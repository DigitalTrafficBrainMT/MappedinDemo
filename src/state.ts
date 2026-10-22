// Single source of truth for which screen is showing (ADR-001). The panels
// render from it and the map reacts to it, so the two can't drift apart.
import type { TabId } from "./search/search";

export type Field = "from" | "to";

export type AppState =
  | { view: "browse"; query: string; tab: TabId; groupId: string | null }
  | { view: "location"; placeId: string }
  | {
      view: "editing";
      fromId: string | null;
      toId: string | null;
      active: Field;
      query: string;
      error: string | null;
      busy: boolean;
    }
  /** `step: null` is the overview (the phone's "Steps" list). */
  | { view: "directions"; fromId: string; toId: string; step: number | null };

export type ViewOf<V extends AppState["view"]> = Extract<AppState, { view: V }>;

export const HOME: AppState = { view: "browse", query: "", tab: "popular", groupId: null };

type Listener = (next: AppState, prev: AppState) => void;

let current: AppState = HOME;
const history: AppState[] = [];
const listeners: Listener[] = [];

function set(next: AppState) {
  const prev = current;
  current = next;
  listeners.forEach((listener) => listener(next, prev));
}

export function getState(): AppState {
  return current;
}

/** Move to another screen; Back returns here. */
export function navigate(next: AppState) {
  history.push(current);
  set(next);
}

/** Change the current screen in place (typing, stepping) without adding history. */
export function replace(next: AppState) {
  set(next);
}

export function back() {
  set(history.pop() ?? HOME);
}

/** Leave everything and start over at `to` (the phone's Close). */
export function reset(to: AppState = HOME) {
  history.length = 0;
  set(to);
}

/** Listeners run in registration order: register the UI before the map. */
export function subscribe(listener: Listener) {
  listeners.push(listener);
}
