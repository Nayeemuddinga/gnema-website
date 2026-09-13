#!/usr/bin/env python3
"""Production smoke tests for the public G-NeMa deployment."""
from __future__ import annotations

import re
import sys
import urllib.request
from urllib.error import HTTPError, URLError

BASE = "https://gnema.in"
PAGES = ["/", "/architecture/", "/products/", "/solutions/", "/industries/", "/research/", "/about.html", "/contact.html", "/pricing.html", "/privacy.html", "/terms.html", "/assessment/titan.html", "/404.html"]
REPORTED_HEADERS = [
    "X-GNeMa-Worker",
    "X-Content-Type-Options",
    "X-Frame-Options",
    "Referrer-Policy",
    "Permissions-Policy",
    "Strict-Transport-Security",
    "Content-Security-Policy",
]


def fetch(path: str):
    req = urllib.request.Request(BASE + path, headers={"User-Agent": "G-NeMa-Production-Smoke/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=20) as response:
            return response.status, dict(response.headers), response.read().decode("utf-8", errors="replace")
    except HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        return exc.code, dict(exc.headers), body
    except (URLError, TimeoutError) as exc:
        return None, {}, str(exc)


def main() -> int:
    failures = []
    for path in PAGES:
        status, headers, body = fetch(path)
        print(f"{path}: HTTP status={status}")
        print(f"{path}: response security headers:")
        for name in REPORTED_HEADERS:
            print(f"{path}: {name}={headers.get(name)!r}")
        if status != 200:
            failures.append(f"{path}: expected HTTP 200, got {status}")
            continue
        if path != "/404.html":
            if not re.search(r"<title\b[^>]*>.*?</title>", body, re.I | re.S):
                failures.append(f"{path}: missing title")
            canonical = re.search(r'<link\b[^>]*rel=[\"\']canonical[\"\'][^>]*href=[\"\']([^\"\']+)', body, re.I | re.S)
            if not canonical or not canonical.group(1).startswith(BASE + "/"):
                failures.append(f"{path}: missing/invalid canonical")
        worker_header = headers.get("X-GNeMa-Worker")
        if worker_header != "active":
            failures.append(f"{path}: Worker diagnostic header is not active (got {worker_header!r})")
        required_headers = ["X-Content-Type-Options", "X-Frame-Options", "Referrer-Policy", "Permissions-Policy", "Strict-Transport-Security"]
        for name in required_headers:
            if name not in headers:
                failures.append(f"{path}: missing response header {name}")
        if path == "/" and "G-NeMa" not in body:
            failures.append("/: homepage content marker missing")
        if path == "/architecture/" and "The Architecture" not in body:
            failures.append("/architecture/: architecture content marker missing")
    if failures:
        print("PRODUCTION SMOKE: FAIL")
        for failure in failures:
            print("ERROR:", failure)
        return 1
    print(f"PRODUCTION SMOKE: PASS — {len(PAGES)} public endpoints verified with Worker execution.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
