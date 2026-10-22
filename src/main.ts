// Inter is self-hosted (not Google Fonts) so visitors' IPs aren't sent to a
// third party without consent — an EU/GDPR concern for a public demo.
import "@fontsource-variable/inter";
import "@mappedin/mappedin-js/lib/index.css";
import "./styles.css";
import { getMapData, show3dMap } from "@mappedin/mappedin-js";
import type { Coordinate, Label, MapData, MapView, Marker, Space } from "@mappedin/mappedin-js";
import { MAPPEDIN_OPTIONS, MOBILE_QUERY } from "./config";
import { buildSteps, type RawInstruction, type RawInstructionType } from "./directions/steps";
import { CameraController } from "./map/camera";
import { mountFloorSelector } from "./map/floors";
import { destinationMarkerHtml } from "./map/markers";
import { RouteLayer } from "./map/route";
import { PlaceIndex, type Place } from "./places";
import { HOME, back, getState, navigate, replace, reset, subscribe, type AppState } from "./state";
import { browseCard } from "./ui/browseCard";
import type { RouteResult, UIContext, ViewModule } from "./ui/context";
import { directionsEditor } from "./ui/directionsEditor";
import { directionsMobile } from "./ui/directionsMobile";
import { directionsPanel } from "./ui/directionsPanel";
import { placeIconName } from "./ui/icons";
import { locationCard } from "./ui/locationCard";
import { mountMapControls } from "./ui/mapControls";
import { initSheet, setExpanded } from "./ui/sheet";
import { distanceM } from "./util/geo";

const app = document.querySelector<HTMLDivElement>("#app")!;
app.innerHTML = `
  <div id="map" class="map"></div>
  <div id="banner" class="banner" hidden></div>
  <section id="panel" class="panel" aria-label="Wayfinding" hidden></section>
  <div id="floor-selector" class="floor-selector"></div>
  <div id="map-controls" class="map-controls"></div>
  <div id="overlay" class="overlay"><div class="spinner" role="status" aria-label="Loading map"></div></div>`;

const el = {
  map: document.getElementById("map")!,
  banner: document.getElementById("banner")!,
  panel: document.getElementById("panel")!,
  floors: document.getElementById("floor-selector")!,
  controls: document.getElementById("map-controls")!,
  overlay: document.getElementById("overlay")!,
};

// show3dMap needs the container to already have a real size. On the very
// first paint the browser can still report 0x0, so wait until it doesn't.
function waitForNonZeroSize(target: HTMLElement): Promise<void> {
  return new Promise((resolve) => {
    const check = () => (target.clientWidth > 0 && target.clientHeight > 0 ? resolve() : requestAnimationFrame(check));
    check();
  });
}

async function start() {
  try {
    await waitForNonZeroSize(el.map);
    const mapData = await getMapData(MAPPEDIN_OPTIONS);
    const mapView = await show3dMap(el.map, mapData);
    setup(mapData, mapView);
    el.overlay.hidden = true;
  } catch (error) {
    console.error("Failed to load the map:", error);
    el.overlay.innerHTML = `<div class="error-card" role="alert">
      <h2>Couldn't load the map</h2>
      <p>Check your connection and try again.</p>
      <button type="button" class="btn-primary" id="retry">Try again</button>
    </div>`;
    document.getElementById("retry")?.addEventListener("click", () => location.reload());
  }
}

function setup(mapData: MapData, mapView: MapView) {
  const places = new PlaceIndex(mapData);
  const camera = new CameraController(mapView);
  const route = new RouteLayer(mapView);
  const mobileQuery = window.matchMedia(MOBILE_QUERY);
  const isMobile = () => mobileQuery.matches;

  // Map labels keep the data's emoji names; rooms become clickable.
  const labels = new Map<string, Label>();
  for (const place of places.places) {
    if (place.kind !== "space") continue;
    const space = place.target as Space;
    labels.set(place.id, mapView.Labels.add(space, place.name));
    mapView.updateState(space, { interactive: true, hoverColor: "#DCE5FF" });
  }

  mountFloorSelector(el.floors, mapView);
  mountMapControls(el.controls, camera);

  // ---- Routes ------------------------------------------------------------
  let routeCache: RouteResult | null = null;
  let lastStep = 0;

  async function startRoute(fromId: string, toId: string) {
    const s = getState();
    if (s.view !== "editing") return;
    const from = places.get(fromId);
    const to = places.get(toId);
    if (!from || !to) return;
    if (fromId === toId) return replace({ ...s, error: "Pick two different places.", busy: false });

    replace({ ...s, error: null, busy: true });
    try {
      const directions = await mapData.getDirections(from.target, to.target);
      const now = getState();
      if (now.view !== "editing" || now.fromId !== fromId || now.toId !== toId) return; // user moved on
      if (!directions) return replace({ ...now, busy: false, error: "No route found between these places." });

      const instructions: RawInstruction[] = directions.instructions.map((instruction) => ({
        type: instruction.action.type as RawInstructionType,
        bearing: instruction.action.bearing,
        direction: instruction.action.direction,
        connectionType: instruction.action.connection?.type,
        toFloorId: instruction.action.toFloor?.id,
        distance: instruction.distance,
        lat: instruction.coordinate.latitude,
        lng: instruction.coordinate.longitude,
        floorId: instruction.coordinate.floorId ?? "",
      }));
      const steps = buildSteps({
        instructions,
        fromName: from.displayName,
        toName: to.displayName,
        departureId: from.id,
        floorNames: places.floorNames(),
        landmarks: places.landmarks(),
      });
      routeCache = { key: `${fromId}>${toId}`, fromId, toId, directions, steps };
      lastStep = 0;
      replace({ ...now, busy: false }); // Back from directions returns to a settled editor
      navigate({ view: "directions", fromId, toId, step: 0 });
    } catch (error) {
      console.error("getDirections failed:", error);
      const now = getState();
      if (now.view === "editing") replace({ ...now, busy: false, error: "Couldn't work out a route. Please try again." });
    }
  }

  // ---- UI ----------------------------------------------------------------
  const ctx: UIContext = {
    places,
    route: () => routeCache,
    isMobile,
    navigate,
    replace,
    back,
    close: () => reset(HOME),
    pickPlace(placeId) {
      const s = getState();
      if (s.view !== "editing") return;
      const next = { ...s, query: "", error: null, ...(s.active === "from" ? { fromId: placeId } : { toId: placeId }) };
      const other = s.active === "from" ? "to" : "from";
      if (!(other === "from" ? next.fromId : next.toId)) return replace({ ...next, active: other });
      replace(next);
      void startRoute(next.fromId!, next.toId!);
    },
    swapEnds() {
      const s = getState();
      if (s.view !== "editing") return;
      const next = { ...s, fromId: s.toId, toId: s.fromId, query: "", error: null };
      replace(next);
      if (next.fromId && next.toId) void startRoute(next.fromId, next.toId);
    },
    goToStep(step) {
      const s = getState();
      if (s.view !== "directions" || !routeCache) return;
      if (step === null) {
        if (s.step !== null) lastStep = s.step;
        return replace({ ...s, step: null });
      }
      replace({ ...s, step: Math.max(0, Math.min(routeCache.steps.length - 1, step)) });
    },
    resumeSteps() {
      ctx.goToStep(lastStep);
    },
    setSheetExpanded(expanded) {
      setExpanded(el.panel, expanded);
    },
  };

  let mounted: ViewModule<AppState> | null = null;

  function moduleFor(state: AppState): ViewModule<AppState> {
    const module =
      state.view === "browse"
        ? browseCard
        : state.view === "location"
          ? locationCard
          : state.view === "editing"
            ? directionsEditor
            : isMobile()
              ? directionsMobile
              : directionsPanel;
    return module as ViewModule<AppState>;
  }

  function renderUI(next: AppState, prev: AppState, force = false) {
    const module = moduleFor(next);
    if (!force && module === mounted && prev.view === next.view && module.patch) {
      module.patch(el.panel, el.banner, prev, next, ctx);
    } else {
      el.banner.hidden = true;
      el.banner.innerHTML = "";
      el.banner.onclick = null;
      el.panel.hidden = false;
      el.panel.dataset.view = next.view;
      module.render(el.panel, el.banner, next, ctx);
      mounted = module;
    }
  }

  // ---- Map reactions -----------------------------------------------------
  let mapToken = 0;
  let drawnKey: string | null = null;
  let locationMarker: Marker | null = null;
  const hiddenLabels = new Set<string>();

  function setLabelHidden(placeId: string, hidden: boolean) {
    const label = labels.get(placeId);
    if (!label || hiddenLabels.has(placeId) === hidden) return;
    mapView.updateState(label, { enabled: !hidden });
    if (hidden) hiddenLabels.add(placeId);
    else hiddenLabels.delete(placeId);
  }

  function showAllLabels() {
    [...hiddenLabels].forEach((id) => setLabelHidden(id, false));
  }

  function clearLocationMarker() {
    if (locationMarker) mapView.Markers.remove(locationMarker);
    locationMarker = null;
  }

  // The destination-style marker for a selected place replaces its label.
  function markPlace(place: Place, floorId: string) {
    clearLocationMarker();
    showAllLabels();
    setLabelHidden(place.id, true);
    locationMarker = mapView.Markers.add(
      places.anchor(place, floorId),
      destinationMarkerHtml(place.displayName, placeIconName(place)),
      { rank: "always-visible", placement: "center" },
    );
  }

  function clearRoute() {
    route.clear();
    drawnKey = null;
  }

  function setFloor(floorId: string | undefined) {
    if (floorId && floorId !== mapView.currentFloor?.id) mapView.setFloor(floorId);
  }

  // Leave room for whatever UI is on screen (spec §6), measured live.
  function refreshOffsets() {
    const pad = 16;
    const floorsRect = el.floors.hidden ? null : el.floors.getBoundingClientRect();
    const right = floorsRect && floorsRect.width ? window.innerWidth - floorsRect.left + pad : pad;
    if (isMobile()) {
      // Wider side margin on phones: framing is by room centres, so walls and
      // labels need room to spill outward on a 375px screen.
      const side = 32;
      const top = el.banner.hidden ? pad : el.banner.getBoundingClientRect().bottom + 8;
      const bottom = el.panel.hidden ? pad : window.innerHeight - el.panel.getBoundingClientRect().top + 8;
      camera.setOffsets({ top, bottom, left: side, right: Math.max(side, Math.min(right, 72)) });
    } else {
      const left = el.panel.hidden ? pad : el.panel.getBoundingClientRect().right + pad;
      camera.setOffsets({ top: pad, bottom: pad, left, right });
    }
  }

  function coordinatesOnFloor(coordinates: Coordinate[], floorId: string | undefined) {
    return coordinates.filter((c) => c.floorId === floorId);
  }

  // The slice of the route between two instruction points, for camera framing.
  function legCoordinates(all: Coordinate[], from: Coordinate, to: Coordinate): Coordinate[] {
    const nearest = (target: Coordinate) => {
      let best = 0;
      let bestDistance = Infinity;
      all.forEach((c, i) => {
        if (c.floorId !== target.floorId) return;
        const d = distanceM({ lat: c.latitude, lng: c.longitude }, { lat: target.latitude, lng: target.longitude });
        if (d < bestDistance) {
          best = i;
          bestDistance = d;
        }
      });
      return best;
    };
    const a = nearest(from);
    const b = nearest(to);
    const slice = all.slice(Math.min(a, b), Math.max(a, b) + 1).filter((c) => c.floorId === from.floorId);
    return slice.length >= 2 ? slice : [from, to];
  }

  function applyStep(r: RouteResult, step: number | null) {
    const d = r.directions;
    if (step === null) {
      route.clearHighlight();
      const floorId = d.instructions[0]?.coordinate.floorId;
      setFloor(floorId);
      return camera.floorRoute(coordinatesOnFloor(d.coordinates, floorId));
    }
    const s = r.steps[step];
    if (s.kind === "take-connection") {
      // Battersea's stairs/escalator step: jump to the next floor and show
      // its whole stretch of the route.
      route.clearHighlight();
      setFloor(s.toFloorId);
      return camera.floorRoute(coordinatesOnFloor(d.coordinates, s.toFloorId));
    }
    // On arrival, keep the final approach in view.
    const leg = s.kind === "arrive" && step > 0 ? r.steps[step - 1] : s;
    const from = d.instructions[leg.rawIndex].coordinate;
    const to = d.instructions[leg.legEndIndex].coordinate;
    setFloor(leg.floorId);
    route.highlight(from, to);
    return camera.leg(legCoordinates(d.coordinates, from, to));
  }

  async function applyMapState(next: AppState, prev: AppState) {
    const token = ++mapToken;
    refreshOffsets();
    switch (next.view) {
      case "browse":
        if (prev.view !== "browse" || prev === next) {
          clearRoute();
          clearLocationMarker();
          showAllLabels();
          await camera.overview();
        }
        return;
      case "location": {
        const place = places.get(next.placeId);
        if (!place || (prev.view === "location" && prev.placeId === next.placeId)) return;
        clearRoute();
        const floorId = place.floorIds.includes(mapView.currentFloor?.id ?? "") ? mapView.currentFloor.id : place.floorId;
        setFloor(floorId);
        markPlace(place, floorId);
        await camera.location(place.kind === "space" ? (place.target as Space) : places.anchor(place, floorId));
        return;
      }
      case "editing": {
        if (prev.view === "directions") clearRoute();
        const to = places.get(next.toId);
        if (to) markPlace(to, to.floorIds.includes(mapView.currentFloor?.id ?? "") ? mapView.currentFloor.id : to.floorId);
        else {
          clearLocationMarker();
          showAllLabels();
        }
        return;
      }
      case "directions": {
        const r = routeCache;
        if (!r) return;
        if (drawnKey !== r.key) {
          clearLocationMarker();
          showAllLabels();
          const to = places.get(r.toId);
          if (to) setLabelHidden(to.id, true);
          await route.draw(r.directions, { name: to?.displayName ?? "Destination", icon: to ? placeIconName(to) : "pin" });
          drawnKey = r.key;
        }
        if (token !== mapToken) return; // a newer state already took over
        if (prev.view !== "directions" || prev.step !== next.step || prev !== next) await applyStep(r, next.step);
        return;
      }
    }
  }

  subscribe((next, prev) => renderUI(next, prev));
  subscribe((next, prev) => void applyMapState(next, prev));

  // ---- Input -------------------------------------------------------------
  mapView.on("click", (event) => {
    const space = event.spaces?.find((s) => places.get(s.id));
    if (!space) return;
    const s = getState();
    if (s.view === "browse") navigate({ view: "location", placeId: space.id });
    else if (s.view === "location") replace({ view: "location", placeId: space.id });
    else if (s.view === "editing") ctx.pickPlace(space.id);
  });

  document.addEventListener("keydown", (event) => {
    const target = event.target instanceof HTMLElement ? event.target : null;
    if (target?.matches("input, textarea")) {
      if (event.key === "Escape") target.blur();
      return;
    }
    const s = getState();
    if (s.view === "directions" && s.step !== null && routeCache) {
      if (event.key === "ArrowRight") return ctx.goToStep(s.step + 1);
      if (event.key === "ArrowLeft") return ctx.goToStep(s.step - 1);
    }
    if (event.key === "Escape" && s.view !== "browse") back();
  });

  // Layout flips (rotate, resize across the breakpoint) rebuild the panel.
  mobileQuery.addEventListener("change", () => {
    const s = getState();
    renderUI(s, s, true);
    void applyMapState(s, s);
  });

  let offsetsFrame = 0;
  const observer = new ResizeObserver(() => {
    cancelAnimationFrame(offsetsFrame);
    offsetsFrame = requestAnimationFrame(refreshOffsets);
  });
  observer.observe(el.panel);
  observer.observe(el.banner);
  // In directions, the sheet's two heights are the two phone modes: pulling it
  // up opens the Steps list, pushing it down returns to turn-by-turn.
  initSheet(el.panel, isMobile, () => {
    const s = getState();
    const expanded = el.panel.classList.contains("is-expanded");
    if (s.view === "directions" && expanded && s.step !== null) return ctx.goToStep(null);
    if (s.view === "directions" && !expanded && s.step === null) return ctx.resumeSteps();
    refreshOffsets();
  });

  const initial = getState();
  renderUI(initial, initial, true);
  void applyMapState(initial, initial);

  // Handy when demoing from the console.
  Object.assign(window, { mapView, mapData });
}

void start();
