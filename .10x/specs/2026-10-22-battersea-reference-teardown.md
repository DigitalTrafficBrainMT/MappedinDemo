# Battersea Power Station wayfinding — reference teardown

**Source:** https://batterseapowerstation.co.uk/map/#/directions?to=loc_3063&from=loc_3154&textDirectionsVisible=true&instruction=7
**Captured:** 2026-10-22, desktop viewport 1440×900
**What it is:** Mappedin's own hosted "Mappedin Web" app, mounted in a shadow root (`#mappedin-map`). It runs on the same Mappedin JS SDK this project uses, so every behaviour below is reproducible with public SDK calls.

Values marked *measured* were read from computed styles. Values marked *observed* were judged from screenshots.

## 1. Browse mode (no route)

- **Top-left card** holding a search field ("Search...") with a magnifier icon. Under it sit pill tabs (`Categories` / `Popular` / `Amenities`, with the active tab filled dark), then a sideways carousel of amenity tiles (icon in a rounded square, name, and either "8 locations" or a floor name). A `›` button scrolls the carousel.
- **Camera** *(observed)*: a pitched 3D overview of the whole venue, about 45°.
- **Labels** carry category icons, such as a fork and knife for restaurants. Amenities appear as small white circular icon markers.
- **Floor selector**, top right *(measured)*:
  - The building button is a 48px white circle with layered shadow `0 4px 8px rgba(0,0,0,.1), 0 2px 6px rgba(0,0,0,.04), 0 0 0 1px rgba(0,0,0,.02)`.
  - Floor buttons are 40px circles: `#F1F2F5` when inactive, `#293035` with white text when active. They're spaced 4px apart and labelled with short names (`1F`, `UGF`, `GF`).
  - The selector stays visible during directions as well.
- **Map controls**, bottom right *(measured)*: full screen, zoom in and zoom out. They're 48px white buttons stacked into one pill (the top button has radius `50% 50% 0 0`), with shadow `0 2.4px 12px 1.2px rgba(186,186,186,.3)`.

## 2. Location card (after tapping a location)

- Logo, plus share and close icon buttons.
- **Name** in bold, then a "First Floor | Closed" line where the status is red.
- A full-width dark **Directions** button (`#293035`).
- Hours, category chips, description and social links.
- **Camera** *(observed)*: zooms top-down onto the location. The location marker is a white circular bubble with a category icon, a dark dot underneath, and a bold label beside it.

## 3. Directions editor (after pressing Directions)

- Header reads `← Directions`.
- Two inputs: `Choose Departure`, with a search icon and a small dot on the left, and `Choose Destination`, prefilled and marked with a pin on the left. A swap button (⇅) sits to the right.
- A "Most Popular" list of quick picks below, each with an icon and a floor or count subtitle. Typing filters the list ("196 results available").

## 4. Directions panel (the main thing being copied)

### Container *(measured)*
- Font Inter, white background, radius **24px**, padding **20px**, width **360px**.
- Shadow `rgba(83,83,83,.15) 0 4px 100px 10px`, which is very soft and wide.

### Header
- `← Back` on the left and a `⋯` menu on the right. The menu holds **Share** and **QR Code**.
- Subtitle "Directions to Bread Street Kitchen & Bar": **13.5px / 500 / #606060**.
- Headline "2 minutes total": **22.5px / 600 / line-height 31.5px / rgb(0,27,33)**. On the last step it changes to **"You have arrived"**.

### Progress bar *(measured)*
- Track: **8px tall, #E6E6E6, radius 4px**. Fill: **#2266FF, radius 10px**.
- A hollow circle sits at the start and a **pin icon** at the end.
- **Floor changes appear as icons** on the track (an escalator icon). Other steps show as small dots.
- The fill advances to the current step. Points already passed get a blue check circle.

### Step list
- **Start location heading**: the departure name ("UNIQLO") in **18px / 600 / black**, with a grey dot on the left. A **dotted vertical line** runs down the left edge and joins the steps into a timeline.
- **Each row** is 65px tall with radius 8px, a direction icon on the left and two lines of text:
  - Instruction: **15.75px / 500 / line-height 22.5px / #343D43**.
  - Time: **13.5px / 500 / grey**, for example "Less than a minute".
- **Active row**: background **#293035**, radius **11px**, with white text and a white icon. This is the most noticeable thing in the panel.
- **The wording uses landmarks and floor names**:
  - "Leave UNIQLO and turn left" joins the departure step with its first turn.
  - "Turn right at lululemon" and "Turn right at Arcade" name the nearest location.
  - "Take escalator up to First Floor" names the connection type, the direction and the floor.
  - "Exit escalator and head left".
  - "Arrive at Bread Street Kitchen & Bar".
- **Icons**: straight arrows for left and right, curved arrows (↰ ↱) for turns, an escalator glyph for connections.

### Step nav *(measured)*
- Two buttons, each 151×44 with radius 8px.
- Previous when disabled: white, `1px solid #CCC`, grey arrow. Next when enabled: `#F0F0F0` background with a `#293035` arrow.

## 5. Route rendering and camera during directions

- **Route colours** *(observed)*:
  - The base route is a bright blue.
  - **Only the current step's leg**, from instruction *i* to instruction *i+1*, is drawn in **dark navy with white chevron arrows** pointing the direction of travel.
  - Legs already walked and legs still ahead both stay the base blue. This is a single exclusive section, which matches the SDK's `Navigation.highlightPathSection(from, to)`.
- **Markers**:
  - Departure: a hollow white circle with a grey ring.
  - Destination: a white circular bubble with the category icon, a dark dot under it, and the name in bold beside it.
  - Connections: a blue circle with the escalator icon, next to a blue circle with an up or down arrow.
- **Floor handling**:
  - Only the current floor's part of the route is drawn.
  - On a `TakeConnection` step the map **switches to the destination floor** and shows the route on that floor.
  - The floor selector updates to the active floor.
- **Camera per step** *(observed, approximate)*:
  - It frames the **current leg or the current floor's segment**, not a single point, and leaves room for the panel on the left.
  - Pitch moves between near top-down (0–15°) on simple turn steps and about 45° on the floor-change overview step.
  - Bearing usually stays fixed. It **re-orients on some steps**, such as after leaving the escalator, so it isn't strictly heading-up.
  - Movement is animated and short, about 0.5–1 seconds.
- **URL state**: `#/directions?to=…&from=…&textDirectionsVisible=true&instruction=N`, so routes and steps can be deep-linked and shared.

## 5b. Mobile directions (375×812)

The phone layout is turn-by-turn. It is not a smaller copy of the desktop card.
- **Top banner**: a white sheet with 24px rounded bottom corners.
  - First row: `← Close` on the left and `⋯` on the right.
  - Below that, the **current instruction only**: a 48px rounded-square tile (`#F0F0F0`) holding the direction icon, then **bold instruction text** (about 17px) and a grey time line.
- **Map** fills the middle. The camera is closer than on desktop. The floor selector sits on the right inside a white pill holder.
- **Bottom sheet**: a white sheet with 24px rounded top corners. It holds the progress bar (start ring, connection icon, dots and an end pin, each in a small white circle), then "Directions to X" (grey), then the bold headline, then **two large arrow buttons**: `#F0F0F0`, about 44px tall, each taking half the width.
- The **`⋯` menu**: Share, QR Code and **Steps**.
- **Steps** switches to an **overview mode**:
  - `instruction` is dropped from the URL.
  - The header becomes `← Back`, "Directions to X" and "2 minutes total".
  - The whole route is drawn in base blue, with no dark leg because no step is active.

## 5c. Mobile browse (375×812)

- The **bottom sheet** has a drag handle (a small grey bar) at the top.
- Inside the sheet, in order:
  - A **pill-shaped search field** with a `#F0F0F0` background, a magnifier icon and the placeholder "Search...".
  - The tabs: `Categories` (outlined), `Popular` (filled dark when active) and `Amenities` (grey).
  - The tile carousel. Each tile is a square bordered box with a large icon, then a bold name and a grey subtitle underneath.
- The map sits above the sheet and opens on a city-level overview before moving in.
- The floor selector is folded into a building button plus `⋯` on the right.

## 6. What the Office Demo map data can support

| Battersea feature | Demo data | Notes |
|---|---|---|
| Multi-floor route with a connection step | ✅ 2 floors, 4 elevators, 3 stairs | Floor-change steps can be tested |
| Floor short names (`1F`) | ⚠️ `shortName` = "Level 1" / "Level 2" | We would need our own short-name fallback ("L1") |
| Category tabs and carousel | ⚠️ 6 categories, only 3 non-empty (Office 12, Meeting Room 3, Restroom 2) | Better to build quick picks from space names (washrooms, meeting rooms, kitchen, elevators) |
| Logos, hours, social links on the location card | ❌ none | The card has to stay simpler: name, floor, Directions |
| Landmark names for "Turn left at X" | ✅ 73 named spaces | Nearest named space to each turn coordinate |
| Default camera | pitch 45°, bearing ≈71.3°, zoom ≈19.4 | — |
