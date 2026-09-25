#!/usr/bin/env node
/**
 * Backward-compatible entry point. The sitemap is now generated from the
 * complete canonical HTML inventory rather than a hard-coded page list.
 */
await import('./generate_sitemap.mjs');
