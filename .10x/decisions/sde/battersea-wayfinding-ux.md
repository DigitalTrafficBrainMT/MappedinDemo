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

14. **Following Mappedin's own guidance** (user feedback: duplicate stairs icon, messy line):
    - `show3dMap(..., { multiFloorView: { enabled: false } })`. It's on by default and stacked the other floor and its route as a ghost underneath; Battersea shows one floor at a time.
    - Navigation markers are synced to the current floor, using the documented `Navigation.markers` + `updateState({ enabled })` pattern. That removes the double stairs icon.
    - Corner smoothing changed to the documented defaults: tension 0.2, `cornerRadius` 0.5 (was 0.9, which overlapped on short legs). Width is now 1.2 m.

15. **Own route rendering ("pipework")**, after user feedback that the line looked eaten, wasn't straight and lacked right-angle connectors:
    - `directions/straighten.ts` (pure, tested) snaps each floor's route to straight runs along the building's dominant axes, absorbs jogs under 1.5 m, and meets runs at right-angle corners. The ends and stairs points are preserved.
    - `map/route.ts` draws each floor as **non-overlapping pieces**: blue before, navy for the current leg (carried 1.2 m round its corners and cut square), blue after. Joins fall mid-run, so no colour peeks out from under another.
    - **Mappedin `Navigation` is no longer used for drawing.** Its `pathOptions.visible: false` is ignored: it still drew a thin raw-geometry line underneath, which was the real cause of the light-blue slivers. `updateState(path, { visible })` doesn't hide paths either. Markers are now placed directly; floor sync uses our own list.
    - `xray` opacity 0, so there's no faint copy behind walls.

16. **Route polish** (user feedback: squashed arrows, runs not square to the building, seams):
    - The grid angle comes from the floor's **room outlines** (`gridAngle` over the space polygons), not from the route's own drifting points.
    - The base line is **one continuous path per floor**. The navy leg is laid on top with the same geometry and no border (a border drew ticks across square cuts).
    - **Arrows only on straight parts** of the navy leg, at least 1 m clear of bends. The SDK spaces arrows evenly, so some used to land on curves and get squashed.

17. **One line, two colours** (user feedback: seams, width step, corner mismatch, heavier bend edges). Root cause: the blue and navy paths differed in border (blue had one), width (navy 1.06x) and therefore corner geometry. Both now share one style (`ROUTE_SHAPE`, flat, no border, same width, same smoothing) and differ only in colour. Connection markers use `placement: "top"` so the stairs pill sits beside the line, not on it.

18. **Soft fade, fewer dots, rail ends at arrival** (user request):
    - The navy leg now fades into the blue over 1.2 m through 5 stepped colours (the SDK has no per-path gradient), skipped at the route's own ends.
    - Progress dots within 11% of an icon are dropped; the fill still uses every step's position.
    - The dotted rail is drawn per row and the last row only gets its upper half, so it stops at the arrival pin.
    - Arrows keep 1.1 m clear of leg ends so they don't sit on stairs pills.

19. **Corner streaks were z-fighting.** Base, navy leg and arrows sat at 0.10/0.12/0.14 m above the floor, 2 cm apart, so the depth buffer flickered where their rounded corners overlapped. Layers now sit at 0.05/0.20/0.35 m (`Z_BASE`/`Z_LEG`/`Z_ARROWS`). The fade uses 10 thin steps so it reads as a gradient, not bands.

20. **One line, restyled — not stacked** (after reading Mappedin's own Battersea app code, `cdn.mappedin.com/web2/release/mappedin-web.js`). Battersea never draws a second line: its highlight is `highlightPathSection`, a shader state that recolours a range of the *same* mesh (`highlightStart/EndFraction`, colour = base darkened 45%, width ×1.1 + 0.2, arrows on). We now do the same with `Paths.highlightPathSection` on our one straightened path per floor.
    - Deleted: the stacked navy leg, arrow overlay paths, blue-to-navy fade pieces and the height constants. (The fade is impossible with this mechanism — segment state holds one range — and Battersea has none.) `route.ts` went from ~290 to ~205 lines.
    - New pure `cutPosition`/`pointAt`/`vertexArcs` (tested): the renderer cuts a flat edge across the line, so a boundary is snapped to just before its nearest corner (0.9 m) and never within 0.7 m of a bend; short runs use their middle.
    - Known: a leg shorter than ~2.6 m (e.g. the last turn into a room) carries no arrow.

21. **Arrival matches Battersea** (observed live + their code): after the floor change they stop following each leg and frame the floor's whole route; on arrival the camera does not move, the highlight clears, and the destination bubble just stays (no pulse/drop animation — their SDK's pin-drop/bounce CSS isn't used for it). Verified: zoom/centre/pitch identical from the stairs step through arrival. Legs under 2.6 m carry no arrow. The progress bar now also collapses to start ring + end check on arrival. Bug found doing this: clicking Next quickly into the arrival left the previous leg navy, because the highlight animation re-applies its colour on its last frame after a clear; `clearHighlight` now waits for the running animation (generation-guarded).

## Tech debt / known issues
- **Duplicate room names** (two "Electrical Room · Level 2") can't be told apart in lists. This is a data issue. A "near {landmark}" subtitle would fix it.
- **Whole-floor overview labels.** At overview zoom most room labels are hidden by the SDK's collision rules, and they appear on zoom-in. Battersea behaves the same way, but our office has few large rooms.
- **Bundle size.** 1.6 MB (445 kB gzip), almost all of it the Mappedin SDK. This triggers Vite's chunk-size warning.
- **No automated UI/e2e tests.** UI behaviour is covered by manual QA only (see the QA report).
- **Reduced motion.** The reduced-motion path is code-reviewed but wasn't emulated in the test browser.
