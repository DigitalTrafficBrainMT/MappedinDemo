# Handoff

**From:** CTO + PM (Phase 1) → **To:** Architect + Staff Engineer (Phase 2)

- The user approved the full spec, `specs/2026-10-22-battersea-wayfinding-ux-design.md`, with both increments.
- Build vs buy is settled: extend the vanilla TS app; Vitest as a dev-only addition.
- The Phase 2 ADRs need to cover: (1) the module and view-state architecture, (2) the route highlight and camera model, and (3) the step-merging algorithm, since it's the trickiest logic.
- The real-data fixture for the reference route was captured during planning research. It goes in `src/directions/__fixtures__/` at implementation time.
