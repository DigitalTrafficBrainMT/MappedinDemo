# Handoff

**From:** SDE (Phase 4) → **To:** QA + Security (Phase 5)

Built: everything in spec §12 for both increments. Commits `f06eb9b`…`ae57bb5`.

**For QA:**
- The browser checks were run during implementation (desktop 1280×800 and phone 375×812). Formalise them in the QA report and re-check the acceptance list against them.
- Hot spots: step wording on other routes, editor focus handling, the phone sheet gestures, layout flips.

**For Security:**
- All templates in `src/ui/*` and `src/map/markers.ts` interpolate data. Verify every map/user value goes through `esc()` or `textContent`.
- The keys are in `config.ts` (public demo keys).
- `npm audit` reports 0 after `audit fix` (Vite 8.3.5).

Known debt is listed in `decisions/sde/battersea-wayfinding-ux.md`.
