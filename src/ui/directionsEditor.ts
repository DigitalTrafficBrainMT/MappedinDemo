// "Choose Departure / Choose Destination" editor (spec §7.6).
import { rankPlaces } from "../search/search";
import { getState, type Field, type ViewOf } from "../state";
import { esc } from "../util/text";
import type { UIContext, ViewModule } from "./context";
import { icon } from "./icons";
import { placeRowHtml, sheetHandle } from "./parts";

type Editing = ViewOf<"editing">;

const INPUT_ID: Record<Field, string> = { from: "route-from", to: "route-to" };

export const directionsEditor: ViewModule<Editing> = {
  render(panel, _banner, state, ctx) {
    panel.innerHTML = `${sheetHandle()}
      <header class="panel-header">
        <button type="button" class="link-btn" data-action="back" aria-label="Back">${icon("back")}</button>
        <h2 class="panel-title">Directions</h2>
      </header>
      <div class="route-fields">
        <div class="route-marks" aria-hidden="true"><span class="rm-dot"></span><span class="rm-line"></span><span class="rm-pin">${icon(
          "pin",
        )}</span></div>
        <label class="pill-input" for="${INPUT_ID.from}">
          <span class="sr-only">Departure</span>${icon("search")}
          <input id="${INPUT_ID.from}" data-field="from" type="text" placeholder="Choose Departure" autocomplete="off" spellcheck="false" />
        </label>
        <label class="pill-input" for="${INPUT_ID.to}">
          <span class="sr-only">Destination</span>${icon("search")}
          <input id="${INPUT_ID.to}" data-field="to" type="text" placeholder="Choose Destination" autocomplete="off" spellcheck="false" />
        </label>
        <button type="button" class="icon-btn swap-btn" data-action="swap" aria-label="Swap departure and destination">${icon(
          "swap",
        )}</button>
      </div>
      <p class="form-msg" data-slot="msg" role="status"></p>
      <div class="panel-scroll" data-slot="list"></div>`;

    panel.onclick = (event) => {
      const action = (event.target as HTMLElement).closest<HTMLElement>("[data-action]");
      const s = getState();
      if (!action || s.view !== "editing") return;
      if (action.dataset.action === "back") ctx.back();
      else if (action.dataset.action === "swap") ctx.swapEnds();
      else if (action.dataset.action === "pick" && action.dataset.id) ctx.pickPlace(action.dataset.id);
    };

    // Inputs are rebuilt on each render, so direct handlers can't stack up.
    panel.querySelectorAll<HTMLInputElement>("input[data-field]").forEach((input) => {
      input.onfocus = () => {
        const field = input.dataset.field as Field;
        const s = getState();
        if (s.view !== "editing") return;
        input.select();
        if (s.active !== field || s.query) ctx.replace({ ...s, active: field, query: "", error: null });
        if (ctx.isMobile()) ctx.setSheetExpanded(true);
      };
    });

    panel.oninput = (event) => {
      const input = event.target as HTMLInputElement;
      const field = input.dataset?.field as Field | undefined;
      const s = getState();
      if (!field || s.view !== "editing") return;
      // Emptying a box clears its choice, so it doesn't refill as you backspace.
      const cleared = input.value === "" ? { [field === "from" ? "fromId" : "toId"]: null } : {};
      ctx.replace({ ...s, ...cleared, active: field, query: input.value, error: null });
    };

    panel.onkeydown = (event) => {
      const s = getState();
      if (event.key !== "Enter" || s.view !== "editing" || !s.query.trim()) return;
      const first = rankPlaces(ctx.places.places, s.query, 1)[0];
      if (first) {
        event.preventDefault();
        ctx.pickPlace(first.id);
      }
    };

    ctx.setSheetExpanded(true);
    syncInputs(panel, state, ctx);
    renderList(panel, state, ctx);
    renderMessage(panel, state);
    // Put the caret in whichever box still needs filling.
    const focusField = !state.fromId ? "from" : !state.toId ? "to" : null;
    if (focusField && !ctx.isMobile()) panel.querySelector<HTMLInputElement>(`#${INPUT_ID[focusField]}`)?.focus();
  },

  patch(panel, _banner, prev, next, ctx) {
    // Read before renderList: replacing the list drops focus from a clicked row.
    const focusInPanel = panel.contains(document.activeElement);
    syncInputs(panel, next, ctx);
    if (prev.query !== next.query || prev.active !== next.active || prev.fromId !== next.fromId || prev.toId !== next.toId) {
      renderList(panel, next, ctx);
    }
    if (prev.error !== next.error || prev.busy !== next.busy) renderMessage(panel, next);
    // After picking from the list, move the caret to the box that still needs
    // filling. Not after a map click — focus isn't in the panel then, and
    // popping the phone keyboard over the map would be jarring.
    if (prev.active !== next.active) {
      const input = panel.querySelector<HTMLInputElement>(`#${INPUT_ID[next.active]}`);
      if (input && document.activeElement !== input && focusInPanel) input.focus();
    }
  },
};

// A box belongs to the user while they're typing a query into it; otherwise
// it shows the name of the place it holds — including right after a pick,
// when it may still have focus (Enter on a result, or Safari, which doesn't
// move focus to clicked buttons).
function syncInputs(panel: HTMLElement, state: Editing, ctx: UIContext) {
  (["from", "to"] as Field[]).forEach((field) => {
    const input = panel.querySelector<HTMLInputElement>(`#${INPUT_ID[field]}`);
    const typing = document.activeElement === input && state.active === field && state.query !== "";
    if (!input || typing) return;
    const place = ctx.places.get(field === "from" ? state.fromId : state.toId);
    const value = place ? place.displayName : "";
    // Assigning .value (even unchanged) drops the select-all done on focus.
    if (input.value !== value) input.value = value;
  });
}

function renderList(panel: HTMLElement, state: Editing, ctx: UIContext) {
  const slot = panel.querySelector<HTMLElement>('[data-slot="list"]');
  if (!slot) return;
  const selectedId = state.active === "from" ? state.fromId : state.toId;
  const query = state.query.trim();

  if (query) {
    const results = rankPlaces(ctx.places.places, query);
    slot.innerHTML = results.length
      ? `<ul class="place-list">${results.map((p) => placeRowHtml(p, p.id === selectedId)).join("")}</ul>`
      : `<p class="list-empty">No places match “${esc(query)}”.</p>`;
    return;
  }

  slot.innerHTML = ctx.places
    .roomsByFloor()
    .map(
      (group) =>
        `<h3 class="list-heading">${esc(group.floorLabel)}</h3><ul class="place-list">${group.places
          .map((p) => placeRowHtml(p, p.id === selectedId))
          .join("")}</ul>`,
    )
    .join("");
}

function renderMessage(panel: HTMLElement, state: Editing) {
  const slot = panel.querySelector<HTMLElement>('[data-slot="msg"]');
  if (!slot) return;
  slot.classList.toggle("is-error", Boolean(state.error));
  slot.textContent = state.error ?? (state.busy ? "Finding the best route…" : "");
}
