// Marker HTML matching the Battersea route markers. Each root is the exact
// anchor point (placement "center"); bubbles and labels overflow around it.
import { connectionIconName, icon, type IconName } from "../ui/icons";
import { esc } from "../util/text";

/** Hollow white ring with a grey border at the start of the route. */
export function departureMarkerHtml(): string {
  return `<div class="mk-depart" aria-hidden="true"></div>`;
}

/** White bubble with an icon over a dark dot, name in bold beside it. */
export function destinationMarkerHtml(name: string, iconName: IconName): string {
  return `<div class="mk-dest">
    <span class="mk-dest-bubble">${icon(iconName)}</span>
    <span class="mk-dest-label">${esc(name)}</span>
  </div>`;
}

/** Blue circle with the stairs/lift glyph next to a blue up/down arrow. */
export function connectionMarkerHtml(type: string | undefined, direction: "up" | "down" | undefined): string {
  const arrow = direction ? `<span class="mk-conn-dir">${icon(direction === "up" ? "arrowUp" : "arrowDown")}</span>` : "";
  return `<div class="mk-conn"><span class="mk-conn-type">${icon(connectionIconName(type))}</span>${arrow}</div>`;
}
