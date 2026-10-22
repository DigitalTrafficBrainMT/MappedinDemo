// Desktop directions card (spec §7.1, measured from the Battersea reference).
import { getState, type ViewOf } from "../state";
import { esc } from "../util/text";
import type { RouteResult, UIContext, ViewModule } from "./context";
import { icon } from "./icons";
import { handleStepAction, headline, markActiveRow, progressHtml, stepNavHtml, timelineHtml } from "./parts";

type Directing = ViewOf<"directions">;

export const directionsPanel: ViewModule<Directing> = {
  render(panel, _banner, state, ctx) {
    const route = ctx.route();
    if (!route) return;
    const { from, to } = names(route, ctx);
    panel.innerHTML = `
      <header class="panel-header">
        <button type="button" class="link-btn" data-action="back">${icon("back")}<span>Back</span></button>
      </header>
      <p class="dir-sub">Directions to ${esc(to)}</p>
      <h2 class="dir-headline" data-slot="headline">${esc(headline(route.steps, state.step))}</h2>
      <div data-slot="progress">${progressHtml(route.steps, state.step)}</div>
      <div class="dir-scroll">${timelineHtml(route.steps, from, to, state.step)}</div>
      <div data-slot="nav">${stepNavHtml(state.step, route.steps.length)}</div>`;

    panel.onclick = (event) => {
      const target = event.target as HTMLElement;
      const s = getState();
      if (s.view !== "directions") return;
      if (target.closest('[data-action="back"]')) return ctx.back();
      handleStepAction(target, s.step, route.steps.length, (i) => ctx.goToStep(i));
    };
    markActiveRow(panel, state.step);
  },

  patch(panel, _banner, prev, next, ctx) {
    const route = ctx.route();
    if (!route || prev.step === next.step) return;
    setSlot(panel, "headline", esc(headline(route.steps, next.step)));
    setSlot(panel, "progress", progressHtml(route.steps, next.step));
    setSlot(panel, "nav", stepNavHtml(next.step, route.steps.length));
    markActiveRow(panel, next.step);
  },
};

export function names(route: RouteResult, ctx: UIContext) {
  return {
    from: ctx.places.get(route.fromId)?.displayName ?? "Start",
    to: ctx.places.get(route.toId)?.displayName ?? "Destination",
  };
}

export function setSlot(root: HTMLElement, slot: string, html: string) {
  const el = root.querySelector<HTMLElement>(`[data-slot="${slot}"]`);
  if (el) el.innerHTML = html;
}
