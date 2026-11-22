# PDF.js 6.5.438, local text-check packaging

The CV structure checker reads a visitor's selected file locally. These files are served from this site. No CDN, upload endpoint, runtime build, new account permission, hosting change or deployment workflow is needed.

## Upstream source and license

- Mozilla PDF.js release: https://github.com/mozilla/pdf.js/releases/tag/v6.5.438
- Source commit: `0a4153349dc473ba950fc17941c5ca7eda43c1de`.
- Official distribution archive: https://registry.npmjs.org/pdfjs-dist/-/pdfjs-dist-6.5.438.tgz
- Upstream build configuration: https://raw.githubusercontent.com/mozilla/pdf.js/v6.5.438/gulpfile.mjs
- License: Apache-2.0, retained in `LICENSE` and the runtime headers.

The reader code in `pdf.min.mjs` is byte-identical to the official distribution after removing the added JobPick packaging notice and one final LF. The upstream reader SHA-256 is `3a88402882cfa3e7e72c2c9b5149f52f0f88baf1c5b62aa11a41abdbc2072440`. The notice and final LF are documented packaging-only changes for normal source commits.

The worker is rebuilt from the same source commit, with unchanged parser source. Its original single-file package is too large for the available source-editor path. It is packaged as a module entry and eight statically imported relative modules instead. Each worker module is below 256 KiB. They must be deployed together. There is no blob script, data URL, eval-based loader or remote runtime dependency.

## Packaging settings

The source release's locked development dependencies and webpack 5.112.2 are used locally. `manifest.json` records the upstream package-lock SHA-256 and every shipped runtime file's size and SHA-256.

The upstream `createWebpackConfig` and `createWebpackStream` are used with the source's default defines plus `GENERIC: true`, `MINIFIED: true`, and `WORKER_THREAD: true`. `SKIP_BABEL` stays true. The version metadata is `6.5.438`, build `438`, commit `0a4153349`.

Only packaging settings change:

- ESM library output, `module: true`, `chunkFormat: 'module'`, `chunkLoading: 'import'`.
- Entry filename `pdf.worker.min.mjs`; other initial and asynchronous chunks use `pdf.worker.part-[contenthash:12].mjs`.
- `splitChunks`: all chunks, minimum size 20,000 bytes, maximum size 500,000 bytes before minification, maximum initial/async requests 30.
- Default cache groups disabled. One enforced cache group covers source modules, with one minimum use, no fixed name and the same maximum size.
- A preserved `@license` banner identifies the JobPick packaging change. Upstream license/version banners remain.
- One final LF is added to each output if needed, so a normal source-editor commit does not silently alter file hashes. Manifest hashes cover the final shipped bytes, not webpack's pre-normalization content hashes.

No build script or workflow is installed into the website. The checked-in files are the deployment inputs. Rebuilding is a local vendor-maintenance operation, not a site deployment step.

## Runtime boundaries

`assets/cv-pdf-checker.mjs` owns a real module worker. It limits files to 8 MiB, 30 pages and 150,000 text characters. Reading has a 25-second deadline and at most 250 ms of graceful cleanup before the owned worker is terminated, even if parsing or cleanup stalls. There is no main-thread fake-worker fallback.

PDF.js is called with `isEvalSupported: false`, `useWorkerFetch: false`, `enableXfa: false`, `disableAutoFetch: true`, `disableStream: true`, and `stopAtErrors: true`.

Scans, protected files, unsupported/corrupt documents, oversized documents and reader failures fall back to pasted text. Prior text is retained when a new file fails. This is text extraction and a simple checklist, not OCR, an ATS service or a hiring prediction. Current browsers are required; if the reader cannot start, pasted text remains available.

## Verification

- Unit coverage includes input limits, owned-worker cleanup, reader failure, and deadlines during file reading, module loading, parsing and stuck cleanup.
- Chromium and Firefox produce identical text with the upstream single-file worker and this split worker on fictional CVs, an embedded-Unicode sample and the upstream 13-page `tracemonkey.pdf` fixture.
- Tests apply the live site's CSP to every local response. PDF selection causes only same-origin GETs for static reader assets, with no request bodies.
- Real-worker busy-loop tests verify termination and recovery. Mobile layouts at 320/390 px and desktop at 1280 px are checked.
- Scanned, locked, invalid, oversized and over-page-limit files retain the previous text and usable fallback.
- Safari/WebKit is not independently verified by these checks.

Run `node tests/cv-pdf-checker.mjs`, `node tests/cv-pdf-assets.mjs` and `node tests/site-regression.mjs` for the checked-in tests. Browser proof fixtures are fictional or upstream test documents, not visitor or owner CVs.
