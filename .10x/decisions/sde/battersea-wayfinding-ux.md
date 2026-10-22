# SDE — battersea-wayfinding-ux

**Status:** Implemented (T1–T18). Commits `f06eb9b` … `ae57bb5`.

## What was built
| Area | Files |
|---|---|
| Pure logic + tests (35 tests) | `directions/steps.ts`, `directions/progress.ts`, `search/search.ts`, `util/{text,geo,motion}.ts`, a real-data fixture in `directions/__fixtures__/` |
| State + data | `state.ts` (view union, history stack), `places.ts` (rooms plus lifts/stairs as one `Place` type) |
| Map | `map/route.ts` (draw, current-leg highlight, markers), `map/camera.ts` (`focusOn` presets, offsets), `map/floors.ts`, `map/markers.ts` |
| UI | `ui/browseCard.ts`, `ui/locationCard.ts`, `ui/directionsEditor.ts`, `ui/directionsPanel.ts` (desktop), `ui/directionsMobile.ts` (phone), `ui/sheet.ts`, `ui/mapControls.ts`, `ui/parts.ts`, `ui/icons.ts` |
| App | `main.ts` (startup, loading and error states, `renderUI`, `applyMapState`, input), `styles.css` (tokens + components), `index.html` (Inter) |

The Vite scaffold was removed: `counter.ts`, `style.css`, `assets/`, `public/icons.svg`. A pin favicon was added.

## Deviations from spec / plan
1. **Increments built back to back.** Both were approved together, so they were built in one pass and verified as two QA passes (directions first, then browse). Browse is therefore home from day one; spec §7.6 had the editor as the start screen *for increment 1 only*.
2. **Landmark rule refined** (recorded in ADR-003). Utility rooms (`storage|electrical|custodial`) and names that appear more than once on a floor are excluded. "Storage 📦" appears up to 4× per floor.
3. **Cluster turning is summed per bend**, not taken as last heading minus first. QA found a doorway loop of three lefts (−189°) that read as "Turn around". With different geometry, the old formula would even have said "right". Over 150° across *several* bends now counts as a turn, not "turn around". There's a regression test.
4. **Lifts and stairs as route ends.** A TakeConnection immediately before Arrival is skipped (no "Take the lift" when you're going *to* the lift). An ExitConnection immediately after Departure is folded into the departure. There are tests for both.
5. **UK wording.** Connection type `elevator` reads "lift" in steps, and connection names "Elevator N" display as "Lift N", to match Battersea and the Lifts tile. Display names (not raw names) feed `buildSteps`.
6. **Phone directions sheet.** Dragging it up opens the Steps overview, and dragging it down returns to turn-by-turn. The spec only said Steps expands the sheet; without this, an expanded turn-by-turn sheet would be empty.
7. **Floor pills hide while the phone sheet is expanded.** They were overlapping the step list.
8. **Swap reroutes immediately** when both ends are set. This was found in QA.
9. **Editor input ownership.** A box belongs to the user only while it holds a typed query. Emptying a box clears its choice.
10. **SDK bump 6.27 → 6.30.** Made while investigating the missing street map; it was *not* the cause. Kept because it's within `^6`, all gates pass, and all QA ran on 6.30.
11. **Outdoor street map regression fixed.** MapLibre adds `.maplibregl-map { position: relative }` to `#map`, and that beat our single-class `inset` sizing. The container collapsed to 0px, so the outdoor view failed to initialise. Now `#map` uses an id selector with explicit 100% sizing.
12. **Tuned values:**
    - `ROUTE_COLOR` `#4C82FF`, `ROUTE_ACTIVE_COLOR` `#1A2C9E`, for more Battersea-like contrast.
    - Phone side camera margin 32px.
    - Camera pitch and zoom presets kept at their spec defaults (`stepPitch` 10, `maxZoomLevel` 21) after visual review.

13. **Route rendered as a flat ribbon** (user feedback after delivery, 2026-10-22). The SDK's default 3D tube showed side faces and angled seams, and the arrows on the highlighted leg were blue.
    - Now `geometry: 'ribbon'`, a 1.1 m width that scales with zoom, CatmullRom corners (`tension` 0.25, `cornerRadius` 0.9), a darkened border and `accentColor` white. Same shape for the other floor's stretch.
    - Above about 0.3, tension made S-shaped wobbles at doorways.
    - **Route geometry was left unchanged** (default `greedy-los` simplification):
      - `smoothing: false` zig-zagged along the raw corridor graph.
      - `dp-optimal` took a 22% longer route with a diagonal shortcut.
      - Keeping the default also keeps instructions, step wording and the fixture identical.

## Tech debt / known issues
- **Duplicate room names** (two "Electrical Room · Level 2") can't be told apart in lists. This is a data issue. A "near {landmark}" subtitle would fix it.
- **Whole-floor overview labels.** At overview zoom most room labels are hidden by the SDK's collision rules, and they appear on zoom-in. Battersea behaves the same way, but our office has few large rooms.
- **Bundle size.** 1.6 MB (445 kB gzip), almost all of it the Mappedin SDK. This triggers Vite's chunk-size warning.
- **No automated UI/e2e tests.** UI behaviour is covered by manual QA only (see the QA report).
- **Reduced motion.** The reduced-motion path is code-reviewed but wasn't emulated in the test browser.
