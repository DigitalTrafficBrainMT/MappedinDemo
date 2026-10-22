// Phone directions (spec §7.2): Battersea's turn-by-turn banner at the top,
// a bottom sheet with progress and big arrows, and a Steps overview.
import type { Step } from "../directions/steps";
import { getState, type ViewOf } from "../state";
import { esc } from "../util/text";
import type { ViewModule } from "./context";
import { names, setSlot } from "./directionsPanel";
import { icon, stepIconName } from "./icons";
import { handleStepAction, headline, markActiveRow, progressHtml, sheetHandle, stepNavHtml, timelineHtml } from "./parts";

type Directing = ViewOf<"directions">;

export const directionsMobile: ViewModule<Directing> = {
  render(panel, banner, state, ctx) {
    const route = ctx.route();
    if (!route) return;
    const { from, to } = names(route, ctx);
    banner.hidden = false;

    if (state.step === null) {
      // Steps overview: the whole list, no active step.
      banner.innerHTML = `<div class="banner-row">
          <button type="button" class="link-btn" data-action="resume">${icon("back")}<span>Back</span></button>
        </div>
        <p class="dir-sub">Directions to ${esc(to)}</p>
        <h2 class="dir-headline">${esc(headline(route.steps, null))}</h2>`;
      panel.innerHTML = `${sheetHandle()}<div class="panel-scroll">${timelineHtml(route.steps, from, to, null)}</div>`;
      ctx.setSheetExpanded(true);
    } else {
      banner.innerHTML = `<div class="banner-row">
          <button type="button" class="link-btn" data-action="close">${icon("back")}<span>Close</span></button>
          <button type="button" class="icon-btn" data-action="overview" aria-label="Show all steps">${icon("list")}</button>
        </div>
        <div class="banner-step" data-slot="current" aria-live="polite">${currentStepHtml(route.steps[state.step])}</div>`;
      panel.innerHTML = `${sheetHandle()}
        <div data-slot="progress">${progressHtml(route.steps, state.step)}</div>
        <p class="dir-sub">Directions to ${esc(to)}</p>
        <h2 class="dir-headline" data-slot="headline">${esc(headline(route.steps, state.step))}</h2>
        <div data-slot="nav">${stepNavHtml(state.step, route.steps.length)}</div>`;
      ctx.setSheetExpanded(false);
    }

    banner.onclick = (event) => {
      const action = (event.target as HTMLElement).closest<HTMLElement>("[data-action]")?.dataset.action;
      if (action === "close") ctx.close();
      else if (action === "overview") ctx.goToStep(null);
      else if (action === "resume") ctx.resumeSteps();
    };
    panel.onclick = (event) => {
      const s = getState();
      if (s.view !== "directions") return;
      handleStepAction(event.target as HTMLElement, s.step, route.steps.length, (i) => ctx.goToStep(i));
    };
  },

  patch(panel, banner, prev, next, ctx) {
    const route = ctx.route();
    if (!route || prev.step === next.step) return;
    // Switching between turn-by-turn and the overview is a different layout.
    if (prev.step === null || next.step === null) return directionsMobile.render(panel, banner, next, ctx);
    setSlot(banner, "current", currentStepHtml(route.steps[next.step]));
    setSlot(panel, "progress", progressHtml(route.steps, next.step));
    setSlot(panel, "headline", esc(headline(route.steps, next.step)));
    setSlot(panel, "nav", stepNavHtml(next.step, route.steps.length));
    markActiveRow(panel, next.step);
  },
};

function currentStepHtml(step: Step): string {
  return `<span class="banner-icon">${icon(stepIconName(step))}</span>
    <div class="banner-text"><p class="banner-instr">${esc(step.text)}</p>${
      step.timeText ? `<p class="banner-time">${esc(step.timeText)}</p>` : ""
    }</div>`;
}
