# QA — battersea-wayfinding-ux

**Report:** `reviews/2026-10-22-qa-report.md` · **Verdict:** PASS

## Strategy
- **Unit (Vitest, 35 tests).** Step merging on a captured real-route fixture, plus synthetic edge cases: straight drop, lift wording, the left loop, lift as either end, and the landmark exclusions. Also progress positions, search ranking and groups, and text/geo utilities.
- **Manual browser QA** on desktop (1280×800) and phone (375×812): the full journey, error paths, keyboard, sheet gestures, layout flips, and a clean-console check in a fresh tab.
- **Wording sampling:** 7 extra real routes through `buildSteps`.

## Quality gates (all must pass before a commit counts as done)
`npx tsc --noEmit` · `npx vitest run` · `npm run build` · zero console errors in a fresh-tab journey.

## Bugs found
8, all fixed (1 high, 3 medium, 4 low). See the report.

## Open
- Duplicate-name disambiguation (data).
- Reduced motion was verified by code review only.
- Recommended: a Playwright smoke test of the journey if the demo keeps evolving.
