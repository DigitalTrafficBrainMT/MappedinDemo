# Security — battersea-wayfinding-ux

**Review:** `reviews/2026-10-22-security-review.md` · **Verdict:** PASS for the demo

## Threat model
A client-only app with no auth and no storage. The risks are XSS from map or user text, leaking credentials, and third-party privacy.

## Decisions
- **Escaping:** all template data goes through `esc()` or `textContent`. All 17 `innerHTML` sinks were audited and a live injection test passed.
- **Privacy:** the font is self-hosted; Google Fonts was removed (GDPR).
- **Credentials:** the demo keys stay client-side (accepted). **For a real venue, use Mappedin's access-token flow behind a small backend.** Shipping a real secret like this is a blocker.
- **CSP:** none for now. For strict-CSP embeds, use `setWorkersUrl()` with self-hosted workers.
- **Dependencies:** 0 audit findings (Vite 8.3.5, SDK 6.30.0).
