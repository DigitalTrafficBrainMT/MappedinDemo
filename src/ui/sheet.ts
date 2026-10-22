// Phone bottom sheet: drag the handle up to expand, down to collapse, or tap
// it to toggle (spec §7.4). The panel's CSS decides the two heights; while
// dragging, an inline height follows the finger.
const SNAP_PX = 40;

export function initSheet(panel: HTMLElement, isMobile: () => boolean, onChange: () => void) {
  let startY = 0;
  let startHeight = 0;
  let dragging = false;

  panel.addEventListener("pointerdown", (event) => {
    if (!isMobile() || !(event.target as HTMLElement).closest("[data-sheet-handle]")) return;
    dragging = true;
    startY = event.clientY;
    startHeight = panel.getBoundingClientRect().height;
    panel.setPointerCapture(event.pointerId);
    panel.classList.add("is-dragging");
  });

  panel.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    const height = Math.min(window.innerHeight * 0.85, Math.max(120, startHeight - (event.clientY - startY)));
    panel.style.height = `${height}px`;
    panel.style.maxHeight = `${height}px`;
  });

  const finish = (event: PointerEvent) => {
    if (!dragging) return;
    dragging = false;
    panel.classList.remove("is-dragging");
    panel.style.height = "";
    panel.style.maxHeight = "";
    const moved = event.clientY - startY;
    if (moved < -SNAP_PX) setExpanded(panel, true);
    else if (moved > SNAP_PX) setExpanded(panel, false);
    else setExpanded(panel, !panel.classList.contains("is-expanded"));
    onChange();
  };
  panel.addEventListener("pointerup", finish);
  panel.addEventListener("pointercancel", finish);
}

export function setExpanded(panel: HTMLElement, expanded: boolean) {
  panel.classList.toggle("is-expanded", expanded);
}
