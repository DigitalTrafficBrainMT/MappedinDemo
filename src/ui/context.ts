import type { Directions } from "@mappedin/mappedin-js";
import type { Step } from "../directions/steps";
import type { PlaceIndex } from "../places";
import type { AppState } from "../state";

export interface RouteResult {
  key: string;
  fromId: string;
  toId: string;
  directions: Directions;
  steps: Step[];
}

/** What a panel module may read and do. Panels never touch the SDK (ADR-001). */
export interface UIContext {
  places: PlaceIndex;
  route(): RouteResult | null;
  isMobile(): boolean;
  navigate(next: AppState): void;
  replace(next: AppState): void;
  back(): void;
  close(): void;
  pickPlace(placeId: string): void;
  /** Swap departure and destination; re-route straight away if both are set. */
  swapEnds(): void;
  goToStep(step: number | null): void;
  resumeSteps(): void;
  setSheetExpanded(expanded: boolean): void;
}

/**
 * `render` builds a screen from scratch; `patch` updates it in place when the
 * screen stays the same (keeps input focus/caret while typing).
 */
export interface ViewModule<S extends AppState> {
  render(panel: HTMLElement, banner: HTMLElement, state: S, ctx: UIContext): void;
  patch?(panel: HTMLElement, banner: HTMLElement, prev: S, next: S, ctx: UIContext): void;
}
