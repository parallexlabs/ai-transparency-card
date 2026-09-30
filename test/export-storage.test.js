import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { createEmptyState } from '../web/js/core/card.js';

globalThis.__ATC_SKIP_INIT__ = true;

function buildExportTestDom() {
  const nodes = new Map();
  globalThis.document = {
    body: { appendChild(el) { return el; }, classList: { add() {}, remove() {} } },
    documentElement: { lang: 'en' },
    createElement(tag) {
      const el = {
        tagName: tag.toUpperCase(),
        id: '',
        hidden: false,
        value: '',
        textContent: '',
        addEventListener() {},
        focus() {}
      };
      return el;
    },
    querySelector(sel) {
      if (sel === '.view:not([hidden])') return { id: 'view-wizard' };
      return null;
    },
    getElementById(id) {
      if (!nodes.has(id)) {
        const el = globalThis.document.createElement('div');
        el.id = id;
        nodes.set(id, el);
      }
      return nodes.get(id);
    }
  };
  globalThis.$ = (id) => globalThis.document.getElementById(id);
  globalThis.requestAnimationFrame = (fn) => fn();
  globalThis.window = { print() {}, scrollTo() {}, scrollY: 0 };

  for (const id of [
    'f-name', 'f-purpose', 'f-team', 'f-accountable', 'f-tool-type', 'f-deployment',
    'f-input-lang', 'f-output-lang', 'f-next-review', 'live-region'
  ]) {
    const el = globalThis.document.createElement('input');
    el.id = id;
    globalThis.document.getElementById(id);
    globalThis.document.getElementById(id).value = '';
  }
}

describe('export when localStorage throws', () => {
  /** @type {typeof import('../web/js/ui/app.js')} */
  let app;

  beforeEach(async () => {
    globalThis.__ATC_SKIP_INIT__ = true;
    buildExportTestDom();
    const store = new Map();
    globalThis.localStorage = {
      getItem: (k) => store.get(k) ?? null,
      setItem: (k, v) => {
        if (k === 'ai-transparency-card-draft') throw new Error('quota exceeded');
        store.set(k, v);
      },
      removeItem: (k) => { store.delete(k); }
    };
    app = await import('../web/js/ui/app.js');
    const state = createEmptyState();
    state.step1.name = 'Export test';
    state.step1.purpose = 'Purpose';
    state.step1.toolType = 'summarisation';
    state.step1.deployment = 'org-approved';
    state.step1.inputLanguages = 'English';
    state.step1.outputLanguages = 'English';
    app.__testSetWizardState(state, JSON.parse(JSON.stringify(state)), 6);
    globalThis.document.getElementById('f-name').value = 'Export test';
    globalThis.document.getElementById('f-purpose').value = 'Purpose';
    globalThis.document.getElementById('f-tool-type').value = 'summarisation';
    globalThis.document.getElementById('f-deployment').value = 'org-approved';
    globalThis.document.getElementById('f-input-lang').value = 'English';
    globalThis.document.getElementById('f-output-lang').value = 'English';
  });

  afterEach(() => {
    delete globalThis.__ATC_SKIP_INIT__;
  });

  it('export JSON works from in-memory state when save fails', () => {
    const persisted = app.__testFinalizeForExport();
    assert.equal(persisted, false);
    const exported = JSON.parse(app.__testExportJson());
    assert.equal(exported.step1.name, 'Export test');
    assert.ok(globalThis.document.getElementById('live-region').textContent.length > 0);
  });
});
