// Everything the UI can point at: named rooms plus lifts and stairs. The demo
// map has no lift/stairs rooms — they only exist as connections — so both
// kinds are wrapped in one Place shape.
import type { Connection, Coordinate, Floor, MapData, Space } from "@mappedin/mappedin-js";
import type { GroupDef, PlaceSummary } from "./search/search";
import type { Landmark } from "./directions/steps";
import { stripEmoji } from "./util/text";

export interface Place extends PlaceSummary {
  target: Space | Connection;
  /** Other floors a connection reaches; empty for rooms. */
  floorIds: string[];
}

export class PlaceIndex {
  readonly places: Place[];
  private byId = new Map<string, Place>();
  private mapData: MapData;

  constructor(mapData: MapData) {
    this.mapData = mapData;
    const spaces = mapData
      .getByType("space")
      .filter((space) => stripEmoji(space.name ?? ""))
      .map((space): Place => ({
        id: space.id,
        kind: "space",
        name: space.name,
        displayName: stripEmoji(space.name),
        floorId: space.floor.id,
        floorLabel: space.floor.name,
        target: space,
        floorIds: [space.floor.id],
      }));

    const connections = mapData
      .getByType("connection")
      .filter((connection) => connection.name && connection.floors.length > 0)
      .map((connection): Place => ({
        id: connection.id,
        kind: "connection",
        name: connection.name,
        // UK wording, to match Battersea's "Lift" and our Lifts tile.
        displayName: connection.name.replace(/^elevator/i, "Lift"),
        floorId: connection.floors[0].id,
        floorLabel: connectionFloorLabel(connection.floors),
        connectionType: connection.type,
        target: connection,
        floorIds: connection.floors.map((floor) => floor.id),
      }));

    this.places = [...spaces, ...connections];
    this.places.forEach((place) => this.byId.set(place.id, place));
  }

  get(id: string | null | undefined): Place | undefined {
    return id ? this.byId.get(id) : undefined;
  }

  /** Rooms only, top floor first, then by name — the editor's default list. */
  roomsByFloor(): { floorLabel: string; places: Place[] }[] {
    const floors = [...this.mapData.getByType("floor")].sort((a, b) => b.elevation - a.elevation);
    return floors
      .map((floor) => ({
        floorLabel: floor.name,
        places: this.places
          .filter((p) => p.kind === "space" && p.floorId === floor.id)
          .sort((a, b) => a.displayName.localeCompare(b.displayName, undefined, { numeric: true })),
      }))
      .filter((group) => group.places.length > 0);
  }

  floorNames(): Record<string, string> {
    return Object.fromEntries(this.mapData.getByType("floor").map((floor) => [floor.id, floor.name]));
  }

  landmarks(): Landmark[] {
    return this.places
      .filter((p): p is Place & { target: Space } => p.kind === "space")
      .map((p) => ({
        id: p.id,
        name: p.name,
        lat: p.target.center.latitude,
        lng: p.target.center.longitude,
        floorId: p.floorId,
      }));
  }

  /** The point to drop a marker on: a room's centre, or a connection's stop on `floorId`. */
  anchor(place: Place, floorId?: string): Coordinate {
    if (place.kind === "space") return (place.target as Space).center;
    const coordinates = (place.target as Connection).coordinates;
    return coordinates.find((c) => c.floorId === floorId) ?? coordinates[0];
  }

  /** SDK location categories that actually contain rooms, as browse tiles. */
  categoryGroups(): GroupDef[] {
    return this.mapData
      .getByType("location-category")
      .map((category): GroupDef => {
        const ids = new Set(category.locationProfiles.flatMap((profile) => profile.spaces.map((space) => space.id)));
        return { id: `cat:${category.id}`, label: category.name, icon: "category", match: (p) => ids.has(p.id) };
      })
      .filter((group) => this.places.some(group.match));
  }

  categoryNames(placeId: string): string[] {
    return this.mapData
      .getByType("location-category")
      .filter((category) => category.locationProfiles.some((profile) => profile.spaces.some((s) => s.id === placeId)))
      .map((category) => category.name);
  }
}

// "Level 1–2" for a lift serving Level 1 and Level 2.
function connectionFloorLabel(floors: Floor[]): string {
  const levels = floors.map((floor) => /^level\s*(\d+)$/i.exec(floor.name)?.[1]);
  if (levels.every(Boolean)) {
    const sorted = (levels as string[]).map(Number).sort((a, b) => a - b);
    return sorted.length > 1 ? `Level ${sorted[0]}–${sorted[sorted.length - 1]}` : `Level ${sorted[0]}`;
  }
  return floors.length > 1 ? "All floors" : floors[0].name;
}
