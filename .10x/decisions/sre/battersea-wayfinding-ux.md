# SRE — battersea-wayfinding-ux

## Service shape
A static client app. At runtime it depends on two external services: the **Mappedin API** (map data, directions) and the **Mappedin tile CDN** (the outdoor street map). There's no server of our own to keep up.

## SLO (demo-appropriate)
- **Availability:** whatever the static host and Mappedin provide. No SLO of our own beyond "the demo loads when shown".
- **User-facing failure handling:**
  - A map that fails to load shows an error card with Try again.
  - A route failure shows an inline message.
  - An outdoor map failure degrades to indoor-only (SDK fallback).

## Monitoring (recommended, optional for a demo)
- An uptime check on the deployed URL (the host's built-in checks or a free pinger).
- If the demo is shown to clients often, add a lightweight error reporter (for example, Sentry's free tier) hooked to `console.error` in `start()` and `startRoute()`. Not added now (scope).

## Runbook
| Symptom | Likely cause | Fix |
|---|---|---|
| "Couldn't load the map" card | Mappedin API unreachable, or demo keys revoked | Check status.mappedin.com; try the keys in `src/config.ts` against a fresh `getMapData` |
| Building floats on white, no streets | Outdoor view failed (container size) | Console shows "Failed to initialize outdoor view". Check that `#map` CSS still has the id selector with explicit size (see SDE deviation 11) |
| Labels missing at overview | SDK collision at the whole-floor zoom | Expected; they appear on zoom-in |
| Odd step wording on a route | Merging heuristics | Capture the route's instructions (see the fixture format) and add a unit test; tune `config.ts` thresholds |
| CI red after `npm update` | SDK or tooling change | Run the gates locally; the SDK is pinned to `^6`, so check the changelog for 6.x behaviour changes |
