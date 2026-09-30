import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { fullFormats } from 'ajv-formats/dist/formats.js';
import {
  validateCardData,
  schemaValidates,
  exceedsNestingDepth,
  exceedsStringLength,
  MAX_STRING_LENGTH
} from '../web/js/core/validate.js';
import { parseImportedJson } from '../web/js/core/card.js';
import uriFormat from '../web/js/core/ajv-formats-uri.js';
import dateFormat from '../web/js/core/ajv-formats-date.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const schema = JSON.parse(readFileSync(join(root, 'schema/card.schema.json'), 'utf8'));
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const ajvValidate = ajv.compile(schema);

const sample = JSON.parse(readFileSync(join(root, 'web/data/samples/sample-tier1-green.json'), 'utf8'));

function browserAccepts(data) {
  return validateCardData(data, (k) => k).length === 0;
}

function ajvAccepts(data) {
  if (exceedsNestingDepth(data) || exceedsStringLength(data)) return false;
  return ajvValidate(data) === true;
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function setPath(obj, path, value) {
  const parts = path.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (!(p in cur)) cur[p] = {};
    cur = cur[p];
  }
  cur[parts[parts.length - 1]] = value;
}

function deletePath(obj, path) {
  const parts = path.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) cur = cur[parts[i]];
  delete cur[parts[parts.length - 1]];
}

const MUTATIONS = [
  () => { const d = deepClone(sample); delete d.attribution; return d; },
  () => { const d = deepClone(sample); d.step1.team = null; return d; },
  () => { const d = deepClone(sample); d.nextReviewDate = null; return d; },
  () => { const d = deepClone(sample); d.evaluation = null; return d; },
  () => {
    const d = deepClone(sample);
    d.evaluation = { ...d.evaluation, firedRules: null };
    return d;
  },
  () => {
    const d = deepClone(sample);
    d.provenance = { ...d.provenance, sourceUrl: 'not a URI' };
    return d;
  },
  () => {
    const d = deepClone(sample);
    d.attribution = { ...d.attribution, sourceUrl: 'https://example.com/%ZZ' };
    return d;
  },
  () => {
    const d = deepClone(sample);
    d.attribution = { ...d.attribution, sourceUrl: 'http:' };
    return d;
  },
  () => {
    const d = deepClone(sample);
    d.provenance = { ...d.provenance, sourceUrl: 'https://[bad' };
    return d;
  },
  () => {
    const d = deepClone(sample);
    d.attribution = { ...d.attribution, sourceUrl: 'not a URI' };
    return d;
  },
  () => {
    const d = deepClone(sample);
    d.changeLog = [{ date: d.date, version: 2, changes: [{}] }];
    return d;
  },
  () => {
    const d = deepClone(sample);
    d.changeLog = [{ date: d.date, version: 2, summary: { toString: () => '0', valueOf: () => 0 } }];
    return d;
  },
  () => { const d = deepClone(sample); d.localized = { fr: null }; return d; },
  () => { const d = deepClone(sample); d.community.extra = 'x'; return d; },
  () => { const d = deepClone(sample); d.step1.purpose = { toString: () => 'x', valueOf: () => 0 }; return d; },
  () => {
    let nested = 'leaf';
    for (let i = 0; i < 40; i++) nested = [nested];
    const d = deepClone(sample);
    d.localized = { fr: { nested } };
    return d;
  },
  () => {
    const d = deepClone(sample);
    d.step1.purpose = 'x'.repeat(MAX_STRING_LENGTH + 1);
    return d;
  }
];

const PATH_SWAPS = [
  ['step1.name', 0],
  ['step1.purpose', false],
  ['step1.toolType', 'invalid-tool'],
  ['impact.I1', 'yes'],
  ['data.D1', 'true'],
  ['safeguards.S_ACCOUNTABLE_ROLE', 'true'],
  ['community.informWhat', null],
  ['changeLog', []],
  ['language', 'de'],
  ['schemaVersion', 'v1'],
  ['cardVersion', 0],
  ['date', '2026-13-40']
];

function randomMutation(base, seed) {
  const d = deepClone(base);
  const kind = seed % 6;
  if (kind === 0) {
    const [path, val] = PATH_SWAPS[seed % PATH_SWAPS.length];
    setPath(d, path, val);
  } else if (kind === 1) {
    deletePath(d, ['step1', 'name', 'attribution', 'changeLog', 'impact', 'language'][seed % 6]);
  } else if (kind === 2) {
    d[`extra${seed}`] = true;
  } else if (kind === 3) {
    d.step1.extra = seed;
  } else if (kind === 4) {
    d.attribution.sourceUrl = seed % 2 ? 'ftp://bad' : 'not-a-uri';
  } else {
    d.changeLog = [{ date: d.date, version: 1, summary: seed % 2 ? '' : { x: 1 } }];
  }
  return d;
}

describe('validator parity with Ajv schema', () => {
  it('review probe cases agree between browser validator and Ajv', () => {
    for (const mutate of MUTATIONS) {
      const data = mutate();
      const browserOk = browserAccepts(data);
      const ajvOk = ajvAccepts(data);
      assert.equal(
        browserOk,
        ajvOk,
        `parity mismatch: browser=${browserOk} ajv=${ajvOk}`
      );
      assert.equal(schemaValidates(data), ajvOk);
    }
  });

  it('at least 2000 random mutations agree between browser validator and Ajv', () => {
    let mismatches = 0;
    for (let i = 0; i < 2000; i++) {
      const data = randomMutation(sample, i);
      const browserOk = browserAccepts(data);
      const ajvOk = ajvAccepts(data);
      if (browserOk !== ajvOk) mismatches++;
    }
    assert.equal(mismatches, 0, `${mismatches} parity mismatches in 2000 mutations`);
  });

  it('parseImportedJson rejects the same invalid probes as Ajv', () => {
    for (const mutate of MUTATIONS) {
      const data = mutate();
      if (!ajvAccepts(data)) {
        assert.throws(() => parseImportedJson(JSON.stringify(data), (k) => k));
      }
    }
  });

  it('rejects deep nesting before schema evaluation', () => {
    let nested = { value: 'x' };
    for (let i = 0; i < 50; i++) nested = { child: nested };
    assert.equal(exceedsNestingDepth(nested), true);
    assert.equal(browserAccepts({ ...sample, localized: { fr: nested } }), false);
  });

  it('URI corpus agrees with Ajv fullFormats.uri and browser validator', () => {
    const REVIEW_INVALID = [
      'https://example.com/%ZZ',
      'https://[bad',
      'https://example.com/<img>',
      'https://example.com/pipe|test',
      'https://example.com/back\\slash',
      `https://example.com/${String.fromCharCode(0)}nul`,
      'http:',
      'not a URI',
      '://missing-scheme',
      'https:// exam ple.com',
      'https://example.com/%',
      'https://example.com/%GG',
      'javascript:alert(1)'
    ];
    const REVIEW_VALID = [
      'https://www.cdacnetwork.org/safe-ai',
      'https://creativecommons.org/licenses/by/4.0/',
      'http://example.com/path',
      'https://example.com/path?query=1#frag',
      'mailto:user@example.com',
      'https://user:pass@example.com:8080/dir/file.html'
    ];

    const GENERATED_VALID = [];
    const GENERATED_INVALID = [];
    for (let i = 0; i < 100; i++) {
      GENERATED_VALID.push(`https://example.org/resource/${i}/file-${i}.html?q=${i}`);
    }
    for (let i = 0; i < 100; i++) {
      GENERATED_INVALID.push(`bad-uri-${i} not valid`);
    }

    const validUris = [...REVIEW_VALID, ...GENERATED_VALID].filter((uri) => fullFormats.uri(uri));
    const invalidUris = [...REVIEW_INVALID, ...GENERATED_INVALID].filter((uri) => !fullFormats.uri(uri));
    assert.ok(validUris.length >= 100, `need at least 100 valid URIs, got ${validUris.length}`);
    assert.ok(invalidUris.length >= 100, `need at least 100 invalid URIs, got ${invalidUris.length}`);

    const URI_FIELDS = [
      ['attribution', 'sourceUrl'],
      ['attribution', 'licenceUrl'],
      ['provenance', 'sourceUrl'],
      ['provenance', 'licenceUrl']
    ];

    for (const uri of validUris) {
      assert.equal(fullFormats.uri(uri), true, `ajv should accept ${uri}`);
      assert.equal(uriFormat(uri), true, `vendored uri should accept ${uri}`);
    }
    for (const uri of invalidUris) {
      assert.equal(fullFormats.uri(uri), false, `ajv should reject ${JSON.stringify(uri)}`);
      assert.equal(uriFormat(uri), false, `vendored uri should reject ${JSON.stringify(uri)}`);
    }

    let mismatches = 0;
    for (const uri of [...validUris, ...invalidUris]) {
      for (const [obj, key] of URI_FIELDS) {
        const data = deepClone(sample);
        if (obj === 'provenance') {
          data.provenance = { creator: 'Test', sourceUrl: uri, licenceUrl: sample.attribution.licenceUrl };
        } else {
          data.attribution = { ...data.attribution, [key]: uri };
        }
        const browserOk = browserAccepts(data);
        const ajvOk = ajvAccepts(data);
        if (browserOk !== ajvOk) mismatches++;
      }
    }
    assert.equal(mismatches, 0, `${mismatches} URI field parity mismatches`);
  });

  it('date corpus agrees with Ajv fullFormats.date and browser validator', () => {
    const REVIEW_INVALID = [
      '2026-99-99',
      '2026-13-01',
      '2026-02-30',
      '2025-02-29',
      '2026-00-15',
      '2026-04-31',
      'not-a-date',
      '2026-09-30T12:00:00Z',
      ' 2026-09-30',
      '2026-09-30 ',
      '20260930',
      '30-09-2026'
    ];
    const REVIEW_VALID = [
      '2026-09-30',
      '2024-02-29',
      '2000-02-29',
      '2023-12-31',
      ''
    ];

    const GENERATED_VALID = [];
    const GENERATED_INVALID = [];
    for (let year = 2020; year <= 2030; year++) {
      GENERATED_VALID.push(`${year}-01-01`);
      GENERATED_VALID.push(`${year}-12-31`);
      if (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) {
        GENERATED_VALID.push(`${year}-02-29`);
      } else {
        GENERATED_INVALID.push(`${year}-02-29`);
      }
    }

    const validDates = [...REVIEW_VALID, ...GENERATED_VALID].filter((d) => d === '' || fullFormats.date.validate(d));
    const invalidDates = [...REVIEW_INVALID, ...GENERATED_INVALID].filter((d) => !fullFormats.date.validate(d));
    assert.ok(validDates.length >= 20, `need valid date corpus, got ${validDates.length}`);
    assert.ok(invalidDates.length >= 20, `need invalid date corpus, got ${invalidDates.length}`);

    for (const date of validDates.filter((d) => d !== '')) {
      assert.equal(fullFormats.date.validate(date), true, `ajv should accept ${date}`);
      assert.equal(dateFormat(date), true, `vendored date should accept ${date}`);
    }
    for (const date of invalidDates) {
      assert.equal(fullFormats.date.validate(date), false, `ajv should reject ${JSON.stringify(date)}`);
      assert.equal(dateFormat(date), false, `vendored date should reject ${JSON.stringify(date)}`);
    }

    const DATE_FIELDS = [
      ['date'],
      ['nextReviewDate'],
      ['changeLog', 0, 'date']
    ];

    let mismatches = 0;
    for (const date of [...validDates.filter((d) => d !== ''), ...invalidDates]) {
      for (const field of DATE_FIELDS) {
        const data = deepClone(sample);
        if (field[0] === 'changeLog') {
          data.changeLog = [{ date, version: 1, summary: 'probe' }];
        } else if (field[0] === 'nextReviewDate') {
          data.nextReviewDate = date;
        } else {
          data.date = date;
        }
        const browserOk = browserAccepts(data);
        const ajvOk = ajvAccepts(data);
        if (browserOk !== ajvOk) mismatches++;
      }
    }

    const emptyNext = deepClone(sample);
    emptyNext.nextReviewDate = '';
    assert.equal(browserAccepts(emptyNext), true);
    assert.equal(ajvAccepts(emptyNext), true);

    assert.equal(mismatches, 0, `${mismatches} date field parity mismatches`);
  });
});
