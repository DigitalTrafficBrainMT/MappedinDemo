# Architect — index

## System shape (as of 2026-10-22)
- Single-page vanilla TS app. One view-state store drives the panels and the map reactions (ADR-001).
- Map rules: highlight only the current leg; the camera frames extents with a fixed venue bearing (ADR-002).
- Step wording comes from a pure merging module (ADR-003).

## Known defects found during discovery (fixed by battersea-wayfinding-ux)
- `zoomLevel: 2500` invalid camera zoom → replaced by `focusOn` extents.
- Highlight model the reverse of the reference → ADR-002.

## Active features
- `battersea-wayfinding-ux`: see `battersea-wayfinding-ux.md`
