// Draws the route Battersea-style: straight "pipework" runs with rounded
// corners in bright blue, and the current step's leg in dark navy with white
// arrows. Mappedin's Navigation isn't used for drawing: its raw points
// zig-zag inside corridors, its section highlight is a separate overlay whose
// ends never line up, and it always draws a line of its own underneath.
//
// Instead each floor's straightened line is drawn as non-overlapping pieces:
// blue before the current leg, navy for it, blue after. The joins sit in the
// middle of straight runs, so they're invisible, and every corner is drawn by
// exactly one piece — no slivers of one colour peeking out from under another.
import type { Coordinate, Directions, MapData, MapView, Marker, Path, TDirectionInstruction } from "@mappedin/mappedin-js";
import { CAMERA, ROUTE_ACTIVE_COLOR, ROUTE_ARROW_COLOR, ROUTE_COLOR, ROUTE_SHAPE } from "../config";
import { project, slice, straighten, type XY } from "../directions/straighten";
import type { IconName } from "../ui/icons";
import { motion } from "../util/motion";
import { connectionMarkerHtml, departureMarkerHtml, destinationMarkerHtml } from "./markers";

const EARTH_M_PER_DEG = 111_320;
/** How far the navy leg continues past a corner, so the bend is all navy. */
const LEG_OVERRUN_M = 1.2;
/** The SDK's default ribbon endcap, kept where the route itself starts/ends. */
const ROUND_CAP_M = 0.5;

function lineLength(line: XY[]): number {
  let total = 0;
  for (let i = 1; i < line.length; i++) total += Math.hypot(line[i].x - line[i - 1].x, line[i].y - line[i - 1].y);
  return total;
}

/** One floor's stretch of the route, straightened, in local metres. */
interface Stretch {
  floorId: string;
  line: XY[];
  length: number;
  paths: Path[];
}

export class RouteLayer {
  private mapView: MapView;
  private mapData: MapData;
  private origin = { lat: 0, lng: 0, cos: 1 };
  private stretches: Stretch[] = [];
  /** The stretch currently split around a navy leg, if any. */
  private split: Stretch | null = null;
  private markers: Marker[] = [];

  constructor(mapView: MapView, mapData: MapData) {
    this.mapView = mapView;
    this.mapData = mapData;
  }

  async draw(directions: Directions, destination: { name: string; icon: IconName }) {
    this.clear();
    // Markers are placed here rather than via Navigation.draw(): Navigation
    // always draws its own route line too (pathOptions.visible:false is
    // ignored), and that thin raw-geometry line peeked out from under ours.
    const { Markers } = this.mapView;
    const options = { rank: "always-visible" as const, placement: "center" as const };
    const coords = directions.coordinates;
    this.markers.push(Markers.add(coords[0], departureMarkerHtml(), options));
    this.markers.push(Markers.add(coords[coords.length - 1], destinationMarkerHtml(destination.name, destination.icon), options));
    for (const instruction of directions.instructions) {
      const type = instruction.action.type;
      if (type !== "TakeConnection" && type !== "ExitConnection") continue;
      this.markers.push(
        Markers.add(
          instruction.coordinate,
          connectionMarkerHtml(instruction.action.connection?.type, travelDirection(instruction)),
          options,
        ),
      );
    }

    const first = directions.coordinates[0];
    this.origin = { lat: first.latitude, lng: first.longitude, cos: Math.cos((first.latitude * Math.PI) / 180) };

    // Split the route wherever it changes floor; straighten each stretch.
    let current: Coordinate[] = [];
    const flush = () => {
      if (current.length >= 2) {
        const line = straighten(current.map((c) => this.toXY(c)));
        this.stretches.push({ floorId: current[0].floorId ?? "", line, length: lineLength(line), paths: [] });
      }
      current = [];
    };
    for (const c of directions.coordinates) {
      if (current.length && c.floorId !== current[0].floorId) flush();
      current.push(c);
    }
    flush();

    this.stretches.forEach((stretch) => this.drawWhole(stretch, motion(600)));
  }

  /** Dark-navy leg with white arrows, carried round the corners at its ends. */
  highlight(from: Coordinate, to: Coordinate) {
    this.clearHighlight();
    const stretch = this.stretches.find((s) => s.floorId === from.floorId && s.floorId === to.floorId);
    if (!stretch) return;
    let a = project(stretch.line, this.toXY(from));
    let b = project(stretch.line, this.toXY(to));
    if (Math.abs(b - a) < 0.3) return;
    const forward = a < b;
    if (!forward) [a, b] = [b, a];
    const start = Math.max(0, a - LEG_OVERRUN_M);
    const end = Math.min(stretch.length, b + LEG_OVERRUN_M);

    this.removePaths(stretch);
    this.addPiece(stretch, 0, start, ROUTE_COLOR, false, 0);
    this.addPiece(stretch, start, end, ROUTE_ACTIVE_COLOR, true, motion(CAMERA.highlightDuration), !forward);
    this.addPiece(stretch, end, stretch.length, ROUTE_COLOR, false, 0);
    this.split = stretch;
  }

  clearHighlight() {
    if (!this.split) return;
    this.removePaths(this.split);
    this.drawWhole(this.split, 0);
    this.split = null;
  }

  clear() {
    this.stretches.forEach((stretch) => this.removePaths(stretch));
    this.stretches = [];
    this.split = null;
    this.markers.forEach((marker) => this.mapView.Markers.remove(marker));
    this.markers = [];
  }

  /**
   * Route markers are always-visible, so both ends of a staircase would show
   * at once (same spot, two floors). Mappedin's recommendation: enable only
   * the markers on the floor being viewed. Call on every floor change.
   */
  syncMarkersToFloor(floorId: string | undefined) {
    for (const marker of this.markers) {
      this.mapView.updateState(marker, { enabled: marker.coordinate.floorId === floorId });
    }
  }

  private drawWhole(stretch: Stretch, drawDuration: number) {
    this.addPiece(stretch, 0, stretch.length, ROUTE_COLOR, false, drawDuration);
  }

  /** Draw the part of a stretch between two arc lengths. */
  private addPiece(
    stretch: Stretch,
    from: number,
    to: number,
    color: string,
    arrows: boolean,
    drawDuration: number,
    reverse = false,
  ) {
    if (to - from < 0.05) return;
    const line = slice(stretch.line, from, to);
    if (reverse) line.reverse();
    // Round caps only where the route itself starts or ends; square cuts
    // where pieces meet, so the joins disappear.
    const roundFrom = from < 0.01;
    const roundTo = stretch.length - to < 0.01;
    const caps: [number, number] = reverse
      ? [roundTo ? ROUND_CAP_M : 0, roundFrom ? ROUND_CAP_M : 0]
      : [roundFrom ? ROUND_CAP_M : 0, roundTo ? ROUND_CAP_M : 0];
    stretch.paths.push(
      this.mapView.Paths.add(this.toCoordinates(stretch.floorId, line), {
        ...ROUTE_SHAPE,
        color,
        accentColor: ROUTE_ARROW_COLOR,
        displayArrowsOnPath: arrows,
        endcapExtension: caps,
        animateDrawing: drawDuration > 0,
        drawDuration,
      }),
    );
  }

  private removePaths(stretch: Stretch) {
    stretch.paths.forEach((path) => this.mapView.Paths.remove(path));
    stretch.paths = [];
  }

  // Local metres around the route's start: plenty accurate indoors.
  private toXY(c: Coordinate): XY {
    return {
      x: (c.longitude - this.origin.lng) * EARTH_M_PER_DEG * this.origin.cos,
      y: (c.latitude - this.origin.lat) * EARTH_M_PER_DEG,
    };
  }

  private toCoordinates(floorId: string, line: XY[]): Coordinate[] {
    const floor = this.mapData.getById("floor", floorId);
    return line.map((p) =>
      this.mapView.createCoordinate(
        this.origin.lat + p.y / EARTH_M_PER_DEG,
        this.origin.lng + p.x / (EARTH_M_PER_DEG * this.origin.cos),
        floor,
      ),
    );
  }
}

// ExitConnection reports its direction reversed (see ADR-003), so flip it
// to show which way the visitor actually travelled.
function travelDirection(instruction: TDirectionInstruction): "up" | "down" | undefined {
  const reported = instruction.action.direction;
  if (reported !== "up" && reported !== "down") return undefined;
  if (instruction.action.type !== "ExitConnection") return reported;
  return reported === "up" ? "down" : "up";
}
