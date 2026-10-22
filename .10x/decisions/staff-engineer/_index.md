# Staff Engineer — index

## Conventions
- Vanilla TS with `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax` (use `import type`) and `erasableSyntaxOnly` (no enums or parameter properties).
- Styles live in `src/styles.css` with tokens as CSS custom properties. No CSS-in-TS. *(Changed 2026-10-22; previously injected strings.)*
- Templates with `esc()` for data, delegated `data-action` click handling, and pure logic isolated for Vitest.
- Gates: `npx tsc --noEmit`, `npx vitest run`, `npm run build`, and browser QA.

## Active features
- `battersea-wayfinding-ux`: see `battersea-wayfinding-ux.md`
