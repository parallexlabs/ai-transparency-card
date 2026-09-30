import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { exportJson, parseImportedJson, buildCard } from '../web/js/core/card.js';
import { evaluate } from '../web/js/core/rules.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const schema = JSON.parse(readFileSync(join(root, 'schema/card.schema.json'), 'utf8'));
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);

describe('JSON round trip', () => {
  for (const file of ['sample-tier1-green.json', 'sample-tier2-amber.json', 'sample-tier3-red.json']) {
    it(`round trips ${file} with schema-valid export`, () => {
      const original = JSON.parse(readFileSync(join(root, 'web/data/samples', file), 'utf8'));
      const text = exportJson(original);
      const exported = JSON.parse(text);
      assert.equal(validate(exported), true, JSON.stringify(validate.errors));
      assert.equal(exported.tierDefinition, undefined);
      assert.ok(exported.attribution?.sourceUrl);
      assert.ok(exported.attribution?.licenceUrl);
      assert.ok(exported.attribution?.independenceStatement);
      const parsed = parseImportedJson(text, (k) => k);
      assert.equal(parsed.step1.name, original.step1.name);
      assert.deepEqual(parsed.community, original.community);
      const ev1 = evaluate(original);
      const ev2 = evaluate(parsed);
      assert.equal(ev1.decision, ev2.decision);
      assert.equal(ev1.tier, ev2.tier);
      assert.deepEqual(ev1.redFlags.sort(), ev2.redFlags.sort());
    });
  }

  it('buildCard attaches evaluation without exporting tierDefinition', () => {
    const sample = JSON.parse(readFileSync(join(root, 'web/data/samples/sample-tier3-red.json'), 'utf8'));
    const card = buildCard(sample);
    assert.equal(card.evaluation.decision, 'red');
    assert.ok(card.evaluation.redFlags.includes('R3'));
    assert.ok(card.tierDefinition);
    const exported = JSON.parse(exportJson(sample));
    assert.equal(exported.tierDefinition, undefined);
  });
});
