#!/usr/bin/env python3
"""G-NeMa technical SEO operations and release-safe site audit."""
from __future__ import annotations

import html
import json
import os
import re
import sys
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONFIG_PATH = ROOT / "ops" / "config.json"


def load_config():
    with CONFIG_PATH.open("r", encoding="utf-8") as f:
        return json.load(f)


def fetch(url: str, timeout: int = 20):
    req = urllib.request.Request(url, headers={"User-Agent": "G-NeMa-OpsBot/2.0 (+https://gnema.in)"})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as response:
            return response.status, response.read().decode("utf-8", errors="replace")
    except Exception as exc:
        return None, str(exc)


def extract_tag_attrs(tag: str):
    attrs = {}
    for match in re.finditer(r"([:\w-]+)\s*=\s*([\"'])(.*?)\2", tag, flags=re.I | re.S):
        attrs[match.group(1).lower()] = html.unescape(match.group(3)).strip()
    return attrs


def extract_canonical(text: str):
    for tag in re.findall(r"<link\b[^>]*>", text, flags=re.I | re.S):
        attrs = extract_tag_attrs(tag)
        if attrs.get("rel", "").lower() == "canonical" and attrs.get("href"):
            return attrs["href"]
    return None


def extract_title(text: str):
    m = re.search(r"<title\b[^>]*>(.*?)</title>", text, flags=re.I | re.S)
    return re.sub(r"\s+", " ", html.unescape(m.group(1))).strip() if m else None


def extract_meta(text: str, name: str):
    wanted = name.lower()
    for tag in re.findall(r"<meta\b[^>]*>", text, flags=re.I | re.S):
        attrs = extract_tag_attrs(tag)
        if attrs.get("name", "").lower() == wanted and attrs.get("content"):
            return attrs["content"]
    return None


def has_jsonld(text: str):
    return bool(re.search(r'<script\b[^>]+type=["\']application/ld\+json["\']', text, flags=re.I))


def audit_html(config):
    results = []
    required_meta = config["audit"]["required_meta"]
    excluded_pages = {"404.html", "products/titan.html"}
    for path in sorted(ROOT.rglob("*.html")):
        if any(part in {".git", "node_modules"} for part in path.parts):
            continue
        relative_path = str(path.relative_to(ROOT)).replace("\\", "/")
        if relative_path in excluded_pages:
            continue
        text = path.read_text(encoding="utf-8", errors="ignore")
        errors, warnings = [], []
        title, canonical = extract_title(text), extract_canonical(text)
        if config["audit"].get("require_title") and not title: errors.append("missing title")
        if config["audit"].get("require_canonical") and not canonical: errors.append("missing canonical")
        for meta in required_meta:
            if not extract_meta(text, meta): errors.append(f"missing meta:{meta}")
        if config["audit"].get("require_jsonld") and not has_jsonld(text): warnings.append("missing JSON-LD")
        if title and len(title) > 70: warnings.append(f"title longer than 70 characters ({len(title)} characters)")
        description = extract_meta(text, "description")
        if description and len(description) > 170: warnings.append(f"description is long ({len(description)} characters)")
        results.append({"file": relative_path, "title": title, "canonical": canonical, "errors": errors, "warnings": warnings})
    return results


def audit_sitemap(config):
    sitemap = ROOT / "sitemap.xml"
    if not sitemap.exists(): return {"ok": False, "message": "sitemap.xml missing", "urls": []}
    text = sitemap.read_text(encoding="utf-8", errors="ignore")
    urls = re.findall(r"<loc>(.*?)</loc>", text)
    bad = [u for u in urls if not u.startswith(config["site"]["url"])]
    titan_duplicate = any(u.rstrip("/") == config["site"]["url"] + "/products/titan.html" for u in urls)
    return {"ok": not bad and not titan_duplicate, "message": "sitemap verified", "urls": urls, "bad_urls": bad, "titan_duplicate": titan_duplicate}


def audit_robots(config):
    robots = ROOT / "robots.txt"
    if not robots.exists(): return {"ok": False, "message": "robots.txt missing"}
    text = robots.read_text(encoding="utf-8", errors="ignore")
    expected = config["site"]["url"].rstrip("/") + "/sitemap.xml"
    return {"ok": expected in text, "message": "robots.txt verified" if expected in text else "sitemap missing from robots.txt"}


def ranking_check(config):
    ranking = config["ranking"]
    if not ranking.get("enabled"): return {"enabled": False, "results": []}
    api_key = os.environ.get("SERPAPI_KEY")
    if not api_key: return {"enabled": True, "available": False, "message": "SERPAPI_KEY not set; ranking check skipped.", "results": []}
    results = []
    for query in ranking.get("queries", []):
        params = urllib.parse.urlencode({"engine":"google","q":query,"api_key":api_key,"google_domain":ranking.get("google_domain","google.com"),"location":ranking.get("location","India"),"hl":ranking.get("language","en")})
        status, body = fetch("https://serpapi.com/search.json?" + params)
        if status != 200:
            results.append({"query":query,"status":"error","position":None}); continue
        try: data = json.loads(body)
        except Exception:
            results.append({"query":query,"status":"invalid-response","position":None}); continue
        position = matched_url = None
        for index, item in enumerate(data.get("organic_results", []), start=1):
            link = item.get("link", "")
            if "gnema.in" in link: position, matched_url = index, link; break
        results.append({"query":query,"status":"ok","position":position,"url":matched_url})
    return {"enabled":True,"available":True,"results":results}


def create_report(config, html_results, sitemap, robots, rankings):
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    errors = sum(len(x["errors"]) for x in html_results); warnings = sum(len(x["warnings"]) for x in html_results)
    lines = ["# G-NeMa SEO Operations Report","",f"Generated: `{now}`","","## Summary","",f"- HTML files audited: **{len(html_results)}**",f"- Metadata errors: **{errors}**",f"- Metadata warnings: **{warnings}**",f"- Sitemap: **{'PASS' if sitemap.get('ok') else 'FAIL'}**",f"- Robots: **{'PASS' if robots.get('ok') else 'FAIL'}**","","## Sitemap","",f"- Canonical URLs: **{len(sitemap.get('urls', []))}**",f"- Duplicate TITAN HTML URL present: **{sitemap.get('titan_duplicate', False)}**","","## Page Audit","","| Page | Errors | Warnings | Canonical |","|---|---:|---:|---|"]
    for item in html_results:
        lines.append(f"| `{item['file']}` | {len(item['errors'])} | {len(item['warnings'])} | `{item['canonical'] or 'MISSING'}` |")
        for error in item["errors"]: lines.append(f"| ↳ Error | {error} | | |")
        for warning in item["warnings"]: lines.append(f"| ↳ Warning | | {warning} | |")
    lines += ["","## Ranking",""]
    if not rankings.get("available"):
        lines.append(f"- {rankings.get('message', 'Ranking data unavailable.')}")
    else:
        lines += ["| Query | Position | URL |","|---|---:|---|"]
        for result in rankings.get("results", []): lines.append(f"| {result['query']} | {result.get('position') or 'Not found'} | {result.get('url') or '-'} |")
    lines += ["","## Recommended Actions","","1. Review metadata errors and warnings.","2. Keep sitemap URLs aligned with canonical URLs.","3. Inspect important pages in Google Search Console after deployment.","4. Expand content around validated search-intent topics.","5. Review ranking movement over time rather than reacting to one measurement.","","G-NeMa Ops Bot does not automatically send outreach messages."]
    return "\n".join(lines) + "\n"


def main():
    config = load_config(); html_results = audit_html(config); sitemap = audit_sitemap(config); robots = audit_robots(config); rankings = ranking_check(config)
    report = create_report(config, html_results, sitemap, robots, rankings)
    report_dir = ROOT / config["reporting"]["directory"]; report_dir.mkdir(parents=True, exist_ok=True)
    (ROOT / config["reporting"]["latest"]).write_text(report, encoding="utf-8")
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")
    (report_dir / f"report-{timestamp}.md").write_text(report, encoding="utf-8")
    print(report)
    if any(len(x["errors"]) for x in html_results): print("OPS RESULT: FAIL — metadata errors.", file=sys.stderr); return 1
    if not sitemap.get("ok"): print("OPS RESULT: FAIL — sitemap validation failed.", file=sys.stderr); return 1
    if not robots.get("ok"): print("OPS RESULT: FAIL — robots validation failed.", file=sys.stderr); return 1
    print("OPS RESULT: PASS"); return 0

if __name__ == "__main__": raise SystemExit(main())
