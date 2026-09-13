#!/usr/bin/env python3
"""Deterministic quality gates for the static G-NeMa site."""
from __future__ import annotations
import re
from pathlib import Path
from html.parser import HTMLParser

ROOT = Path(__file__).resolve().parents[1]
HTML_FILES = sorted(ROOT.rglob('*.html'))
IGNORED = {'.git', 'node_modules'}

class Parser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.title = ''
        self.h1 = 0
        self.description = None
        self.canonical = None
        self.jsonld = 0
        self.ids = []
        self.links = []
        self.in_title = False
        self.doctype = False
    def handle_decl(self, decl):
        if decl.lower().startswith('doctype html'):
            self.doctype = True
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'title': self.in_title = True
        if tag == 'h1': self.h1 += 1
        if tag == 'meta' and a.get('name','').lower() == 'description': self.description = a.get('content','')
        if tag == 'link' and a.get('rel','').lower() == 'canonical': self.canonical = a.get('href','')
        if tag == 'script' and a.get('type') == 'application/ld+json': self.jsonld += 1
        if 'id' in a and a['id']: self.ids.append(a['id'])
        if tag == 'a' and a.get('href'): self.links.append(a['href'])
    def handle_endtag(self, tag):
        if tag == 'title': self.in_title = False
    def handle_data(self, data):
        if self.in_title: self.title += data

def clean_target(href: str) -> str:
    return href.split('#',1)[0].split('?',1)[0]

def main() -> int:
    errors = []
    warnings = []
    root = ROOT.resolve()
    for path in HTML_FILES:
        if any(part in IGNORED for part in path.parts): continue
        p = Parser()
        try: p.feed(path.read_text(encoding='utf-8'))
        except Exception as exc:
            errors.append(f'{path}: invalid HTML encoding/parser error: {exc}')
            continue
        rel = path.relative_to(ROOT).as_posix()
        if not p.doctype: errors.append(f'{rel}: missing <!doctype html>')
        if not p.title.strip(): errors.append(f'{rel}: missing title')
        if not (10 <= len(p.title.strip()) <= 70): errors.append(f'{rel}: title length {len(p.title.strip())} outside 10-70')
        if not p.description: errors.append(f'{rel}: missing meta description')
        elif len(p.description) > 170: warnings.append(f'{rel}: description is long ({len(p.description)} chars)')
        if not p.canonical: errors.append(f'{rel}: missing canonical')
        elif not p.canonical.startswith('https://gnema.in/'): errors.append(f'{rel}: canonical is not on https://gnema.in/: {p.canonical}')
        if p.h1 != 1: errors.append(f'{rel}: expected exactly one H1, found {p.h1}')
        if not p.jsonld and rel not in {'thank-you.html'}: warnings.append(f'{rel}: missing JSON-LD')
        seen_ids = set()
        for item in p.ids:
            if item in seen_ids:
                errors.append(f'{rel}: duplicate HTML id: {item}')
            seen_ids.add(item)
        for href in p.links:
            if href.startswith(('http://','https://','//','mailto:','tel:','#','javascript:')): continue
            target = clean_target(href)
            if not target: continue
            if target.startswith('/'):
                target_path = (root / target.lstrip('/')).resolve()
            else:
                target_path = (path.parent / target).resolve()
            try: target_path.relative_to(root)
            except ValueError:
                errors.append(f'{rel}: link escapes site root: {href}'); continue
            if target_path.is_dir(): target_path = target_path / 'index.html'
            if not target_path.exists(): errors.append(f'{rel}: broken local link: {href}')
    sitemap_path = ROOT / 'sitemap.xml'
    robots_path = ROOT / 'robots.txt'
    headers_path = ROOT / '_headers'
    for required_file in (sitemap_path, robots_path, headers_path):
        if not required_file.exists(): errors.append(f'{required_file.relative_to(ROOT)}: required file missing')
    if sitemap_path.exists():
        sitemap = sitemap_path.read_text(encoding='utf-8')
        if 'https://gnema.in/' not in sitemap: errors.append('sitemap.xml: homepage missing')
    if robots_path.exists():
        robots = robots_path.read_text(encoding='utf-8')
        if 'Sitemap:' not in robots: errors.append('robots.txt: Sitemap directive missing')
    if headers_path.exists():
        headers = headers_path.read_text(encoding='utf-8')
        for required in ('X-Content-Type-Options:', 'X-Frame-Options:', 'Referrer-Policy:', 'Permissions-Policy:', 'Strict-Transport-Security:'):
            if required not in headers: errors.append(f'_headers: missing {required}')
    print(f'Quality gates: {len(HTML_FILES)} HTML files; {len(errors)} errors; {len(warnings)} warnings.')
    for item in warnings: print('WARNING:', item)
    for item in errors: print('ERROR:', item)
    return 1 if errors else 0

if __name__ == '__main__':
    raise SystemExit(main())
