import type { Step } from "../directions/steps";
import type { PlaceSummary } from "../search/search";

// 24×24 stroke icons drawn in currentColor, so they pick up white on the
// active (dark) step row automatically.
const PATHS = {
  back: '<path d="M19 12H5M11 18l-6-6 6-6"/>',
  close: '<path d="M18 6 6 18M6 6l12 12"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  swap: '<path d="M8 4v14M4 8l4-4 4 4M16 20V6M12 16l4 4 4-4"/>',
  list: '<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r=".8"/><circle cx="4.5" cy="12" r=".8"/><circle cx="4.5" cy="18" r=".8"/>',
  pin: '<path d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11Z"/><circle cx="12" cy="10" r="2.5"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  arrowLeft: '<path d="M20 12H5M11 6l-6 6 6 6"/>',
  arrowRight: '<path d="M4 12h15M13 6l6 6-6 6"/>',
  arrowUp: '<path d="M12 20V5M6 11l6-6 6 6"/>',
  arrowDown: '<path d="M12 4v15M6 13l6 6 6-6"/>',
  turnRight: '<path d="M6 20v-7a5 5 0 0 1 5-5h8M15 4l4 4-4 4"/>',
  turnLeft: '<path d="M18 20v-7a5 5 0 0 0-5-5H5M9 4 5 8l4 4"/>',
  bearRight: '<path d="M8 20v-6l9-9M11 5h6v6"/>',
  bearLeft: '<path d="M16 20v-6L7 5M13 5H7v6"/>',
  uturn: '<path d="M7 20V10a5 5 0 0 1 10 0v6M13 13l4 4 4-4"/>',
  stairs: '<path d="M3 20h5v-5h5v-5h5V5h3"/>',
  lift: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="m9 9 3-3 3 3M9 15l3 3 3-3"/>',
  escalator: '<path d="M3 19h4l9-10h5"/><circle cx="9" cy="6" r="1.5"/><path d="M9 9v3"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  chevronRight: '<path d="m9 6 6 6-6 6"/>',
  meeting: '<circle cx="8" cy="8" r="2.5"/><circle cx="16" cy="8" r="2.5"/><path d="M3.5 19a4.5 4.5 0 0 1 9 0M11.5 19a4.5 4.5 0 0 1 9 0"/>',
  focus: '<path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="14" width="4" height="6" rx="1.5"/><rect x="17" y="14" width="4" height="6" rx="1.5"/>',
  huddle: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3Z"/>',
  washroom: '<circle cx="12" cy="4.5" r="2"/><path d="M9 21v-6H7.5L9 8.5h6l1.5 6.5H15v6"/>',
  kitchen: '<path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 3c-1.7 0-3 2.2-3 5s1.3 4 3 4v9"/>',
  storage: '<path d="M3 7l9-4 9 4v10l-9 4-9-4V7Z"/><path d="M3 7l9 4 9-4M12 11v10"/>',
  office: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/>',
  print: '<path d="M7 9V3h10v6M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"/><rect x="7" y="14" width="10" height="7"/>',
  category: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
  room: '<path d="M5 21h14M7 21V4a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v17"/><circle cx="14" cy="12" r=".8"/>',
} as const;

export type IconName = keyof typeof PATHS;

export function icon(name: IconName | string, className = "icon"): string {
  const paths = PATHS[name as IconName] ?? PATHS.room;
  return `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths}</svg>`;
}

export function connectionIconName(type: string | undefined): IconName {
  if (type === "elevator") return "lift";
  if (type === "escalator") return "escalator";
  return "stairs";
}

// Battersea uses a straight arrow for "Leave X and turn left" / "Exit … head
// left" and curved arrows for turns in a corridor.
export function stepIconName(step: Step): IconName {
  switch (step.kind) {
    case "depart":
    case "exit-connection":
      return step.side === "left" ? "arrowLeft" : step.side === "right" ? "arrowRight" : "arrowUp";
    case "turn":
      return step.side === "left" ? "turnLeft" : "turnRight";
    case "bear":
      return step.side === "left" ? "bearLeft" : "bearRight";
    case "uturn":
      return "uturn";
    case "take-connection":
      return connectionIconName(step.connectionType);
    case "arrive":
      return "pin";
  }
}

export function placeIconName(place: PlaceSummary): IconName {
  if (place.kind === "connection") return connectionIconName(place.connectionType);
  const name = place.displayName.toLowerCase();
  if (name.includes("meeting")) return "meeting";
  if (name.startsWith("focus")) return "focus";
  if (name.startsWith("huddle")) return "huddle";
  if (/washroom|restroom|toilet/.test(name)) return "washroom";
  if (name.includes("kitchen")) return "kitchen";
  if (name.includes("storage")) return "storage";
  if (name.startsWith("office")) return "office";
  if (name.startsWith("print")) return "print";
  return "room";
}
