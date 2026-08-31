# -*- coding: utf-8 -*-
"""Regenerates docs/BRD_V2.pdf from docs/BRD_V2.md.

    pip install markdown
    python3 docs/brd-to-pdf.py && node docs/brd-to-pdf.js

Edit the markdown, re-run both, and the PDF follows. Do not hand-edit the PDF.

Render docs/BRD_V2.md to a print-ready PDF via Chromium.

Markdown -> styled HTML -> Chromium print. Chromium is used rather than
LibreOffice because the estimation worksheet is a 10-column table with blank
cells IT will write into, and Chromium's print engine handles repeating table
headers and page-break avoidance properly.
"""
import io, re, markdown

SRC = '/home/user/Talent-Marketplace/docs/BRD_V2.md'
OUT = '/tmp/brd.html'   # intermediate; the PDF step reads this

md = io.open(SRC, encoding='utf-8').read()

# Strikethrough is not in core python-markdown; the document uses it once.
md = re.sub(r'~~([^~]+)~~', r'<del>\1</del>', md)

# The metadata block under the title is one field per line in the source, but
# markdown would run them into a single paragraph. Hard-break just that block —
# not the whole document, whose blockquotes are hard-wrapped prose.
head, sep, rest = md.partition('\n---\n')
head = re.sub(r'(?<=\S)\n(?=\*\*)', '  \n', head)
md = head + sep + rest

body = markdown.markdown(md, extensions=['tables', 'sane_lists', 'attr_list'])

# Tag the wide worksheet table so it gets its own compact treatment.
ID_CELL = re.compile(r'<tbody>\s*<tr>\s*<td>([A-Z]{1,4}-\d)')
def widen(m):
    tbl = m.group(0)
    cols = tbl.count('</th>')
    cls = f'w{cols}'
    if cols not in (5, 7, 10) and ID_CELL.search(tbl):
        cls += ' idcol'
    return tbl.replace('<table>', f'<table class="{cls}">', 1)
body = re.sub(r'<table>.*?</table>', widen, body, flags=re.S)

CSS = """
@page { size: A4; margin: 15mm 13mm 16mm 13mm; }
* { box-sizing: border-box; }
body { font-family: "Helvetica Neue", Arial, sans-serif; font-size: 9.6pt; line-height: 1.5;
       color: #1F2937; margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }

h1 { font-size: 21pt; font-weight: 700; color: #0F172A; margin: 0 0 2mm; line-height: 1.2;
     letter-spacing: -0.2pt; }
h2 { font-size: 13pt; font-weight: 700; color: #0F172A; margin: 9mm 0 3mm; padding-bottom: 1.6mm;
     border-bottom: 1.6pt solid #C00000; break-after: avoid; }
h3 { font-size: 10.8pt; font-weight: 700; color: #C00000; margin: 6mm 0 2mm; break-after: avoid; }
h1 + p { color: #4B5563; font-size: 9.2pt; line-height: 1.65; }

p { margin: 0 0 2.6mm; }
strong { color: #0F172A; }
hr { border: 0; border-top: 0.5pt solid #E5E7EB; margin: 6mm 0; }

code { font-family: "DejaVu Sans Mono", Menlo, monospace; font-size: 8.4pt;
       background: #F1F5F9; padding: 0.3mm 1mm; border-radius: 1mm; color: #0F172A; }

blockquote { margin: 3mm 0; padding: 2.6mm 3.4mm; background: #F8FAFC;
             border-left: 2.4pt solid #94A3B8; color: #334155; font-size: 9.2pt; }
blockquote p { margin: 0 0 1.6mm; } blockquote p:last-child { margin: 0; }

ul, ol { margin: 0 0 3mm; padding-left: 6mm; }
li { margin-bottom: 1.4mm; }

table { width: 100%; border-collapse: collapse; margin: 3mm 0 5mm; font-size: 8.8pt;
        break-inside: auto; }
thead { display: table-header-group; }
tr { break-inside: avoid; }
th { background: #0F172A; color: #fff; font-weight: 700; text-align: left; padding: 1.7mm 2mm;
     font-size: 8.2pt; letter-spacing: 0.1pt; border: 0.4pt solid #0F172A; }
td { padding: 1.6mm 2mm; border: 0.4pt solid #E2E8F0; vertical-align: top; }
tbody tr:nth-child(even) td { background: #F8FAFC; }

/* The estimation worksheet: narrow marker columns, roomy blank effort columns. */
table.w10 { font-size: 7.6pt; }
table.w10 th, table.w10 td { padding: 1.2mm 1.4mm; }
table.w10 td:nth-child(1) { width: 7%;  font-weight: 700; white-space: nowrap; }
table.w10 td:nth-child(2) { width: 33%; }
table.w10 td:nth-child(3),
table.w10 td:nth-child(4),
table.w10 td:nth-child(5) { width: 4%; text-align: center; }
table.w10 td:nth-child(n+6) { width: 8.5%; background: #FFFDF0; }
table.w10 tbody tr:nth-child(even) td:nth-child(n+6) { background: #FEFCEA; }
/* Workstream separator rows carry an empty first cell. */
table.w10 td:empty + td strong { color: #C00000; }

/* Requirement tables: ID | Requirement | Pri | Δ | BU */
table.w5 { table-layout: fixed; }
table.w5 td:nth-child(1), table.w5 th:nth-child(1) { width: 11%; white-space: nowrap; font-weight: 700; }
table.w5 td:nth-child(2) { width: 63%; }
table.w5 td:nth-child(3), table.w5 th:nth-child(3),
table.w5 td:nth-child(4), table.w5 th:nth-child(4) { width: 5%; text-align: center; }
table.w5 td:nth-child(5), table.w5 th:nth-child(5) { width: 10%; white-space: nowrap; }

/* Integration table: ID | System | Direction | Frequency | Content | Δ | BU */
table.w7 { table-layout: fixed; font-size: 8.2pt; }
table.w7 td:nth-child(1) { width: 8%; white-space: nowrap; font-weight: 700; }
table.w7 td:nth-child(2) { width: 20%; }
table.w7 td:nth-child(3) { width: 11%; }
table.w7 td:nth-child(4) { width: 10%; }
table.w7 td:nth-child(5) { width: 36%; }
table.w7 td:nth-child(6) { width: 5%; text-align: center; }
table.w7 td:nth-child(7) { width: 10%; white-space: nowrap; }

/* Any auto-layout table whose first column holds identifiers: size that column
   to its content so an ID never breaks across two lines. */
table.idcol td:nth-child(1), table.idcol th:nth-child(1) {
  width: 1%; white-space: nowrap; font-weight: 700; }

del { color: #9CA3AF; }

.cover { border-bottom: 2.4pt solid #C00000; padding-bottom: 4mm; margin-bottom: 5mm; }
"""

html = f"""<!doctype html><html><head><meta charset="utf-8">
<title>Growth v2 — Business Requirements Document</title><style>{CSS}</style></head>
<body>{body}</body></html>"""
io.open(OUT, 'w', encoding='utf-8').write(html)
print('html written:', OUT, len(html), 'bytes')
