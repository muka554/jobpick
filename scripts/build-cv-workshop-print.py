#!/usr/bin/env python3
"""Rebuild the two CV workshop PDFs from the guide's own HTML.

Requires Python Playwright and its Chromium browser. Run from the repository root:
  python scripts/build-cv-workshop-print.py
No network, uploads, forms, credentials or user data are used.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets/worksheets'
OUT.mkdir(parents=True, exist_ok=True)
PAGE = ROOT / 'guides/uae-cv-guide/index.html'
CSS = '''
@page { size: A4; margin: 14mm; }
* { box-sizing: border-box; }
body { font: 11pt/1.4 Arial, sans-serif; color: #111; margin: 0; }
h3 { font-size: 21pt; line-height: 1.15; margin: 8pt 0 10pt; }
h4 { font-size: 11.5pt; margin: 13pt 0 4pt; }
p { margin: 5pt 0 8pt; }
ul { margin: 5pt 0 10pt; padding-left: 17pt; }
li { margin: 5pt 0; }
.practice-label, .print-kicker { font-size: 9pt; line-height: 1.35; color: #333; }
.practice-label { border-top: 1px solid #777; padding-top: 7pt; }
.worksheet-sheet { break-after: page; }
.worksheet-sheet:last-child { break-after: auto; }
.write-field { break-inside: avoid; }
.write-field h4 { margin-top: 10pt; }
.write-field p { font-size: 10pt; margin-bottom: 0; }
.write-space { height: 37pt; border-bottom: .6pt solid #999; }
.write-space.tall { height: 62pt; }
.write-space.extra-tall { height: 145pt; }
'''
with sync_playwright() as p:
    browser = p.chromium.launch(args=['--no-sandbox'])
    page = browser.new_page()
    page.route('**/*', lambda route: route.abort())
    # Inert parse only: remove the source page's scripts before extracting sections.
    import re
    html = re.sub(r'<script\b[\s\S]*?</script>', '', PAGE.read_text(), flags=re.I)
    page.set_content(html)
    sections = {
        'jobpick-fictional-cv.pdf': page.locator('#worked-cv').evaluate('(e) => e.outerHTML'),
        'jobpick-cv-application-workbook.pdf': page.locator('#blank-print').evaluate('(e) => e.innerHTML')
    }
    for filename, body in sections.items():
        page.set_content('<!doctype html><html lang="en"><head><meta charset="utf-8"><title>JobPick application practice</title><style>' + CSS + '</style></head><body>' + body + '</body></html>')
        page.pdf(path=str(OUT / filename), prefer_css_page_size=True, print_background=False, tagged=True, outline=True)
        print(OUT / filename)
    browser.close()
