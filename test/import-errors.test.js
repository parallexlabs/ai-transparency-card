import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateCardData } from '../web/js/core/validate.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const en = JSON.parse(readFileSync(join(root, 'web/i18n/en.json'), 'utf8'));
const fr = JSON.parse(readFileSync(join(root, 'web/i18n/fr.json'), 'utf8'));
const sample = JSON.parse(readFileSync(join(root, 'web/data/samples/sample-tier1-green.json'), 'utf8'));

const ERROR_KEYS = [
  'validation.import.invalid',
  'validation.import.parse',
  'validation.import.tooLarge',
  'validation.import.schemaVersion',
  'validation.import.unsupportedVersion',
  'validation.import.cardVersion',
  'validation.import.date',
  'validation.import.language',
  'validation.import.step1',
  'validation.import.name',
  'validation.import.purpose',
  'validation.import.accountableRole',
  'validation.import.toolType',
  'validation.import.deployment',
  'validation.import.inputLanguages',
  'validation.import.outputLanguages',
  'validation.import.impact',
  'validation.import.impact.I1',
  'validation.import.data',
  'validation.import.data.D1',
  'validation.import.safeguards',
  'validation.import.community',
  'validation.import.community.informWhat',
  'validation.import.nextReviewDate',
  'validation.import.changeLog',
  'validation.import.changeLogEntry',
  'validation.import.evaluation',
  'validation.import.extra',
  'validation.import.provenance',
  'validation.import.localized',
  'validation.import.attribution',
  'validation.import.readFailed'
];

describe('import error messages', () => {
  for (const key of ERROR_KEYS) {
    it(`English message for ${key}`, () => {
      assert.ok(en[key], `missing en key ${key}`);
      assert.notEqual(en[key], key);
    });
    it(`French message for ${key}`, () => {
      assert.ok(fr[key], `missing fr key ${key}`);
      assert.notEqual(fr[key], key);
    });
  }

  it('invalid purpose returns localized purpose message', () => {
    const bad = { ...sample, step1: { ...sample.step1, purpose: 1 } };
    const errors = validateCardData(bad, (k) => en[k]);
    assert.ok(errors.some((e) => e === en['validation.import.purpose']));
  });
});
