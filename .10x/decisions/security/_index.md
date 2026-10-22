# Security — index

## Cross-cutting rules
- Never put unescaped map or user data into `innerHTML`.
- No third-party requests beyond Mappedin (API and tiles) without a privacy review.
- Real venue secrets must never ship in the bundle; use access tokens.

## Features
- `battersea-wayfinding-ux`: PASS for the demo, with a production caveat on credentials. See `battersea-wayfinding-ux.md`
