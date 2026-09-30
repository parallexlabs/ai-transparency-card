import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { findEmDashViolations } from '../scripts/em_dash_policy.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

describe('no em dash (U+2014) in tracked text', () => {
  it('repository text files contain no U+2014 outside allowed quotations', () => {
    const violations = findEmDashViolations(root);
    assert.equal(violations.length, 0, violations.join('\n'));
  });
});
