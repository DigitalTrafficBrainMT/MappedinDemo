# Architect — battersea-wayfinding-ux

**ADRs:** 001 (modules and view state), 002 (highlight and camera), 003 (step merging)

## Components
| Component | Responsibility | Depends on |
|---|---|---|
| `state.ts` | `AppState` union, history stack, `navigate` / `back` / `update` / `subscribe` | — |
| `places.ts` | Builds the `Place[]` index (named rooms plus connections) with display names and floor labels; resolves a target by id | SDK MapData |
| `directions/steps.ts` | **Pure.** Raw instructions to `Step[]` | `config`, `util/text` |
| `directions/progress.ts` | **Pure.** Progress nodes and fill | `steps` types |
| `search/search.ts` | **Pure.** Ranking and tile groups | `util/text` |
| `map/route.ts` | Draw the route with custom markers, highlight a leg, clear | SDK, `markers` |
| `map/camera.ts` | Screen offsets; focus location, leg, floor route or overview | SDK, `config` |
| `map/floors.ts` | Floor selector UI and sync | SDK, `util/text` |
| `map/markers.ts` | Marker HTML for departure, destination and connection | `ui/icons` |
| `ui/*` | Render from state; dispatch actions | `state`, pure modules, `places` |
| `main.ts` | Startup, loading and error states, `applyMapState`, map click and keyboard routing | everything |

## Data flow
```
user action ─▶ ui module ─▶ actions (navigate/update/back, selectRoute)
                                  │
                                  ▼
                              state.ts ──subscribe──▶ render(ui)  +  applyMapState(map)
selectRoute: getDirections(from,to) ─▶ buildSteps ─▶ routeCache{key,directions,steps} ─▶ navigate(directions, step 0)
```
`routeCache` is written before navigating, so the renders and the map reaction both read the same steps.

## Places
`Place = { id, kind: 'space'|'connection', name, displayName, floorId, floorLabel, target }`.
- Connections (lifts and stairs) are places too, so the Lifts and Stairs tiles work. The demo map has no lift or stairs rooms.
- A connection's floor label reads "Level 1–2".
- A connection's anchor is its coordinate on the current floor.

## Failure modes
| Failure | Handling |
|---|---|
| `getMapData` / `show3dMap` throws | Error card with Try again (reloads) |
| `getDirections` returns undefined or throws | Inline editor error; state stays in `editing` |
| The same place picked twice | Inline error; no SDK call |
| Layout flips mid-route (rotate / resize) | Full re-render of the panel plus an offsets refresh; the step is kept |
| Rapid stepping | Each step is a single interruptible SDK call; the last one wins |
