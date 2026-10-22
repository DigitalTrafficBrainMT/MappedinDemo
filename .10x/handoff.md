# Handoff

**From:** DevOps + SRE (Phase 6) → **To:** User / next feature

`battersea-wayfinding-ux` is complete and verified for demo use.
- **Run locally:** `npm install && npm run dev`.
- **Gates:** `npx tsc --noEmit && npm test && npm run build`.
- **Ship:**
  1. Push to GitHub (the token fix is pending).
  2. Connect Vercel, Netlify or Cloudflare Pages (build `npm run build`, output `dist`, Node 24).
- **Runbook:** `decisions/sre/battersea-wayfinding-ux.md`. **Escalation:** Mappedin status page / support for API or tile outages.
- **Next-feature candidates:**
  - Duplicate-name disambiguation.
  - A Playwright smoke test.
  - The access-token flow for a real venue.
