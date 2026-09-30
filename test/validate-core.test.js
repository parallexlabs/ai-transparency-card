import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  validateCardData,
  validateDraftData,
  parseAndValidateJson,
  encodedByteLength,
  exceedsNestingDepth,
  exceedsStringLength,
  MAX_IMPORT_BYTES,
  MAX_STRING_LENGTH
} from '../web/js/core/validate.js';
import { createEmptyState } from '../web/js/core/card.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const en = JSON.parse(readFileSync(join(root, 'web/i18n/en.json'), 'utf8'));
const sample = JSON.parse(readFileSync(join(root, 'web/data/samples/sample-tier1-green.json'), 'utf8'));
const msg = (k) => en[k] || k;

describe('validate.js coverage', () => {
  it('validateCardData rejects non-object root', () => {
    assert.ok(validateCardData(null, msg).length > 0);
    assert.ok(validateCardData([], msg).length > 0);
  });

  it('validateCardData rejects unsupported schema version after schema pass', () => {
    const bad = { ...sample, schemaVersion: '9.9.9' };
    const errors = validateCardData(bad, msg);
    assert.ok(errors.some((e) => e === en['validation.import.unsupportedVersion']));
  });

  it('parseAndValidateJson throws on invalid JSON and oversize input', () => {
    assert.throws(() => parseAndValidateJson('{', msg), /parse|Invalid/i);
    assert.throws(() => parseAndValidateJson('x'.repeat(MAX_IMPORT_BYTES + 1), msg), /too large|Large/i);
    assert.throws(() => parseAndValidateJson(123, msg));
  });

  it('parseAndValidateJson returns parsed card for valid input', () => {
    const parsed = parseAndValidateJson(JSON.stringify(sample), msg);
    assert.equal(parsed.step1.name, sample.step1.name);
  });

  it('validateDraftData rejects cardVersion object and null date types', () => {
    const badVersion = createEmptyState();
    badVersion.step1.name = 'Draft';
    badVersion.cardVersion = { toString: () => '1', valueOf: () => 1 };
    assert.ok(validateDraftData(badVersion, msg).length > 0);

    const badDate = createEmptyState();
    badDate.step1.name = 'Draft';
    badDate.date = { x: 1 };
    assert.ok(validateDraftData(badDate, msg).length > 0);
  });

  it('validateDraftData rejects invalid nested structures', () => {
    const cases = [
      () => {
        const d = createEmptyState();
        d.step1.name = 'Draft';
        d.impact = 'bad';
        return d;
      },
      () => {
        const d = createEmptyState();
        d.step1.name = 'Draft';
        d.data = { D1: 'yes' };
        return d;
      },
      () => {
        const d = createEmptyState();
        d.step1.name = 'Draft';
        d.safeguards = { S1: 'yes' };
        return d;
      },
      () => {
        const d = createEmptyState();
        d.step1.name = 'Draft';
        d.community = { extra: 'x' };
        return d;
      },
      () => {
        const d = createEmptyState();
        d.step1.name = 'Draft';
        d.changeLog = [{ version: 0 }];
        return d;
      },
      () => {
        const d = createEmptyState();
        d.step1.name = 'Draft';
        d.localized = { fr: 'bad' };
        return d;
      },
      () => {
        const d = createEmptyState();
        d.step1.name = 'Draft';
        d.provenance = { creator: 1 };
        return d;
      },
      () => {
        const d = createEmptyState();
        d.step1.name = 'Draft';
        d.syntheticLabel = 1;
        return d;
      }
    ];
    for (const make of cases) {
      assert.ok(validateDraftData(make(), msg).length > 0);
    }
  });

  it('encodedByteLength and depth/string guards', () => {
    assert.ok(encodedByteLength('café') > 4);
    assert.equal(exceedsNestingDepth({ a: { b: { c: 'x' } } }), false);
    assert.equal(exceedsStringLength({ a: 'x'.repeat(MAX_STRING_LENGTH + 1) }), true);
  });
});
