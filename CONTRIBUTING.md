# Contributing

Thank you for helping improve the AI Transparency Card.

## Setup

```bash
npm ci
npm run lint
npm test
npx playwright install --with-deps chromium
npm run check:site
npm run test:browser
```

## Guidelines

- Keep all user data in the browser only; no analytics, trackers or server uploads.
- Cite public sources for factual claims; use synthetic labelled examples only.
- Keep bilingual i18n keys in sync (`web/i18n/en.json` and `fr.json`).
- Run the full CI script sequence before opening a pull request.

## Coverage

The generated schema validator at `web/js/core/card-validator.js` is excluded from line-coverage (`npm test`). It is produced by `npm run gen:validator` and checked with `npm run check:validator`; correctness is enforced by `test/validator-parity.test.js`, which compares every acceptance decision with Ajv plus ajv-formats.

## Security

Report vulnerabilities privately to info@parallexlabs.ca (see SECURITY.md).
