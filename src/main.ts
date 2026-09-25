import "@mappedin/mappedin-js/lib/index.css";
import { getMapData, show3dMap } from "@mappedin/mappedin-js";
import type { TDirectionInstruction, Directions, Space, Coordinate } from "@mappedin/mappedin-js";

// Mappedin demo keys (Office Demo map)
const options = {
  key: "mik_yeBk0Vf0nNJtpesfu560e07e5",
  secret: "mis_2g9ST8ZcSFb5R9fPnsvYhrX3RyRwPtDGbMGweCYKEq385431022",
  mapId: "64ef49e662fd90fe020bee61",
};

// Average indoor walking speed, used to turn distances into the
// "2 minutes total" style time estimates (the SDK only gives meters).
const WALK_SPEED_METERS_PER_SECOND = 1.4;

// Full-bleed reset. #app is pinned to the viewport with `position: fixed;
// inset: 0` rather than sized with 100vw/100vh — vw/vh measure the full
// viewport *including* the scrollbar track on some browsers, and the
// default browser margin on <body> was pushing everything a few pixels
// past the visible edges, which is what showed up as bars on the right
// and bottom. `overflow: hidden` on html/body also stops that gap from
// ever becoming a scrollable area, and `inset: 0` recomputes automatically
// on any window/viewport size, so this adapts to any screen without extra
// JS or a resize listener.
const rootStyle = document.createElement("style");
rootStyle.textContent = `
  html, body {
    margin: 0;
    padding: 0;
    height: 100%;
    overflow: hidden;
  }
  #app {
    position: fixed;
    inset: 0;
  }
`;
document.head.appendChild(rootStyle);

const app = document.querySelector<HTMLDivElement>("#app")!;

// Map fills the whole screen; the wayfinding panel floats on top of it.
app.innerHTML = `
  <div id="map" style="position:absolute; inset:0;"></div>

  <div id="floor-selector"></div>

  <div id="search-panel" class="panel">
    <h2>Wayfinding</h2>
    <label>
      From
      <select id="from-select"></select>
    </label>
    <label>
      To
      <select id="to-select"></select>
    </label>
    <button id="go-btn">Get Directions</button>
  </div>

  <div id="directions-panel" class="panel" hidden>
    <div class="directions-header">
      <button id="back-btn" class="link-btn">&larr; Back</button>
    </div>
    <div class="directions-title">
      <div class="directions-subtitle">Directions to <span id="destination-name"></span></div>
      <div class="directions-time" id="total-time"></div>
    </div>
    <div class="progress-track">
      <div class="progress-fill" id="progress-fill"></div>
      <div class="progress-dots" id="progress-dots"></div>
    </div>
    <div class="current-location" id="current-location"></div>
    <div id="directions-list"></div>
    <div class="step-nav">
      <button id="prev-btn" class="secondary" aria-label="Previous step">&larr;</button>
      <button id="next-btn" aria-label="Next step">&rarr;</button>
    </div>
  </div>
`;

// Panel styling injected here so this stays a single self-contained file.
const style = document.createElement("style");
style.textContent = `
  .panel {
    position: absolute;
    top: 16px;
    left: 16px;
    width: 320px;
    max-height: calc(100vh - 32px);
    overflow-y: auto;
    background: #ffffff;
    border-radius: 16px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.18);
    padding: 18px;
    font-family: system-ui, -apple-system, sans-serif;
    box-sizing: border-box;
    z-index: 10;
  }

  /* --- Search panel --- */
  #search-panel h2 {
    margin: 0 0 12px;
    font-size: 16px;
  }
  #search-panel label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    color: #555;
    margin-bottom: 10px;
  }
  #search-panel select {
    display: block;
    width: 100%;
    margin-top: 4px;
    padding: 8px;
    font-size: 14px;
    border-radius: 6px;
    border: 1px solid #ccc;
    box-sizing: border-box;
  }
  #search-panel button {
    width: 100%;
    padding: 10px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    background: #2563eb;
    color: white;
    margin-top: 4px;
  }
  #search-panel button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* --- Directions panel --- */
  .directions-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }
  .link-btn {
    background: none;
    border: none;
    padding: 0;
    font-size: 14px;
    font-weight: 600;
    color: #111;
    cursor: pointer;
  }
  .directions-subtitle {
    font-size: 12px;
    color: #777;
    margin-bottom: 2px;
  }
  .directions-time {
    font-size: 22px;
    font-weight: 700;
    color: #111;
    margin-bottom: 14px;
  }

  .progress-track {
    position: relative;
    height: 20px;
    margin-bottom: 14px;
  }
  .progress-fill {
    position: absolute;
    top: 9px;
    left: 9px;
    right: 9px;
    height: 2px;
    background: #e2e2e2;
  }
  .progress-fill::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: var(--progress, 0%);
    background: #2563eb;
    transition: width 0.25s ease;
  }
  .progress-dots {
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 20px;
  }
  .progress-dot {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #fff;
    border: 2px solid #e2e2e2;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    color: #fff;
    z-index: 1;
  }
  .progress-dot.done {
    background: #2563eb;
    border-color: #2563eb;
  }
  .progress-dot.current {
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
  }

  .current-location {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 700;
    font-size: 14px;
    color: #111;
    padding-bottom: 10px;
    margin-bottom: 6px;
    border-bottom: 1px solid #eee;
  }
  .current-location::before {
    content: "";
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #999;
    flex-shrink: 0;
  }

  #directions-list .step {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    padding: 10px 6px;
    border-radius: 8px;
    cursor: pointer;
  }
  #directions-list .step.active {
    background: #f0f5ff;
  }
  #directions-list .step-icon {
    flex-shrink: 0;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #f2f2f2;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  #directions-list .step.active .step-icon {
    background: #2563eb;
    color: #fff;
  }
  #directions-list .step-icon svg {
    width: 16px;
    height: 16px;
  }
  #directions-list .step-text {
    line-height: 1.35;
    font-size: 14px;
    font-weight: 600;
    color: #111;
  }
  #directions-list .step-time {
    color: #888;
    font-size: 12px;
    font-weight: 400;
    margin-top: 2px;
  }
  #directions-list .empty {
    color: #888;
    font-size: 13px;
    padding: 8px 0;
  }

  .step-nav {
    display: flex;
    gap: 8px;
    margin-top: 12px;
  }
  .step-nav button {
    flex: 1;
    padding: 10px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    background: #2563eb;
    color: white;
  }
  .step-nav button.secondary {
    background: #f0f0f0;
    color: #333;
  }
  .step-nav button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  /* --- Floor selector --- */
  #floor-selector {
    position: absolute;
    top: 16px;
    right: 16px;
    flex-direction: column;
    gap: 8px;
    z-index: 10;
  }
  #floor-selector:not([hidden]) {
    display: flex;
  }
  #floor-selector button {
    min-width: 40px;
    height: 40px;
    padding: 0 10px;
    border-radius: 20px;
    border: none;
    background: #ffffff;
    color: #333;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
    font-family: system-ui, -apple-system, sans-serif;
    white-space: nowrap;
  }
  #floor-selector button.active {
    background: #111;
    color: #fff;
  }
`;
document.head.appendChild(style);

// ---------------------------------------------------------------------------
// Heading — used to rotate the camera so the direction of travel always
// points "up" on screen, like turn-by-turn heading-up navigation.
// ---------------------------------------------------------------------------

// Compass bearing (degrees clockwise from North) from one coordinate to
// another, matching the convention Camera.animateTo's `bearing` expects.
function bearingBetween(from: Coordinate, to: Coordinate): number {
  const lat1 = (from.latitude * Math.PI) / 180;
  const lat2 = (to.latitude * Math.PI) / 180;
  const dLon = ((to.longitude - from.longitude) * Math.PI) / 180;
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  const degrees = (Math.atan2(y, x) * 180) / Math.PI;
  return (degrees + 360) % 360;
}

// ---------------------------------------------------------------------------
// Time + text formatting
// ---------------------------------------------------------------------------

function formatDuration(meters: number): string {
  const seconds = meters / WALK_SPEED_METERS_PER_SECOND;
  const minutes = Math.round(seconds / 60);
  if (minutes < 1) return "Less than a minute";
  return `${minutes} minute${minutes === 1 ? "" : "s"}`;
}

// Turns a raw instruction into a readable sentence.
// The SDK gives structured data (action type/bearing + distance), not
// pre-written text, so we build the sentence ourselves.
function describeInstruction(instruction: TDirectionInstruction, fromName: string): string {
  const type = instruction.action?.type;
  const bearing = instruction.action?.bearing;

  if (type === "Departure") return `Leave ${fromName}`;
  if (type === "Arrival") return "You have arrived at your destination";
  if (type === "TakeConnection") {
    const direction = instruction.action?.direction;
    const connectionType = instruction.action?.connection?.type ?? "connection";
    const verb = connectionType === "elevator" ? "Take the elevator" : `Take the ${connectionType}`;
    return `${verb}${direction && direction !== "none" ? ` ${direction}` : ""}`;
  }
  if (type === "ExitConnection") return "Exit and head out";
  if (type === "Turn" && bearing) {
    if (bearing === "Straight") return "Continue straight";
    return `Turn ${bearing.replace(/([A-Z])/g, " $1").trim().toLowerCase()}`;
  }
  return "Continue";
}

// ---------------------------------------------------------------------------
// Icons — one small inline SVG per action, with turn icons rotated to match
// the bearing so the arrow actually points the way you're turning.
// ---------------------------------------------------------------------------

const ARROW_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M12 5l-6 6M12 5l6 6"/></svg>`;
const PIN_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11Z"/><circle cx="12" cy="10" r="2.5"/></svg>`;
const WALK_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="13" cy="4" r="2"/><path d="M14 8l-3 3 1 7M11 11 7 13l-1 6M11 11l4 2 3 3"/></svg>`;
const ELEVATOR_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M10 9l2-2 2 2M10 15l2 2 2-2"/></svg>`;
const ESCALATOR_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 18h4l10-10h2M4 18v2M20 8V6"/><circle cx="18" cy="5" r="1.5" fill="currentColor" stroke="none"/></svg>`;
const STAIRS_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4v-4h4v-4h4V8h4"/></svg>`;

const BEARING_ROTATION: Record<string, number> = {
  Straight: 0,
  Right: 90,
  SlightRight: 45,
  Left: -90,
  SlightLeft: -45,
  Back: 180,
};

function connectionIcon(connectionType: string | undefined): string {
  if (connectionType === "elevator") return ELEVATOR_SVG;
  if (connectionType === "escalator") return ESCALATOR_SVG;
  if (connectionType === "stairs") return STAIRS_SVG;
  return ARROW_SVG;
}

function iconFor(instruction: TDirectionInstruction): string {
  const type = instruction.action?.type;
  if (type === "Departure") return WALK_SVG;
  if (type === "Arrival") return PIN_SVG;
  if (type === "TakeConnection" || type === "ExitConnection") {
    return connectionIcon(instruction.action?.connection?.type);
  }
  if (type === "Turn") {
    const rotation = BEARING_ROTATION[instruction.action?.bearing ?? "Straight"] ?? 0;
    return `<span style="display:flex; transform: rotate(${rotation}deg);">${ARROW_SVG}</span>`;
  }
  return ARROW_SVG;
}

// ---------------------------------------------------------------------------
// show3dMap needs the container to already have a real size. On the very
// first paint the browser can still report 0x0, so wait a frame until it
// doesn't before handing the container to the SDK.
// ---------------------------------------------------------------------------

function waitForNonZeroSize(el: HTMLElement): Promise<void> {
  return new Promise((resolve) => {
    function check() {
      if (el.clientWidth > 0 && el.clientHeight > 0) {
        resolve();
      } else {
        requestAnimationFrame(check);
      }
    }
    check();
  });
}

async function init() {
  const mapContainer = document.getElementById("map")!;
  await waitForNonZeroSize(mapContainer);

  // Fetch the venue data, then render it in 3D
  const mapData = await getMapData(options);
  const mapView = await show3dMap(mapContainer, mapData);

  // Label every named space so the map is readable out of the box
  const spaces = mapData.getByType("space").filter((space) => !!space.name);
  spaces.forEach((space) => {
    mapView.Labels.add(space, space.name);
  });

  // --- Elements ---
  const searchPanel = document.getElementById("search-panel") as HTMLDivElement;
  const directionsPanel = document.getElementById("directions-panel") as HTMLDivElement;
  const fromSelect = document.getElementById("from-select") as HTMLSelectElement;
  const toSelect = document.getElementById("to-select") as HTMLSelectElement;
  const goBtn = document.getElementById("go-btn") as HTMLButtonElement;
  const backBtn = document.getElementById("back-btn") as HTMLButtonElement;
  const prevBtn = document.getElementById("prev-btn") as HTMLButtonElement;
  const nextBtn = document.getElementById("next-btn") as HTMLButtonElement;
  const destinationNameEl = document.getElementById("destination-name")!;
  const totalTimeEl = document.getElementById("total-time")!;
  const currentLocationEl = document.getElementById("current-location")!;
  const listEl = document.getElementById("directions-list")!;
  const progressFillEl = document.getElementById("progress-fill") as HTMLDivElement;
  const progressDotsEl = document.getElementById("progress-dots")!;
  const floorSelectorEl = document.getElementById("floor-selector")!;

  // --- Floor selector: one button per floor, top → bottom by elevation,
  // shown while browsing the map but hidden during active directions
  // (matching how the Battersea reference site hides it mid-route). ---
  const floors = [...mapView.currentFloorStack.floors].sort((a, b) => b.elevation - a.elevation);
  floorSelectorEl.innerHTML = floors
    .map((floor) => `<button data-floor-id="${floor.id}">${floor.shortName}</button>`)
    .join("");

  function syncFloorSelector() {
    floorSelectorEl.querySelectorAll<HTMLButtonElement>("button").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.floorId === mapView.currentFloor?.id);
    });
  }
  floorSelectorEl.querySelectorAll<HTMLButtonElement>("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.dataset.floorId) mapView.setFloor(btn.dataset.floorId);
    });
  });
  mapView.on("floor-change", syncFloorSelector);
  syncFloorSelector();

  // Populate the From/To dropdowns with every named space
  const optionsHtml = spaces
    .map((space) => `<option value="${space.id}">${space.name}</option>`)
    .join("");
  fromSelect.innerHTML = optionsHtml;
  toSelect.innerHTML = optionsHtml;
  // Default to two different spaces so a first click has something to show
  if (spaces.length > 1) toSelect.selectedIndex = 1;

  // --- State for the active route ---
  let activeDirections: Directions | null = null;
  let currentStepIndex = 0;
  // The step the "walked so far" highlight currently ends at.
  let highlightedStepIndex = -1;
  // Bumped on every highlight request; a running grow-in animation checks
  // this each frame and bails out as soon as it's stale, so a fast new
  // request cleanly supersedes an older one instead of fighting it.
  let highlightAnimationToken = 0;

  function showSearchView() {
    mapView.Navigation.clear();
    activeDirections = null;
    searchPanel.hidden = false;
    directionsPanel.hidden = true;
    floorSelectorEl.hidden = false;
  }

  const HIGHLIGHT_COLOR = "#2563eb";

  // highlightPathSection isn't additive — each call replaces the entire
  // highlighted range, it doesn't extend the previous one. So to keep every
  // already-walked segment dark, every call must highlight the FULL
  // (routeStart -> target) range, never just the newest increment.
  function setHighlight(start: Coordinate, target: Coordinate) {
    mapView.Navigation.highlightPathSection(start, target, {
      color: HIGHLIGHT_COLOR,
      widthMultiplier: 1.1,
      animationDuration: 0,
    });
  }

  // Animates the highlighted range growing from `fromCoordinate` to
  // `toCoordinate` by re-issuing setHighlight() every frame with an
  // interpolated endpoint — since the SDK's own animation only ever
  // animates the single range it's given (dropping earlier history), we
  // drive the "grow" effect ourselves instead.
  function animateHighlightGrowth(start: Coordinate, fromCoordinate: Coordinate, toCoordinate: Coordinate) {
    const token = ++highlightAnimationToken;
    const duration = 450;
    const startTime = performance.now();
    const floor = toCoordinate.floorId ? mapData.getById("floor", toCoordinate.floorId) : undefined;

    function frame(now: number) {
      if (token !== highlightAnimationToken) return; // a newer request took over
      const t = Math.min((now - startTime) / duration, 1);
      const eased = 1 - (1 - t) * (1 - t); // ease-out
      if (t < 1) {
        const latitude = fromCoordinate.latitude + (toCoordinate.latitude - fromCoordinate.latitude) * eased;
        const longitude = fromCoordinate.longitude + (toCoordinate.longitude - fromCoordinate.longitude) * eased;
        setHighlight(start, mapView.createCoordinate(latitude, longitude, floor));
        requestAnimationFrame(frame);
      } else {
        setHighlight(start, toCoordinate);
      }
    }
    requestAnimationFrame(frame);
  }

  function goToStep(index: number) {
    if (!activeDirections) return;
    const instructions = activeDirections.instructions;
    currentStepIndex = Math.max(0, Math.min(index, instructions.length - 1));

    // Highlight the portion of the path walked so far, and pan the camera
    // to where this step happens. Moving forward exactly one step (the
    // normal Next-button flow) animates the highlight growing in; jumping
    // to an arbitrary step or moving backward just snaps it instantly.
    const start = activeDirections.coordinates[0];
    const target = instructions[currentStepIndex].coordinate;
    if (start) {
      const movingForwardOneStep = currentStepIndex === highlightedStepIndex + 1;
      const previousTarget = instructions[highlightedStepIndex]?.coordinate;
      if (movingForwardOneStep && previousTarget && previousTarget.floorId === target.floorId) {
        animateHighlightGrowth(start, previousTarget, target);
      } else {
        highlightAnimationToken++; // cancel any animation still in flight
        setHighlight(start, target);
      }
      highlightedStepIndex = currentStepIndex;
    }
    const stepFloorId = target.floorId;
    if (stepFloorId && stepFloorId !== mapView.currentFloor?.id) {
      mapView.setFloor(stepFloorId);
    }

    // Rotate the camera to face the direction of travel: the bearing to the
    // *next* step if there is one (facing where you're about to go), or the
    // bearing from the previous step on arrival (facing how you got here).
    const nextCoordinate = instructions[currentStepIndex + 1]?.coordinate;
    const previousCoordinate = instructions[currentStepIndex - 1]?.coordinate;
    let bearing: number | undefined;
    if (nextCoordinate) bearing = bearingBetween(target, nextCoordinate);
    else if (previousCoordinate) bearing = bearingBetween(previousCoordinate, target);

    mapView.Camera.animateTo({ center: target, zoomLevel: 2500, bearing }, { duration: 600 });

    // Sync the active row + progress bar to the current step.
    listEl.querySelectorAll(".step").forEach((el, i) => {
      el.classList.toggle("active", i === currentStepIndex);
      if (i === currentStepIndex) el.scrollIntoView({ block: "nearest" });
    });
    progressDotsEl.querySelectorAll(".progress-dot").forEach((el, i) => {
      el.classList.toggle("done", i < currentStepIndex);
      el.classList.toggle("current", i === currentStepIndex);
    });
    const total = Math.max(instructions.length - 1, 1);
    progressFillEl.style.setProperty("--progress", `${(currentStepIndex / total) * 100}%`);

    prevBtn.disabled = currentStepIndex === 0;
    nextBtn.disabled = currentStepIndex === instructions.length - 1;
  }

  function renderDirections(directions: Directions, toSpace: Space, fromSpace: Space) {
    activeDirections = directions;
    highlightedStepIndex = -1;
    highlightAnimationToken++; // cancel any animation left over from a previous route
    const instructions = directions.instructions;

    destinationNameEl.textContent = toSpace.name;
    totalTimeEl.textContent = `${formatDuration(directions.distance)} total`;
    currentLocationEl.textContent = fromSpace.name;

    listEl.innerHTML = instructions
      .map((instruction, i) => {
        const meters = instruction.distance;
        return `
          <div class="step" data-index="${i}">
            <div class="step-icon">${iconFor(instruction)}</div>
            <div class="step-text">
              ${describeInstruction(instruction, fromSpace.name)}
              <div class="step-time">${meters > 0 ? formatDuration(meters) : ""}</div>
            </div>
          </div>
        `;
      })
      .join("");

    listEl.querySelectorAll<HTMLElement>(".step").forEach((el) => {
      el.addEventListener("click", () => goToStep(Number(el.dataset.index)));
    });

    // One dot per instruction, matching the Battersea-style stepper.
    progressDotsEl.innerHTML = instructions.map(() => `<div class="progress-dot"></div>`).join("");

    searchPanel.hidden = true;
    directionsPanel.hidden = false;
    floorSelectorEl.hidden = true;
    goToStep(0);
  }

  goBtn.addEventListener("click", async () => {
    const fromSpace = mapData.getById("space", fromSelect.value);
    const toSpace = mapData.getById("space", toSelect.value);
    if (!fromSpace || !toSpace || fromSpace.id === toSpace.id) return;

    goBtn.disabled = true;
    try {
      const directions = await mapData.getDirections(fromSpace, toSpace);
      if (directions) {
        mapView.Navigation.draw(directions);
        renderDirections(directions, toSpace, fromSpace);
      }
    } catch (err) {
      console.error("Failed to get directions:", err);
    } finally {
      goBtn.disabled = false;
    }
  });

  backBtn.addEventListener("click", showSearchView);
  prevBtn.addEventListener("click", () => goToStep(currentStepIndex - 1));
  nextBtn.addEventListener("click", () => goToStep(currentStepIndex + 1));

  // Expose for debugging in the browser console
  (window as any).mapView = mapView;
  (window as any).mapData = mapData;
}

init().catch((err) => console.error("Failed to load map:", err));
