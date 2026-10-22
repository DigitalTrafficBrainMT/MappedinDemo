# Senior Engineer — battersea-wayfinding-ux

## Implementation approach per task
- **T1:**
  - `npm i -D vitest`; script `"test": "vitest run"`.
  - Vitest picks up `src/**/*.test.ts` by default. Tests use explicit `import { describe, it, expect } from 'vitest'`, so tsconfig needs no globals.
  - Inter loads via `<link>` in `index.html`.
- **T2:**
  - `stripEmoji` uses `/[\p{Extended_Pictographic}\u{FE0F}\u{200D}]/gu`, then collapses whitespace and trims.
  - `floorShortLabel(name, shortName)`: use `shortName` when it differs from `name` and is 4 characters or fewer; `/^level\s*(\d+)$/i` → `L$1`; otherwise the initials.
  - `geo`: an equirectangular approximation is plenty at indoor scales. Bearings use the same formula as the old `bearingBetween`.
- **T3:**
  - `buildSteps({ instructions, fromName, toName, floorNames, landmarks, departureId })`.
  - Walk the instructions with an index pointer; at each anchor, gather the cluster of turns within `MERGE_DISTANCE_M`.
  - **Cluster heading:** the incoming heading is the bearing of the last non-zero-length leg before the cluster start. The outgoing heading is the bearing of the first non-zero-length leg after the cluster end, on the same floor.
  - Every step records `rawIndex`. `legEnd` is the `rawIndex` of the next step. `cumulative` is the sum of distances up to `rawIndex`.
  - The fixture becomes a JSON import. Vite and Vitest handle JSON, and `resolveJsonModule` isn't needed with `moduleResolution: bundler` plus `allowArbitraryExtensions`. Verify with `tsc`.
- **T4:** `buildProgress(steps)` returns nodes `{ index, kind, position }`. `fillFraction(steps, current)` is a separate function.
- **T5:**
  - `rankPlaces(places, query)` scores 0 for a prefix match, 1 for a word-start match and 2 for a substring match, then sorts by name. Emoji and case are ignored.
  - Group definitions are data: `{ id, label, icon, match: (p) => boolean }` per tab.
- **T6:**
  - The store is a closure with listeners. `navigate` pushes a copy of the current state.
  - `places.ts` builds the places once after load. A `Map` gives lookup by id.
- **T7:**
  - `route.draw(directions, from, to)` uses `Navigation.draw(directions, { pathOptions: { color }, createMarkers: { departure, destination, connection }, setMapToDeparture: false })`.
  - Markers come from `mapView.Markers.add(coord, html, { rank: 'always-visible', placement })`.
  - The departure ring uses `placement: 'center'`; the destination bubble anchors at the bottom; connection markers use `'center'`.
- **T8:**
  - `CameraController.refreshOffsets()` measures `#panel` / `#banner` with `getBoundingClientRect` and calls `setScreenOffsets`. It runs from a `ResizeObserver` on those elements and after each render.
  - `focusLeg(coords)` uses `pitch` = `CAMERA.stepPitch`.
- **T9:**
  - Same behaviour as today, but with circle buttons, short labels, top floor first, and always visible.
  - Zoom uses `Camera.animateTo({ zoomLevel: z ± 1 })`. This is valid Mercator usage, unlike the old 2500.
- **T10:**
  - The skeleton renders once per view (inputs plus a list container). `patch` swaps only the list HTML and the error line.
  - Inputs fire `update({ query })`. Focusing an input sets `active`.
  - Picking a place sets the `fromId` or `toId`, clears the query, and moves `active` to the other box if it's empty. When both are set, call `selectRoute()`.
- **T11:**
  - `render(state)` builds the card from `routeCache.steps`.
  - `patch(prev, next)` on a step change toggles the `.is-active` and `aria-current` attributes, updates the headline, progress fill and node classes, scrolls the active row into view, and sets the buttons' disabled state.
- **T12:**
  - `sheet.ts` attaches a drag handle to `#panel`. While dragging it applies a `translateY`; on release it snaps to collapsed or expanded by a 40px threshold or a tap. It adds the `.is-expanded` class.
  - The mobile directions render uses `#banner` (top) plus `#panel` (bottom sheet). On a step change, `patch` updates the banner text and icon.
  - Steps overview sets `update({ step: null })` and expands the sheet.
- **T13:**
  - `applyMapState(prev, next)` switches on `next.view`. It only runs expensive steps (route draw, location marker) when ids change, and runs the camera on view or step changes.
  - Map click: `e.spaces?.[0]` for named spaces only, dispatched by view.
  - Keyboard: ←/→/Esc, ignored while focus is in an input.
- **T14 / T18:** QA checklist in `decisions/qa`. Tune `config.ts` values and record them in the SDE notes.

## Tricky parts
1. **Focus loss while typing.** Never re-render the inputs inside `patch`.
2. **Duplicate room names** (several "Storage 📦"). Places and search results always show the floor; ids drive selection, never names.
3. **Connections as destinations.** `getDirections(space, connection)` needs a `Connection` target. Use `place.target` for both ends.
4. **Floor changes in `applyMapState`.** Call `setFloor` *before* `focusOn` so the camera frames the right floor.
