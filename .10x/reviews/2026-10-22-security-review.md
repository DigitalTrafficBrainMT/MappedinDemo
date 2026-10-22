# Security review: battersea-wayfinding-ux

**Date:** 2026-10-22 · **Build:** `71bd791` · **Scope:** the whole client app (no backend exists)

## Verdict: PASS for a public demo. Two items must change before using real (non-demo) venue credentials.

## Threat model (brief)
- **Assets:** the Mappedin API key and secret, and visitor privacy.
- **Entry points:**
  - The search and editor text inputs.
  - Map data, such as room and category names, rendered into HTML.
  - Map clicks.
  - Third-party resources: the Mappedin API and tile CDN. (Google Fonts was removed; see F2.)
- **Out of scope:** auth, storage and server code. None of these exist.

## Findings
| # | Severity | Finding | Status |
|---|---|---|---|
| F1 | — | **XSS via templates.** Every `innerHTML` sink was audited (17 sinks across `src/ui/*`, `map/markers.ts`, `map/floors.ts` and `main.ts`). Each interpolation is one of: `esc()`, an `icon()` constant, a numeric value, an internal constant, or an escaping helper (`placeRowHtml`, `timelineHtml`, `currentStepHtml`, `progressHtml`). A live injection test typed `<img src=x onerror=alert(1)>` into the editor: it rendered as text, with 0 `<img>` elements created. | ✅ No issue |
| F2 | Medium (privacy) | **Google Fonts** sent every visitor's IP to Google without consent, which is a GDPR problem for an EU operator (LG München I, 3 O 17493/20). | ✅ Fixed in `71bd791`: Inter is self-hosted with `@fontsource-variable/inter`; the build has 0 Google requests |
| F3 | Low (dev only) | **Vite dev-server advisory** (GHSA-vfpm-58rq-9qcg, 2× high), which exposes files outside `server.fs`. It affects the dev server only, not the built site. | ✅ Fixed: `npm audit fix` brought Vite to 8.3.5; `npm audit` reports 0 |
| F4 | Accepted (demo) → **must change for production** | **Mappedin key and secret ship in the client bundle** (`src/config.ts`). These are Mappedin's *public demo* keys, so exposure is harmless. A real venue's secret must not ship like this. | ⚠️ Accepted for the demo. For a real venue, switch to Mappedin's access-token flow (`getMapData({ accessToken })`, with the token minted by a small backend) |
| F5 | Info | **No CSP is set.** The SDK uses `blob:` workers by default. A strict CSP would need `setWorkersUrl()` with self-hosted `maplibre-worker.csp.js` and `collision-worker.csp.js`. | ℹ️ Recommended if the demo is embedded on a site with a strict CSP |
| F6 | — | **Event handling.** Clicks resolve `data-id`/`data-tab` through `Map` lookups only; there's no `eval` or dynamic code. Unknown ids are ignored. | ✅ No issue |
| F7 | — | **Data at rest.** No cookies, `localStorage` or URL state; nothing personal is collected. | ✅ No issue |

## Dependencies
- Runtime: `@mappedin/mappedin-js` 6.30.0 and `@fontsource-variable/inter`.
- Dev: `vite` 8.3.5, `vitest` 5.0.5, `typescript` ~6.0.2.
- `npm audit`: **0 vulnerabilities**.
