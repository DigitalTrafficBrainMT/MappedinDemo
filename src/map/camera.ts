// Camera behaviour from spec §6 / ADR-002: frame real extents with
// focusOn(), always at the venue's own bearing, leaving room for the UI.
import type { Coordinate, InsetPadding, MapView } from "@mappedin/mappedin-js";
import { CAMERA } from "../config";
import { motion } from "../util/motion";

type FocusTarget = Parameters<MapView["Camera"]["focusOn"]>[0];

export class CameraController {
  private mapView: MapView;
  // Read once after load. Battersea never rotates per step, so every move
  // reuses this.
  private bearing: number;

  constructor(mapView: MapView) {
    this.mapView = mapView;
    this.bearing = mapView.Camera.bearing;
  }

  /** Room the camera must leave for panels, in pixels from each edge. */
  setOffsets(offsets: InsetPadding) {
    this.mapView.Camera.setScreenOffsets(offsets);
  }

  /** Browse: the whole current floor at 45°. */
  overview(target: FocusTarget = this.mapView.currentFloor) {
    return this.focus(target, CAMERA.overviewPitch, CAMERA.stepDuration);
  }

  /** Location card: straight down onto the room. */
  location(target: FocusTarget) {
    return this.focus(target, CAMERA.locationPitch, CAMERA.stepDuration, CAMERA.maxZoomLevel);
  }

  /** A directions step: the current leg, nearly flat. */
  leg(coordinates: Coordinate[]) {
    return this.focus(coordinates, CAMERA.stepPitch, CAMERA.stepDuration, CAMERA.maxZoomLevel);
  }

  /** Floor change or overview: the route's stretch on one floor at 45°. */
  floorRoute(coordinates: Coordinate[]) {
    return this.focus(coordinates, CAMERA.overviewPitch, CAMERA.connectionDuration);
  }

  zoomBy(delta: number) {
    const { Camera } = this.mapView;
    return Camera.animateTo({ zoomLevel: Camera.zoomLevel + delta }, { duration: motion(250) });
  }

  private focus(target: FocusTarget, pitch: number, duration: number, maxZoomLevel?: number) {
    return this.mapView.Camera.focusOn(target, {
      bearing: this.bearing,
      pitch,
      maxZoomLevel,
      duration: motion(duration),
    });
  }
}
