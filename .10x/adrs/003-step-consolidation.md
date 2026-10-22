# ADR-003: Merge raw SDK instructions into human steps in a pure module

**Status:** Accepted
**Date:** 2026-10-22
**Feature:** battersea-wayfinding-ux
**Author:** 10x-Team (Architect + Staff Engineer)

## Context
`getDirections` on the reference route (Electrical Room L2 → Focus Room 102 L1, 42m) returns **17 instructions**, and most of them are 0–2m wiggles. Battersea's Mappedin Web shows about 8 clear steps for a 2-minute route, with phrasing like:
- "Leave UNIQLO and turn left"
- "Turn right at lululemon"
- "Take escalator up to First Floor"
- "Exit escalator and head left"

Three properties of the SDK output shape the solution:
- The `Departure` instruction carries **no bearing**. The first real turn sits about 0.5m later.
- `ExitConnection` reports `direction` and `toFloor` **reversed** ("up", back to Level 2, after going down).
- `instruction.distance` is the distance **travelled to reach** that instruction. Departure is 0, and the sum equals `directions.distance`.

## Decision
`src/directions/steps.ts`: a pure function `buildSteps(input) → Step[]`. It works only on plain data: instruction type, bearing, connection type, lat/lng/floorId, the landmark list and the floor names. Steps reference raw instruction indices so the map layer can get the SDK `Coordinate` objects back. The rules are as in the spec §4, with these implementation choices:

1. **Departure and exit clusters** (a departure or exit, plus turns within `MERGE_DISTANCE_M` = 3m) take their side from the **first turn's SDK bearing**. The SDK knows the door or stair orientation; we don't.
2. **Mid-route turn clusters** take their side from the **net heading change**: the heading leaving the cluster minus the heading entering it. Headings are bearings between instruction points, skipping zero-length legs. Under 25° the step is dropped, 25–60° is "bear", 60–150° is "turn", and over 150° is "turn around".
3. **Landmarks:** the nearest named room centre on the same floor within `LANDMARK_RADIUS_M` (5m) of the step point. Excluded:
   - The departure room.
   - Utility rooms (`/storage|electrical|custodial/i`).
   - Any name that appears more than once on that floor ("Storage 📦" appears up to 4 times). Ambiguous landmarks mislead.

   This refines spec rule 5 and is recorded as an SDE deviation.
4. **Emoji** are stripped from all names used in the text.
5. **Unit tests** use a captured real-data fixture of the reference route.

## Alternatives Considered
| Alternative | Pros | Cons | Why Not |
|---|---|---|---|
| Show the raw SDK instructions (status quo) | Zero logic | 17 noisy steps; "Turn right, 1m" twice in a row | Fails the fidelity goal |
| Drop every turn shorter than X metres | Very simple | Loses real direction changes; can't explain the net effect | Wrong answers on wiggly corridors |
| Use SDK bearings for every cluster (join the strings) | No geometry maths | Can't combine "Right + SlightRight + SlightLeft" into one meaning | The net-heading approach is principled |
| Mappedin `smoothing` option in `getDirections` | Fewer nodes at the source | Changes path geometry, not instruction semantics, and still yields micro-turns | Doesn't solve wording |

## Consequences
### Positive
- Readable steps that match the reference's tone, fully covered by unit tests on real data.
- Thresholds live in `config.ts` and can be tuned without touching the logic.

### Negative
- Heuristic. Unusual geometry, such as very long curved corridors, could still produce an odd "bear" step.

### Risks
- The 5m landmark radius could pick a room on the other side of a wall. Mitigation: utility and duplicate exclusions; QA reviews the wording on several routes.

## Dependencies
- Feeds ADR-002 (the highlight leg and camera framing) and the progress bar.
