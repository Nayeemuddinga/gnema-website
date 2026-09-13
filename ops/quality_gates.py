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
        self.robots = None
        self.canonical = None
        self.jsonld = 0
        self.ids = []
        self.links = []
        self.resources = []
        self.in_title = False
        self.doctype = False
    def handle_decl(self, decl):
        if decl.strip().lower() == 'doctype html': self.doctype = True
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        tag = tag.lower()
        if tag == 'title': self.in_title = True
        if tag == 'h1': self.h1 += 1
        if tag == 'meta' and a.get('name','').lower() == 'description': self.description = a.get('content','')
        if tag == 'meta' and a.get('name','').lower() == 'robots': self.robots = a.get('content','')
        if tag == 'link' and a.get('rel','').lower() == 'canonical': self.canonical = a.get('href','')
        if tag == 'script' and a.get('type','').lower() == 'application/ld+json': self.jsonld += 1
        if a.get('id'): self.ids.append(a['id'])
        if tag == 'a' and a.get('href'): self.links.append(a['href'])
        if tag == 'script' and a.get('src'): self.resources.append(a['src'])
        if tag == 'img' and a.get('src'): self.resources.append(a['src'])
        if tag == 'link' and a.get('href') and a.get('rel','').lower() in {'stylesheet','icon','apple-touch-icon','manifest'}: self.resources.append(a['href'])
    def handle_endtag(self, tag):
        if tag.lower() == 'title': self.in_title = False
    def handle_data(self, data):
        if self.in_title: self.title += data

def clean_target(href: str) -> str:
    return href.split('#',1)[0].split('?',1)[0]

def resolve_local(path: Path, target: str) -> Path:
    if target.startswith('/'):
        return (ROOT / target.lstrip('/')).resolve()
    return (path.parent / target).resolve()

def is_local(href: str) -> bool:
    return not href.startswith(('http://','https://','//','mailto:','tel:','#','javascript:','data:'))

def check_target(rel: str, path: Path, href: str, errors: list[str], kind: str = 'link') -> None:
    target = clean_target(href)
    if not target or not is_local(href): return
    target_path = resolve_local(path, target)
    try: target_path.relative_to(ROOT)
    except ValueError:
        errors.append(f'{rel}: {kind} escapes site root: {href}'); return
    if target_path.is_dir(): target_path /= 'index.html'
    if not target_path.exists(): errors.append(f'{rel}: broken local {kind}: {href}')

def main() -> int:
    errors: list[str] = []
    warnings: list[str] = []
    for path in HTML_FILES:
        if any(part in IGNORED for part in path.parts): continue
        p = Parser(); rel = path.relative_to(ROOT).as_posix()
        try: p.feed(path.read_text(encoding='utf-8'))
        except Exception as exc:
            errors.append(f'{rel}: invalid HTML encoding/parser error: {exc}'); continue
        if not p.doctype: errors.append(f'{rel}: missing <!doctype html>')
        title = p.title.strip()
        if not title: errors.append(f'{rel}: missing title')
        elif not 10 <= len(title) <= 70: errors.append(f'{rel}: title length {len(title)} outside 10-70')
        if not p.description: errors.append(f'{rel}: missing meta description')
        elif len(p.description) > 170: warnings.append(f'{rel}: description is long ({len(p.description)} chars)')
        if not p.robots: errors.append(f'{rel}: missing meta robots')
        if not p.canonical: errors.append(f'{rel}: missing canonical')
        elif not re.fullmatch(r'https://gnema\.in(?:/.*)?', p.canonical): errors.append(f'{rel}: canonical is not on https://gnema.in/: {p.canonical}')
        if p.h1 != 1: errors.append(f'{rel}: expected exactly one H1, found {p.h1}')
        if not p.jsonld and rel not in {'thank-you.html','404.html'}: warnings.append(f'{rel}: missing JSON-LD')
        seen_ids = set()
        for item in p.ids:
            if item in seen_ids: errors.append(f'{rel}: duplicate HTML id: {item}')
            seen_ids.add(item)
        for href in p.links: check_target(rel, path, href, errors, 'link')
        for src in p.resources: check_target(rel, path, src, errors, 'resource')

    required_files = [ROOT/'sitemap.xml', ROOT/'robots.txt', ROOT/'_headers']
    for required_file in required_files:
        if not required_file.exists(): errors.append(f'{required_file.relative_to(ROOT)}: required file missing')
    if (ROOT/'sitemap.xml').exists():
        sitemap = (ROOT/'sitemap.xml').read_text(encoding='utf-8')
        if 'https://gnema.in/' not in sitemap: errors.append('sitemap.xml: homepage missing')
        if re.search(r'<loc>[^<]+</loc>\s*<lastmod>[^<]*</lastmod>', sitemap) is None: warnings.append('sitemap.xml: verify lastmod format and freshness')
    if (ROOT/'robots.txt').exists():
        robots = (ROOT/'robots.txt').read_text(encoding='utf-8')
        if 'Sitemap: https://gnema.in/sitemap.xml' not in robots: errors.append('robots.txt: canonical Sitemap directive missing')
    if (ROOT/'_headers').exists():
        headers = (ROOT/'_headers').read_text(encoding='utf-8')
        required = ('X-Content-Type-Options:', 'X-Frame-Options:', 'Referrer-Policy:', 'Permissions-Policy:', 'Strict-Transport-Security:', 'Content-Security-Policy:')
        for name in required:
            if name not in headers: errors.append(f'_headers: missing {name}')

    print(f'Quality gates: {len(HTML_FILES)} HTML files; {len(errors)} errors; {len(warnings)} warnings.')
    for item in warnings: print('WARNING:', item)
    for item in errors: print('ERROR:', item)
    return 1 if errors else 0

if __name__ == '__main__': raise SystemExit(main())
