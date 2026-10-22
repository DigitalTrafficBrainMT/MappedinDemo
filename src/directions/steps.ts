// Turns raw Mappedin direction instructions into human steps in the style of
// the Battersea Power Station wayfinding (ADR-003). Pure: no DOM, no SDK
// imports, so it can be unit-tested against captured real data.
import {
  ANGLE_SLIGHT,
  ANGLE_STRAIGHT,
  ANGLE_TURN,
  LANDMARK_EXCLUDE,
  LANDMARK_RADIUS_M,
  MERGE_DISTANCE_M,
  WALK_SPEED_MPS,
} from "../config";
import { bearingDeg, distanceM, turnAngle, type LatLng } from "../util/geo";
import { stripEmoji } from "../util/text";

export type RawInstructionType = "Departure" | "TakeConnection" | "ExitConnection" | "Turn" | "Arrival";

export interface RawInstruction extends LatLng {
  type: RawInstructionType;
  /** SDK bearing: Straight | Right | SlightRight | Left | SlightLeft | Back */
  bearing?: string;
  /** Only trustworthy on TakeConnection — ExitConnection reports it reversed. */
  direction?: string;
  connectionType?: string;
  toFloorId?: string;
  /** Metres travelled to *reach* this instruction (Departure is 0). */
  distance: number;
  floorId: string;
}

export interface Landmark extends LatLng {
  id: string;
  name: string;
  floorId: string;
}

export type StepKind = "depart" | "turn" | "bear" | "uturn" | "take-connection" | "exit-connection" | "arrive";
export type Side = "left" | "right";

export interface Step {
  kind: StepKind;
  side?: Side;
  connectionType?: string;
  direction?: "up" | "down";
  toFloorId?: string;
  text: string;
  timeText: string;
  /** Raw instruction index where this step happens. */
  rawIndex: number;
  /** Raw instruction index where the next step happens (end of this step's leg). */
  legEndIndex: number;
  floorId: string;
  legDistance: number;
  /** Metres from the start of the route to this step. */
  cumulative: number;
}

export interface BuildStepsInput {
  instructions: RawInstruction[];
  fromName: string;
  toName: string;
  /** The departure room is never used as a landmark — you just left it. */
  departureId?: string;
  floorNames: Record<string, string>;
  landmarks: Landmark[];
}

type Turn = { kind: "turn" | "bear" | "uturn"; side?: Side };

// Battersea is a UK venue ("Lift"), and the browse tiles say "Lifts".
const CONNECTION_LABELS: Record<string, string> = { elevator: "lift" };

export function connectionLabel(type: string | undefined): string {
  if (!type) return "connection";
  return CONNECTION_LABELS[type] ?? type;
}

export function formatLegTime(metres: number): string {
  const minutes = Math.round(metres / WALK_SPEED_MPS / 60);
  if (minutes < 1) return "Less than a minute";
  return `${minutes} minute${minutes === 1 ? "" : "s"}`;
}

export function formatTotalTime(metres: number): string {
  const minutes = Math.max(1, Math.round(metres / WALK_SPEED_MPS / 60));
  return `${minutes} minute${minutes === 1 ? "" : "s"} total`;
}

function turnFromSdkBearing(bearing: string | undefined): Turn | null {
  switch (bearing) {
    case "Right":
      return { kind: "turn", side: "right" };
    case "Left":
      return { kind: "turn", side: "left" };
    case "SlightRight":
      return { kind: "bear", side: "right" };
    case "SlightLeft":
      return { kind: "bear", side: "left" };
    case "Back":
      return { kind: "uturn" };
    default:
      return null;
  }
}

// `delta` is the total signed turning through a cluster (can exceed ±180°).
// Over ANGLE_TURN, a single bend is a real reversal ("Turn around"); several
// quick bends the same way are a doorway loop, which people call a turn.
function turnFromAngle(delta: number, multipleBends: boolean): Turn | null {
  const abs = Math.abs(delta);
  const side: Side = delta > 0 ? "right" : "left";
  if (abs < ANGLE_STRAIGHT) return null;
  if (abs < ANGLE_SLIGHT) return { kind: "bear", side };
  if (abs <= ANGLE_TURN || multipleBends) return { kind: "turn", side };
  return { kind: "uturn" };
}

export function buildSteps(input: BuildStepsInput): Step[] {
  const ins = input.instructions;
  if (ins.length === 0) return [];

  const from = stripEmoji(input.fromName);
  const to = stripEmoji(input.toName);
  const findLandmark = makeLandmarkFinder(input.landmarks, input.departureId);

  const cumulative: number[] = [];
  ins.forEach((instruction, i) => {
    cumulative.push((i === 0 ? 0 : cumulative[i - 1]) + instruction.distance);
  });

  // Turns that follow `anchor` within MERGE_DISTANCE_M of each other belong
  // to the same physical manoeuvre (the SDK reports 0–2 m wiggles). Capped
  // so a chain of near-threshold gaps can't swallow a real corridor.
  const clusterEnd = (anchor: number): number => {
    let end = anchor;
    for (let j = anchor + 1; j < ins.length; j++) {
      const next = ins[j];
      if (next.type !== "Turn" || next.floorId !== ins[anchor].floorId) break;
      if (next.distance >= MERGE_DISTANCE_M) break;
      if (cumulative[j] - cumulative[anchor] >= MERGE_DISTANCE_M * 2) break;
      end = j;
    }
    return end;
  };

  // Heading of the last non-trivial leg arriving at `k`, staying on k's floor.
  const headingInto = (k: number): number | undefined => {
    for (let m = k; m >= 1; m--) {
      if (ins[m - 1].floorId !== ins[k].floorId) return undefined;
      if (distanceM(ins[m - 1], ins[m]) > 0.05) return bearingDeg(ins[m - 1], ins[m]);
    }
    return undefined;
  };

  // Heading of the first non-trivial leg leaving `k`, staying on k's floor.
  const headingOutOf = (k: number): number | undefined => {
    for (let m = k + 1; m < ins.length; m++) {
      if (ins[m].floorId !== ins[k].floorId) return undefined;
      if (distanceM(ins[m - 1], ins[m]) > 0.05) return bearingDeg(ins[m - 1], ins[m]);
    }
    return undefined;
  };

  // Sum the signed turn at every bend in a cluster. Comparing only the
  // first and last headings wraps past 180°, so three quick lefts (−270°)
  // would read as a right.
  const totalTurn = (start: number, end: number): number | undefined => {
    let heading = headingInto(start);
    if (heading === undefined) return undefined;
    let total = 0;
    for (let k = start; k <= end; k++) {
      const out = headingOutOf(k);
      if (out === undefined) return undefined;
      total += turnAngle(heading, out);
      heading = out;
    }
    return total;
  };

  type Draft = Omit<Step, "timeText" | "legEndIndex" | "legDistance" | "cumulative">;
  const drafts: Draft[] = [];

  let i = 0;
  while (i < ins.length) {
    const current = ins[i];

    if (current.type === "Departure" || current.type === "ExitConnection") {
      // Starting at a lift/stairs: the SDK puts an ExitConnection straight
      // after Departure. Fold it into the departure rather than saying
      // "Exit the lift" before you've gone anywhere.
      const anchor = current.type === "Departure" && ins[i + 1]?.type === "ExitConnection" ? i + 1 : i;
      // The SDK's first turn after a door or stairwell is measured against
      // the door/stair orientation, which we can't know — so trust its bearing.
      const end = clusterEnd(anchor);
      const first = end > anchor ? turnFromSdkBearing(ins[anchor + 1].bearing) : null;
      if (current.type === "Departure") {
        drafts.push({ kind: "depart", side: first?.side, rawIndex: i, floorId: current.floorId, text: departText(from, first) });
      } else {
        const label = connectionLabel(current.connectionType);
        const side = first?.side;
        drafts.push({
          kind: "exit-connection",
          side,
          connectionType: current.connectionType,
          rawIndex: i,
          floorId: current.floorId,
          text: side ? `Exit the ${label} and head ${side}` : `Exit the ${label}`,
        });
      }
      i = end + 1;
      continue;
    }

    if (current.type === "TakeConnection") {
      // Routing *to* a lift/stairs ends with a TakeConnection then Arrival;
      // "Take the lift" there would be wrong — you've arrived at it.
      if (ins[i + 1]?.type === "Arrival") {
        i++;
        continue;
      }
      const label = connectionLabel(current.connectionType);
      const direction = current.direction === "up" || current.direction === "down" ? current.direction : undefined;
      const floorName = current.toFloorId ? input.floorNames[current.toFloorId] : undefined;
      const parts = [`Take the ${label}`];
      if (direction) parts.push(direction);
      if (floorName) parts.push(`to ${floorName}`);
      drafts.push({
        kind: "take-connection",
        connectionType: current.connectionType,
        direction,
        toFloorId: current.toFloorId,
        rawIndex: i,
        floorId: current.floorId,
        text: parts.join(" "),
      });
      i++;
      continue;
    }

    if (current.type === "Arrival") {
      drafts.push({ kind: "arrive", rawIndex: i, floorId: current.floorId, text: `Arrive at ${to}` });
      i++;
      continue;
    }

    // Turn: merge the cluster and judge it by the total turning through it.
    const end = clusterEnd(i);
    const total = totalTurn(i, end);
    const turn = total !== undefined ? turnFromAngle(total, end > i) : turnFromSdkBearing(current.bearing);
    if (turn) {
      const landmark = turn.kind === "uturn" ? undefined : findLandmark(current);
      drafts.push({
        kind: turn.kind,
        side: turn.side,
        rawIndex: i,
        floorId: current.floorId,
        text: turnText(turn, landmark),
      });
    }
    i = end + 1;
  }

  return drafts.map((draft, index) => {
    const next = drafts[index + 1];
    const legEndIndex = next ? next.rawIndex : draft.rawIndex;
    const legDistance = cumulative[legEndIndex] - cumulative[draft.rawIndex];
    return {
      ...draft,
      legEndIndex,
      legDistance,
      cumulative: cumulative[draft.rawIndex],
      timeText: draft.kind === "arrive" ? "" : formatLegTime(legDistance),
    };
  });
}

function departText(from: string, turn: Turn | null): string {
  if (!turn) return `Leave ${from}`;
  if (turn.kind === "uturn") return `Leave ${from} and turn around`;
  return `Leave ${from} and ${turn.kind} ${turn.side}`;
}

function turnText(turn: Turn, landmark: string | undefined): string {
  const base = turn.kind === "uturn" ? "Turn around" : `${turn.kind === "bear" ? "Bear" : "Turn"} ${turn.side}`;
  return landmark ? `${base} at ${landmark}` : base;
}

function makeLandmarkFinder(landmarks: Landmark[], departureId: string | undefined) {
  // A name that appears more than once on a floor ("Storage" ×4) would be
  // ambiguous, so it can't be a landmark.
  const counts = new Map<string, number>();
  const keyOf = (l: Landmark) => `${l.floorId}|${stripEmoji(l.name).toLowerCase()}`;
  landmarks.forEach((l) => counts.set(keyOf(l), (counts.get(keyOf(l)) ?? 0) + 1));

  const eligible = landmarks.filter(
    (l) => l.id !== departureId && !LANDMARK_EXCLUDE.test(l.name) && counts.get(keyOf(l)) === 1,
  );

  return (point: RawInstruction): string | undefined => {
    let best: Landmark | undefined;
    let bestDistance = LANDMARK_RADIUS_M;
    for (const landmark of eligible) {
      if (landmark.floorId !== point.floorId) continue;
      const d = distanceM(point, landmark);
      if (d <= bestDistance) {
        best = landmark;
        bestDistance = d;
      }
    }
    return best ? stripEmoji(best.name) : undefined;
  };
}
