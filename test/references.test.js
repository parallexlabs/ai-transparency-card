import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { RULES } from '../web/js/core/rules.js';
import { REFERENCES, SOURCE_KEY_REFERENCE, getReferenceById } from '../web/js/core/references.js';

describe('references', () => {
  it('every rules.js sourceKey resolves to a reference entry or ParalleX own rule', () => {
    const missing = [];
    for (const rule of Object.values(RULES)) {
      const key = rule.sourceKey;
      if (key === 'parallex') continue;
      const refId = SOURCE_KEY_REFERENCE[key];
      if (!refId) {
        missing.push(`${rule.id}: unknown sourceKey ${key}`);
        continue;
      }
      if (!getReferenceById(refId)) {
        missing.push(`${rule.id}: sourceKey ${key} maps to missing reference ${refId}`);
      }
    }
    assert.equal(missing.length, 0, missing.join('\n'));
  });

  it('REFERENCE entries have required URLs', () => {
    for (const ref of REFERENCES) {
      assert.ok(ref.url.startsWith('https://'), `${ref.id} missing https URL`);
      assert.ok(ref.titleEn.length > 20, `${ref.id} missing English title`);
      assert.ok(ref.titleFr.length > 20, `${ref.id} missing French title`);
    }
  });

  it('SAFE AI reference includes CC BY note', () => {
    const safe = getReferenceById('safe-ai');
    assert.match(safe.noteEn, /unofficial translations by ParalleX Labs/);
    assert.match(safe.licenceEn, /creativecommons\.org\/licenses\/by\/4\.0/);
  });
});
