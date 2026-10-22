// Battersea-style floor selector: 40px circles, top floor first, active one
// dark. Stays visible during directions (spec decision) and follows any
// floor change, including the ones the camera makes on a stairs step.
import type { MapView } from "@mappedin/mappedin-js";
import { esc, floorShortLabel } from "../util/text";

export function mountFloorSelector(root: HTMLElement, mapView: MapView) {
  const floors = [...mapView.currentFloorStack.floors].sort((a, b) => b.elevation - a.elevation);
  if (floors.length < 2) {
    root.hidden = true;
    return;
  }

  root.innerHTML = `<div class="floor-stack" role="group" aria-label="Floors">${floors
    .map(
      (floor) =>
        `<button type="button" class="floor-btn" data-floor-id="${esc(floor.id)}" aria-label="${esc(floor.name)}">${esc(
          floorShortLabel(floor.name, floor.shortName),
        )}</button>`,
    )
    .join("")}</div>`;

  root.onclick = (event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>(".floor-btn");
    if (button?.dataset.floorId) mapView.setFloor(button.dataset.floorId);
  };

  const sync = () => {
    root.querySelectorAll<HTMLButtonElement>(".floor-btn").forEach((button) => {
      const active = button.dataset.floorId === mapView.currentFloor?.id;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  };
  mapView.on("floor-change", sync);
  sync();
}
