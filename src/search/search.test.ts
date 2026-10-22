import { describe, expect, it } from "vitest";
import { AMENITY_GROUPS, POPULAR_GROUPS, groupSubtitle, placesInGroup, rankPlaces, type PlaceSummary } from "./search";

const place = (name: string, floorLabel = "Level 1", extra: Partial<PlaceSummary> = {}): PlaceSummary => ({
  id: `${name}|${floorLabel}`,
  kind: "space",
  name,
  displayName: name.replace(/[^\p{L}\p{N}' ]/gu, "").trim(),
  floorId: floorLabel,
  floorLabel,
  ...extra,
});

const places: PlaceSummary[] = [
  place("Yew Meeting Room", "Level 2"),
  place("Juniper Meeting Room", "Level 2"),
  place("Focus Room 102 🎧"),
  place("Focus 101 🎧"),
  place("Women's Washroom 🚻"),
  place("Kitchen 🍽️"),
  place("Huddle 101 💡"),
  place("Storage 📦"),
  place("Storage 📦", "Level 2"),
  place("Lift 3", "Level 1–2", { kind: "connection", connectionType: "elevator" }),
  place("Stairs 1", "Level 1–2", { kind: "connection", connectionType: "stairs" }),
];

describe("rankPlaces", () => {
  it("puts prefix matches before word-start and substring matches", () => {
    expect(rankPlaces(places, "ju").map((p) => p.displayName)).toEqual(["Juniper Meeting Room"]);
    expect(rankPlaces(places, "meet").map((p) => p.displayName)).toEqual(["Juniper Meeting Room", "Yew Meeting Room"]);
    expect(rankPlaces(places, "room 1").map((p) => p.displayName)).toEqual(["Focus Room 102"]);
  });

  it("ignores case, apostrophes and emoji", () => {
    expect(rankPlaces(places, "WOMENS")[0].displayName).toBe("Women's Washroom");
  });

  it("keeps duplicates apart by floor", () => {
    expect(rankPlaces(places, "storage").map((p) => p.floorLabel)).toEqual(["Level 1", "Level 2"]);
  });

  it("returns nothing for an empty query", () => {
    expect(rankPlaces(places, "   ")).toEqual([]);
  });
});

describe("tile groups", () => {
  const group = (defs: typeof POPULAR_GROUPS, id: string) => defs.find((g) => g.id === id)!;

  it("matches rooms by name and lifts/stairs by connection type", () => {
    expect(placesInGroup(places, group(POPULAR_GROUPS, "meeting"))).toHaveLength(2);
    expect(placesInGroup(places, group(POPULAR_GROUPS, "focus"))).toHaveLength(2);
    expect(placesInGroup(places, group(AMENITY_GROUPS, "lifts")).map((p) => p.displayName)).toEqual(["Lift 3"]);
    expect(placesInGroup(places, group(AMENITY_GROUPS, "stairs"))).toHaveLength(1);
  });

  it("subtitles with a count, or the floor for a single place", () => {
    expect(groupSubtitle(placesInGroup(places, group(POPULAR_GROUPS, "meeting")))).toBe("2 locations");
    expect(groupSubtitle(placesInGroup(places, group(AMENITY_GROUPS, "kitchen")))).toBe("Level 1");
  });
});
