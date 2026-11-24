#!/bin/sh
# Render C200.md + C200-Lampiran.md into DOCX and PDF for submission.
# Run from the repo root: sh c200/export.sh
# ref-c200.docx carries the typography (A4, 2 cm margins, Times New Roman 10 pt,
# tables 8 pt). Do not swap it without re-measuring the page count.
set -e
pandoc C200.md --reference-doc=c200/ref-c200.docx -o C200.docx
pandoc C200-Lampiran.md --reference-doc=c200/ref-c200.docx -o C200-Lampiran.docx
soffice --headless --convert-to pdf --outdir . C200.docx C200-Lampiran.docx
echo "C200.docx, C200.pdf, C200-Lampiran.docx, C200-Lampiran.pdf written."
echo "Check the page count of C200.docx and fill 'Jumlah Halaman' in the front matter."
