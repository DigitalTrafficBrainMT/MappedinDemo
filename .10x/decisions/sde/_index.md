# SDE — index

## Current state of the code (2026-10-22)
- Vanilla TS modules: pure logic (`directions/`, `search/`, `util/`), map controllers (`map/`), panels (`ui/`), and the store (`state.ts`), all wired up in `main.ts`.
- 35 unit tests (Vitest). Gates: `tsc`, `vitest run`, `npm run build`.
- Known debt: duplicate room names in lists, the 1.6 MB SDK bundle, no e2e tests.

## Features
- `battersea-wayfinding-ux`: implemented. See `battersea-wayfinding-ux.md` for the 12 deviations and debt

## History
- *[DISCOVERED]* Before 2026-10-22 everything lived in a single `main.ts`, with a heading-up camera and a cumulative highlight. That was replaced by the feature above.
