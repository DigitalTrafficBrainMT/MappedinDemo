# Staff Engineer — index

## Conventions observed [DISCOVERED]
- Vanilla TS with strict-ish tsconfig: `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax` (so type-only imports need `import type`), `erasableSyntaxOnly`.
- CSS is injected from TS via `<style>` elements; there's no CSS file in use. `src/style.css`, `src/counter.ts` and `src/assets/*` are leftover Vite scaffold and unused.
- Comment style: short "why" comments above non-obvious SDK workarounds.
- Verification so far: `npx tsc --noEmit` plus manual checks in the browser. No test runner.
