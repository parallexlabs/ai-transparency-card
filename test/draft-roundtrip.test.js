import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { createEmptyState } from '../web/js/core/card.js';
import { saveDraft, loadDraft, clearDraft } from '../web/js/core/storage.js';

const COMMUNITY_KEYS = [
  'informWhat', 'informChannels', 'informLanguages', 'informFormats', 'informWhen',
  'complainChannel', 'complainResponseTime', 'complainHandover',
  'consultWho', 'consultWhen', 'consultMethod', 'consultInfluence',
  'feedbackHow', 'inclusion'
];

const STEP1_TEXT_KEYS = ['name', 'purpose', 'team', 'accountableRole', 'inputLanguages', 'outputLanguages'];
const TOOL_TYPES = [
  '', 'general-chat', 'translation', 'transcription', 'summarisation',
  'classification-triage', 'image-analysis', 'public-chatbot', 'other'
];
const DEPLOYMENTS = ['', 'org-approved', 'public-consumer', 'local-hosted'];

function randomPartialDraft(seed) {
  const draft = createEmptyState();
  draft.language = seed % 2 ? 'en' : 'fr';
  draft.cardVersion = 1 + (seed % 5);
  const month = (seed % 12) + 1;
  const day = (seed % 28) + 1;
  draft.date = seed % 7 === 0 ? '' : `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  draft.nextReviewDate = seed % 5 === 0 ? '' : (seed % 3 === 0 ? '2027-01-15' : '');

  for (const key of STEP1_TEXT_KEYS) {
    draft.step1[key] = seed % (STEP1_TEXT_KEYS.indexOf(key) + 2) === 0 ? '' : `${key}-${seed}`;
  }
  draft.step1.toolType = TOOL_TYPES[seed % TOOL_TYPES.length];
  draft.step1.deployment = DEPLOYMENTS[seed % DEPLOYMENTS.length];

  for (const id of ['I1', 'I2', 'I3', 'I4']) {
    draft.impact[id] = seed % 4 === 0 ? null : seed % 2 === 0;
  }

  for (const id of ['D1', 'D2', 'D3', 'D4']) {
    draft.data[id] = seed % 3 === 0;
  }

  if (seed % 6 === 0) draft.safeguards = { S_ACCOUNTABLE_ROLE: true };
  if (seed % 8 === 0) draft.safeguards = {};

  for (const key of COMMUNITY_KEYS) {
    draft.community[key] = seed % (COMMUNITY_KEYS.indexOf(key) + 3) === 0 ? '' : `community-${seed}-${key}`;
  }

  if (seed % 9 === 0) {
    draft.changeLog = [{ date: '2026-01-01', version: 1, summary: `seed-${seed}` }];
  } else if (seed % 11 === 0) {
    draft.changeLog = [{ date: '', version: 2, changes: [`change-${seed}`] }];
  } else {
    draft.changeLog = [];
  }

  if (seed % 13 === 0) {
    draft.localized = { fr: { step1: { name: `FR ${seed}` } } };
  }

  if (seed % 17 === 0) {
    draft.provenance = { creator: `Author ${seed}`, sourceUrl: 'https://example.com/', licenceUrl: 'https://creativecommons.org/licenses/by/4.0/' };
  }

  if (seed % 19 === 0) draft.syntheticLabel = `Label ${seed}`;

  return draft;
}

describe('draft save and restore round-trip', () => {
  beforeEach(() => {
    const store = new Map();
    globalThis.localStorage = {
      getItem: (k) => store.get(k) ?? null,
      setItem: (k, v) => { store.set(k, v); },
      removeItem: (k) => { store.delete(k); }
    };
    clearDraft();
  });

  afterEach(() => {
    clearDraft();
  });

  it('empty name draft round-trips through save and load', () => {
    const draft = createEmptyState();
    draft.step1.name = '';
    draft.community.informWhat = 'Saved without a name';
    saveDraft(draft);
    const loaded = loadDraft();
    assert.equal(loaded.invalid, false);
    assert.deepEqual(loaded.state, draft);
  });

  it('many partial drafts round-trip with identical data', () => {
    for (let seed = 0; seed < 250; seed++) {
      clearDraft();
      const draft = randomPartialDraft(seed);
      const saveResult = saveDraft(draft);
      assert.equal(saveResult.ok, true, `save failed for seed ${seed}`);
      const loaded = loadDraft();
      assert.equal(loaded.invalid, false, `invalid draft for seed ${seed}`);
      assert.deepEqual(loaded.state, draft, `mismatch for seed ${seed}`);
    }
  });
});
