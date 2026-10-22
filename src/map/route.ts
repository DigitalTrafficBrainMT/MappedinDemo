// Draws the route Battersea-style: straight "pipework" runs aligned to the
// building's walls, rounded right-angle corners, bright blue, with the
// current step's leg in dark navy carrying white arrows.
//
// - Mappedin's Navigation isn't used for drawing: its raw points zig-zag,
//   and it always draws a line of its own underneath (visible:false is
//   ignored), which peeked out as slivers.
// - Each floor's base line is ONE continuous path (no joins, so no seams).
//   The navy leg is laid exactly on top from the same geometry, carried round
//   its corners and cut square mid-run.
// - Arrows are drawn only on straight parts of the navy leg: the SDK spaces
//   arrows evenly, and any that land on a bend get squashed.
import type { Coordinate, Directions, MapData, MapView, Marker, Path, TDirectionInstruction } from "@mappedin/mappedin-js";
import { CAMERA, ROUTE_ACTIVE_COLOR, ROUTE_ARROW_COLOR, ROUTE_COLOR, ROUTE_SHAPE } from "../config";
import { gridAngle, project, slice, straighten, type XY } from "../directions/straighten";
import type { IconName } from "../ui/icons";
import { motion } from "../util/motion";
import { connectionMarkerHtml, departureMarkerHtml, destinationMarkerHtml } from "./markers";

const EARTH_M_PER_DEG = 111_320;
/** How far the navy leg continues past a corner, so the bend is all navy. */
const LEG_OVERRUN_M = 1.2;
/** The SDK's default ribbon endcap, kept where the route itself starts/ends. */
const ROUND_CAP_M = 0.5;
/** Keep arrows this far from a bend so none is drawn on the curve. */
const ARROW_CORNER_CLEARANCE_M = 1.0;
/** A straight run needs at least this much room to carry an arrow. */
const ARROW_MIN_RUN_M = 1.4;

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
  /** Paths making up the current navy leg (body + arrow runs). */
  private legPaths: Path[] = [];
  private markers: Marker[] = [];
  private wallAngles = new Map<string, number>();

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
        const line = straighten(current.map((c) => this.toXY(c)), this.wallAngle(current[0].floorId ?? ""));
        this.stretches.push({ floorId: current[0].floorId ?? "", line, length: lineLength(line), paths: [] });
      }
      current = [];
    };
    for (const c of directions.coordinates) {
      if (current.length && c.floorId !== current[0].floorId) flush();
      current.push(c);
    }
    flush();

    this.stretches.forEach((stretch) =>
      stretch.paths.push(
        this.addLine(stretch.floorId, stretch.line, {
          color: ROUTE_COLOR,
          caps: [ROUND_CAP_M, ROUND_CAP_M],
          drawDuration: motion(600),
        }),
      ),
    );
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

    const leg = slice(stretch.line, start, end);
    if (!forward) leg.reverse();
    const roundStart = (forward ? start : stretch.length - end) < 0.01;
    const roundEnd = (forward ? stretch.length - end : start) < 0.01;

    // The navy body: no border (it would draw ticks across the square cuts),
    // a hair wider than the base so the blue's edge can't show.
    this.legPaths.push(
      this.addLine(stretch.floorId, leg, {
        color: ROUTE_ACTIVE_COLOR,
        caps: [roundStart ? ROUND_CAP_M : 0, roundEnd ? ROUND_CAP_M : 0],
        border: false,
        widthScale: 1.06,
        verticalOffset: 0.12,
        drawDuration: motion(CAMERA.highlightDuration),
      }),
    );

    // Arrows only on the straight runs, clear of every bend.
    for (let i = 1; i < leg.length; i++) {
      const a = leg[i - 1];
      const b = leg[i];
      const runLength = Math.hypot(b.x - a.x, b.y - a.y);
      const clearA = i === 1 ? 0.4 : ARROW_CORNER_CLEARANCE_M;
      const clearB = i === leg.length - 1 ? 0.4 : ARROW_CORNER_CLEARANCE_M;
      if (runLength - clearA - clearB < ARROW_MIN_RUN_M) continue;
      const along = (d: number) => ({ x: a.x + ((b.x - a.x) * d) / runLength, y: a.y + ((b.y - a.y) * d) / runLength });
      this.legPaths.push(
        this.addLine(stretch.floorId, [along(clearA), along(runLength - clearB)], {
          color: ROUTE_ACTIVE_COLOR,
          caps: [0, 0],
          border: false,
          widthScale: 1.06,
          verticalOffset: 0.14,
          arrows: true,
          drawDuration: 0,
        }),
      );
    }
  }

  clearHighlight() {
    this.legPaths.forEach((path) => this.mapView.Paths.remove(path));
    this.legPaths = [];
  }

  clear() {
    this.clearHighlight();
    this.stretches.forEach((stretch) => stretch.paths.forEach((path) => this.mapView.Paths.remove(path)));
    this.stretches = [];
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

  private addLine(
    floorId: string,
    line: XY[],
    o: {
      color: string;
      caps: [number, number];
      drawDuration: number;
      border?: boolean;
      widthScale?: number;
      verticalOffset?: number;
      arrows?: boolean;
    },
  ): Path {
    return this.mapView.Paths.add(this.toCoordinates(floorId, line), {
      ...ROUTE_SHAPE,
      ...(o.border === false ? { border: { enabled: false, color: "darken" } } : {}),
      width: ROUTE_SHAPE.width * (o.widthScale ?? 1),
      color: o.color,
      accentColor: ROUTE_ARROW_COLOR,
      displayArrowsOnPath: o.arrows ?? false,
      endcapExtension: o.caps,
      verticalOffset: o.verticalOffset ?? 0.1,
      animateDrawing: o.drawDuration > 0,
      drawDuration: o.drawDuration,
    });
  }

  /**
   * The building's wall grid on a floor, from its room outlines. The route's
   * own points drift a few degrees; the walls don't.
   */
  private wallAngle(floorId: string): number | undefined {
    const cached = this.wallAngles.get(floorId);
    if (cached !== undefined) return cached;
    const segments: [XY, XY][] = [];
    for (const space of this.mapData.getByType("space")) {
      if (space.floor.id !== floorId) continue;
      const geometry = space.geoJSON?.geometry as { type?: string; coordinates?: number[][][] } | undefined;
      if (geometry?.type !== "Polygon" || !geometry.coordinates) continue;
      for (const ring of geometry.coordinates) {
        for (let i = 1; i < ring.length; i++) {
          segments.push([this.lngLatToXY(ring[i - 1]), this.lngLatToXY(ring[i])]);
        }
      }
    }
    const angle = segments.length ? gridAngle(segments) : undefined;
    if (angle !== undefined) this.wallAngles.set(floorId, angle);
    return angle;
  }

  private lngLatToXY([lng, lat]: number[]): XY {
    return {
      x: (lng - this.origin.lng) * EARTH_M_PER_DEG * this.origin.cos,
      y: (lat - this.origin.lat) * EARTH_M_PER_DEG,
    };
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
