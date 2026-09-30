import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import {
  exportJson,
  exportMarkdown,
  parseImportedJson,
  buildCard,
  diffChanges,
  diffSummary,
  createEmptyState,
  escapeMarkdownLiteral
} from '../web/js/core/card.js';
import { evaluate } from '../web/js/core/rules.js';
import { encodedByteLength, MAX_IMPORT_BYTES, validateCardData } from '../web/js/core/validate.js';
import { SAFE_AI_URL, CC_BY_URL, buildAttributionObject } from '../web/js/core/attribution.js';
import { ruleReasonKey } from '../web/js/core/rules.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const schema = JSON.parse(readFileSync(join(root, 'schema/card.schema.json'), 'utf8'));
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validateSchema = ajv.compile(schema);

const en = JSON.parse(readFileSync(join(root, 'web/i18n/en.json'), 'utf8'));
const fr = JSON.parse(readFileSync(join(root, 'web/i18n/fr.json'), 'utf8'));
const reasonFn = (id) => en[ruleReasonKey(id)] || id;

const sample = JSON.parse(readFileSync(join(root, 'web/data/samples/sample-tier1-green.json'), 'utf8'));

describe('regression: markdown export escapes hostile user content', () => {
  it('markdown export encodes dynamic values as inline code spans', () => {
    const state = { ...sample };
    state.step1 = {
      ...state.step1,
      name: '<h2 id="forged">APPROVED</h2>',
      purpose: '<script>alert(1)</script>',
      accountableRole: '<img src=x onerror=alert(1)>'
    };
    state.syntheticLabel = '<b>fake</b>';
    state.community = { ...state.community, informWhat: '[click](http://evil.example)' };
    const md = exportMarkdown(buildCard(state), en, 'en', reasonFn);
    assert.ok(md.includes('`<h2 id="forged">APPROVED</h2>`') || md.includes(' `<h2 id="forged">APPROVED</h2>` '));
    assert.ok(md.includes('`<script>alert(1)</script>`') || md.includes(' `<script>alert(1)</script>` '));
    assert.ok(md.includes('`<img src=x onerror=alert(1)>`') || md.includes(' `<img src=x onerror=alert(1)>` '));
    assert.match(md, /\*\*Name:\*\* `[^`]+`/);
    assert.doesNotMatch(md, /^# <h2/m);
  });

  it('encodeMarkdownLiteral wraps hostile markdown syntax in code spans', () => {
    const encoded = escapeMarkdownLiteral('# heading\n**bold** <tag>');
    assert.ok(encoded.startsWith('`'));
    assert.ok(encoded.endsWith('`'));
    assert.ok(!encoded.includes('\n'));
    assert.ok(encoded.includes('# heading'));
  });
});

describe('regression: JSON import validation parity with schema', () => {
  const invalidCases = [
    ['safeguards array', { ...sample, safeguards: [] }],
    ['object accountableRole', { ...sample, step1: { ...sample.step1, accountableRole: {} } }],
    ['extra step1 property', { ...sample, step1: { ...sample.step1, extra: true } }],
    ['object nextReviewDate', { ...sample, nextReviewDate: {} }],
    ['string localized', { ...sample, localized: 'fr' }],
    ['array evaluation', { ...sample, evaluation: [] }],
    ['missing attribution', { ...sample, attribution: undefined }],
    ['null team', { ...sample, step1: { ...sample.step1, team: null } }],
    ['null nextReviewDate', { ...sample, nextReviewDate: null }],
    ['null evaluation', { ...sample, evaluation: null }],
    ['null firedRules', { ...sample, evaluation: { ...sample.evaluation, firedRules: null } }],
    ['bad provenance uri', { ...sample, provenance: { ...sample.provenance, sourceUrl: 'not a URI' } }],
    ['bad attribution uri', { ...sample, attribution: { ...sample.attribution, sourceUrl: 'not a URI' } }],
    ['changeLog object change', { ...sample, changeLog: [{ date: sample.date, version: 2, changes: [{}] }] }],
    ['changeLog object summary', { ...sample, changeLog: [{ date: sample.date, version: 2, summary: { x: 1 } }] }],
    ['localized fr null', { ...sample, localized: { fr: null } }]
  ];

  for (const [name, data] of invalidCases) {
    it(`rejects ${name} in custom validator`, () => {
      const errors = validateCardData(data, (k) => k);
      assert.ok(errors.length > 0, `expected rejection for ${name}`);
    });

    it(`rejects ${name} in parseImportedJson`, () => {
      assert.throws(() => parseImportedJson(JSON.stringify(data), (k) => en[k] || k));
    });

    it(`Ajv rejects ${name}`, () => {
      assert.equal(validateSchema(data), false, `expected Ajv rejection for ${name}`);
    });
  }

  it('rejects banana schemaVersion', () => {
    assert.throws(() => parseImportedJson('{"schemaVersion":"banana"}', (k) => en[k] || k));
  });

  it('rejects impact null', () => {
    const bad = { ...sample, impact: null };
    assert.throws(() => parseImportedJson(JSON.stringify(bad), (k) => en[k] || k));
  });

  it('enforces encoded byte length for direct string imports', () => {
    const big = '{"schemaVersion":"1.0.0"' + ' '.repeat(MAX_IMPORT_BYTES) + '}';
    assert.throws(() => parseImportedJson(big, (k) => en[k] || k), /too large/i);
    assert.ok(encodedByteLength('é'.repeat(600000)) > MAX_IMPORT_BYTES);
  });
});

describe('regression: attribution in JSON exports', () => {
  it('newly created card export includes required attribution fields', () => {
    const state = createEmptyState();
    state.step1.name = 'Test';
    state.step1.purpose = 'Purpose';
    state.step1.toolType = 'summarisation';
    state.step1.deployment = 'org-approved';
    state.step1.inputLanguages = 'English';
    state.step1.outputLanguages = 'English';
    state.impact = { I1: false, I2: false, I3: false, I4: true };
    state.changeLog = [{ date: state.date, version: 1, changes: ['initial'] }];
    const exported = JSON.parse(exportJson(buildCard(state)));
    const expected = buildAttributionObject();
    assert.deepEqual(exported.attribution, expected);
    assert.equal(exported.attribution.sourceUrl, SAFE_AI_URL);
    assert.equal(exported.attribution.licenceUrl, CC_BY_URL);
    assert.ok(exported.attribution.independenceStatement.includes('independent'));
    assert.equal(validateSchema(exported), true, JSON.stringify(validateSchema.errors));
  });

  it('markdown includes SAFE AI and CC BY links', () => {
    const md = exportMarkdown(buildCard(sample), en, 'en', reasonFn);
    assert.ok(md.includes(SAFE_AI_URL));
    assert.ok(md.includes(CC_BY_URL));
    assert.match(md, /Creator|CDAC Network/i);
  });

  it('import strips attribution before state is returned', () => {
    const text = exportJson(sample);
    const imported = parseImportedJson(text, (k) => en[k] || k);
    assert.equal(imported.attribution, undefined);
  });
});

describe('regression: data-dependent decision preview', () => {
  it('D2 with public-consumer is red only when data is current', () => {
    const base = {
      step1: { deployment: 'public-consumer' },
      impact: { I1: false, I2: false, I3: false, I4: true },
      data: { D1: false, D2: false, D3: false, D4: false },
      safeguards: {
        S_ACCOUNTABLE_ROLE: true,
        S_OUTPUT_REVIEW: true,
        S_USER_TRAINING: true,
        S_DATA_MINIMISATION: true,
        S_RECORD_OF_USE: true
      }
    };
    assert.equal(evaluate(base).decision, 'green');
    const withD2 = { ...base, data: { ...base.data, D2: true } };
    assert.equal(evaluate(withD2).decision, 'red');
    assert.ok(evaluate(withD2).redFlags.includes('R1'));
  });
});

describe('regression: change log detects substantive edits', () => {
  it('accountable role change is not minor', () => {
    const old = createEmptyState();
    old.step1.accountableRole = 'A';
    const neu = { ...createEmptyState(), step1: { ...createEmptyState().step1, accountableRole: 'B' } };
    assert.notDeepEqual(diffChanges(old, neu), ['minor']);
  });

  it('team change is not minor', () => {
    const old = createEmptyState();
    old.step1.team = 'Alpha';
    const neu = { ...createEmptyState(), step1: { ...createEmptyState().step1, team: 'Beta' } };
    assert.ok(diffChanges(old, neu).includes('team'));
  });

  it('review date change produces non-minor summary', () => {
    const old = createEmptyState();
    old.nextReviewDate = '2027-01-01';
    const neu = { ...createEmptyState(), nextReviewDate: '2027-06-01' };
    assert.match(diffSummary(old, neu), /nextReviewDate|review/);
  });
});

describe('regression: localized change log rendering', () => {
  it('French card uses French change labels', () => {
    const state = { ...sample, language: 'fr' };
    const md = exportMarkdown(buildCard(state), fr, 'fr', (id) => fr[ruleReasonKey(id)] || id);
    assert.match(md, /Fiche initiale créée/);
    assert.ok(!md.includes('Initial card created'));
  });
});
