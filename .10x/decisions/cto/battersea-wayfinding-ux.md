# CTO — battersea-wayfinding-ux

**Date:** 2026-10-22 · **Status:** Approved by user

## Problem
The demo works, but it doesn't feel like a polished venue wayfinding product. The bar the user set is Battersea Power Station's map, which runs on Mappedin Web. The demo needs to hold up when shown side by side with it, on a laptop or a phone.

## Build vs buy
| Option | Verdict |
|---|---|
| Embed Mappedin Web (what Battersea runs) | **Rejected.** It needs a paid Mappedin Web setup for the venue, can't be customised beyond its settings, and leaves no code of our own to demo |
| React plus `@mappedin/react-sdk` rewrite | **Rejected for now.** It's a full rewrite plus a new framework, and the hard parts (camera, highlight, step wording) cost the same either way |
| **Extend the existing vanilla TS app** | **Chosen.** Same stack, no runtime dependencies added, reuses the working SDK integration |

## Tech direction
- Stays on Vite + TS + `@mappedin/mappedin-js` 6.x. Adds **Vitest** (dev only) for the pure logic.
- Adds the Inter webfont from Google Fonts, falling back to system-ui if it fails to load.
- No backend. The demo keys stay client-side, which is acceptable for public demo keys only (see Security).

## Risks
- **Fidelity is judged by eye.** Mitigation: measured tokens in the teardown spec, and side-by-side screenshot QA.
- **The demo map is an office, not a mall.** Its categories are sparse and it has no logos or hours. Mitigation: build quick picks from room names and connections; keep the location card minimal.
