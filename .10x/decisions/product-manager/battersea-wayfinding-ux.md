# Product Manager — battersea-wayfinding-ux

**Date:** 2026-10-22 · **Status:** Approved by user

## Users and jobs
- **Presenter** (Digital Traffic Brain) wants a demo that looks and behaves like a shipped venue product on a laptop and on a phone.
- **Visitor** (the person in the demo story) wants to find a room, see clear step-by-step directions that name rooms and floors, and not get lost at a floor change.

## Scope
**Increment 1: directions**
1. A route editor with searchable departure and destination, swap, picking rooms by clicking the map, and inline errors.
2. Battersea-style step wording: merged micro-turns, "Leave X and turn …", landmarks, floor-change wording, "Arrive at …".
3. Only the current stretch is highlighted (dark navy with arrows). The camera follows the spec §6 table with a fixed bearing.
4. The desktop directions card (measured Battersea styling), and the phone turn-by-turn banner with bottom sheet and Steps overview.
5. A floor selector that stays visible and in sync during directions, plus desktop zoom controls.

**Increment 2: browsing**
6. A browse card or phone sheet with search, Categories / Popular / Amenities tabs, tiles and lists. The sheet can be dragged.
7. A location card with a Directions button that leads into the editor with the destination already set. Rooms on the map can be clicked.

## Out of scope
Sharing, URL state, QR codes, hours, logos, social links, a full-screen button, an accessible-route toggle, the blue dot, heading-up rotation, and deployment.

## Success criteria
- Every acceptance box in the design spec §12 is ticked.
- On the reference route the step list reads naturally: about 7–9 steps, one stairs step, and at least one landmark.
- Side-by-side screenshots at 1440×900 and 375×812 look like the same product family as Battersea.
- Zero console errors during the full journey.
