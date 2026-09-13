# G-NeMa Final Website

Static, Cloudflare Workers Static Assets-ready website for **G-NeMa — Galactic Nexus of Machines**.

## Structure
- `/public/` — complete deployable website root
- `/public/products/` — product portfolio
- `/public/products/titan.html` — TITAN
- `/public/products/multi-agent-organization.html` — Multi-Agent Organization
- `/public/products/causal-world-simulation.html` — Causal World Simulation
- `/public/solutions/` — solutions
- `/public/industries/` — industry positioning
- `/public/research/` — research hub
- `/public/architecture/` — architecture overview
- `/public/assessment/` — TITAN assessment
- `/public/insights/` — insights
- `/public/about.html` — company
- `/public/contact.html` — contact
- `/public/assets/` — logos, favicon, CSS, JS and media
- `/public/_headers` — Cloudflare static asset security headers
- `/public/robots.txt`, `/public/sitemap.xml`, `/public/404.html`
- `/ops/` — CI, SEO and production validation tooling; not deployed as public assets

## Deployment
Cloudflare Workers serves the contents of `/public/` as static assets. The repository root contains deployment configuration, CI workflows and operational tooling only.

## Notes
The contact form uses a `mailto:` fallback so it does not pretend to have a backend. Replace it later with Cloudflare Workers, Formspree, or another approved form endpoint.

## Branding update
- Official G-NeMa logo supplied by the owner is used consistently in all page headers and footers.
- Browser favicon remains the G-NeMa favicon and Apple touch icon uses the supplied brand logo.
- Added responsive LinkedIn, YouTube, X, Instagram and Facebook social-media branding plus `www.gnema.in` in every footer.
- Corrected sub-page header brand links so the logo always returns to the site home.
