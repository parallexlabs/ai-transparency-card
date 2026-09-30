import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { createEmptyState } from '../web/js/core/card.js';
import {
  loadDraft,
  saveDraft,
  clearDraft,
  hasValidDraft,
  hasInvalidDraft,
  saveLanguage,
  loadLanguage,
  listQuarantinedDrafts,
  getQuarantinedDraftRaw,
  deleteQuarantinedDraft,
  hasPreservedUnreadableDraft,
  getPreservedUnreadableDraftRaw,
  discardPreservedUnreadableDraft,
  getPreservedUnreadableDraftCause
} from '../web/js/core/storage.js';

function quarantineRawTexts() {
  const { drafts } = listQuarantinedDrafts();
  return drafts.map((d) => d.raw);
}

describe('draft storage validation', () => {
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

  it('rejects corrupt draft with invalid impact structure', () => {
    const bad = createEmptyState();
    bad.step1.name = 'Saved work';
    bad.impact = null;
    globalThis.localStorage.setItem('ai-transparency-card-draft', JSON.stringify(bad));
    const result = loadDraft();
    assert.equal(result.state, null);
    assert.equal(result.invalid, true);
    assert.equal(hasValidDraft(), false);
    assert.equal(hasInvalidDraft(), true);
  });

  it('rejects draft with hostile community object values', () => {
    const bad = createEmptyState();
    bad.step1.name = 'Saved work';
    bad.community = { informWhat: { x: 1 } };
    globalThis.localStorage.setItem('ai-transparency-card-draft', JSON.stringify(bad));
    const result = loadDraft();
    assert.equal(result.state, null);
    assert.equal(result.invalid, true);
  });

  it('rejects draft with changeLog containing null entry', () => {
    const bad = createEmptyState();
    bad.step1.name = 'Saved work';
    bad.changeLog = [null];
    globalThis.localStorage.setItem('ai-transparency-card-draft', JSON.stringify(bad));
    const result = loadDraft();
    assert.equal(result.state, null);
    assert.equal(result.invalid, true);
  });

  it('rejects draft with hostile cardVersion object', () => {
    const bad = createEmptyState();
    bad.step1.name = 'Saved work';
    bad.cardVersion = { toString: () => '1', valueOf: () => 1 };
    globalThis.localStorage.setItem('ai-transparency-card-draft', JSON.stringify(bad));
    const result = loadDraft();
    assert.equal(result.state, null);
    assert.equal(result.invalid, true);
  });

  it('rejects draft with non-string date', () => {
    const bad = createEmptyState();
    bad.step1.name = 'Saved work';
    bad.date = { x: 1 };
    globalThis.localStorage.setItem('ai-transparency-card-draft', JSON.stringify(bad));
    const result = loadDraft();
    assert.equal(result.state, null);
    assert.equal(result.invalid, true);
  });

  it('resumes only validated draft', () => {
    const good = createEmptyState();
    good.step1.name = 'Saved work';
    saveDraft(good);
    assert.equal(hasValidDraft(), true);
    assert.equal(hasInvalidDraft(), false);
    const loaded = loadDraft();
    assert.equal(loaded.state.step1.name, 'Saved work');
  });

  it('restores draft with empty name saved through save path', () => {
    const draft = createEmptyState();
    draft.step1.name = '';
    draft.community.informWhat = 'Community input';
    saveDraft(draft);
    const loaded = loadDraft();
    assert.equal(loaded.invalid, false);
    assert.deepEqual(loaded.state, draft);
    assert.equal(hasValidDraft(), true);
  });

  it('successful save does not remove quarantined draft', () => {
    const bad = createEmptyState();
    bad.step1.name = 'Quarantined';
    bad.impact = null;
    const quarantinedRaw = JSON.stringify(bad);
    globalThis.localStorage.setItem('ai-transparency-card-draft-invalid', quarantinedRaw);

    const good = createEmptyState();
    good.step1.name = 'New save';
    saveDraft(good);

    assert.ok(quarantineRawTexts().includes(quarantinedRaw));
    assert.equal(hasInvalidDraft(), true);
    const loaded = loadDraft();
    assert.equal(loaded.state.step1.name, 'New save');
  });

  it('preserves original draft when quarantine storage throws', () => {
    const bad = createEmptyState();
    bad.step1.name = 'Saved work';
    bad.impact = null;
    const raw = JSON.stringify(bad);
    globalThis.localStorage.setItem('ai-transparency-card-draft', raw);

    const originalSetItem = globalThis.localStorage.setItem.bind(globalThis.localStorage);
    globalThis.localStorage.setItem = (k, v) => {
      if (k === 'ai-transparency-card-draft-invalid') {
        throw new DOMException('QuotaExceededError', 'QuotaExceededError');
      }
      originalSetItem(k, v);
    };

    const result = loadDraft();
    assert.equal(result.ok, false);
    assert.equal(result.error, 'quarantine_failed');
    assert.equal(result.preserved, true);
    assert.equal(globalThis.localStorage.getItem('ai-transparency-card-draft'), raw);
  });

  it('saveLanguage and loadLanguage round-trip', () => {
    assert.equal(saveLanguage('fr').ok, true);
    assert.equal(loadLanguage().lang, 'fr');
  });

  it('clearDraft removes only the current draft key', () => {
    saveDraft(createEmptyState());
    globalThis.localStorage.setItem('ai-transparency-card-draft-invalid', '{"orphan":true}');
    assert.equal(clearDraft().ok, true);
    assert.equal(globalThis.localStorage.getItem('ai-transparency-card-draft'), null);
    assert.ok(globalThis.localStorage.getItem('ai-transparency-card-draft-invalid'));
    assert.equal(hasInvalidDraft(), true);
  });

  it('quarantine keeps earlier unreadable drafts when a second is loaded', () => {
    globalThis.localStorage.setItem('ai-transparency-card-draft-invalid', 'OLD');
    globalThis.localStorage.setItem('ai-transparency-card-draft', '{"not":"a draft"}');
    const result = loadDraft();
    assert.equal(result.invalid, true);
    const raws = quarantineRawTexts();
    assert.ok(raws.includes('OLD'));
    assert.ok(raws.includes('{"not":"a draft"}'));
  });

  it('two successive unreadable drafts are both kept', () => {
    globalThis.localStorage.setItem('ai-transparency-card-draft', '{"first":"bad"}');
    loadDraft();
    globalThis.localStorage.setItem('ai-transparency-card-draft', '{"second":"bad"}');
    loadDraft();
    const raws = quarantineRawTexts();
    assert.equal(raws.length, 2);
    assert.ok(raws.includes('{"first":"bad"}'));
    assert.ok(raws.includes('{"second":"bad"}'));
  });

  it('getQuarantinedDraftRaw returns exact stored text', () => {
    globalThis.localStorage.setItem('ai-transparency-card-draft', '{not json');
    loadDraft();
    const { drafts } = listQuarantinedDrafts();
    assert.equal(drafts.length, 1);
    const got = getQuarantinedDraftRaw(drafts[0].id);
    assert.equal(got.ok, true);
    assert.equal(got.raw, '{not json');
  });

  it('deleteQuarantinedDraft removes only the chosen entry', () => {
    globalThis.localStorage.setItem('ai-transparency-card-draft', '{"one":"bad"}');
    loadDraft();
    globalThis.localStorage.setItem('ai-transparency-card-draft', '{"two":"bad"}');
    loadDraft();
    const { drafts } = listQuarantinedDrafts();
    assert.equal(drafts.length, 2);
    const keepId = drafts.find((d) => d.raw === '{"one":"bad"}').id;
    const dropId = drafts.find((d) => d.raw === '{"two":"bad"}').id;
    assert.equal(deleteQuarantinedDraft(dropId).ok, true);
    const remaining = listQuarantinedDrafts().drafts;
    assert.equal(remaining.length, 1);
    assert.equal(remaining[0].id, keepId);
    assert.equal(remaining[0].raw, '{"one":"bad"}');
  });

  it('saveDraft reports storage errors', () => {
    globalThis.localStorage = {
      getItem: () => null,
      setItem: (k) => {
        if (k === 'ai-transparency-card-draft') throw new Error('quota');
      },
      removeItem: () => {}
    };
    const result = saveDraft(createEmptyState());
    assert.equal(result.ok, false);
    assert.match(result.error, /quota/);
  });

  it('loadDraft quarantines invalid JSON', () => {
    globalThis.localStorage.setItem('ai-transparency-card-draft', '{not json');
    const result = loadDraft();
    assert.equal(result.invalid, true);
    assert.equal(result.state, null);
    assert.equal(hasInvalidDraft(), true);
  });

  it('refuses save over preserved unreadable draft when quarantine fails', () => {
    const bad = createEmptyState();
    bad.step1.name = 'Saved work';
    bad.impact = null;
    const raw = JSON.stringify(bad);
    globalThis.localStorage.setItem('ai-transparency-card-draft', raw);

    const originalSetItem = globalThis.localStorage.setItem.bind(globalThis.localStorage);
    globalThis.localStorage.setItem = (k, v) => {
      if (k === 'ai-transparency-card-draft-invalid') {
        throw new DOMException('QuotaExceededError', 'QuotaExceededError');
      }
      originalSetItem(k, v);
    };

    const loaded = loadDraft();
    assert.equal(loaded.preserved, true);
    assert.equal(hasPreservedUnreadableDraft(), true);

    const good = createEmptyState();
    good.step1.name = 'New save';
    const saveResult = saveDraft(good);
    assert.equal(saveResult.ok, false);
    assert.equal(saveResult.error, 'unreadable_draft_preserved');
    assert.equal(globalThis.localStorage.getItem('ai-transparency-card-draft'), raw);

    const preserved = getPreservedUnreadableDraftRaw();
    assert.equal(preserved.ok, true);
    assert.equal(preserved.raw, raw);
  });

  it('quota-limited storage keeps unreadable original through load and blocked save', () => {
    const quotaBytes = 45 * 1024;
    const store = new Map();
    globalThis.localStorage = {
      getItem: (k) => store.get(k) ?? null,
      setItem: (k, v) => {
        const next = new Map(store);
        next.set(k, String(v));
        let total = 0;
        for (const [kk, vv] of next) total += (kk.length + vv.length) * 2;
        if (total > quotaBytes) {
          throw new DOMException('QuotaExceededError', 'QuotaExceededError');
        }
        store.set(k, String(v));
      },
      removeItem: (k) => { store.delete(k); }
    };

    const filler = 'x'.repeat(12 * 1024);
    globalThis.localStorage.setItem('ai-transparency-card-draft', filler);
    const original = globalThis.localStorage.getItem('ai-transparency-card-draft');

    const loaded = loadDraft();
    assert.equal(loaded.preserved, true);
    assert.equal(globalThis.localStorage.getItem('ai-transparency-card-draft'), original);

    const blocked = saveDraft(createEmptyState());
    assert.equal(blocked.ok, false);
    assert.equal(blocked.error, 'unreadable_draft_preserved');
    assert.equal(globalThis.localStorage.getItem('ai-transparency-card-draft'), original);
  });

  it('discard clears preserved unreadable draft so save can proceed', () => {
    const bad = createEmptyState();
    bad.impact = null;
    const raw = JSON.stringify(bad);
    globalThis.localStorage.setItem('ai-transparency-card-draft', raw);

    const originalSetItem = globalThis.localStorage.setItem.bind(globalThis.localStorage);
    globalThis.localStorage.setItem = (k, v) => {
      if (k === 'ai-transparency-card-draft-invalid') {
        throw new DOMException('QuotaExceededError', 'QuotaExceededError');
      }
      originalSetItem(k, v);
    };

    loadDraft();
    assert.equal(discardPreservedUnreadableDraft().ok, true);
    assert.equal(hasPreservedUnreadableDraft(), false);

    const good = createEmptyState();
    good.step1.name = 'After discard';
    assert.equal(saveDraft(good).ok, true);
    assert.equal(loadDraft().state.step1.name, 'After discard');
  });

  it('failed legacy migration reuses stable ID for list, download and delete', () => {
    const legacyRaw = '{"legacy":"unreadable"}';
    globalThis.localStorage.setItem('ai-transparency-card-draft-invalid', legacyRaw);

    const originalSetItem = globalThis.localStorage.setItem.bind(globalThis.localStorage);
    globalThis.localStorage.setItem = (k, v) => {
      if (k === 'ai-transparency-card-draft-invalid') {
        throw new DOMException('QuotaExceededError', 'QuotaExceededError');
      }
      originalSetItem(k, v);
    };

    const first = listQuarantinedDrafts();
    const second = listQuarantinedDrafts();
    assert.equal(first.drafts.length, 1);
    assert.equal(second.drafts.length, 1);
    assert.equal(first.drafts[0].id, second.drafts[0].id);

    const id = first.drafts[0].id;
    const download = getQuarantinedDraftRaw(id);
    assert.equal(download.ok, true);
    assert.equal(download.raw, legacyRaw);

    assert.equal(deleteQuarantinedDraft(id).ok, true);
    assert.equal(listQuarantinedDrafts().drafts.length, 0);
    assert.equal(globalThis.localStorage.getItem('ai-transparency-card-draft-invalid'), null);
  });

  it('reads work when setItem throws QuotaExceededError', () => {
    const legacyRaw = '{"still":"readable"}';
    globalThis.localStorage.setItem('ai-transparency-card-draft-invalid', legacyRaw);

    const store = new Map([['ai-transparency-card-draft-invalid', legacyRaw]]);
    globalThis.localStorage = {
      getItem: (k) => store.get(k) ?? null,
      setItem: () => {
        throw new DOMException('QuotaExceededError', 'QuotaExceededError');
      },
      removeItem: (k) => { store.delete(k); }
    };

    const listed = listQuarantinedDrafts();
    assert.equal(listed.ok, true);
    assert.equal(listed.drafts.length, 1);
    const id = listed.drafts[0].id;
    const download = getQuarantinedDraftRaw(id);
    assert.equal(download.ok, true);
    assert.equal(download.raw, legacyRaw);

    const good = createEmptyState();
    good.step1.name = 'Readable draft';
    store.set('ai-transparency-card-draft', JSON.stringify(good));
    const loaded = loadDraft();
    assert.equal(loaded.ok, true);
    assert.equal(loaded.state.step1.name, 'Readable draft');
  });

  it('duplicate quarantine IDs are disambiguated for download and delete', () => {
    const entries = [
      { id: 'same', raw: 'A', quarantinedAt: '2026-09-29' },
      { id: 'same', raw: 'B', quarantinedAt: '2026-09-30' }
    ];
    globalThis.localStorage.setItem('ai-transparency-card-draft-invalid', JSON.stringify(entries));
    const { drafts } = listQuarantinedDrafts();
    assert.equal(drafts.length, 2);
    const idA = drafts.find((d) => d.raw === 'A').id;
    const idB = drafts.find((d) => d.raw === 'B').id;
    assert.notEqual(idA, idB);
    assert.equal(getQuarantinedDraftRaw(idB).raw, 'B');
    assert.equal(deleteQuarantinedDraft(idA).ok, true);
    const remaining = listQuarantinedDrafts().drafts;
    assert.equal(remaining.length, 1);
    assert.equal(remaining[0].raw, 'B');
  });

  it('saveDraft aborts when draft read fails after probe', () => {
    const store = new Map();
    let writeAttempted = false;
    globalThis.localStorage = {
      getItem: (k) => {
        if (k === '__storage_read_probe__') return null;
        if (k === 'ai-transparency-card-draft') throw new Error('read blocked');
        return store.get(k) ?? null;
      },
      setItem: (k, v) => {
        writeAttempted = true;
        store.set(k, v);
      },
      removeItem: (k) => { store.delete(k); }
    };
    const result = saveDraft(createEmptyState());
    assert.equal(result.ok, false);
    assert.match(result.error, /read blocked/);
    assert.equal(writeAttempted, false);
  });

  it('loadDraft does not overwrite quarantine when quarantine list read fails', () => {
    const store = new Map([
      ['ai-transparency-card-draft-invalid', JSON.stringify([
        { id: 'keep', raw: 'KEEP', quarantinedAt: '2026-01-01T00:00:00.000Z' }
      ])],
      ['ai-transparency-card-draft', '{"bad":true}']
    ]);
    globalThis.localStorage = {
      getItem: (k) => {
        if (k === '__storage_read_probe__') return null;
        if (k === 'ai-transparency-card-draft-invalid') throw new Error('read blocked');
        return store.get(k) ?? null;
      },
      setItem: (k, v) => { store.set(k, v); },
      removeItem: (k) => { store.delete(k); }
    };
    const result = loadDraft();
    assert.equal(result.ok, false);
    assert.equal(result.error, 'quarantine_failed');
    assert.equal(store.get('ai-transparency-card-draft'), '{"bad":true}');
    assert.ok(store.get('ai-transparency-card-draft-invalid').includes('KEEP'));
  });

  it('discard and delete abort when a required read fails', () => {
    globalThis.localStorage = {
      getItem: (k) => {
        if (k === '__storage_read_probe__') return null;
        throw new Error('read blocked');
      },
      setItem: () => {},
      removeItem: () => {}
    };
    assert.match(discardPreservedUnreadableDraft().error, /read blocked/);
    assert.match(deleteQuarantinedDraft('any').error, /read blocked/);
  });

  it('saveDraft rejects draft that would fail validation on reload', () => {
    const state = createEmptyState();
    state.step1.purpose = 'x'.repeat(100001);
    const result = saveDraft(state);
    assert.equal(result.ok, false);
    assert.equal(result.error, 'validation_failed');
    assert.equal(globalThis.localStorage.getItem('ai-transparency-card-draft'), null);
  });

  it('preserved unreadable cause is quota only for quota errors', () => {
    const bad = createEmptyState();
    bad.impact = null;
    globalThis.localStorage.setItem('ai-transparency-card-draft', JSON.stringify(bad));

    const originalSetItem = globalThis.localStorage.setItem.bind(globalThis.localStorage);
    globalThis.localStorage.setItem = (k, v) => {
      if (k === 'ai-transparency-card-draft-invalid') {
        throw new DOMException('SecurityError', 'SecurityError');
      }
      originalSetItem(k, v);
    };

    loadDraft();
    assert.equal(getPreservedUnreadableDraftCause(), 'blocked');
    assert.equal(hasPreservedUnreadableDraft(), true);

    globalThis.localStorage.setItem = (k, v) => {
      if (k === 'ai-transparency-card-draft-invalid') {
        throw new DOMException('QuotaExceededError', 'QuotaExceededError');
      }
      originalSetItem(k, v);
    };
    loadDraft();
    assert.equal(getPreservedUnreadableDraftCause(), 'quota');
  });
});

describe('storage unavailable', () => {
  beforeEach(() => {
    globalThis.localStorage = {
      getItem: () => { throw new Error('disabled'); },
      setItem: () => { throw new Error('disabled'); },
      removeItem: () => { throw new Error('disabled'); }
    };
  });

  it('saveDraft returns storage_unavailable', () => {
    assert.equal(saveDraft(createEmptyState()).error, 'storage_unavailable');
  });

  it('loadDraft returns null state when storage throws on get', () => {
    assert.equal(loadDraft().ok, true);
    assert.equal(loadDraft().state, null);
  });

  it('clearDraft returns storage_unavailable', () => {
    assert.equal(clearDraft().error, 'storage_unavailable');
  });
});
