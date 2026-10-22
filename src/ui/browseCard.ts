// Browse card / phone sheet (spec §7.4): search, Battersea's
// Categories | Popular | Amenities tabs, and a carousel of quick-pick tiles.
import {
  AMENITY_GROUPS,
  POPULAR_GROUPS,
  groupSubtitle,
  placesInGroup,
  rankPlaces,
  type GroupDef,
  type TabId,
} from "../search/search";
import { getState, type ViewOf } from "../state";
import { esc } from "../util/text";
import type { UIContext, ViewModule } from "./context";
import { icon } from "./icons";
import { placeRowHtml, sheetHandle } from "./parts";

type Browsing = ViewOf<"browse">;

const TABS: { id: TabId; label: string }[] = [
  { id: "categories", label: "Categories" },
  { id: "popular", label: "Popular" },
  { id: "amenities", label: "Amenities" },
];

function groupsFor(tab: TabId, ctx: UIContext): GroupDef[] {
  const groups = tab === "categories" ? ctx.places.categoryGroups() : tab === "popular" ? POPULAR_GROUPS : AMENITY_GROUPS;
  return groups.filter((group) => ctx.places.places.some(group.match));
}

export const browseCard: ViewModule<Browsing> = {
  render(panel, _banner, state, ctx) {
    panel.innerHTML = `${sheetHandle()}
      <label class="search-pill" for="browse-search">
        ${icon("search")}<span class="sr-only">Search</span>
        <input id="browse-search" type="search" placeholder="Search..." autocomplete="off" spellcheck="false" />
        <button type="button" class="icon-btn search-clear" data-action="clear" aria-label="Clear search" hidden>${icon("close")}</button>
      </label>
      <div class="browse-body" data-slot="body"></div>`;

    const input = panel.querySelector<HTMLInputElement>("#browse-search")!;
    input.value = state.query;

    panel.oninput = (event) => {
      const s = getState();
      if (s.view !== "browse" || event.target !== input) return;
      ctx.replace({ ...s, query: input.value, groupId: null });
    };
    input.onfocus = () => {
      if (ctx.isMobile()) ctx.setSheetExpanded(true);
    };
    panel.onclick = (event) => {
      const action = (event.target as HTMLElement).closest<HTMLElement>("[data-action]");
      const s = getState();
      if (!action || s.view !== "browse") return;
      switch (action.dataset.action) {
        case "clear":
          input.value = "";
          ctx.replace({ ...s, query: "" });
          input.focus();
          break;
        case "tab":
          ctx.replace({ ...s, tab: action.dataset.tab as TabId, groupId: null });
          break;
        case "group": {
          const group = groupsFor(s.tab, ctx).find((g) => g.id === action.dataset.group);
          if (!group) break;
          const members = placesInGroup(ctx.places.places, group);
          if (members.length === 1) ctx.navigate({ view: "location", placeId: members[0].id });
          else ctx.replace({ ...s, groupId: group.id });
          break;
        }
        case "ungroup":
          ctx.replace({ ...s, groupId: null });
          break;
        case "pick":
          if (action.dataset.id) ctx.navigate({ view: "location", placeId: action.dataset.id });
          break;
        case "tiles-next":
          panel.querySelector(".tiles")?.scrollBy({ left: 220, behavior: "smooth" });
          break;
      }
    };

    renderBody(panel, state, ctx);
  },

  patch(panel, _banner, prev, next, ctx) {
    if (prev.query !== next.query || prev.tab !== next.tab || prev.groupId !== next.groupId) renderBody(panel, next, ctx);
  },
};

function renderBody(panel: HTMLElement, state: Browsing, ctx: UIContext) {
  const body = panel.querySelector<HTMLElement>('[data-slot="body"]');
  const clear = panel.querySelector<HTMLButtonElement>(".search-clear");
  if (!body) return;
  if (clear) clear.hidden = !state.query;
  const query = state.query.trim();

  if (query) {
    const results = rankPlaces(ctx.places.places, query);
    body.innerHTML = results.length
      ? `<div class="panel-scroll"><ul class="place-list">${results.map((p) => placeRowHtml(p)).join("")}</ul></div>`
      : `<p class="list-empty">No places match “${esc(query)}”.</p>`;
    if (ctx.isMobile()) ctx.setSheetExpanded(true);
    return;
  }

  const groups = groupsFor(state.tab, ctx);
  const group = groups.find((g) => g.id === state.groupId);
  if (group) {
    const members = placesInGroup(ctx.places.places, group);
    body.innerHTML = `<div class="group-header">
        <button type="button" class="link-btn" data-action="ungroup" aria-label="Back to ${esc(state.tab)}">${icon("back")}</button>
        <h2 class="panel-title">${esc(group.label)}</h2>
        <span class="group-count">${members.length}</span>
      </div>
      <div class="panel-scroll"><ul class="place-list">${members.map((p) => placeRowHtml(p)).join("")}</ul></div>`;
    if (ctx.isMobile()) ctx.setSheetExpanded(true);
    return;
  }

  body.innerHTML = `<div class="tabs" role="tablist" aria-label="Browse">${TABS.map(
    (tab, i) =>
      `${i === 1 ? '<span class="tab-divider" aria-hidden="true"></span>' : ""}<button type="button" role="tab" class="tab" data-action="tab" data-tab="${
        tab.id
      }" aria-selected="${tab.id === state.tab}">${tab.label}</button>`,
  ).join("")}</div>
    <div class="tiles-wrap">
      <div class="tiles" role="tabpanel">${groups
        .map((g) => {
          const members = placesInGroup(ctx.places.places, g);
          return `<button type="button" class="tile" data-action="group" data-group="${esc(g.id)}">
            <span class="tile-icon">${icon(g.icon)}</span>
            <span class="tile-label">${esc(g.label)}</span>
            <span class="tile-sub">${esc(groupSubtitle(members))}</span>
          </button>`;
        })
        .join("")}</div>
      ${groups.length > 3 ? `<button type="button" class="tiles-next" data-action="tiles-next" aria-label="More">${icon("chevronRight")}</button>` : ""}
    </div>`;
  if (ctx.isMobile()) ctx.setSheetExpanded(false);
}
