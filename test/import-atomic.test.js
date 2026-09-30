import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createEmptyState } from '../web/js/core/card.js';

globalThis.__ATC_SKIP_INIT__ = true;

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const sample = JSON.parse(readFileSync(join(root, 'web/data/samples/sample-tier1-green.json'), 'utf8'));

function input(id, value = '') {
  const el = document.createElement('input');
  el.id = id;
  el.value = value;
  return el;
}

function textarea(id, value = '') {
  const el = document.createElement('textarea');
  el.id = id;
  el.value = value;
  return el;
}

function select(id, value = '') {
  const el = document.createElement('select');
  el.id = id;
  el.value = value;
  return el;
}

function view(id, hidden = false) {
  const el = document.createElement('section');
  el.id = id;
  el.className = 'view';
  el.hidden = hidden;
  return el;
}

function buildImportTestDom() {
  const nodes = new Map();
  const body = {
    appendChild(el) { return el; },
    replaceChildren() { nodes.clear(); }
  };
  globalThis.document = {
    body,
    documentElement: { lang: 'en' },
    createElement(tag) {
      const classes = new Set();
      const el = {
        tagName: tag.toUpperCase(),
        id: '',
        className: '',
        hidden: false,
        value: '',
        checked: false,
        name: '',
        type: '',
        dataset: {},
        classList: {
          contains: (c) => classes.has(c),
          add: (c) => classes.add(c)
        },
        appendChild() {},
        replaceChildren() {},
        setAttribute() {},
        addEventListener() {},
        focus() {},
        scrollIntoView() {}
      };
      Object.defineProperty(el, 'className', {
        get: () => [...classes].join(' '),
        set: (v) => {
          classes.clear();
          for (const c of String(v).split(/\s+/).filter(Boolean)) classes.add(c);
        }
      });
      return el;
    },
    getElementById(id) {
      return nodes.get(id) ?? null;
    },
    querySelector(sel) {
      if (sel === '.view:not([hidden])') {
        return [...nodes.values()].find((el) => el.className === 'view' && !el.hidden) ?? null;
      }
      if (sel.startsWith('[data-safeguard=')) return null;
      if (sel.startsWith('input[name="impact-')) {
        const m = sel.match(/name="([^"]+)"/);
        const val = sel.match(/value="([^"]+)"/);
        if (!m) return null;
        return [...nodes.values()].find((el) => el.name === m[1] && (!val || el.value === val[1])) ?? null;
      }
      if (sel === '.site-header') return null;
      return null;
    },
    querySelectorAll(sel) {
      if (sel === '.step-panel') {
        return [...nodes.values()].filter((el) => el.classList?.contains?.('step-panel') || el.className === 'step-panel');
      }
      if (sel.startsWith('input[name="impact-')) {
        const m = sel.match(/name="([^"]+)"/);
        return [...nodes.values()].filter((el) => el.name === m[1]);
      }
      return [];
    }
  };

  const append = (el) => {
    nodes.set(el.id, el);
    body.appendChild(el);
  };

  append(view('view-home', false));
  append(view('view-wizard', true));

  for (let n = 1; n <= 6; n++) {
    const panel = document.createElement('div');
    panel.className = 'step-panel';
    panel.dataset.step = String(n);
    panel.hidden = n !== 5;
    panel.id = `step-${n}`;
    const title = document.createElement('h2');
    title.id = `step-${n}-title`;
    panel.appendChild(title);
    append(panel);
  }

  const nav = document.createElement('nav');
  nav.id = 'steps-nav';
  append(nav);
  const back = input('btn-back');
  back.id = 'btn-back';
  append(back);
  const next = input('btn-next');
  next.id = 'btn-next';
  append(next);
  const save = input('btn-save');
  save.id = 'btn-save';
  append(save);

  append(input('f-name', 'Tool name'));
  append(textarea('f-purpose', 'Purpose'));
  append(input('f-team', 'Team'));
  append(input('f-accountable', 'Role'));
  append(select('f-tool-type', 'summarisation'));
  append(select('f-deployment', 'org-approved'));
  append(input('f-input-lang', 'English'));
  append(input('f-output-lang', 'English'));
  append(input('f-next-review', '2026-12-01'));

  for (const id of ['D1', 'D2', 'D3', 'D4']) {
    const box = input(`data-${id}`);
    box.type = 'checkbox';
    append(box);
  }

  for (const id of ['I1', 'I2', 'I3', 'I4']) {
    for (const value of ['yes', 'no']) {
      const radio = input(`impact-${id}-${value}`);
      radio.type = 'radio';
      radio.name = `impact-${id}`;
      radio.value = value;
      if (value === 'no') radio.checked = true;
      append(radio);
    }
  }

  const communityValues = {
    'c-inform-what': '  Keep my community text  ',
    'c-inform-channels': ' channels ',
    'c-inform-languages': '',
    'c-inform-formats': '',
    'c-inform-when': '',
    'c-complain-channel': '',
    'c-complain-time': '',
    'c-complain-handover': '',
    'c-consult-who': '',
    'c-consult-when': '',
    'c-consult-method': '',
    'c-consult-influence': '',
    'c-feedback-how': '',
    'c-inclusion': ''
  };
  for (const [id, value] of Object.entries(communityValues)) {
    append(id.startsWith('c-consult-influence') || id === 'c-inform-what' ? textarea(id, value) : input(id, value));
  }

  for (const id of [
    'safeguards-fieldset',
    'card-content',
    'card-preview-content',
    'decision-preview',
    'tier-result',
    'community-req-note',
    'live-region'
  ]) {
    const el = document.createElement('div');
    el.id = id;
    append(el);
  }

  for (const id of ['import-error-summary-home', 'import-error-summary-wizard']) {
    const summary = document.createElement('div');
    summary.id = id;
    summary.hidden = true;
    const list = document.createElement('ul');
    list.id = `${id}-list`;
    summary.appendChild(list);
    append(summary);
  }

  globalThis.requestAnimationFrame = (fn) => fn();
  globalThis.window = { scrollTo() {}, scrollY: 0 };
}

describe('atomic import via handleImport', () => {
  /** @type {typeof import('../web/js/ui/app.js')} */
  let app;

  beforeEach(async () => {
    globalThis.__ATC_SKIP_INIT__ = true;
    buildImportTestDom();
    app = await import('../web/js/ui/app.js');
    const state = createEmptyState();
    state.step1.name = 'Existing tool';
    state.step1.purpose = 'Existing purpose';
    state.step1.toolType = 'summarisation';
    state.step1.deployment = 'org-approved';
    state.step1.inputLanguages = 'English';
    state.step1.outputLanguages = 'English';
    state.community.informWhat = '  Keep my community text  ';
    app.__testSetWizardState(state, JSON.parse(JSON.stringify(state)), 5);
  });

  afterEach(() => {
    delete globalThis.__ATC_SKIP_INIT__;
  });

  it('leaves raw form fields and state unchanged after rejected import', async () => {
    const beforeSnapshot = app.captureFormSnapshot();
    const invalid = { ...sample };
    delete invalid.attribution;

    class MockReader {
      constructor() {
        this.result = JSON.stringify(invalid);
        this.onerror = null;
        this.onload = null;
      }
      readAsText() {
        queueMicrotask(() => this.onload?.());
      }
    }
    globalThis.FileReader = MockReader;

    app.handleImport({ size: 100 }, null);
    await new Promise((resolve) => queueMicrotask(resolve));

    const afterSnapshot = app.captureFormSnapshot();
    assert.equal(afterSnapshot.community.informWhat, beforeSnapshot.community.informWhat);
    assert.equal(afterSnapshot.community.informWhat, '  Keep my community text  ');
    assert.deepEqual(afterSnapshot.state, beforeSnapshot.state);
    assert.deepEqual(afterSnapshot.step1, beforeSnapshot.step1);
  });

  it('captureFormSnapshot does not trim community fields', () => {
    const snapshot = app.captureFormSnapshot();
    assert.equal(snapshot.community.informWhat, '  Keep my community text  ');
    assert.equal(snapshot.community.informChannels, ' channels ');
  });
});
