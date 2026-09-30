import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const schema = JSON.parse(readFileSync(join(root, 'schema/card.schema.json'), 'utf8'));
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);

const validSample = JSON.parse(readFileSync(join(root, 'web/data/samples/sample-tier1-green.json'), 'utf8'));

describe('schema validation', () => {
  it('sample tier1 is valid', () => {
    assert.equal(validate(validSample), true);
  });

  it('sample tier2 is valid', () => {
    const s = JSON.parse(readFileSync(join(root, 'web/data/samples/sample-tier2-amber.json'), 'utf8'));
    assert.equal(validate(s), true);
  });

  it('sample tier3 is valid', () => {
    const s = JSON.parse(readFileSync(join(root, 'web/data/samples/sample-tier3-red.json'), 'utf8'));
    assert.equal(validate(s), true);
  });

  const invalidCases = [
    { name: 'missing schemaVersion', data: { ...validSample, schemaVersion: undefined } },
    { name: 'bad schemaVersion', data: { ...validSample, schemaVersion: 'v1' } },
    { name: 'cardVersion zero', data: { ...validSample, cardVersion: 0 } },
    { name: 'bad date', data: { ...validSample, date: '30-09-2026' } },
    { name: 'invalid calendar date', data: { ...validSample, date: '2026-99-99' } },
    { name: 'invalid changeLog date', data: { ...validSample, changeLog: [{ date: '2026-02-30', version: 1, summary: 'x' }] } },
    { name: 'invalid nextReviewDate', data: { ...validSample, nextReviewDate: 'not-a-date' } },
    { name: 'non-leap Feb 29', data: { ...validSample, date: '2025-02-29' } },
    { name: 'invalid language', data: { ...validSample, language: 'de' } },
    { name: 'empty name', data: { ...validSample, step1: { ...validSample.step1, name: '' } } },
    { name: 'bad toolType', data: { ...validSample, step1: { ...validSample.step1, toolType: 'magic' } } },
    { name: 'bad deployment', data: { ...validSample, step1: { ...validSample.step1, deployment: 'cloud' } } },
    { name: 'missing impact I1', data: { ...validSample, impact: { I2: false, I3: false, I4: true } } },
    { name: 'extra top-level property', data: { ...validSample, extra: true } },
    { name: 'invalid changeLog entry', data: { ...validSample, changeLog: [{ date: 'bad', version: 1, summary: 'x' }] } },
    { name: 'empty changeLog summary', data: { ...validSample, changeLog: [{ date: '2026-09-30', version: 1, summary: '' }] } }
  ];

  for (const { name, data } of invalidCases) {
    it(`rejects ${name}`, () => {
      validate(data);
      assert.equal(validate.errors?.length > 0, true, `expected errors for ${name}`);
    });
  }
});
