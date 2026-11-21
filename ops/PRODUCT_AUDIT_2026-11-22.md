# G-NeMa engineering and website audit — 2026-11-22

## Evidence and limitations
- Live gnema.in pages are discoverable; this is not a synthetic-browser or Lighthouse pass.
- GitHub repositories accessible: gnema-website (public), titan (private), gnema-ai-platform (private), aegisdb-omni (private), nexaora-website (public).
- The TITAN README documents Oracle AIOps and a 12-agent organization; no live production certification was established.
- gnema-ai-platform README is minimal. Other product maturity is unknown, not automatically 'planned'.
- D: local files were unavailable because Desktop Commander reported the monthly usage limit.
- Cloudflare deployment, analytics, CRM and live endpoints were not independently verified.

## Priority 0 — Reliability and honest product positioning
1. Give every product one of: Verified Production, Pilot, Prototype, Research, Verification Pending. Require dated evidence and signoff before changing from Verification Pending.
2. Run functional CTA/contact tests, record lead delivery, and test Cloudflare deployment/rollback.
3. Create automated link checks, accessibility checks, HTML checks and Lighthouse CI; block deployments on critical failures.
4. Check current Cloudflare production response headers, Worker scripts and route configuration, and secrets/permissions.
5. Require explicit release criteria for TITAN and Multi-Agent Organization, including safety, observability, security and human override.

## Priority 1 — Speed and SEO
1. Change global CSS/JS no-store to short public cache + conditional revalidation and long immutable caching only for hashed filenames. Keep HTML on revalidation.
2. Consolidate duplicate viewport, Open Graph and twitter tags; replace malformed '&amp;amp;' and '?' brand separators.
3. Update sitemap lastmod from real Git commit timestamps; check sitemap/robots/canonical resolution and redirect consistency.
4. Optimize hero images and product thumbnails, emit responsive image sizes, lazy-load below the fold, reserve layout dimensions.
5. Collect actual Core Web Vitals: LCP <= 2.5s, INP <= 200ms, CLS <= 0.1 at 75th percentile.
6. Audit all product links and canonical URLs, including /products/titan/ vs /products/titan.html.

## Priority 2 — Business conversion
1. Add deployment/maturity labels, customer outcomes, technical proof, and limitations on each product page.
2. Replace mailto fallback with a validated anti-spam form and privacy-compliant lead handling.
3. Define one primary action per major product and track funnel clicks/submissions (consent-aware).
4. Add scoped case studies, architecture screenshots and benchmark methodology; avoid unsupported claims.
5. Clarify service availability, geography, pricing scope and support/SLAs.

## Priority 3 — Product operations
1. Product registry: product, owner, repo, branch, milestone, test coverage, deploy environment, incident count, release gate, last verification date.
2. CI: lint, test, SAST, dependency scanning, SBOM, signed release artifact and security reviews.
3. Operational dashboards: latency p50/p95/p99, errors, cost/request, agent tool success, customer retention and uptime.
4. TITAN: integrate test database, rollback/dry run, query plan regression and deterministic firewall tests before customer pilots.
5. Agents: isolate secrets, enforce bounded tool permissions, audit actions, ensure idempotency and human approval for high-impact actions.

## Publication rule
Public pages may say 'verification pending' where evidence is incomplete; never infer 'production-certified' from repository text.
