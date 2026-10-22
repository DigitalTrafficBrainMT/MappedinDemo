// Battersea's stacked zoom pill (bottom right, desktop only — phones pinch).
import type { CameraController } from "../map/camera";
import { icon } from "./icons";

export function mountMapControls(root: HTMLElement, camera: CameraController) {
  root.innerHTML = `<div class="zoom-pill">
    <button type="button" class="zoom-btn" data-zoom="1" aria-label="Zoom in">${icon("plus")}</button>
    <button type="button" class="zoom-btn" data-zoom="-1" aria-label="Zoom out">${icon("minus")}</button>
  </div>`;
  root.onclick = (event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>(".zoom-btn");
    if (button) camera.zoomBy(Number(button.dataset.zoom));
  };
}
