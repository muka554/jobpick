# Local CV document import

PDF uses the existing owned-worker PDF.js reader and its 8 MB / 30 page / 150,000 character / 25 second bounds. DOCX reads only standard document, header/footer and foot/endnote XML parts. ZIP validation rejects encrypted, macro-bearing, duplicate, multi-disk, ZIP64, invalid CRC and unsafe-path entries. Only stored and raw-deflate text parts are supported. It limits the archive to 8 MB / 400 entries, each XML part to 2 MB and total selected XML to 4 MB. Streaming decompression has a byte cap and 15 second deadline. XML DTD/entity declarations are rejected. Text only is read; no relationship, image, field code, hyperlink target, macro or embedded object is executed or fetched. Deleted text is omitted. No new library or service.

Contact fields need explicit English/Arabic labels, or a standalone email/phone/URL in the header. The first name-like line may be suggested as a name, with a warning. Recognized English/Arabic sections are mapped to the editor. Explicit title | organisation pairs and clear date ranges are split; uncertain work/education stays verbatim in entry detail fields, not guessed affiliations. Unsorted material is retained in an editable Other imported details section and exported. Oversized fields fail mapping rather than silently truncate facts. No job-advert evidence is imported.

Text extraction is not complete document conversion. Scans need device OCR then pasted text. Columns and unusual/Arabic reading orders can need repair in the visible extracted-text editor. Graphics, photos, layout, comments and tracked deletions are not imported. The page says so before use. The source file is never persisted; extracted text stays only in page memory until cleared or the page closes. The chosen mapped draft uses the existing opt-in browser saving behavior. Original source text is not placed in the draft or exported as hidden metadata.

The review panel does not change the draft. Use these details asks before replacing any current content. Users can edit every field, change designs and use existing Word, PDF/print, text and JSON-draft output. Original extracted text remains available in the import panel until cleared.

## Checks

- `node tests/site-regression.mjs`, `npm run test:security`.
- `CV_STUDIO_QA_PACKAGES=/path/to/qa/package.json CV_STUDIO_QA_OUTPUT=/tmp/import-qa node tests/cv-import-browser.mjs` with Playwright and axe installed outside production.
- Browser checks on 1440/390 widths in both themes: local PDF and DOCX, review/apply, editable fields, design switch, JSON export, Arabic RTL, cancellation before overwrite, inert hostile text, no external requests, no automatic CV storage, axe and overflow.
- Existing Studio browser suite: six designs/letter styles, tailoring, Word/PDF, RTL, storage failure/cross-tab, bad imports, long output and five widths.
- Separate manual QA used a Python-generated deflate-compressed DOCX to verify browser DecompressionStream support; repository browser fixtures use the existing stored-ZIP exporter.

No hosting, billing, analytics, paid feature, CSP or deployment configuration changes. Review and owner approval still required before merge.
