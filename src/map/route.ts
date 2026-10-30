// Draws the route Battersea-style: straight "pipework" runs aligned to the
// building's walls, rounded right-angle corners, bright blue, with the
// current step's leg in dark navy carrying white arrows.
//
// How Battersea (Mappedin Web) does it, and so do we: there is ONE line, and
// the current step is that same line restyled. Mappedin's own
// Paths.highlightPathSection recolours a range of the existing mesh, so there
// is no second line to misalign: no double corners, width mismatch or
// z-fighting. (We tried stacking a second line first; that was the source of
// every streak and seam.)
//
// Mappedin's Navigation isn't used for drawing: its raw points zig-zag, and
// it always draws a line of its own underneath (visible:false is ignored).
import type { Coordinate, Directions, MapData, MapView, Marker, Path, TDirectionInstruction } from "@mappedin/mappedin-js";
import { CAMERA, ROUTE_ACTIVE_COLOR, ROUTE_ARROW_COLOR, ROUTE_COLOR, ROUTE_SHAPE } from "../config";
import { cutPosition, gridAngle, lineLength, pointAt, project, straighten, type XY } from "../directions/straighten";
import type { IconName } from "../ui/icons";
import { motion } from "../util/motion";
import { connectionMarkerHtml, departureMarkerHtml, destinationMarkerHtml } from "./markers";

const EARTH_M_PER_DEG = 111_320;
/** The SDK's default ribbon endcap, on the route's own start and end. */
const ROUND_CAP_M = 0.5;
/** The current step is a touch wider than the rest, as on Battersea (+10%). */
const ACTIVE_WIDTH_FACTOR = 1.1;

/** One floor's stretch of the route: its straightened line and its one path. */
interface Stretch {
  floorId: string;
  line: XY[];
  length: number;
  path: Path;
}

export class RouteLayer {
  private mapView: MapView;
  private mapData: MapData;
  private origin = { lat: 0, lng: 0, cos: 1 };
  private stretches: Stretch[] = [];
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
          // "top" puts the pill beside/above the stairwell, not on the line.
          { ...options, placement: "top" as const },
        ),
      );
    }

    const first = directions.coordinates[0];
    this.origin = { lat: first.latitude, lng: first.longitude, cos: Math.cos((first.latitude * Math.PI) / 180) };

    // Split the route wherever it changes floor; straighten each stretch and
    // draw it as ONE continuous path.
    let current: Coordinate[] = [];
    const flush = () => {
      if (current.length >= 2) {
        const floorId = current[0].floorId ?? "";
        const line = straighten(current.map((c) => this.toXY(c)), this.wallAngle(floorId));
        const path = this.mapView.Paths.add(this.toCoordinates(floorId, line), {
          ...ROUTE_SHAPE,
          color: ROUTE_COLOR,
          accentColor: ROUTE_ARROW_COLOR,
          displayArrowsOnPath: false,
          endcapExtension: [ROUND_CAP_M, ROUND_CAP_M],
          drawDuration: motion(600),
        });
        this.stretches.push({ floorId, line, length: lineLength(line), path });
      }
      current = [];
    };
    for (const c of directions.coordinates) {
      if (current.length && c.floorId !== current[0].floorId) flush();
      current.push(c);
    }
    flush();
  }

  /**
   * Recolour the part of the line between two points: darker, 10% wider, with
   * white arrows. The ends are moved off bends (see cutPosition) so the flat
   * edge the renderer cuts always lands across a straight run.
   */
  highlight(from: Coordinate, to: Coordinate) {
    this.clearHighlight();
    const stretch = this.stretches.find((s) => s.floorId === from.floorId && s.floorId === to.floorId);
    if (!stretch) return;
    let a = cutPosition(stretch.line, project(stretch.line, this.toXY(from)));
    let b = cutPosition(stretch.line, project(stretch.line, this.toXY(to)));
    if (a > b) [a, b] = [b, a];
    if (b - a < 0.3) return;
    this.mapView.Paths.highlightPathSection(
      stretch.path,
      this.toCoordinates(stretch.floorId, [pointAt(stretch.line, a)])[0],
      this.toCoordinates(stretch.floorId, [pointAt(stretch.line, b)])[0],
      {
        color: ROUTE_ACTIVE_COLOR,
        widthMultiplier: ACTIVE_WIDTH_FACTOR,
        displayArrowsOnPath: true,
        animationDuration: motion(CAMERA.highlightDuration),
      },
    );
  }

  clearHighlight() {
    this.stretches.forEach((s) => this.mapView.Paths.clearHighlightedPathSection(s.path));
  }

  clear() {
    this.stretches.forEach((s) => this.mapView.Paths.remove(s.path));
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
