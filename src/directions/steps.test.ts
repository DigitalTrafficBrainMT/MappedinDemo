import { describe, expect, it } from "vitest";
import fixture from "./__fixtures__/electrical-to-focus102.json";
import { buildSteps, formatLegTime, formatTotalTime, type BuildStepsInput, type RawInstruction } from "./steps";

const L1 = "m_9b34472d80f1af20";

function referenceInput(): BuildStepsInput {
  return {
    instructions: fixture.instructions as RawInstruction[],
    fromName: fixture.fromName,
    toName: fixture.toName,
    departureId: fixture.fromId,
    floorNames: fixture.floorNames,
    landmarks: fixture.landmarks,
  };
}

describe("buildSteps on the captured reference route", () => {
  const steps = buildSteps(referenceInput());

  it("collapses 17 raw instructions into Battersea-style steps", () => {
    expect(fixture.instructions).toHaveLength(17);
    expect(steps.map((s) => s.text)).toEqual([
      "Leave Electrical Room and turn right",
      "Turn right at Juniper Meeting Room",
      "Turn right",
      "Take the stairs down to Level 1",
      "Exit the stairs and head right",
      "Turn right at Focus Room 101",
      "Turn left at Focus Room 102",
      "Arrive at Focus Room 102",
    ]);
  });

  it("describes the floor change", () => {
    const take = steps.find((s) => s.kind === "take-connection");
    expect(take).toMatchObject({ connectionType: "stairs", direction: "down", toFloorId: L1 });
    // ExitConnection reports direction "up" (reversed) — must not leak into text.
    expect(steps.find((s) => s.kind === "exit-connection")?.text).not.toMatch(/up/);
  });

  it("chains legs so each step's leg ends where the next step begins", () => {
    steps.slice(0, -1).forEach((step, i) => expect(step.legEndIndex).toBe(steps[i + 1].rawIndex));
    const last = steps[steps.length - 1];
    expect(last.kind).toBe("arrive");
    expect(last.legEndIndex).toBe(last.rawIndex);
  });

  it("accumulates distance to the SDK's total", () => {
    const last = steps[steps.length - 1];
    expect(last.cumulative).toBeCloseTo(fixture.totalDistance, 6);
    steps.slice(1).forEach((step, i) => expect(step.cumulative).toBeGreaterThanOrEqual(steps[i].cumulative));
  });

  it("gives every step but the arrival a time", () => {
    steps.slice(0, -1).forEach((step) => expect(step.timeText).toBe("Less than a minute"));
    expect(steps[steps.length - 1].timeText).toBe("");
  });
});

describe("buildSteps rules", () => {
  const F = "floor-a";
  // Points 10 m apart heading north, then east: a clean right turn at p1.
  const p0 = { lat: 0, lng: 0 };
  const p1 = { lat: 0.00009, lng: 0 };
  const p2 = { lat: 0.00009, lng: 0.00009 };
  const base = { fromName: "Lobby 🚪", toName: "Kitchen 🍽️", floorNames: { [F]: "Level 1", up: "Level 2" }, landmarks: [] };
  const at = (p: { lat: number; lng: number }, rest: Partial<RawInstruction>): RawInstruction => ({
    type: "Turn",
    distance: 10,
    floorId: F,
    ...p,
    ...rest,
  });

  it("says just 'Leave X' when nothing turns near the door", () => {
    const steps = buildSteps({
      ...base,
      instructions: [at(p0, { type: "Departure", distance: 0 }), at(p1, { bearing: "Right" }), at(p2, { type: "Arrival" })],
    });
    expect(steps[0].text).toBe("Leave Lobby");
    expect(steps[1].text).toBe("Turn right");
    expect(steps[2].text).toBe("Arrive at Kitchen");
  });

  it("drops a turn whose net heading change is straight", () => {
    const straight = { lat: 0.00018, lng: 0 };
    const steps = buildSteps({
      ...base,
      instructions: [at(p0, { type: "Departure", distance: 0 }), at(p1, { bearing: "SlightRight" }), at(straight, { type: "Arrival" })],
    });
    expect(steps.map((s) => s.kind)).toEqual(["depart", "arrive"]);
  });

  it("reads a tight loop of left turns as a left, not 'turn around' or right", () => {
    // East for 11 m, then left-left-left 2 m apart (−270° in total) into a
    // doorway. Comparing only the first and last headings wraps to +90°
    // ("right"); summing each bend keeps the real direction.
    const A = { lat: 0, lng: 0 };
    const B = { lat: 0, lng: 0.0001 };
    const C = { lat: 0.000018, lng: 0.0001 };
    const D = { lat: 0.000018, lng: 0.000082 };
    const E = { lat: 0, lng: 0.000082 };
    const steps = buildSteps({
      ...base,
      instructions: [
        at(A, { type: "Departure", distance: 0 }),
        at(B, { bearing: "Left", distance: 11.1 }),
        at(C, { bearing: "Left", distance: 2 }),
        at(D, { bearing: "Left", distance: 2 }),
        at(E, { type: "Arrival", distance: 2 }),
      ],
    });
    expect(steps.map((s) => s.text)).toEqual(["Leave Lobby", "Turn left", "Arrive at Kitchen"]);
  });

  it("uses 'lift' for elevators and falls back without a direction", () => {
    const steps = buildSteps({
      ...base,
      instructions: [
        at(p0, { type: "Departure", distance: 0 }),
        at(p1, { type: "TakeConnection", connectionType: "elevator", direction: "up", toFloorId: "up" }),
        at(p1, { type: "ExitConnection", connectionType: "elevator", distance: 0, floorId: "up" }),
        at(p2, { type: "Arrival", floorId: "up" }),
      ],
    });
    expect(steps.map((s) => s.text)).toEqual(["Leave Lobby", "Take the lift up to Level 2", "Exit the lift", "Arrive at Kitchen"]);
  });

  it("skips utility rooms and ambiguous duplicates as landmarks", () => {
    const near = (id: string, name: string) => ({ id, name, lat: p1.lat + 0.00001, lng: p1.lng, floorId: F });
    const make = (landmarks: BuildStepsInput["landmarks"]) =>
      buildSteps({
        ...base,
        landmarks,
        instructions: [at(p0, { type: "Departure", distance: 0 }), at(p1, { bearing: "Right" }), at(p2, { type: "Arrival" })],
      })[1].text;
    expect(make([near("a", "Storage 📦")])).toBe("Turn right");
    expect(make([near("a", "Office 1"), { ...near("b", "Office 1"), lat: 5 }])).toBe("Turn right");
    expect(make([near("a", "Yew Meeting Room")])).toBe("Turn right at Yew Meeting Room");
  });
});

describe("time formatting", () => {
  it("formats legs and totals at 1.4 m/s", () => {
    expect(formatLegTime(40)).toBe("Less than a minute");
    expect(formatLegTime(84)).toBe("1 minute");
    expect(formatLegTime(300)).toBe("4 minutes");
    expect(formatTotalTime(10)).toBe("1 minute total");
    expect(formatTotalTime(170)).toBe("2 minutes total");
  });
});
