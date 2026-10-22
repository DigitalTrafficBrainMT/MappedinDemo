// Draws the route Battersea-style (ADR-002): one bright-blue route, and only
// the current step's leg in dark navy with arrows.
import type { Coordinate, Directions, MapView, TDirectionInstruction } from "@mappedin/mappedin-js";
import { CAMERA, ROUTE_ACTIVE_COLOR, ROUTE_ARROW_COLOR, ROUTE_COLOR, ROUTE_SHAPE } from "../config";
import type { IconName } from "../ui/icons";
import { motion } from "../util/motion";
import { connectionMarkerHtml, departureMarkerHtml, destinationMarkerHtml } from "./markers";

export class RouteLayer {
  private mapView: MapView;

  constructor(mapView: MapView) {
    this.mapView = mapView;
  }

  async draw(directions: Directions, destination: { name: string; icon: IconName }) {
    const { Navigation, Markers } = this.mapView;
    Navigation.clear();
    await Navigation.draw(directions, {
      setMapToDeparture: false,
      // accentColor colours the arrows; the highlighted leg inherits it.
      pathOptions: { ...ROUTE_SHAPE, color: ROUTE_COLOR, accentColor: ROUTE_ARROW_COLOR, displayArrowsOnPath: false },
      // The route's stretch on other floors: same shape, SDK's muted colour.
      inactivePathOptions: { ...ROUTE_SHAPE },
      createMarkers: {
        departure: (instruction) =>
          Markers.add(instruction.coordinate, departureMarkerHtml(), { rank: "always-visible", placement: "center" }),
        destination: (instruction) =>
          Markers.add(instruction.coordinate, destinationMarkerHtml(destination.name, destination.icon), {
            rank: "always-visible",
            placement: "center",
          }),
        connection: (instruction) =>
          Markers.add(
            instruction.coordinate,
            connectionMarkerHtml(instruction.action.connection?.type, travelDirection(instruction)),
            { rank: "always-visible", placement: "center" },
          ),
      },
    });
  }

  /**
   * The SDK keeps a single highlighted section, so each call replaces the
   * previous one — exactly the "current leg only" behaviour we want.
   */
  highlight(from: Coordinate, to: Coordinate) {
    this.mapView.Navigation.highlightPathSection(from, to, {
      color: ROUTE_ACTIVE_COLOR,
      widthMultiplier: 1.15,
      displayArrowsOnPath: true,
      animationDuration: motion(CAMERA.highlightDuration),
    });
  }

  clearHighlight() {
    this.mapView.Navigation.clearHighlightedPathSection();
  }

  clear() {
    this.mapView.Navigation.clear();
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
