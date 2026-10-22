// Markup shared between panels. All map/user data goes through esc().
import { buildProgress, fillFraction } from "../directions/progress";
import { formatTotalTime, type Step } from "../directions/steps";
import type { PlaceSummary } from "../search/search";
import { esc } from "../util/text";
import { connectionIconName, icon, placeIconName, stepIconName } from "./icons";

export function sheetHandle(): string {
  return `<div class="sheet-handle" data-sheet-handle aria-hidden="true"><span></span></div>`;
}

export function headline(steps: Step[], current: number | null): string {
  if (current !== null && current === steps.length - 1) return "You have arrived";
  return formatTotalTime(steps.length ? steps[steps.length - 1].cumulative : 0);
}

export function progressHtml(steps: Step[], current: number | null): string {
  const fill = fillFraction(steps, current) * 100;
  const nodes = buildProgress(steps)
    .map((node) => {
      const done = current !== null && node.index < current;
      const isCurrent = current !== null && node.index === current;
      let glyph = "";
      if (node.kind === "connection") glyph = icon(done ? "check" : connectionIconName(node.connectionType));
      if (node.kind === "end") glyph = icon(isCurrent ? "check" : "pin");
      const state = `${done ? " is-done" : ""}${isCurrent ? " is-current" : ""}`;
      return `<span class="pnode pnode--${node.kind}${state}" style="--pos:${node.position * 100}%">${glyph}</span>`;
    })
    .join("");
  return `<div class="progress" style="--fill:${fill}%" aria-hidden="true">
    <div class="progress-track"><div class="progress-fill"></div></div>${nodes}
  </div>`;
}

export function timelineHtml(steps: Step[], fromName: string, toName: string, current: number | null): string {
  const rows = steps
    .map((step, i) => {
      const active = i === current;
      return `<li><button type="button" class="tl-step${active ? " is-active" : ""}" data-action="step" data-index="${i}"${
        active ? ' aria-current="step"' : ""
      }>
        <span class="tl-icon">${icon(stepIconName(step))}</span>
        <span class="tl-body"><span class="tl-text">${esc(step.text)}</span>${
          step.timeText ? `<span class="tl-time">${esc(step.timeText)}</span>` : ""
        }</span>
      </button></li>`;
    })
    .join("");
  return `<div class="timeline">
    <p class="tl-place"><span class="tl-place-mark"><span class="tl-dot"></span></span><span>${esc(fromName)}</span></p>
    <ol class="tl-steps" aria-label="Steps">${rows}</ol>
    <p class="tl-place tl-place--end"><span class="tl-place-mark">${icon("pin")}</span><span>${esc(toName)}</span></p>
  </div>`;
}

/** Re-mark the active row without rebuilding the list (keeps scroll position). */
export function markActiveRow(root: HTMLElement, current: number | null) {
  root.querySelectorAll<HTMLButtonElement>(".tl-step").forEach((row) => {
    const active = Number(row.dataset.index) === current;
    row.classList.toggle("is-active", active);
    if (active) {
      row.setAttribute("aria-current", "step");
      row.scrollIntoView({ block: "nearest" });
    } else {
      row.removeAttribute("aria-current");
    }
  });
}

export function stepNavHtml(current: number | null, count: number): string {
  const prevDisabled = current === null || current <= 0;
  const nextDisabled = current === null || current >= count - 1;
  return `<div class="step-nav">
    <button type="button" class="step-btn" data-action="prev" aria-label="Previous step"${prevDisabled ? " disabled" : ""}>${icon(
      "arrowLeft",
    )}</button>
    <button type="button" class="step-btn" data-action="next" aria-label="Next step"${nextDisabled ? " disabled" : ""}>${icon(
      "arrowRight",
    )}</button>
  </div>`;
}

export function placeRowHtml(place: PlaceSummary, selected = false): string {
  return `<li><button type="button" class="place-row${selected ? " is-selected" : ""}" data-action="pick" data-id="${esc(place.id)}">
    <span class="place-row-icon">${icon(placeIconName(place))}</span>
    <span class="place-row-text"><span class="place-row-name">${esc(place.displayName)}</span><span class="place-row-sub">${esc(
      place.floorLabel,
    )}</span></span>
  </button></li>`;
}

/** Shared step-navigation click handling for both directions layouts. */
export function handleStepAction(target: HTMLElement, current: number | null, count: number, goToStep: (i: number) => void) {
  const action = target.closest<HTMLElement>("[data-action]");
  if (!action) return false;
  if (action.dataset.action === "prev" && current !== null) goToStep(Math.max(0, current - 1));
  else if (action.dataset.action === "next" && current !== null) goToStep(Math.min(count - 1, current + 1));
  else if (action.dataset.action === "step") goToStep(Number(action.dataset.index));
  else return false;
  return true;
}
