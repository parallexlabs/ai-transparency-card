import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildCard, exportMarkdown, applyLocalizedContent } from '../web/js/core/card.js';
import { ruleReasonKey } from '../web/js/core/rules.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const en = JSON.parse(readFileSync(join(root, 'web/i18n/en.json'), 'utf8'));
const fr = JSON.parse(readFileSync(join(root, 'web/i18n/fr.json'), 'utf8'));

const ENGLISH_SENTENCES = [
  en['rules.R1'],
  en['rules.R2'],
  en['rules.R3'],
  en['rules.R4'],
  en['safeguards.S_ACCOUNTABLE_ROLE'],
  en['safeguards.S_DPIA'],
  en['data.D2'],
  en['tool.public-chatbot'],
  en['deploy.public-consumer']
].filter(Boolean);

function frenchReason(id) {
  return fr[ruleReasonKey(id)] || id;
}

describe('French sample cards', () => {
  for (const file of ['sample-tier1-green.json', 'sample-tier2-amber.json', 'sample-tier3-red.json']) {
    it(`${file} renders without known English rule sentences`, () => {
      const raw = JSON.parse(readFileSync(join(root, 'web/data/samples', file), 'utf8'));
      const state = applyLocalizedContent(raw, 'fr');
      state.language = 'fr';
      const md = exportMarkdown(buildCard(state), fr, 'fr', frenchReason);
      for (const sentence of ENGLISH_SENTENCES) {
        assert.ok(!md.includes(sentence), `Found English: ${sentence}`);
      }
      assert.match(md, /Exemple fictif/i);
    });
  }
});
