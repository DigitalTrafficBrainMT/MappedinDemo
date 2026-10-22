# DevOps — battersea-wayfinding-ux

## Build
- `npm ci && npm run build` produces a static `dist/` of about 1.0 MB JS (302 kB gzip), 31 kB CSS, and about 48 kB of Inter woff2 subsets.
- The production build was verified with `vite preview`: full journey, street map, self-hosted font, 0 console errors.

## CI (added)
- `.github/workflows/ci.yml` runs on pushes to `main` and on PRs, on Node 24: `npm ci` → `tsc --noEmit` → `npm test` → `npm run build`.
- Dry-run passed on a clean checkout of HEAD.
- It becomes active once the repo is pushed to GitHub.

## Deploy (recommended; not executed, since it needs the user's accounts)
- **Host:** Vercel, Netlify or Cloudflare Pages, connected to the GitHub repo. Settings: build `npm run build`, output `dist`, Node 24. No environment variables are needed while the demo keys are in use.
- **No SPA rewrites needed:** there's no client-side routing.
- **Caching:** hashed files in `dist/assets/` can be served with a 1-year immutable cache. `index.html` should not be cached (`no-cache`).
- **Strategy:** each push to `main` gets an atomic deploy, and PRs get preview URLs.
- **Rollback:** promote the previous deployment in the host dashboard (it's instant), or `git revert` and push.

## Blockers
- The GitHub push to `DigitalTrafficBrainMT/MappedinDemo` hasn't landed: the user needs a token for the right account. CI and hosting both depend on it.
