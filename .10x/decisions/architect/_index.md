# Architect — index

## Current structure [DISCOVERED]
- **One file, `src/main.ts` (~700 lines)**, holds everything: injected CSS strings, DOM templates (`innerHTML`), map bootstrap, the floor selector, the search panel, the directions panel and the step camera.
- Flow: `getMapData(options)` → `show3dMap(#map)` → label every named space → wire the UI.
- View state is two panels toggled with `hidden` (`#search-panel` ↔ `#directions-panel`), plus `#floor-selector`.
- Route rendering: `Navigation.draw(directions)`. The "walked so far" highlight is a hand-rolled rAF tween that re-issues `highlightPathSection(routeStart, interpolatedPoint)` on every frame.
- Step camera: `Camera.animateTo({ center, zoomLevel: 2500, bearing })`, with heading-up bearing taken from the vector to the next instruction.
- No routing, no URL state, no tests.

## Known defects found during discovery
- `zoomLevel: 2500` is not a valid Mercator zoom (the map defaults to about 19.4), so it silently clamps to max zoom on every step.
- The cumulative highlight is the **opposite** of the reference, which highlights only the current leg (see the teardown spec).
