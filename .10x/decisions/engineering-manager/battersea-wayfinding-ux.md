# Engineering Manager — battersea-wayfinding-ux

Each task is half a day or less. Order runs top to bottom; dependencies are noted.

## Increment 1: directions
| # | Task | Depends on | Size |
|---|---|---|---|
| T1 | Tooling: Vitest + `test` script; remove scaffold (`counter.ts`, `style.css`, `assets/`); `index.html` (Inter font, title); `styles.css` with tokens | — | S |
| T2 | `config.ts`, `util/text.ts` (esc, stripEmoji, floor short label), `util/geo.ts` (distance, bearing, angle delta) + tests | T1 | S |
| T3 | `directions/steps.ts` + real-data fixture + tests (wording, merging, landmarks, times) | T2 | M |
| T4 | `directions/progress.ts` + tests | T3 | S |
| T5 | `search/search.ts` ranking + tile group definitions + tests | T2 | S |
| T6 | `state.ts` (union, history) + `places.ts` (place index incl. connections) | T2 | S |
| T7 | `ui/icons.ts`, `map/markers.ts`, `map/route.ts` | T3 | S |
| T8 | `map/camera.ts` (offsets from live UI, focus presets, reduced motion) | T6 | S |
| T9 | `map/floors.ts` (selector, short labels, sync) + `ui/mapControls.ts` (zoom) | T2 | S |
| T10 | `ui/directionsEditor.ts` (inputs, swap, list, map-click fill, errors) | T5 T6 | M |
| T11 | `ui/directionsPanel.ts` (desktop card) | T3 T4 T7 | M |
| T12 | `ui/sheet.ts` + `ui/directionsMobile.ts` (banner, sheet, Steps overview) | T11 | M |
| T13 | `main.ts`: startup, loading and error, `applyMapState`, click and keyboard routing | T6–T12 | M |
| T14 | Increment 1 verification: gates, browser QA at both sizes, tune camera and colours | T13 | M |

## Increment 2: browsing
| # | Task | Depends on | Size |
|---|---|---|---|
| T15 | `ui/browseCard.ts` (search, tabs, tiles, group lists), desktop card and phone sheet | T5 T12 | M |
| T16 | `ui/locationCard.ts` + location marker + interactive spaces with hover | T7 T15 | S |
| T17 | Flow wiring browse → location → editor → directions; Back/Close through history; the editor's entry point changes | T15 T16 | S |
| T18 | Increment 2 verification and final full-journey QA | T17 | M |

## Risks and unknowns
- **Camera tuning** (`maxZoomLevel`, step pitch) can only be settled by eye. Time is set aside in T14.
- **Phone sheet drag** on desktop emulation versus real touch. Pointer events cover both, and QA will test with mouse drag.
- **Landmark quality** varies by route. Check 3+ routes in T14.
