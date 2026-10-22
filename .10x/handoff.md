# Handoff

**From:** QA + Security (Phase 5) → **To:** DevOps + SRE (Phase 6)

- **Release readiness:** ready for demo use.
  - QA: `reviews/2026-10-22-qa-report.md`.
  - Security: `reviews/2026-10-22-security-review.md`.
- **Build:** `npm run build` produces a static `dist/`. It contains a 1.6 MB SDK chunk (445 kB gzip), which is expected.
- **Blockers for going public:** none for the demo keys. The GitHub remote push still hasn't landed (auth on the user's side), and no host has been chosen yet.
- **Production caveats:** see security F4 (credentials) and F5 (CSP).
