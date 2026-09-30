# Security policy

## Reporting

Report security issues privately to **info@parallexlabs.ca**. Do not open public issues for sensitive reports.

## Scope

This tool processes information only in the browser. It should make no network requests at runtime except loading static assets from the same origin.

The local development static server responds with `Content-Security-Policy: frame-ancestors 'none'`. GitHub Pages cannot send custom response headers, so the public demo at `parallexlabs.github.io` relies on a client-side frame guard (`web/js/frame-guard.js`) loaded before other assets. Self-hosted deployments should send `Content-Security-Policy: frame-ancestors 'none'` (see `web/_headers` for hosts that read it; the local server sends it). Response headers are stronger than the script guard when available.

If you find code that transmits card content elsewhere, treat it as a high-severity defect.
