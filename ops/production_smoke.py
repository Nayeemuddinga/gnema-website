#!/usr/bin/env python3
"""Production smoke tests for the public G-NeMa deployment."""
from __future__ import annotations

import re
import sys
import time
import urllib.request
from urllib.error import HTTPError, URLError

BASE = "https://gnema.in"
PAGES = ["/", "/architecture/", "/products/", "/solutions/", "/industries/", "/research/", "/about.html", "/contact.html", "/pricing.html", "/privacy.html", "/terms.html", "/assessment/titan.html", "/404.html"]
REPORTED_HEADERS = [
    "X-GNeMa-Worker",
    "X-GNeMa-Diag-A",
    "X-GNeMa-Diag-B",
    "X-GNeMa-Diag-C",
    "X-Content-Type-Options",
    "X-Frame-Options",
    "Referrer-Policy",
    "Permissions-Policy",
    "Strict-Transport-Security",
    "Content-Security-Policy",
]
REQUIRED_HEADERS = ["X-Content-Type-Options", "X-Frame-Options", "Referrer-Policy", "Permissions-Policy", "Strict-Transport-Security", "Content-Security-Policy"]


def fetch(path: str):
    # A nonce prevents the smoke test from repeatedly validating one stale cached
    # representation while Cloudflare propagates a newly deployed Worker version.
    nonce = str(time.time_ns())
    url = f"{BASE}{path}{'&' if '?' in path else '?'}gnema_smoke={nonce}"
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "G-NeMa-Production-Smoke/1.1",
            "Cache-Control": "no-cache",
            "Pragma": "no-cache",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as response:
            return response.status, dict(response.headers), response.read().decode("utf-8", errors="replace")
    except HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        return exc.code, dict(exc.headers), body
    except (URLError, TimeoutError) as exc:
        return None, {}, str(exc)


def report_headers(path: str, headers: dict[str, str]) -> None:
    print(f"{path}: response headers under diagnostic/security inspection:")
    for name in REPORTED_HEADERS:
        print(f"{path}: {name}={headers.get(name)!r}")


def valid_response(path: str, status: int | None, headers: dict[str, str], body: str) -> list[str]:
    failures = []
    if status != 200:
        failures.append(f"{path}: expected HTTP 200, got {status}")
        return failures
    if path != "/404.html":
        if not re.search(r"<title\b[^>]*>.*?</title>", body, re.I | re.S):
            failures.append(f"{path}: missing title")
        canonical = re.search(r'<link\b[^>]*rel=[\"\']canonical[\"\'][^>]*href=[\"\']([^\"\']+)', body, re.I | re.S)
        if not canonical or not canonical.group(1).startswith(BASE + "/"):
            failures.append(f"{path}: missing/invalid canonical")
    worker_header = headers.get("X-GNeMa-Worker")
    if worker_header != "active":
        failures.append(f"{path}: static security header marker is not active (got {worker_header!r})")
    for name in REQUIRED_HEADERS:
        if name not in headers:
            failures.append(f"{path}: missing response header {name}")
    if path == "/" and "G-NeMa" not in body:
        failures.append("/: homepage content marker missing")
    if path == "/architecture/" and "The Architecture" not in body:
        failures.append("/architecture/: architecture content marker missing")
    return failures


def main() -> int:
    failures = []
    for path in PAGES:
        last_status = None
        last_headers: dict[str, str] = {}
        last_body = ""
        last_failures: list[str] = []
        # Cloudflare edge propagation can briefly differ immediately after a Worker
        # version upload. Retry the public endpoint instead of failing the deployment
        # on the first edge response.
        for attempt in range(1, 7):
            status, headers, body = fetch(path)
            last_status, last_headers, last_body = status, headers, body
            last_failures = valid_response(path, status, headers, body)
            if not any("static security header marker" in f or "missing response header" in f for f in last_failures):
                break
            if attempt < 6:
                print(f"{path}: security headers not yet visible; retry {attempt + 1}/6")
                time.sleep(5)
        print(f"{path}: HTTP status={last_status}")
        report_headers(path, last_headers)
        failures.extend(last_failures)

    if failures:
        print("PRODUCTION SMOKE: FAIL")
        for failure in failures:
            print("ERROR:", failure)
        return 1
    print(f"PRODUCTION SMOKE: PASS — {len(PAGES)} public endpoints and static security header policy verified.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
