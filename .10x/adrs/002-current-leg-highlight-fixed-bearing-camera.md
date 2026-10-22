# ADR-002: Highlight only the current leg; frame legs with a fixed-bearing camera

**Status:** Accepted (supersedes the earlier undocumented "cumulative walked highlight" and "heading-up camera" behaviour)
**Date:** 2026-10-22
**Feature:** battersea-wayfinding-ux
**Author:** 10x-Team (Architect + Staff Engineer)

## Context
The current build highlights the whole route walked so far. It does this by re-issuing `highlightPathSection(routeStart, interpolatedPoint)` on every animation frame, because the SDK keeps only one highlighted section at a time. It also rotates the camera to heading-up on every step, and uses `zoomLevel: 2500`, which is invalid (Mercator zoom is about 17–22) and silently clamps to maximum zoom. The Battersea reference does neither:
- It highlights only the current instruction's leg, in dark navy with arrows.
- It frames that leg at a near-flat pitch with a fixed venue bearing.
- It tilts to 45° and switches floor on connection steps.

The user approved matching the reference.

## Decision
- **Highlight:** call `Navigation.highlightPathSection(step.coordinate, step.legEnd, { color: ROUTE_ACTIVE, displayArrowsOnPath: true, widthMultiplier: 1.15, animationDuration: 350 })` once per step change. In overview, call `clearHighlightedPathSection()`. No rAF tween.
- **Camera:** a `CameraController` with these behaviours:
  - It always uses `Camera.focusOn(targets, { bearing: venueBearing, pitch, maxZoomLevel, duration })`. `venueBearing` is read once after `show3dMap`.
  - Normal steps frame the leg's slice of `directions.coordinates` at about a 10° tilt.
  - Take-connection steps call `setFloor(toFloor)` and frame the destination floor's route at 45°.
  - The overview frames the departure floor's route at 45°.
- **Screen offsets:** room left for the UI comes from `Camera.setScreenOffsets()`, fed by live measurements of the visible panels (a `ResizeObserver` plus the `matchMedia` breakpoint).
- **Reduced motion:** when the user has turned motion down in their system settings, all durations become 0.

## Alternatives Considered
| Alternative | Pros | Cons | Why Not |
|---|---|---|---|
| Keep the cumulative "walked" highlight (rAF tween) | Shows progress on the map | Fights the SDK's single-section model; complex; not the reference | User chose to match Battersea |
| Three shades (walked / current / ahead) using `Paths.add` overlays | Most information | Extra path objects to manage per floor; not the reference | YAGNI |
| Heading-up rotation per step | Feels like phone navigation | Disorienting on desktop; not the reference | User chose fixed bearing |
| `Camera.animateTo` to a fixed zoom at the step point | Simple | Ignores leg length (short legs too far out, long legs cropped); the old bug lived here | `focusOn` frames real extents |

## Consequences
### Positive
- Uses the SDK as designed. Less code, no per-frame work, and no race conditions from rapid clicking: the latest call wins.
- The camera framing adapts to leg length, screen size and panel size.

### Negative
- The map no longer shows "how far I've come"; only the progress bar does. This was accepted to match the reference.

### Risks
- `focusOn` over a very short leg could zoom in too far. Mitigation: `maxZoomLevel` (default 21), tuned in QA.
- An observed colour could be off from Battersea's (WebGL pixels can't be measured). Mitigation: colours live in `config.ts` tokens and get tuned in QA.

## Dependencies
- Depends on ADR-003 to provide `step.coordinate`, `step.legEnd` and step kinds.
