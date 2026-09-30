import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { flattenKeys } from '../web/js/core/i18n-core.js';

const i18nRoot = join(dirname(fileURLToPath(import.meta.url)), '..', 'web', 'i18n');
const en = JSON.parse(readFileSync(join(i18nRoot, 'en.json'), 'utf8'));
const fr = JSON.parse(readFileSync(join(i18nRoot, 'fr.json'), 'utf8'));

const ALLOWED_EN_IN_FR = new Set([
  'SAFE AI', 'CDAC Network', 'The Alan Turing Institute', 'Humanitarian AI Advisory',
  'ParalleX', 'CC BY 4.0', 'localStorage', 'JSON', 'Markdown', 'PDF', 'SMS', 'GBV', 'A4',
  'English', 'Français', 'Tier 1', 'Tier 2', 'Tier 3', 'I1', 'I2', 'I3', 'I4', 'D1', 'D2', 'D3', 'D4'
]);

function findEnglishLeakage(frText, enText) {
  if (frText === enText && frText.length > 12) {
    const words = frText.split(/\s+/);
    const allowed = words.every((w) => ALLOWED_EN_IN_FR.has(w) || /^[A-Z0-9–]+$/.test(w));
    if (!allowed) return true;
  }
  return false;
}

describe('i18n', () => {
  it('en and fr have identical keys', () => {
    assert.deepEqual(Object.keys(en).sort(), Object.keys(fr).sort());
  });

  it('no empty values', () => {
    for (const [k, v] of Object.entries(en)) {
      assert.ok(String(v).trim().length > 0, `empty en: ${k}`);
    }
    for (const [k, v] of Object.entries(fr)) {
      assert.ok(String(v).trim().length > 0, `empty fr: ${k}`);
    }
  });

  it('flattenKeys covers all keys', () => {
    assert.equal(flattenKeys(en).length, Object.keys(en).length);
  });

  it('fr tier quotes differ from en (unofficial translation)', () => {
    assert.notEqual(fr['tier.1.quote'], en['tier.1.quote']);
    assert.notEqual(fr['tier.2.quote'], en['tier.2.quote']);
    assert.notEqual(fr['tier.3.quote'], en['tier.3.quote']);
    assert.match(fr['tier.unofficialFr'], /non officielle/i);
  });

  it('no verbatim English UI strings in fr except allowed', () => {
    const leaks = [];
    for (const key of Object.keys(en)) {
      if (key.startsWith('tier.') && key.endsWith('.quote')) continue;
      if (key === 'tier.attribution') continue;
      if (findEnglishLeakage(fr[key], en[key])) leaks.push(key);
    }
    assert.equal(leaks.length, 0, `English leakage: ${leaks.join(', ')}`);
  });

  it('independence statement present in both languages', () => {
    assert.match(en['footer.independence'], /SAFE AI v1\.2/);
    assert.match(fr['footer.independence'], /SAFE AI v1\.2/);
    assert.match(en['footer.independence'], /not SAFE AI's assessment method/);
    assert.match(fr['footer.independence'], /ne constituent pas la méthode d'évaluation de SAFE AI/);
  });

  it('preserved unreadable draft notice is cause-neutral unless quota key', () => {
    assert.doesNotMatch(en['home.preservedUnreadableDraft'], /storage is full/i);
    assert.doesNotMatch(fr['home.preservedUnreadableDraft'], /plein/i);
    assert.match(en['home.preservedUnreadableDraftQuota'], /storage is full/i);
    assert.match(fr['home.preservedUnreadableDraftQuota'], /plein/i);
  });
});
