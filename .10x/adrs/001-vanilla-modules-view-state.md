# ADR-001: Vanilla TS modules driven by a single view-state store

**Status:** Accepted
**Date:** 2026-10-22
**Feature:** battersea-wayfinding-ux
**Author:** 10x-Team (Architect + Staff Engineer)

## Context
All logic, markup and CSS currently live in one 700-line `src/main.ts`. The new scope has about six screens (browse, location, editor, desktop directions, phone directions, Steps overview) in two layouts. The map side effects (route, highlight, camera, floor) must stay consistent with whatever screen is showing. Two earlier bugs came from exactly that drift:
- The highlight was left behind after Clear.
- The floor selector didn't hide.

## Decision
- **One store** (`state.ts`) holds a discriminated union `AppState` (`browse | location | editing | directions`), plus a history stack:
  - `navigate(next)` pushes onto the stack.
  - `back()` pops it.
  - `update(patch)` changes the current view without pushing.
- **The UI renders from state.** Each panel module exports a `render` function used when the view changes, and an optional `patch` function used when the view stays the same. `patch` keeps the input focus and caret while typing and only swaps lists, classes and text.
- **All map side effects run in one reaction**, `applyMapState(prev, next)`, in `main.ts`, and route through `map/*` controllers. UI modules never call the SDK.
- **Pure logic** (step building, progress, search, labels) lives in its own modules with no DOM or SDK imports, so Vitest can test it without a browser.
- **Styles** move to `src/styles.css`, with design tokens as CSS custom properties.

## Alternatives Considered
| Alternative | Pros | Cons | Why Not |
|---|---|---|---|
| Keep a single file, add more functions | No restructuring | Already hard to reason about, and the drift bugs keep happening | Doesn't scale to 6 screens × 2 layouts |
| React / Preact | Declarative rendering, ecosystem | New runtime dependency and a full rewrite; the user chose vanilla | Rejected in brainstorming (approach B) |
| Web Components per panel | Encapsulation | Shadow DOM complicates global token styling and the SDK marker CSS | More ceremony than the problem needs |

## Consequences
### Positive
- Map and UI can't disagree, because both follow the same state.
- The trickiest logic (step merging) becomes unit-testable.
- New screens are additive: one more union member and one more render module.

### Negative
- Hand-written partial patching. Each module has to be careful not to re-render the inputs it owns.
- Templates are strings, so escaping discipline is required. Mitigated by the `escapeHtml` helper and a security review gate.

### Risks
- Partial patching bugs, such as losing focus while typing. Mitigation: inputs are created once per view and only list containers are replaced. This is covered by the QA checklist.

## Dependencies
- Constrains every later UI module to the render/patch contract.
