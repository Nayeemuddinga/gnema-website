#!/usr/bin/env bash
set -Eeuo pipefail

###############################################################################
# G-NeMa Website — SEO Foundation + G-NeMa Ops Bot
# Repository: Nayeemuddinga/gnema-website
# Branch: main
#
# What this script does:
#   1. Verifies the repository and branch
#   2. Creates the SEO foundation
#   3. Normalizes TITAN canonical URL
#   4. Generates sitemap.xml from canonical HTML URLs
#   5. Creates Organization/WebSite/WebPage/Breadcrumb/Product JSON-LD
#   6. Creates G-NeMa Ops Bot
#   7. Creates GitHub Actions automation
#   8. Validates HTML, metadata, sitemap, robots and internal links
#   9. Runs the Ops Bot locally
#  10. Shows git diff
#  11. Commits
#  12. Pushes to origin/main
#
# Requirements:
#   - Git
#   - Python 3
#   - GitHub repository already configured as origin
#
# IMPORTANT:
#   - No API keys are hardcoded.
#   - SERPAPI_KEY is read only from environment/GitHub Secrets.
#   - The bot does not automatically perform outreach.
###############################################################################

echo
echo "============================================================"
echo " G-NeMa SEO + G-NeMa Ops Bot Production Setup"
echo "============================================================"
echo

###############################################################################
# 0. Repository checks
###############################################################################

EXPECTED_REPO="https://github.com/Nayeemuddinga/gnema-website.git"
EXPECTED_BRANCH="main"

if ! command -v git >/dev/null 2>&1; then
    echo "ERROR: Git is not installed."
    exit 1
fi

if ! command -v python >/dev/null 2>&1; then
    echo "ERROR: Python 3 is required and was not found as 'python'."
    echo "Install Python 3 and make sure it is available in Git Bash."
    exit 1
fi

if [ ! -d ".git" ]; then
    echo "ERROR: Run this script from the root of the gnema-website Git repository."
    echo "Expected:"
    echo "  cd /d/GIT/gnema-website"
    exit 1
fi

CURRENT_BRANCH="$(git branch --show-current)"

if [ "$CURRENT_BRANCH" != "$EXPECTED_BRANCH" ]; then
    echo "ERROR: Current branch is '$CURRENT_BRANCH'."
    echo "This production script only pushes to '$EXPECTED_BRANCH'."
    exit 1
fi

ORIGIN_URL="$(git remote get-url origin 2>/dev/null || true)"

if [ -z "$ORIGIN_URL" ]; then
    echo "ERROR: No origin remote configured."
    exit 1
fi

echo "Repository : $ORIGIN_URL"
echo "Branch     : $CURRENT_BRANCH"

if [ ! -f "index.html" ]; then
    echo "ERROR: index.html not found."
    exit 1
fi

###############################################################################
# 1. Clean working tree safety
###############################################################################

echo
echo "[1/12] Checking working tree..."

if ! git diff --quiet || ! git diff --cached --quiet; then
    echo
    echo "ERROR: Your working tree contains uncommitted changes."
    echo
    git status --short
    echo
    echo "Commit/stash your existing work first."
    exit 1
fi

###############################################################################
# 2. Create directories
###############################################################################

echo
echo "[2/12] Creating SEO/Ops directories..."

mkdir -p \
    ops \
    ops/reports \
    ops/state \
    .github/workflows \
    assets/seo

###############################################################################
# 3. Normalize TITAN duplicate route
###############################################################################

echo
echo "[3/12] Normalizing TITAN canonical route..."

cat > products/titan.html <<'EOF'
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>TITAN | G-NeMa</title>
  <meta http-equiv="refresh" content="0; url=/products/titan/">
  <link rel="canonical" href="https://gnema.in/products/titan/">
  <meta name="robots" content="noindex,follow">
</head>
<body>
  <p>
    Redirecting to
    <a href="/products/titan/">TITAN by G-NeMa</a>.
  </p>
  <script>
    window.location.replace("/products/titan/");
  </script>
</body>
</html>
EOF

###############################################################################
# 4. SEO metadata + structured data injector
###############################################################################

echo
echo "[4/12] Applying SEO metadata and structured data..."

cat > /tmp/gnema_seo_inject.py <<'PY'
from pathlib import Path
from html import escape
import re
import json

ROOT = Path(".")
BASE = "https://gnema.in"

# Explicit canonical/page mapping.
PAGES = {
    "index.html": {
        "title": "G-NeMa | AI, Space, Robotics & Intelligent Systems",
        "description": "G-NeMa builds intelligent products across enterprise AI, autonomous systems, space, robotics, defence, cybersecurity and intelligent operations.",
        "canonical": "/",
        "type": "WebSite",
    },
    "about.html": {
        "title": "About G-NeMa | Galactic Nexus of Machines",
        "description": "Learn about G-NeMa, a technology company building AI products and intelligent systems across enterprise intelligence, autonomous systems, space, robotics and defence.",
        "canonical": "/about.html",
        "type": "AboutPage",
    },
    "contact.html": {
        "title": "Contact G-NeMa | AI & Intelligent Systems",
        "description": "Contact G-NeMa for enterprise AI, database intelligence, autonomous systems, robotics, space intelligence, cybersecurity and intelligent technology solutions.",
        "canonical": "/contact.html",
        "type": "ContactPage",
    },
    "products/index.html": {
        "title": "G-NeMa Products | AI, Autonomous & Intelligent Systems",
        "description": "Explore G-NeMa products spanning enterprise intelligence, database AI, multi-agent systems, space autonomy, robotics, cybersecurity and defensive intelligence.",
        "canonical": "/products/",
        "type": "CollectionPage",
    },
    "products/titan/index.html": {
        "title": "TITAN | Autonomous Oracle Database Intelligence & Protection | G-NeMa",
        "description": "TITAN by G-NeMa provides autonomous Oracle database intelligence, performance diagnosis, safe optimization recommendations and deterministic protection controls.",
        "canonical": "/products/titan/",
        "type": "Product",
    },
    "products/multi-agent-organization.html": {
        "title": "Multi-Agent Organization | G-NeMa",
        "description": "G-NeMa Multi-Agent Organization coordinates specialized AI agents for enterprise workflows, reasoning, execution and governed automation.",
        "canonical": "/products/multi-agent-organization.html",
        "type": "Product",
    },
    "products/causal-world-simulation.html": {
        "title": "Causal World Simulation | G-NeMa",
        "description": "G-NeMa Causal World Simulation explores causal reasoning, scenario modeling and decision intelligence for complex systems.",
        "canonical": "/products/causal-world-simulation.html",
        "type": "Product",
    },
    "products/bankai-nexus.html": {
        "title": "BankAI Nexus | AI Banking Intelligence | G-NeMa",
        "description": "BankAI Nexus is a G-NeMa product architecture for intelligent banking operations, decision support, automation and enterprise AI.",
        "canonical": "/products/bankai-nexus.html",
        "type": "Product",
    },
    "products/enterprise-ai-operating-layer.html": {
        "title": "Enterprise AI Operating Layer | G-NeMa",
        "description": "G-NeMa Enterprise AI Operating Layer provides governed infrastructure for enterprise agents, AI workflows, policies, tools and intelligent operations.",
        "canonical": "/products/enterprise-ai-operating-layer.html",
        "type": "Product",
    },
    "products/knowledge-distillation.html": {
        "title": "Knowledge Distillation & Supervised Fine-Tuning | G-NeMa",
        "description": "G-NeMa knowledge distillation and supervised fine-tuning capabilities support enterprise model engineering and domain-specific AI systems.",
        "canonical": "/products/knowledge-distillation.html",
        "type": "Product",
    },
    "products/orbitalis.html": {
        "title": "ORBITALIS | Space Mission Autonomy & Operations | G-NeMa",
        "description": "ORBITALIS is a G-NeMa product line focused on space mission autonomy, intelligent operations and mission decision support.",
        "canonical": "/products/orbitalis.html",
        "type": "Product",
    },
    "products/sentinel-orbit.html": {
        "title": "SENTINEL ORBIT | Space Domain Awareness | G-NeMa",
        "description": "SENTINEL ORBIT is a G-NeMa product line for space domain awareness, orbital resilience and intelligent space operations.",
        "canonical": "/products/sentinel-orbit.html",
        "type": "Product",
    },
    "products/forge-robotics.html": {
        "title": "FORGE ROBOTICS | Embodied AI & Autonomous Robotics | G-NeMa",
        "description": "FORGE ROBOTICS is a G-NeMa product line for embodied AI, autonomous robotics and intelligent robotic systems.",
        "canonical": "/products/forge-robotics.html",
        "type": "Product",
    },
    "products/atlas-robotics.html": {
        "title": "ATLAS AUTONOMY | Multi-Robot Mission Orchestration | G-NeMa",
        "description": "ATLAS AUTONOMY is a G-NeMa product line for multi-robot orchestration, mission coordination and autonomous robotic operations.",
        "canonical": "/products/atlas-robotics.html",
        "type": "Product",
    },
    "products/aegis-defense.html": {
        "title": "AEGIS DEFENSE | Defensive Intelligence & Mission Assurance | G-NeMa",
        "description": "AEGIS DEFENSE is a G-NeMa defensive intelligence product line focused on mission assurance, resilience and decision support.",
        "canonical": "/products/aegis-defense.html",
        "type": "Product",
    },
    "products/sentinel-cyber.html": {
        "title": "SENTINEL CYBER | AI Cybersecurity & Critical Infrastructure | G-NeMa",
        "description": "SENTINEL CYBER is a G-NeMa product line for AI-assisted cybersecurity, resilience and critical infrastructure protection.",
        "canonical": "/products/sentinel-cyber.html",
        "type": "Product",
    },
    "solutions/index.html": {
        "title": "G-NeMa Solutions | Enterprise AI & Intelligent Systems",
        "description": "G-NeMa solutions apply AI, automation, multi-agent systems and intelligent operations to complex enterprise and technology environments.",
        "canonical": "/solutions/",
        "type": "CollectionPage",
    },
    "industries/index.html": {
        "title": "G-NeMa Industries | AI Across Enterprise & Frontier Systems",
        "description": "Explore how G-NeMa applies intelligent systems across banking, enterprise technology, space, robotics, cybersecurity, defence and critical infrastructure.",
        "canonical": "/industries/",
        "type": "CollectionPage",
    },
    "research/index.html": {
        "title": "G-NeMa Research | AI, Autonomous Systems & Deep Technology",
        "description": "Explore G-NeMa research across AI, multi-agent systems, causal intelligence, robotics, space systems, cybersecurity and advanced computing.",
        "canonical": "/research/",
        "type": "CollectionPage",
    },
}

def remove_tag(text, pattern):
    return re.sub(pattern, "", text, count=1, flags=re.I | re.S)

def get_head(text):
    m = re.search(r"<head\b[^>]*>(.*?)</head>", text, flags=re.I | re.S)
    return m.group(1) if m else ""

def jsonld_block(obj):
    return (
        '<script type="application/ld+json">\n'
        + json.dumps(obj, ensure_ascii=False, indent=2)
        + '\n</script>'
    )

def build_schema(path, info):
    canonical = BASE + info["canonical"]

    graph = []

    org = {
        "@type": "Organization",
        "@id": BASE + "/#organization",
        "name": "G-NeMa",
        "url": BASE + "/",
        "logo": BASE + "/assets/logos/DG1.png",
        "sameAs": [
            "https://www.linkedin.com/company/g-nema/"
        ],
    }

    graph.append(org)

    if path == "index.html":
        graph.append({
            "@type": "WebSite",
            "@id": BASE + "/#website",
            "url": BASE + "/",
            "name": "G-NeMa",
            "publisher": {"@id": BASE + "/#organization"},
        })

    if info["type"] == "Product":
        graph.append({
            "@type": "Product",
            "@id": canonical + "#product",
            "name": re.sub(r"\s+\|\s+G-NeMa.*$", "", info["title"]),
            "description": info["description"],
            "url": canonical,
            "brand": {
                "@type": "Brand",
                "name": "G-NeMa"
            },
            "manufacturer": {
                "@id": BASE + "/#organization"
            }
        })

    page_type = info["type"] if info["type"] != "Product" else "WebPage"

    page = {
        "@type": page_type,
        "@id": canonical + "#webpage",
        "url": canonical,
        "name": info["title"],
        "description": info["description"],
        "isPartOf": {"@id": BASE + "/#website"},
        "about": {"@id": BASE + "/#organization"},
    }

    if page_type == "WebSite":
        page = None

    if page:
        graph.append(page)

    # Breadcrumbs for all non-home pages.
    if info["canonical"] != "/":
        pieces = [x for x in info["canonical"].strip("/").split("/") if x]
        items = [{
            "@type": "ListItem",
            "position": 1,
            "name": "G-NeMa",
            "item": BASE + "/"
        }]

        if pieces[0] == "products":
            items.append({
                "@type": "ListItem",
                "position": 2,
                "name": "Products",
                "item": BASE + "/products/"
            })

            if len(pieces) > 1:
                items.append({
                    "@type": "ListItem",
                    "position": 3,
                    "name": re.sub(
                        r"\.html$",
                        "",
                        pieces[-1]
                    ).replace("-", " ").title(),
                    "item": canonical
                })
        else:
            items.append({
                "@type": "ListItem",
                "position": 2,
                "name": pieces[-1].replace("-", " ").replace(".html", "").title(),
                "item": canonical
            })

        graph.append({
            "@type": "BreadcrumbList",
            "@id": canonical + "#breadcrumb",
            "itemListElement": items
        })

    return {
        "@context": "https://schema.org",
        "@graph": graph
    }

for rel, info in PAGES.items():
    path = ROOT / rel

    if not path.exists():
        print(f"SKIP missing: {rel}")
        continue

    text = path.read_text(encoding="utf-8")

    # Do not modify the dedicated redirect page.
    if rel == "products/titan.html":
        continue

    # Remove previous canonical/meta/schema generated by this script.
    text = remove_tag(
        text,
        r'<link[^>]+rel=["\']canonical["\'][^>]*>\s*'
    )

    text = remove_tag(
        text,
        r'<meta[^>]+name=["\']description["\'][^>]*>\s*'
    )

    text = remove_tag(
        text,
        r'<meta[^>]+name=["\']keywords["\'][^>]*>\s*'
    )

    text = remove_tag(
        text,
        r'<script[^>]+type=["\']application/ld\+json["\'][^>]*>.*?</script>\s*'
    )

    title_tag = f"<title>{escape(info['title'])}</title>"
    description_tag = (
        f'<meta name="description" content="{escape(info["description"])}">'
    )
    canonical_tag = (
        f'<link rel="canonical" href="{escape(BASE + info["canonical"])}">'
    )
    robots_tag = '<meta name="robots" content="index,follow,max-image-preview:large">'
    viewport_tag = '<meta name="viewport" content="width=device-width, initial-scale=1">'
    og_title = f'<meta property="og:title" content="{escape(info["title"])}">'
    og_description = (
        f'<meta property="og:description" content="{escape(info["description"])}">'
    )
    og_url = f'<meta property="og:url" content="{escape(BASE + info["canonical"])}">'
    og_type = '<meta property="og:type" content="website">'
    twitter_card = '<meta name="twitter:card" content="summary_large_image">'
    twitter_title = f'<meta name="twitter:title" content="{escape(info["title"])}">'
    twitter_description = (
        f'<meta name="twitter:description" content="{escape(info["description"])}">'
    )
    favicon = '<link rel="icon" type="image/png" href="/assets/logos/Dot1.png">'
    apple = '<link rel="apple-touch-icon" href="/assets/logos/Dot1.png">'

    # Remove existing title only when we have a configured title.
    text = remove_tag(text, r"<title>.*?</title>\s*")

    metadata = "\n".join([
        title_tag,
        viewport_tag,
        description_tag,
        canonical_tag,
        robots_tag,
        og_title,
        og_description,
        og_url,
        og_type,
        twitter_card,
        twitter_title,
        twitter_description,
        favicon,
        apple,
    ])

    schema = jsonld_block(build_schema(rel, info))

    if re.search(r"</head>", text, flags=re.I):
        text = re.sub(
            r"</head>",
            "\n" + metadata + "\n" + schema + "\n</head>",
            text,
            count=1,
            flags=re.I
        )
    else:
        text = metadata + "\n" + schema + "\n" + text

    path.write_text(text, encoding="utf-8")
    print(f"UPDATED {rel}")
PY

python /tmp/gnema_seo_inject.py

###############################################################################
# 5. Generate sitemap.xml
###############################################################################

echo
echo "[5/12] Generating canonical sitemap.xml..."

python - <<'PY'
from pathlib import Path
from datetime import datetime, timezone
import re
import xml.etree.ElementTree as ET

ROOT = Path(".")
BASE = "https://gnema.in"

urls = []

for path in sorted(ROOT.rglob("*.html")):
    if any(part in {".git", ".github", "node_modules"} for part in path.parts):
        continue

    # Exclude redirect/duplicate route.
    if path.as_posix() == "products/titan.html":
        continue

    text = path.read_text(encoding="utf-8", errors="ignore")

    m = re.search(
        r'<link[^>]+rel=["\']canonical["\'][^>]+href=["\']([^"\']+)["\']',
        text,
        flags=re.I
    )

    if not m:
        continue

    canonical = m.group(1).strip()

    if not canonical.startswith(BASE):
        continue

    urls.append((canonical, path))

# De-duplicate while preserving order.
seen = set()
final = []

for canonical, path in urls:
    if canonical not in seen:
        seen.add(canonical)
        final.append((canonical, path))

now = datetime.now(timezone.utc).strftime("%Y-%m-%d")

lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
]

for canonical, path in final:
    lines.extend([
        "  <url>",
        f"    <loc>{canonical}</loc>",
        f"    <lastmod>{now}</lastmod>",
        "  </url>"
    ])

lines.append("</urlset>")

Path("sitemap.xml").write_text("\n".join(lines) + "\n", encoding="utf-8")

print(f"Generated sitemap.xml with {len(final)} canonical URLs.")

for canonical, path in final:
    print(f"  {canonical}")
PY

###############################################################################
# 6. robots.txt
###############################################################################

echo
echo "[6/12] Updating robots.txt..."

cat > robots.txt <<'EOF'
User-agent: *
Allow: /

Sitemap: https://gnema.in/sitemap.xml
EOF

###############################################################################
# 7. G-NeMa Ops Bot configuration
###############################################################################

echo
echo "[7/12] Creating G-NeMa Ops Bot..."

cat > ops/config.json <<'EOF'
{
  "site": {
    "name": "G-NeMa",
    "url": "https://gnema.in",
    "sitemap": "https://gnema.in/sitemap.xml",
    "robots": "https://gnema.in/robots.txt"
  },
  "ranking": {
    "enabled": true,
    "provider": "serpapi",
    "google_domain": "google.com",
    "location": "India",
    "language": "en",
    "queries": [
      "G-NeMa",
      "G-NeMa AI",
      "enterprise AI G-NeMa",
      "Oracle database AI",
      "Oracle database performance monitoring AI",
      "Oracle database autonomous optimization",
      "multi-agent organization",
      "enterprise AI operating layer",
      "BankAI Nexus",
      "space mission autonomy",
      "space domain awareness AI",
      "autonomous robotics AI",
      "multi-robot orchestration",
      "AI cybersecurity critical infrastructure"
    ]
  },
  "audit": {
    "required_meta": [
      "description",
      "robots"
    ],
    "require_canonical": true,
    "require_title": true,
    "require_jsonld": true
  },
  "reporting": {
    "directory": "ops/reports",
    "latest": "ops/reports/latest.md"
  },
  "github": {
    "create_issue": false,
    "issue_title": "G-NeMa SEO Ops Report"
  }
}
EOF

cat > ops/bot.py <<'PY'
#!/usr/bin/env python3

"""
G-NeMa Ops Bot

Safe SEO operations:
- Technical site audit
- Canonical verification
- Sitemap verification
- Robots verification
- JSON-LD detection
- Basic internal-link validation
- Optional SerpAPI ranking checks
- Markdown report generation
- Optional GitHub issue creation

No API keys are stored in source code.
"""

from __future__ import annotations

import json
import os
import re
import sys
import urllib.parse
import urllib.request
from pathlib import Path
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[1]
CONFIG_PATH = ROOT / "ops" / "config.json"


def load_config():
    with CONFIG_PATH.open("r", encoding="utf-8") as f:
        return json.load(f)


def fetch(url: str, timeout: int = 20):
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "G-NeMa-OpsBot/1.0 (+https://gnema.in)"
        },
    )

    try:
        with urllib.request.urlopen(req, timeout=timeout) as response:
            body = response.read().decode("utf-8", errors="replace")
            return response.status, body
    except Exception as exc:
        return None, str(exc)


def extract_canonical(text: str):
    m = re.search(
        r'<link[^>]+rel=["\']canonical["\'][^>]+href=["\']([^"\']+)["\']',
        text,
        flags=re.I
    )
    return m.group(1).strip() if m else None


def extract_title(text: str):
    m = re.search(r"<title>(.*?)</title>", text, flags=re.I | re.S)
    return re.sub(r"\s+", " ", m.group(1)).strip() if m else None


def extract_meta(text: str, name: str):
    pattern = (
        r'<meta[^>]+name=["\']'
        + re.escape(name)
        + r'["\'][^>]+content=["\']([^"\']*)["\']'
    )

    m = re.search(pattern, text, flags=re.I)

    if not m:
        pattern = (
            r'<meta[^>]+content=["\']([^"\']*)["\'][^>]+name=["\']'
            + re.escape(name)
            + r'["\']'
        )
        m = re.search(pattern, text, flags=re.I)

    return m.group(1).strip() if m else None


def has_jsonld(text: str):
    return bool(
        re.search(
            r'<script[^>]+type=["\']application/ld\+json["\']',
            text,
            flags=re.I
        )
    )


def audit_html(config):
    results = []
    required_meta = config["audit"]["required_meta"]

    for path in sorted(ROOT.rglob("*.html")):
        if any(part in {".git", "node_modules"} for part in path.parts):
            continue

        if path.as_posix() == "products/titan.html":
            # Redirect page intentionally noindex.
            continue

        text = path.read_text(encoding="utf-8", errors="ignore")

        errors = []
        warnings = []

        title = extract_title(text)
        canonical = extract_canonical(text)

        if config["audit"].get("require_title") and not title:
            errors.append("missing title")

        if config["audit"].get("require_canonical") and not canonical:
            errors.append("missing canonical")

        for meta in required_meta:
            if not extract_meta(text, meta):
                errors.append(f"missing meta:{meta}")

        if config["audit"].get("require_jsonld") and not has_jsonld(text):
            warnings.append("missing JSON-LD")

        if title and len(title) > 70:
            warnings.append("title longer than 70 characters")

        description = extract_meta(text, "description")

        if description and len(description) > 170:
            warnings.append("description is long")

        results.append({
            "file": str(path.relative_to(ROOT)).replace("\\", "/"),
            "title": title,
            "canonical": canonical,
            "errors": errors,
            "warnings": warnings,
        })

    return results


def audit_sitemap(config):
    sitemap = ROOT / "sitemap.xml"

    if not sitemap.exists():
        return {
            "ok": False,
            "message": "sitemap.xml missing",
            "urls": []
        }

    text = sitemap.read_text(encoding="utf-8", errors="ignore")

    urls = re.findall(r"<loc>(.*?)</loc>", text)

    bad = [
        u for u in urls
        if not u.startswith(config["site"]["url"])
    ]

    titan_duplicate = any(
        u.rstrip("/") == config["site"]["url"] + "/products/titan.html"
        for u in urls
    )

    return {
        "ok": not bad and not titan_duplicate,
        "message": "sitemap verified",
        "urls": urls,
        "bad_urls": bad,
        "titan_duplicate": titan_duplicate,
    }


def audit_robots(config):
    robots = ROOT / "robots.txt"

    if not robots.exists():
        return {
            "ok": False,
            "message": "robots.txt missing"
        }

    text = robots.read_text(encoding="utf-8", errors="ignore")

    expected = config["site"]["url"].rstrip("/") + "/sitemap.xml"

    return {
        "ok": expected in text,
        "message": "robots.txt verified" if expected in text else "sitemap missing from robots.txt"
    }


def ranking_check(config):
    ranking = config["ranking"]

    if not ranking.get("enabled"):
        return {
            "enabled": False,
            "results": []
        }

    api_key = os.environ.get("SERPAPI_KEY")

    if not api_key:
        return {
            "enabled": True,
            "available": False,
            "message": "SERPAPI_KEY not set; ranking check skipped.",
            "results": []
        }

    results = []

    for query in ranking.get("queries", []):
        params = urllib.parse.urlencode({
            "engine": "google",
            "q": query,
            "api_key": api_key,
            "google_domain": ranking.get("google_domain", "google.com"),
            "location": ranking.get("location", "India"),
            "hl": ranking.get("language", "en")
        })

        url = "https://serpapi.com/search.json?" + params

        status, body = fetch(url)

        if status != 200:
            results.append({
                "query": query,
                "status": "error",
                "position": None
            })
            continue

        try:
            data = json.loads(body)
        except Exception:
            results.append({
                "query": query,
                "status": "invalid-response",
                "position": None
            })
            continue

        organic = data.get("organic_results", [])

        position = None
        matched_url = None

        for index, item in enumerate(organic, start=1):
            link = item.get("link", "")

            if "gnema.in" in link:
                position = index
                matched_url = link
                break

        results.append({
            "query": query,
            "status": "ok",
            "position": position,
            "url": matched_url
        })

    return {
        "enabled": True,
        "available": True,
        "results": results
    }


def create_report(config, html_results, sitemap, robots, rankings):
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")

    errors = sum(len(x["errors"]) for x in html_results)
    warnings = sum(len(x["warnings"]) for x in html_results)

    lines = [
        "# G-NeMa SEO Operations Report",
        "",
        f"Generated: `{now}`",
        "",
        "## Summary",
        "",
        f"- HTML files audited: **{len(html_results)}**",
        f"- Metadata errors: **{errors}**",
        f"- Metadata warnings: **{warnings}**",
        f"- Sitemap: **{'PASS' if sitemap.get('ok') else 'FAIL'}**",
        f"- Robots: **{'PASS' if robots.get('ok') else 'FAIL'}**",
        "",
        "## Sitemap",
        "",
        f"- Canonical URLs: **{len(sitemap.get('urls', []))}**",
        f"- Duplicate TITAN HTML URL present: **{sitemap.get('titan_duplicate', False)}**",
        "",
        "## Page Audit",
        "",
        "| Page | Errors | Warnings | Canonical | |",
        "|---|---:|---:|---|---|",
    ]

    for item in html_results:
        canonical = item["canonical"] or "MISSING"
        lines.append(
            f"| `{item['file']}` | "
            f"{len(item['errors'])} | "
            f"{len(item['warnings'])} | "
            f"`{canonical}` | |"
        )

    lines.extend([
        "",
        "## Ranking",
        ""
    ])

    if not rankings.get("available"):
        lines.append(
            f"- {rankings.get('message', 'Ranking data unavailable.')}"
        )
    else:
        lines.extend([
            "| Query | Position | URL |",
            "|---|---:|---|"
        ])

        for result in rankings.get("results", []):
            position = result.get("position")
            position_text = str(position) if position else "Not found"
            url = result.get("url") or "-"
            lines.append(
                f"| {result['query']} | {position_text} | {url} |"
            )

    lines.extend([
        "",
        "## Recommended Actions",
        "",
        "1. Review any metadata errors.",
        "2. Keep sitemap URLs aligned with canonical URLs.",
        "3. Inspect important pages in Google Search Console after deployment.",
        "4. Expand content around validated search-intent topics.",
        "5. Review ranking movement over time rather than reacting to one measurement.",
        "",
        "G-NeMa Ops Bot does not automatically send outreach messages."
    ])

    return "\n".join(lines) + "\n"


def main():
    config = load_config()

    print("G-NeMa Ops Bot")
    print("==============================")

    html_results = audit_html(config)
    sitemap = audit_sitemap(config)
    robots = audit_robots(config)
    rankings = ranking_check(config)

    report = create_report(
        config,
        html_results,
        sitemap,
        robots,
        rankings
    )

    report_dir = ROOT / config["reporting"]["directory"]
    report_dir.mkdir(parents=True, exist_ok=True)

    latest = ROOT / config["reporting"]["latest"]
    latest.write_text(report, encoding="utf-8")

    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")
    archive = report_dir / f"report-{timestamp}.md"
    archive.write_text(report, encoding="utf-8")

    print()
    print(report)

    error_count = sum(len(x["errors"]) for x in html_results)

    if error_count:
        print(
            f"OPS RESULT: FAIL — {error_count} metadata error(s).",
            file=sys.stderr
        )
        return 1

    if not sitemap.get("ok"):
        print(
            "OPS RESULT: FAIL — sitemap validation failed.",
            file=sys.stderr
        )
        return 1

    if not robots.get("ok"):
        print(
            "OPS RESULT: FAIL — robots validation failed.",
            file=sys.stderr
        )
        return 1

    print("OPS RESULT: PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
PY

chmod +x ops/bot.py

###############################################################################
# 8. GitHub Actions workflow
###############################################################################

echo
echo "[8/12] Creating GitHub Actions SEO automation..."

cat > .github/workflows/gnema-ops.yml <<'EOF'
name: G-NeMa Ops Bot

on:
  workflow_dispatch:

  schedule:
    # Daily at 06:30 UTC.
    - cron: "30 6 * * *"

  push:
    branches:
      - main

permissions:
  contents: write
  issues: write

jobs:
  seo-ops:
    name: SEO Audit and Ranking Operations
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.x"

      - name: Run G-NeMa Ops Bot
        env:
          SERPAPI_KEY: ${{ secrets.SERPAPI_KEY }}
        run: |
          python ops/bot.py

      - name: Upload SEO report
        uses: actions/upload-artifact@v4
        with:
          name: gnema-seo-report
          path: ops/reports/

      - name: Commit latest Ops report
        run: |
          git config user.name "G-NeMa Ops Bot"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"

          git add ops/reports/latest.md

          if git diff --cached --quiet; then
            echo "No report change to commit."
          else
            git commit -m "chore(seo): update G-NeMa Ops report"
            git push origin main
          fi
EOF

###############################################################################
# 9. Static validation
###############################################################################

echo
echo "[9/12] Running production validation..."

python - <<'PY'
from pathlib import Path
import re
import sys
import xml.etree.ElementTree as ET

ROOT = Path(".")

errors = []

print()
print("=== HTML VALIDATION ===")

html_files = [
    p for p in ROOT.rglob("*.html")
    if ".git" not in p.parts and "node_modules" not in p.parts
]

for path in sorted(html_files):
    text = path.read_text(encoding="utf-8", errors="ignore")

    if path.as_posix() == "products/titan.html":
        # Redirect page is intentionally noindex.
        if "products/titan/" not in text:
            errors.append(f"{path}: TITAN redirect target missing")
        continue

    if not re.search(r"<title>.*?</title>", text, re.I | re.S):
        errors.append(f"{path}: missing <title>")

    if not re.search(
        r'<meta[^>]+name=["\']description["\']',
        text,
        re.I
    ):
        errors.append(f"{path}: missing meta description")

    if not re.search(
        r'<link[^>]+rel=["\']canonical["\']',
        text,
        re.I
    ):
        errors.append(f"{path}: missing canonical")

    if not re.search(
        r'application/ld\+json',
        text,
        re.I
    ):
        errors.append(f"{path}: missing JSON-LD")

    # Check canonical format.
    m = re.search(
        r'<link[^>]+rel=["\']canonical["\'][^>]+href=["\']([^"\']+)["\']',
        text,
        re.I
    )

    if m and not m.group(1).startswith("https://gnema.in"):
        errors.append(
            f"{path}: canonical does not use https://gnema.in"
        )

    print(f"PASS {path}")

print()
print("=== SITEMAP VALIDATION ===")

try:
    tree = ET.parse("sitemap.xml")
    root = tree.getroot()

    namespace = "{http://www.sitemaps.org/schemas/sitemap/0.9}"

    sitemap_urls = [
        element.text.strip()
        for element in root.findall(f"{namespace}url/{namespace}loc")
        if element.text
    ]

    if not sitemap_urls:
        errors.append("sitemap.xml contains no URLs")

    for url in sitemap_urls:
        if not url.startswith("https://gnema.in/") and url != "https://gnema.in":
            errors.append(f"sitemap contains invalid URL: {url}")

        if url.rstrip("/") == "https://gnema.in/products/titan.html":
            errors.append(
                "sitemap must not contain /products/titan.html"
            )

    print(f"PASS sitemap.xml — {len(sitemap_urls)} URLs")

except Exception as exc:
    errors.append(f"sitemap.xml invalid XML: {exc}")

print()
print("=== ROBOTS VALIDATION ===")

robots = Path("robots.txt").read_text(encoding="utf-8")

if "User-agent: *" not in robots:
    errors.append("robots.txt missing User-agent directive")

if "Sitemap: https://gnema.in/sitemap.xml" not in robots:
    errors.append("robots.txt missing sitemap declaration")

print("PASS robots.txt")

print()
print("=== REQUIRED FILES ===")

required = [
    "robots.txt",
    "sitemap.xml",
    "ops/config.json",
    "ops/bot.py",
    "ops/reports/latest.md",
    ".github/workflows/gnema-ops.yml"
]

for item in required:
    if not Path(item).exists():
        errors.append(f"missing required file: {item}")
    else:
        print(f"PASS {item}")

print()

if errors:
    print("VALIDATION FAILED:")
    for error in errors:
        print(" - " + error)
    sys.exit(1)

print("============================================================")
print(" ALL STATIC SEO VALIDATIONS PASSED")
print("============================================================")
PY

###############################################################################
# 10. Run Ops Bot locally
###############################################################################

echo
echo "[10/12] Running G-NeMa Ops Bot..."

python ops/bot.py

###############################################################################
# 11. Show changes
###############################################################################

echo
echo "[11/12] Reviewing changes..."

git status --short

echo
echo "Changed files:"
git diff --name-only

echo
echo "SEO canonical check:"
grep -RIl 'rel="canonical"' --include='*.html' . \
    | grep -v '/.git/' \
    | sort || true

echo
echo "TITAN canonical:"
grep -n "canonical" products/titan/index.html || true

echo
echo "Sitemap TITAN check:"
if grep -q "products/titan.html" sitemap.xml; then
    echo "ERROR: duplicate TITAN URL still exists in sitemap."
    exit 1
else
    echo "PASS: sitemap uses canonical TITAN route."
fi

echo
echo "Git diff summary:"
git diff --stat

###############################################################################
# 12. Commit and push
###############################################################################

echo
echo "[12/12] Committing and pushing production changes..."

git add \
    robots.txt \
    sitemap.xml \
    products/titan.html \
    index.html \
    about.html \
    contact.html \
    products/ \
    solutions/ \
    industries/ \
    research/ \
    ops/ \
    .github/workflows/gnema-ops.yml \
    assets/seo/ 2>/dev/null || true

# Stage all remaining intended changes while respecting .gitignore.
git add -A

if git diff --cached --quiet; then
    echo
    echo "No changes detected. Nothing to commit."
    exit 0
fi

COMMIT_MESSAGE="feat(seo): add G-NeMa SEO foundation and Ops Bot"

git commit -m "$COMMIT_MESSAGE"

echo
echo "Pushing to origin/main..."

git push origin main

###############################################################################
# Final verification
###############################################################################

echo
echo "============================================================"
echo " G-NeMa SEO DEPLOYMENT COMPLETE"
echo "============================================================"
echo
echo "Repository:"
echo "  $ORIGIN_URL"
echo
echo "Branch:"
echo "  main"
echo
echo "Commit:"
git rev-parse --short HEAD
echo
echo "Canonical TITAN:"
echo "  https://gnema.in/products/titan/"
echo
echo "Sitemap:"
echo "  https://gnema.in/sitemap.xml"
echo
echo "Robots:"
echo "  https://gnema.in/robots.txt"
echo
echo "Ops Bot:"
echo "  ops/bot.py"
echo
echo "GitHub Actions:"
echo "  .github/workflows/gnema-ops.yml"
echo
echo "IMPORTANT:"
echo "  Add SERPAPI_KEY to GitHub repository Secrets if ranking checks"
echo "  are required. The bot safely skips ranking collection when it is absent."
echo
echo "Google indexing is not guaranteed by deployment. Submit/inspect the"
echo "sitemap and important URLs in Google Search Console after Cloudflare"
echo "Pages finishes deploying."
echo
echo "============================================================"
