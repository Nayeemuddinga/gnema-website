#!/usr/bin/env python3
"""Fetch Google Search Console Search Analytics and write a compact authority report.

Authentication is intentionally supplied through GitHub Actions secrets:
- GSC_CLIENT_ID
- GSC_CLIENT_SECRET
- GSC_REFRESH_TOKEN

The refresh token must have Search Console read access for sc-domain:gnema.in.
"""
from __future__ import annotations
import json, os, urllib.parse, urllib.request
from datetime import datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SITE = "sc-domain:gnema.in"
REPORT = ROOT / "ops" / "reports" / "search-console.md"


def request(url, data=None, headers=None):
    req = urllib.request.Request(url, data=data, headers=headers or {})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read().decode())


def token():
    data = urllib.parse.urlencode({
        "client_id": os.environ["GSC_CLIENT_ID"],
        "client_secret": os.environ["GSC_CLIENT_SECRET"],
        "refresh_token": os.environ["GSC_REFRESH_TOKEN"],
        "grant_type": "refresh_token",
    }).encode()
    return request("https://oauth2.googleapis.com/token", data=data).get("access_token")


def analytics(access_token, start, end):
    url = "https://searchconsole.googleapis.com/webmasters/v3/sites/" + urllib.parse.quote(SITE, safe="") + "/searchAnalytics/query"
    payload = json.dumps({
        "startDate": start,
        "endDate": end,
        "dimensions": ["query", "page"],
        "rowLimit": 250,
        "type": "web",
    }).encode()
    return request(url, data=payload, headers={
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
    }).get("rows", [])


def main():
    required = ["GSC_CLIENT_ID", "GSC_CLIENT_SECRET", "GSC_REFRESH_TOKEN"]
    missing = [x for x in required if not os.environ.get(x)]
    if missing:
        print("Search Console tracker skipped; missing secrets: " + ", ".join(missing))
        return 0

    today = datetime.now(timezone.utc).date()
    end = today - timedelta(days=3)  # GSC data has a reporting delay.
    start = end - timedelta(days=27)
    rows = analytics(token(), start.isoformat(), end.isoformat())

    top = sorted(rows, key=lambda r: r.get("impressions", 0), reverse=True)[:50]
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    lines = [
        "# G-NeMa Search Console Authority Report", "",
        f"Period: `{start}` → `{end}`", "",
        f"Rows returned: **{len(rows)}**", "",
        "## Top query/page opportunities", "",
        "| Query | Page | Clicks | Impressions | CTR | Position |",
        "|---|---|---:|---:|---:|---:|",
    ]
    for r in top:
        keys = r.get("keys", ["-", "-"])
        lines.append(f"| {keys[0]} | {keys[1]} | {r.get('clicks',0):.0f} | {r.get('impressions',0):.0f} | {r.get('ctr',0)*100:.2f}% | {r.get('position',0):.1f} |")
    lines += ["", "## Interpretation rules", "", "- Prioritize pages around positions 5–20 with rising impressions.", "- Investigate high-impression/low-CTR query/page pairs for title and snippet alignment.", "- Use newly discovered query language to expand or create Insights content.", "- Review multiple pages sharing the same query for possible cannibalization.", ""]
    REPORT.write_text("\n".join(lines), encoding="utf-8")
    print(REPORT)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
