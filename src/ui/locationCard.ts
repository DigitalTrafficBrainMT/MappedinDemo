// Location card (spec §7.5): name, floor, category chips, Directions. The
// demo data has no hours/logos/socials, so those Battersea rows are omitted.
import type { ViewOf } from "../state";
import { esc } from "../util/text";
import type { ViewModule } from "./context";
import { icon } from "./icons";
import { sheetHandle } from "./parts";

type Locating = ViewOf<"location">;

export const locationCard: ViewModule<Locating> = {
  render(panel, _banner, state, ctx) {
    const place = ctx.places.get(state.placeId);
    if (!place) return ctx.back();
    const chips = ctx.places.categoryNames(place.id);
    panel.innerHTML = `${sheetHandle()}
      <div class="loc-head">
        <div>
          <h2 class="loc-name">${esc(place.displayName)}</h2>
          <p class="loc-meta">${esc(place.floorLabel)}</p>
        </div>
        <button type="button" class="icon-btn" data-action="back" aria-label="Close">${icon("close")}</button>
      </div>
      ${chips.length ? `<div class="chips">${chips.map((c) => `<span class="chip">${esc(c)}</span>`).join("")}</div>` : ""}
      <button type="button" class="btn-primary" data-action="directions">Directions</button>`;

    panel.onclick = (event) => {
      const action = (event.target as HTMLElement).closest<HTMLElement>("[data-action]")?.dataset.action;
      if (action === "back") ctx.back();
      else if (action === "directions")
        ctx.navigate({ view: "editing", fromId: null, toId: place.id, active: "from", query: "", error: null, busy: false });
    };
    ctx.setSheetExpanded(false);
  },

  patch(panel, banner, prev, next, ctx) {
    if (prev.placeId !== next.placeId) locationCard.render(panel, banner, next, ctx);
  },
};
