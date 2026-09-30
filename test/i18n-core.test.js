import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getNested, flattenKeys, interpolate } from '../web/js/core/i18n-core.js';

describe('i18n-core helpers', () => {
  it('getNested returns nested values and undefined for missing paths', () => {
    const obj = { a: { b: { c: 'value' } } };
    assert.equal(getNested(obj, 'a.b.c'), 'value');
    assert.equal(getNested(obj, 'a.missing'), undefined);
    assert.equal(getNested(null, 'a.b'), undefined);
    assert.equal(getNested({ a: 1 }, 'a.b.c'), undefined);
  });

  it('flattenKeys lists leaf keys with prefixes', () => {
    const flat = flattenKeys({ x: 1, group: { y: 2, nested: { z: 3 } } });
    assert.deepEqual(flat.sort(), ['group.nested.z', 'group.y', 'x']);
  });

  it('interpolate replaces placeholders and keeps unknown tokens', () => {
    assert.equal(interpolate('Hello {name}, step {n}', { name: 'Ada', n: 2 }), 'Hello Ada, step 2');
    assert.equal(interpolate('Missing {missing}', {}), 'Missing {missing}');
    assert.equal(interpolate('Null {value}', { value: null }), 'Null {value}');
  });
});
