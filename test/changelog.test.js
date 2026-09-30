import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createEmptyState, bumpVersion, diffChanges, formatChangeLogEntry } from '../web/js/core/card.js';
import { evaluate } from '../web/js/core/rules.js';

const t = (key) => ({
  'changelog.change.initial': 'Initial card created',
  'changelog.change.minor': 'Minor updates',
  'changelog.change.safeguards': 'Safeguards'
}[key] || key);

describe('change log accumulation', () => {
  it('bumpVersion increments version and appends structured entry', () => {
    let state = createEmptyState();
    state.changeLog = [{ date: '2026-09-30', version: 1, changes: ['initial'] }];
    state.cardVersion = 1;
    state = bumpVersion(state, ['safeguards']);
    assert.equal(state.cardVersion, 2);
    assert.equal(state.changeLog.length, 2);
    assert.equal(state.changeLog[1].version, 2);
    assert.deepEqual(state.changeLog[1].changes, ['safeguards']);
  });

  it('formatChangeLogEntry localizes structured changes', () => {
    const line = formatChangeLogEntry({ version: 2, date: '2026-10-01', changes: ['safeguards'] }, t);
    assert.match(line, /Safeguards/);
  });

  it('review date change produces non-minor changes', () => {
    const old = createEmptyState();
    old.nextReviewDate = '2027-01-01';
    const neu = { ...createEmptyState(), nextReviewDate: '2027-06-01' };
    assert.ok(diffChanges(old, neu).includes('nextReviewDate'));
  });

  it('community evidence change produces non-minor changes even when tier unchanged', () => {
    const impact = { I1: false, I2: false, I3: false, I4: true };
    const safeguards = {
      S_ACCOUNTABLE_ROLE: true,
      S_OUTPUT_REVIEW: true,
      S_USER_TRAINING: true,
      S_DATA_MINIMISATION: true,
      S_RECORD_OF_USE: true
    };
    const old = { ...createEmptyState(), impact, safeguards };
    const neu = {
      ...old,
      community: { ...old.community, consultWho: 'Community reps' }
    };
    assert.equal(evaluate(old).tier, evaluate(neu).tier);
    assert.ok(diffChanges(old, neu).includes('community'));
  });
});
