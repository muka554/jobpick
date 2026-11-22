#!/usr/bin/env python3
"""Rebuild the CV workshop PDFs from the guide's own HTML.

Requires reportlab and beautifulsoup4. Run from the repository root:
  python scripts/build-cv-workshop-print.py
No network, uploads, forms, credentials or user data are used.
PDF streams are uncompressed ASCII for transparent, byte-verifiable publishing.
"""
from pathlib import Path
from html import escape
from io import BytesIO
from bs4 import BeautifulSoup
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, HRFlowable, KeepTogether

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets/worksheets'
OUT.mkdir(parents=True, exist_ok=True)
PAGE = ROOT / 'guides/uae-cv-guide/index.html'
STYLE = {
    'p': ParagraphStyle('Body', fontName='Helvetica', fontSize=11, leading=15, spaceAfter=7),
    'h3': ParagraphStyle('Title', fontName='Helvetica-Bold', fontSize=21, leading=25, spaceAfter=12),
    'h4': ParagraphStyle('Section', fontName='Helvetica-Bold', fontSize=11.5, leading=15, spaceBefore=10, spaceAfter=5),
    'small': ParagraphStyle('Note', fontName='Helvetica', fontSize=9, leading=12, spaceAfter=8, textColor=colors.HexColor('#333333')),
    'li': ParagraphStyle('Bullet', fontName='Helvetica', fontSize=11, leading=15, spaceAfter=6, leftIndent=13, firstLineIndent=0, bulletIndent=0)
}

def inline(node):
    if isinstance(node, str):
        return escape(node)
    if node.name == 'br':
        return '<br/>'
    value = ''.join(inline(child) for child in node.children)
    return '<b>' + value + '</b>' if node.name == 'strong' else value

def flow(node):
    if not getattr(node, 'name', None):
        return []
    if node.name in ('p', 'h3', 'h4', 'li'):
        cls = 'small' if set(node.get('class', [])) & {'practice-label', 'print-kicker'} else node.name
        return [Paragraph(inline(node), STYLE[cls], bulletText='•' if node.name == 'li' else None)]
    if 'write-space' in node.get('class', []):
        height = 130 if 'extra-tall' in node.get('class', []) else 57 if 'tall' in node.get('class', []) else 34
        return [Spacer(1, height), HRFlowable(width='100%', thickness=.5, color=colors.HexColor('#888888')), Spacer(1, 4)]
    content = [item for child in node.children for item in flow(child)]
    return [KeepTogether(content)] if 'write-field' in node.get('class', []) else content

def save(filename, story):
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, leftMargin=40, rightMargin=40,
                            topMargin=35, bottomMargin=35, pageCompression=0,
                            title='JobPick CV application practice', author='JobPick Editorial Team',
                            invariant=1)
    doc.build(story)
    data = buffer.getvalue()
    # Replace the four-byte binary-marker comment only. Its length is unchanged,
    # so all cross-reference offsets remain exact. No binary streams are present.
    lines = data.split(b'\n', 2)
    assert lines[0].startswith(b'%PDF-') and lines[1].startswith(b'%\x93\x8c\x8b\x9e')
    data = data.replace(b'\x93\x8c\x8b\x9e', b'ABCD', 1)
    assert data.isascii() and data.endswith(b'%%EOF\n')
    (OUT / filename).write_bytes(data)
    print(OUT / filename)

soup = BeautifulSoup(PAGE.read_text(), 'html.parser')
save('jobpick-fictional-cv.pdf', flow(soup.select_one('#worked-cv')))
story = []
for index, sheet in enumerate(soup.select('#blank-print .worksheet-sheet')):
    if index:
        story.append(PageBreak())
    story.extend(flow(sheet))
save('jobpick-cv-application-workbook.pdf', story)
