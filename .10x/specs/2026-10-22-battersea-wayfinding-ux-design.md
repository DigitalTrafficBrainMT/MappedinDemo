# Design: Battersea-style wayfinding UX

**Feature:** `battersea-wayfinding-ux`
**Date:** 2026-10-22
**Status:** Awaiting user review
**Reference:** `2026-10-22-battersea-reference-teardown.md`. Every "measured" value below comes from there.

## 1. Goal

Bring the Mappedin Office Demo as close as practical to the wayfinding at Battersea Power Station: the camera, route highlighting, step wording, the directions panel, browsing, and the phone layout. Desktop and phone carry equal weight.

## 2. Decisions taken in brainstorming

| Topic | Decision |
|---|---|
| Scope | Everything, in two increments: **(1) directions experience including the route editor**, then **(2) browsing** (search card, tiles, location card) |
| Route highlight | Match Battersea. **Only the current step's stretch** is dark navy with white arrows. Everything else stays base blue. This replaces the old "walked part stays dark" model |
| Camera | Match Battersea. Frame the current stretch with room left for the UI, about 10° tilt on normal steps and 45° on floor-change and overview. **Fixed venue bearing; no per-step rotation** |
| Visual style | Battersea's measured styling exactly: Inter, `#293035`, `#2266FF`, 24px cards |
| Devices | Desktop and phone equally. The phone gets Battersea's turn-by-turn layout and a draggable bottom sheet |
| Sharing | **None.** No URL state, no Share, no QR |
| Approach | Vanilla TypeScript split into modules, with a small view-state machine and a real CSS file. No framework |
| Floor selector | **Visible during directions**, as on Battersea. This reverses the earlier "hide during directions" request |
| Room names in panel text | Emoji stripped ("Electrical Room ⚡️" → "Electrical Room"). Map labels keep them |

## 3. Architecture

### 3.1 View state

```ts
type AppState =
  | { view: 'browse'; query: string; tab: 'categories' | 'popular' | 'amenities'; groupId: string | null }
  | { view: 'location'; spaceId: string }
  | { view: 'editing'; fromId: string | null; toId: string | null; active: 'from' | 'to'; query: string; error: string | null }
  | { view: 'directions'; fromId: string; toId: string; step: number | null }; // step null = overview
```

`state.ts` exports `getState()`, `setState(next)` and `subscribe(fn)`. Each UI module renders from state. Map side effects (route drawing, camera, markers) run in one `applyMapState(prev, next)` reaction, so the panels and the map can't drift apart.

Moves between views:
- `browse` → `location`: tap a room or a result.
- `location` → `editing`: press Directions. `toId` is set and `fromId` is empty.
- `editing` → `directions`: both rooms are set and a route exists. `step` starts at 0.
- Back or Close takes you to the previous view. Closing directions returns to `browse`.

### 3.2 Modules

```
src/
  main.ts            startup: load the map, mount the UI, show load and error states
  config.ts          keys, walking speed, thresholds, camera presets, breakpoint
  state.ts           the view-state store
  styles.css         design tokens (CSS custom properties) and all component styles
  util/dom.ts        escapeHtml, the h() element helper, stripEmoji
  map/route.ts       draw route with Battersea styling, highlight the current stretch, clear
  map/camera.ts      screen offsets from live UI sizes; frame a location, step or overview
  map/floors.ts      floor selector, short names ("Level 1" → "L1"), sync on floor-change
  map/markers.ts     marker HTML for departure ring, destination bubble, stairs/lift circle
  directions/steps.ts     PURE: SDK instructions → Battersea steps (merge, wording, landmarks, times)
  directions/progress.ts  PURE: progress-bar node positions, icon kinds, fill
  search/search.ts        PURE: rank rooms for a query; tile groups from room names
  ui/icons.ts             inline SVG icon set
  ui/browseCard.ts        search, tabs, tiles, results (desktop card / phone sheet)
  ui/locationCard.ts      name, floor, Directions
  ui/directionsEditor.ts  departure/destination inputs, swap, list, inline errors
  ui/directionsPanel.ts   desktop directions card
  ui/directionsMobile.ts  phone top banner, bottom sheet, Steps overview
  ui/sheet.ts             draggable bottom sheet (collapsed/expanded snap points)
  ui/mapControls.ts       zoom pill (desktop only)
```

Delete the unused scaffold: `src/counter.ts`, `src/style.css`, `src/assets/`.

### 3.3 Responsive switch

`config.MOBILE_QUERY = '(max-width: 768px)'`.
- CSS changes the layout.
- `camera.ts` subscribes to the same `matchMedia` query, and to a `ResizeObserver` on the visible panels. It feeds `Camera.setScreenOffsets({ top, right, bottom, left })` the real sizes, so framing leaves room for whatever UI is showing.

## 4. Steps: SDK instructions → Battersea steps (`steps.ts`)

**Input:** `TDirectionInstruction[]`, the route coordinates, a landmark lookup, and the floor names.
**Output:**

```ts
interface Step {
  kind: 'depart' | 'turn' | 'bear' | 'uturn' | 'take-connection' | 'exit-connection' | 'arrive';
  side?: 'left' | 'right';
  connectionType?: 'stairs' | 'elevator' | 'escalator' | string;
  direction?: 'up' | 'down';
  text: string;            // e.g. "Turn right at Yew Meeting Room"
  timeText: string;        // "Less than a minute" | "2 minutes"
  coordinate: Coordinate;  // where the step happens
  floorId: string;
  legEnd: Coordinate;      // where the next step happens (the end of the highlighted stretch)
  legDistance: number;     // metres from this step to the next
  cumulative: number;      // metres from the start to this step
}
```

Rules, applied in order. The thresholds live in `config.ts`.
1. **Leg lengths.** `instruction[i].distance` is the distance travelled *to reach* step `i`. Checked against real data: Departure = 0, and the total matches `directions.distance`. So the stretch after step `i` has length `instruction[i+1].distance`.
2. **Merge turn clusters.** Consecutive `Turn`s whose stretches are shorter than `MERGE_DISTANCE_M` (3m) collapse into one turn at the first one's coordinate.
   - The net angle is the heading of the stretch leaving the cluster minus the heading of the stretch entering it. Headings are bearings between instruction coordinates.
   - |Δ| < 25° → straight, so the step is **dropped**. 25–60° → `bear` ("Bear right"). 60–150° → `turn` ("Turn right"). > 150° → `uturn` ("Turn around").
3. **Departure.** A Departure followed by a turn within `MERGE_DISTANCE_M` gives "Leave {from} and turn {side}" (or "bear"). With no turn nearby it gives "Leave {from}".
4. **Floor changes.**
   - `TakeConnection` → "Take the {type} {up|down} to {toFloor}", for example "Take the stairs down to Level 1".
   - `ExitConnection` followed by a turn within `MERGE_DISTANCE_M` → "Exit the {type} and head {side}". Otherwise "Exit the {type}".
   - Ignore `ExitConnection.direction` and its floors. The real data reports them reversed.
5. **Landmarks.** For `turn` and `bear` steps, find the nearest named room on the same floor whose `center` is within `LANDMARK_RADIUS_M` (5m) of the step, leaving out the departure and destination rooms. If one is found, append " at {name}".
6. **Arrival** → "Arrive at {to}".
7. **Times.**
   - Per step: `legDistance / 1.4 m/s`. Under 60s → "Less than a minute", otherwise "N minutes".
   - Headline: `max(1, round(total/1.4/60))` → "N minute(s) total". It becomes "You have arrived" when the final step is active.

Reference route for tests: Electrical Room (L2) → Focus Room 102 (L1). The SDK returns 17 instructions over 42m; the merged result should be about 7–9 steps, including one stairs step.

## 5. Route and markers (`route.ts`, `markers.ts`)

- `Navigation.draw(directions, { pathOptions: { color: ROUTE, displayArrowsOnPath: false }, createMarkers: { departure, destination, connection }, setMapToDeparture: true })`.
- **Current stretch:** `Navigation.highlightPathSection(step.coordinate, step.legEnd, { color: ROUTE_ACTIVE, widthMultiplier: 1.15, displayArrowsOnPath: true, animationDuration: 350 })`.
  - The SDK keeps only one highlighted section at a time. That's exactly what we want.
  - On overview (`step === null`), call `Navigation.clearHighlightedPathSection()`.
- **Markers:**
  - Departure: a hollow white ring with a grey border.
  - Destination: a white circular bubble with an icon, a dark dot underneath and the name in bold beside it.
  - Connection: a blue circle with the stairs or lift icon, next to a blue circle with an up or down arrow.
- **Colours** (observed, not measurable from WebGL): `ROUTE = #3D6EFF`, `ROUTE_ACTIVE = #1F3CB8`.

## 6. Camera (`camera.ts`)

The bearing always stays at the **venue default**, read once after `show3dMap` (about 71.3° on this map). All moves use `Camera.focusOn(targets, opts)`, with the duration set to 0 when the user has reduced motion turned on in their system settings.

| Situation | Floor | Targets | Pitch | Other |
|---|---|---|---|---|
| Browse (initial / after Back) | current | whole floor | 45° | default |
| Location card | room's floor | the room | 0° | `maxZoomLevel` 21 |
| Directions step (turn, bear, depart, exit, arrive) | step floor | route coordinates from `step.coordinate` to `step.legEnd` | 10° | `maxZoomLevel` 21, 700ms |
| Directions step (take-connection) | **destination floor** | all route coordinates on that floor | 45° | 900ms |
| Directions overview (`step === null`) | departure floor | all route coordinates on that floor | 45° | — |

`maxZoomLevel` 21 and the 10° step pitch are starting values. They are **tuned during QA** against the Battersea screenshots (the map's default zoom is about 19.4), and the final values are recorded in `config.ts`.

Screen offsets come from live UI sizes:
- Desktop: `left = card width + 32`.
- Phone: `top` = banner height, `bottom` = sheet height.

## 7. UI specs

Tokens in `styles.css`:
- `--font: 'Inter', system-ui, sans-serif`. Inter 400/500/600 is loaded from Google Fonts in `index.html`.
- `--ink: #001B21`, `--text: #343D43`, `--muted: #606060`, `--charcoal: #293035`.
- `--surface-2: #F0F0F0`, `--floor-idle: #F1F2F5`, `--track: #E6E6E6`, `--progress: #2266FF`, `--border: #CCCCCC`.
- `--card-w: 360px`, `--card-radius: 24px`, `--card-pad: 20px`, `--card-shadow: 0 4px 100px 10px rgba(83,83,83,.15)`.

### 7.1 Desktop directions card
- Top-left, 16px from the edges.
- **Header:** `← Back`.
- **Subtitle:** "Directions to {to}" at 13.5px / 500 / `--muted`.
- **Headline** at 22.5px / 600 / line-height 31.5px / `--ink`.
- **Progress bar:** 8px `--track` with radius 4px; the fill is `--progress`.
  - Nodes sit at `cumulative / total`: a hollow ring at the start, a pin at the end, a stairs or lift icon in a white circle for floor-change steps, and small dots elsewhere.
  - Nodes the user has passed become blue tick circles.
- **Timeline:**
  - Start room heading: 18px / 600 with a grey dot beside it.
  - A dotted vertical line on the left links the rows.
  - Rows are 65px tall with radius 8px: a 24px icon, then the text (15.75px / 500 / `--text`) and the time (13.5px / 500 / grey).
  - **Active row:** `--charcoal` background, radius 11px, white text and icon.
  - The list ends with the destination heading.
  - Rows can be clicked. The list keeps the active row scrolled into view.
- **Buttons:** two half-width, 44px tall, radius 8px.
  - Disabled: white with `1px solid --border` and a grey icon.
  - Enabled: `--surface-2` with a `--charcoal` icon.
- **Keys:** ← and → change step. Esc goes back.

### 7.2 Phone directions (≤768px)
- **Top banner:** white, bottom corners 24px.
  - Row 1: `← Close` and a **Steps** list button.
  - Row 2: a 48px `--surface-2` rounded tile holding the icon, then the instruction in bold (17px / 600) and the time in grey.
- **Bottom sheet:** white, top corners 24px. It holds the progress bar, the subtitle, the headline, and two large arrow buttons (`--surface-2`, 48px tall, half width each).
- **Steps** opens the overview (`step = null`):
  - The banner becomes `← Back`, the subtitle and the total.
  - The sheet expands to the full timeline.
  - Tapping a row returns to turn-by-turn on that step.
- **Floor selector:** on the right, inside a white rounded holder. Zoom controls are hidden.

### 7.3 Floor selector and map controls
- Floor buttons are 40px circles: `--floor-idle` with `--ink` text, or `--charcoal` with white text when active. They're stacked with a 4px gap, top floor first.
- Labels use `shortName` when it differs from `name`. Otherwise "Level N" becomes "LN"; anything else uses the initials.
- The desktop zoom pill sits bottom-right: two 48px white buttons (in, out) stacked with a shared outer radius and the shadow `0 2.4px 12px 1.2px rgba(186,186,186,.3)`.

### 7.4 Browse card (increment 2)
- Desktop: the top-left card. Phone: a draggable bottom sheet (`sheet.ts`) with snap points at **collapsed** (search, tabs, carousel) and **expanded** (85% of the viewport, used for results and lists).
- **Search:** a pill `--surface-2` field with a magnifier icon and the placeholder "Search...".
  - Results are named rooms, ranked by prefix match, then word-start match, then substring. Emoji and case are ignored.
  - Each result row shows an icon, the name and the floor.
- **Tabs:** `Categories`, `Popular` (default) and `Amenities`, as pills. The active one is `--charcoal`.
- **Tiles:** a square bordered tile with an icon, the name in bold, and "N locations" (or the floor name when there's one).
  - Popular: Meeting rooms, Focus rooms, Huddle rooms, Washrooms.
  - Amenities: Washrooms, Kitchen, Lifts, Stairs, Storage.
  - Categories: the SDK `location-category` entries that have at least one location.
  - Groups are matched on room names or connection type. A tile with one room opens its card; a tile with several opens a list.
- **Map:** the 45° floor overview. Rooms are interactive (pointer on hover), and clicking one moves to `location`.

### 7.5 Location card (increment 2)
- The name (22.5px / 600, emoji removed), the floor (grey), a close ×, and a full-width `--charcoal` **Directions** button (48px tall, radius 8px).
- A destination-style marker sits on the room. The camera follows the Location row in §6.

### 7.6 Route editor (increment 1)
- **Header:** `← Directions`.
- **Inputs:** two stacked `--surface-2` pill inputs, with a dot (departure) and a pin (destination) on the left and a swap ⇅ button on the right.
  - The empty one gets focus, with "Choose Departure" / "Choose Destination" as placeholders.
- **List:** while the active box is empty, every room grouped by floor; otherwise the search results.
- **Clicking a room on the map** fills the active box.
- When both are set, call `getDirections`. Inline errors cover "Pick two different rooms" and "No route found between these rooms".
- **In increment 1** the editor is the start screen (it replaces today's dropdown card). In increment 2 the entry point becomes the browse card.

## 8. Errors and robustness
- **Loading:** a spinner overlay. **Failure:** a card reading "Couldn't load the map. Check your connection and try again." with a **Try again** button that re-runs startup.
- `getDirections` throwing or returning `undefined` shows an inline editor error, and the map stays as it was.
- **Text safety:** all text from map data or the user goes through `textContent` or `escapeHtml`. No unescaped `innerHTML`.
- **Fast clicking:** stepping quickly needs no special handling. Each step makes one highlight call and one interruptible camera move, so the latest call wins.

## 9. Accessibility
- Buttons have accessible names, and the active step has `aria-current="step"`.
- The step list is an `<ol>`. The phone banner has `aria-live="polite"` so the instruction is announced when it changes.
- Contrast: white on `#293035` is about 13:1, and `#606060` on white is about 6.3:1. Both pass AA.
- Reduced motion is respected (§6), and the highlight animation drops to 0.

## 10. Testing
- **Vitest** (dev dependency) covering `steps.ts`, `progress.ts`, `search.ts`, the floor short names and `stripEmoji`. The step tests use captured instruction data from the reference route as a fixture.
- **Gates:** `npx tsc --noEmit`, `npx vitest run` and `npm run build` must all pass.
- **Browser QA** at 1440×900 and 375×812, compared with the teardown screenshots. The checklist lives in the QA decision file.

## 11. Out of scope
- URL state, sharing and QR codes.
- Hours, logos and social links (no data).
- A full-screen button.
- An accessible-route toggle.
- Live position ("blue dot").
- Heading-up rotation.
- Hosting and deployment (tracked separately).

## 12. Acceptance criteria

**Increment 1: directions**
- [ ] The route editor starts the flow, with search, swap, map-click filling and inline errors.
- [ ] The reference route shows about 7–9 merged steps with Battersea wording, including "Leave … and turn …", "Take the stairs down to Level 1", "Exit the stairs and head …" and "Arrive at …". At least one landmark ("… at {room}") shows where geometry allows.
- [ ] Only the current stretch is dark navy with arrows. Moving between steps moves it, and the overview clears it.
- [ ] The camera follows the §6 table, never rotates, and leaves room for the UI on both sizes.
- [ ] The desktop card matches the §7.1 measurements. The phone matches §7.2, including Steps overview.
- [ ] The floor selector stays visible and in sync during directions, including the floor-change step.
- [ ] Unit tests pass. `tsc` and `build` pass. No console errors.

**Increment 2: browsing**
- [ ] The browse card and phone sheet work: search, tabs, tiles and lists, and the sheet drags between snap points.
- [ ] The location card opens from search, tiles and map clicks, and Directions goes into the editor with the destination already set.
- [ ] Back and Close return through the views as specified, and the map resets cleanly each time.
