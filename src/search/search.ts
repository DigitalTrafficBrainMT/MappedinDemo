// Search ranking and the quick-pick tile groups for the browse card. Pure.
// The demo map's categories are too sparse to fill Battersea's carousel, so
// the Popular/Amenities tiles are defined by room name and connection type.
import { stripEmoji } from "../util/text";

export interface PlaceSummary {
  id: string;
  kind: "space" | "connection";
  /** Raw map name (may contain emoji); used for map labels only. */
  name: string;
  /** Clean name for the panels. */
  displayName: string;
  floorId: string;
  floorLabel: string;
  connectionType?: string;
}

export type TabId = "categories" | "popular" | "amenities";

export interface GroupDef {
  id: string;
  label: string;
  /** Icon name from ui/icons. */
  icon: string;
  match: (place: PlaceSummary) => boolean;
}

export function normalize(text: string): string {
  return stripEmoji(text)
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Rank by prefix match, then word-start match, then substring; then by name. */
export function rankPlaces(places: PlaceSummary[], query: string, limit = 50): PlaceSummary[] {
  const q = normalize(query);
  if (!q) return [];
  const scored: { place: PlaceSummary; score: number }[] = [];
  for (const place of places) {
    const name = normalize(place.displayName);
    let score = -1;
    if (name.startsWith(q)) score = 0;
    else if (name.split(" ").some((_word, i, words) => words.slice(i).join(" ").startsWith(q))) score = 1;
    else if (name.includes(q)) score = 2;
    if (score >= 0) scored.push({ place, score });
  }
  scored.sort(
    (a, b) =>
      a.score - b.score ||
      a.place.displayName.localeCompare(b.place.displayName, undefined, { numeric: true }) ||
      a.place.floorLabel.localeCompare(b.place.floorLabel),
  );
  return scored.slice(0, limit).map((s) => s.place);
}

const byName = (pattern: RegExp) => (p: PlaceSummary) => p.kind === "space" && pattern.test(p.displayName);
const byConnection = (type: string) => (p: PlaceSummary) => p.kind === "connection" && p.connectionType === type;

const WASHROOMS: GroupDef = { id: "washrooms", label: "Washrooms", icon: "washroom", match: byName(/washroom|restroom|toilet/i) };

export const POPULAR_GROUPS: GroupDef[] = [
  { id: "meeting", label: "Meeting rooms", icon: "meeting", match: byName(/meeting room/i) },
  { id: "focus", label: "Focus rooms", icon: "focus", match: byName(/^focus\b/i) },
  { id: "huddle", label: "Huddle rooms", icon: "huddle", match: byName(/^huddle\b/i) },
  WASHROOMS,
];

export const AMENITY_GROUPS: GroupDef[] = [
  WASHROOMS,
  { id: "kitchen", label: "Kitchen", icon: "kitchen", match: byName(/kitchen/i) },
  { id: "lifts", label: "Lifts", icon: "lift", match: byConnection("elevator") },
  { id: "stairs", label: "Stairs", icon: "stairs", match: byConnection("stairs") },
  { id: "storage", label: "Storage", icon: "storage", match: byName(/storage/i) },
];

export function placesInGroup(places: PlaceSummary[], group: GroupDef): PlaceSummary[] {
  return places
    .filter(group.match)
    .sort(
      (a, b) =>
        a.floorLabel.localeCompare(b.floorLabel, undefined, { numeric: true }) ||
        a.displayName.localeCompare(b.displayName, undefined, { numeric: true }),
    );
}

/** "11 locations", or the floor name when the group has a single place. */
export function groupSubtitle(members: PlaceSummary[]): string {
  if (members.length === 1) return members[0].floorLabel;
  return `${members.length} locations`;
}
