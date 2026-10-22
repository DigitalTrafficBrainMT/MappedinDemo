# Staff Engineer — battersea-wayfinding-ux

## Standards for this feature
- **Imports:** `import type` for SDK types (`verbatimModuleSyntax`). Pure modules must not import `@mappedin/mappedin-js` at runtime.
- **Escaping:** anything from map data or user input goes into templates via `esc()` or is set with `textContent`. Never interpolate raw data into `innerHTML`.
- **No inline styles for theming.** Every colour and size is a CSS custom property in `styles.css`; the TS side only toggles classes. The exceptions are measured layout values, such as the progress fill percentage, set as CSS variables.
- **Constants** (thresholds, camera presets, colours that the SDK needs as strings) live in `config.ts` and nowhere else.
- **Event handling:** one delegated `click` listener per panel root using `data-action` attributes, so re-rendering never leaves stale listeners.
- **Accessibility:** buttons are `<button>` with an `aria-label` when they're icon-only; the step list is an `<ol>`; the active step has `aria-current="step"`.
- **Comments:** short "why" comments only where SDK behaviour is surprising (reversed exit data, single highlight section, distance semantics).

## Cross-cutting concerns
- **Reduced motion:** one `prefersReducedMotion()` helper used by the camera and highlight durations.
- **Layout:** one `isMobile()` helper plus a `layoutchange` subscription.
- **Error surfaces:** a startup error card, inline editor errors, and `console.error` with context for anything unexpected.

## Reuse from the existing code
- Bearing maths (`bearingBetween`) moves to `util/geo.ts` and is reused for headings.
- `waitForNonZeroSize`, the floor `floor-change` sync and walking-speed formatting are carried over.
- Removed: the rAF highlight tween, the heading-up camera, `<select>` pickers, CSS-in-TS strings, and the Vite scaffold files.
