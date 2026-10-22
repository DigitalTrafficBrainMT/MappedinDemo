# Handoff

**From:** Architect + Staff Engineer (Phase 2) → **To:** EM + Senior Engineer (Phase 3)

- ADRs: **001** (vanilla modules and view-state store), **002** (current-leg highlight with a fixed-bearing `focusOn` camera), **003** (step merging in a pure module).
- The component table and data flow are in `decisions/architect/battersea-wayfinding-ux.md`.
- The coding standards are in `decisions/staff-engineer/battersea-wayfinding-ux.md`. Above all: escape data, no SDK imports in pure modules, tokens only in CSS.
- Plan the order so the pure modules plus tests come first: they de-risk the wording, and the UI depends on them.
