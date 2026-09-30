import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import MarkdownIt from 'markdown-it';
import multimdTable from 'markdown-it-multimd-table';
import { exportMarkdown, buildCard, createEmptyState } from '../web/js/core/card.js';
import { encodeMarkdownLiteral } from '../web/js/core/markdown-escape.js';
import { ruleReasonKey } from '../web/js/core/rules.js';
import { SAFE_AI_URL, CC_BY_URL } from '../web/js/core/attribution.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const en = JSON.parse(readFileSync(join(root, 'web/i18n/en.json'), 'utf8'));
const fr = JSON.parse(readFileSync(join(root, 'web/i18n/fr.json'), 'utf8'));
const sample = JSON.parse(readFileSync(join(root, 'web/data/samples/sample-tier1-green.json'), 'utf8'));
const reasonFn = (id) => en[ruleReasonKey(id)] || id;

const md = new MarkdownIt({ html: true, linkify: true });
md.use(multimdTable);

const HOSTILE_PAYLOADS = [
  '<img src=x onerror=alert(1)>',
  '[link](javascript:alert(1))',
  '# Forged heading',
  '| a | b |',
  '---',
  '- forged list',
  'https://evil.example',
  '```code block```',
  '<script>alert(1)</script>',
  '**bold** _italic_',
  '`inline`',
  'x | y: \u2014'
];

const FIELD_TARGETS = [
  (s, v) => { s.step1.purpose = v; },
  (s, v) => { s.step1.name = v; },
  (s, v) => { s.syntheticLabel = v; },
  (s, v) => { s.community.informWhat = v; },
  (s, v) => { s.provenance = { creator: v, sourceUrl: SAFE_AI_URL, licenceUrl: CC_BY_URL }; },
  (s, v) => {
    s.changeLog = [{ date: s.date, version: 2, summary: v }];
  }
];

function countStructuralElements(html) {
  const tags = html.match(/<(h[1-6]|ul|ol|li|table|tr|td|th|hr|pre|code|a|img|script|iframe)\b/gi) || [];
  return tags.map((t) => t.toLowerCase());
}

function baselineTags(card) {
  const baseline = exportMarkdown(buildCard(card), en, 'en', reasonFn);
  return countStructuralElements(md.render(baseline));
}

describe('markdown export', () => {
  it('includes synthetic notice, all community fields, and attribution', () => {
    const mdText = exportMarkdown(buildCard(sample), en, 'en', reasonFn);
    assert.match(mdText, /Synthetic example/);
    assert.match(mdText, /informWhat|What affected people/i);
    assert.match(mdText, /inclusion/i);
    assert.ok(mdText.includes(SAFE_AI_URL));
    assert.ok(mdText.includes(CC_BY_URL));
    assert.match(mdText, /Accountable role assigned/);
    assert.ok(!/<img[\s>]/i.test(mdText));
  });

  it('encodeMarkdownLiteral uses fenced inline code for hostile strings', () => {
    for (const payload of HOSTILE_PAYLOADS) {
      const encoded = encodeMarkdownLiteral(payload);
      assert.ok(encoded.startsWith('`'), `expected code span for ${payload}`);
      assert.ok(encoded.endsWith('`'));
      assert.ok(!encoded.includes('\n'));
    }
  });

  it('GFM/CommonMark render introduces no extra structural elements from hostile field values', () => {
    const base = buildCard({ ...sample });
    const expectedTags = baselineTags(base);
    const expectedLinkCount = expectedTags.filter((t) => t === '<a').length;

    for (const payload of HOSTILE_PAYLOADS) {
      for (const apply of FIELD_TARGETS) {
        const state = JSON.parse(JSON.stringify(sample));
        apply(state, payload);
        const hostileLabels = {
          'card.title': payload,
          'tool.summarisation': payload,
          [`data.D1`]: payload
        };
        const exported = exportMarkdown(buildCard(state), { ...en, ...hostileLabels }, 'en', reasonFn);
        const html = md.render(exported);
        const tags = countStructuralElements(html);

        assert.ok(!/<script/i.test(html), `script injected for ${payload}`);
        assert.ok(!/<img/i.test(html), `img injected for ${payload}`);
        assert.ok(!/<iframe/i.test(html), `iframe injected for ${payload}`);

        const hrCount = tags.filter((t) => t === '<hr').length;
        const baselineHr = expectedTags.filter((t) => t === '<hr').length;
        assert.equal(hrCount, baselineHr, `extra hr from ${payload}`);

        const preCount = tags.filter((t) => t === '<pre').length;
        const baselinePre = expectedTags.filter((t) => t === '<pre').length;
        assert.equal(preCount, baselinePre, `extra pre/code block from ${payload}`);

        const tableCount = tags.filter((t) => t === '<table').length;
        const baselineTable = expectedTags.filter((t) => t === '<table').length;
        assert.equal(tableCount, baselineTable, `extra table from ${payload}`);

        const linkCount = tags.filter((t) => t === '<a').length;
        assert.equal(linkCount, expectedLinkCount, `extra link from ${payload}`);

        const h1Count = tags.filter((t) => t === '<h1').length;
        assert.equal(h1Count, 1, `forged heading from ${payload}`);
      }
    }
  });

  it('French export uses translated headings and community labels', () => {
    const mdText = exportMarkdown(buildCard(sample), fr, 'fr', reasonFn);
    assert.match(mdText, /^# Fiche de transparence/m);
    assert.match(mdText, /## Objectif/m);
    assert.doesNotMatch(mdText, /community\.informWhat:/);
    assert.match(mdText, /Ce que l'on communique aux personnes touchées/);
  });

  it('hostile labels in labels dict do not forge document structure', () => {
    const state = buildCard(createEmptyState());
    state.step1.name = 'Test tool';
    state.step1.purpose = 'Purpose text';
    state.step1.toolType = 'summarisation';
    state.step1.deployment = 'org-approved';
    state.step1.inputLanguages = 'English';
    state.step1.outputLanguages = 'English';
    state.impact = { I1: false, I2: false, I3: false, I4: true };
    state.data = { D1: false, D2: false, D3: false, D4: true };
    state.safeguards = { S_ACCOUNTABLE_ROLE: true };
    state.changeLog = [{ date: state.date, version: 1, changes: ['initial'] }];

    const hostile = {
      'card.purpose': '# <img src=x onerror=alert(1)>',
      'card.decision': 'FORGED',
      'card.firedRules': '[link](javascript:alert(1))',
      'card.missing': '--- | ---',
      'card.inPlace': 'x | y: \u2014'
    };

    const exported = exportMarkdown(state, { ...en, ...hostile }, 'en', reasonFn);
    const html = md.render(exported);
    assert.equal((html.match(/<h1/gi) || []).length, 1);
    assert.ok(!/<img/i.test(html));
    assert.ok(!/<script/i.test(html));
    const linkCount = (html.match(/<a\b/gi) || []).length;
    assert.equal(linkCount, 2, 'only trusted attribution links');
  });
});
