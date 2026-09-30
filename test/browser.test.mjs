import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import AxeBuilder from '@axe-core/playwright';
import { startStaticServer } from '../scripts/serve-static.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const webRoot = join(root, 'web');
const BASE = '/ai-transparency-card';
const PORT = 4176;

function trackOffOrigin(page) {
  const offOrigin = [];
  page.on('request', (req) => {
    const url = new URL(req.url());
    if (url.origin !== `http://127.0.0.1:${PORT}`) offOrigin.push(req.url());
  });
  return offOrigin;
}

async function runAxe(page) {
  const results = await new AxeBuilder({ page }).include('body').analyze();
  assert.equal(results.violations.length, 0, JSON.stringify(results.violations, null, 2));
}

function pdfPageCount(buffer) {
  const text = buffer.toString('latin1');
  return (text.match(/\/Type\s*\/Page\b/g) || []).length;
}

async function loadSample(page, n) {
  await page.goto(`http://127.0.0.1:${PORT}${BASE}/index.html`, { waitUntil: 'networkidle' });
  await page.locator('.sample-menu').evaluate((el) => el.setAttribute('open', ''));
  await page.click(`#btn-sample-${n}`);
  await page.waitForSelector('#step-6:not([hidden])');
  await page.waitForFunction(() => {
    const preview = document.getElementById('card-preview-content');
    const print = document.getElementById('card-content');
    const target = preview?.offsetParent ? preview : print;
    return target?.childElementCount > 0;
  });
}

describe('browser (Playwright)', () => {
  let server;
  let browser;

  before(async () => {
    server = await startStaticServer(webRoot, BASE, PORT);
    const { chromium } = await import('playwright');
    browser = await chromium.launch({ headless: true });
  });

  after(async () => {
    await browser?.close();
    await new Promise((resolve) => server?.close(resolve));
  });

  it('loads index without console errors', async () => {
    const context = await browser.newContext();
    const page = await context.newPage();
    const offOrigin = trackOffOrigin(page);
    const errors = [];
    page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto(`http://127.0.0.1:${PORT}${BASE}/index.html`, { waitUntil: 'networkidle' });
    assert.equal(errors.length, 0, errors.join('; '));
    assert.equal(offOrigin.length, 0, offOrigin.join(', '));
    await runAxe(page);
    await context.close();
  });

  it('rejects path traversal on dev server', async () => {
    const context = await browser.newContext();
    const page = await context.newPage();
    const res = await page.goto(`http://127.0.0.1:${PORT}${BASE}/../package.json`);
    assert.ok(res.status() === 403 || res.status() === 404);
    await context.close();
  });

  it('full flow in English via keyboard', async () => {
    const context = await browser.newContext();
    const page = await context.newPage();
    const offOrigin = trackOffOrigin(page);
    await page.goto(`http://127.0.0.1:${PORT}${BASE}/index.html`, { waitUntil: 'networkidle' });
    await runAxe(page);

    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    await page.focus('#btn-start');
    await page.keyboard.press('Enter');
    await page.fill('#f-name', 'Test use');
    await page.fill('#f-purpose', 'Testing purpose');
    await page.fill('#f-accountable', 'Test lead');
    await page.selectOption('#f-tool-type', 'summarisation');
    await page.selectOption('#f-deployment', 'org-approved');
    await page.fill('#f-input-lang', 'English');
    await page.fill('#f-output-lang', 'English');
    await runAxe(page);
    await page.click('#btn-next');

    await page.check('input[name="impact-I4"][value="yes"]');
    await page.check('input[name="impact-I1"][value="no"]');
    await page.check('input[name="impact-I2"][value="no"]');
    await page.check('input[name="impact-I3"][value="no"]');
    await runAxe(page);
    await page.click('#btn-next');

    await page.click('#btn-next');

    for (const id of ['S_ACCOUNTABLE_ROLE', 'S_OUTPUT_REVIEW', 'S_USER_TRAINING', 'S_DATA_MINIMISATION', 'S_RECORD_OF_USE']) {
      await page.check(`#sg-${id}`);
    }
    await runAxe(page);
    await page.click('#btn-next');
    await page.click('#btn-next');

    await page.fill('#f-next-review', '2027-01-01');
    await runAxe(page);
    await page.waitForFunction(() => {
      const el = document.getElementById('card-preview-content') || document.getElementById('card-content');
      return el && el.childElementCount > 0;
    });
    await runAxe(page);
    assert.equal(offOrigin.length, 0, offOrigin.join(', '));
    await context.close();
  });

  it('full flow in French shows French card title', async () => {
    const context = await browser.newContext();
    const page = await context.newPage();
    const offOrigin = trackOffOrigin(page);
    await page.goto(`http://127.0.0.1:${PORT}${BASE}/index.html`, { waitUntil: 'networkidle' });
    await page.click('#lang-switch');
    assert.equal(await page.getAttribute('html', 'lang'), 'fr');
    await loadSample(page, 1);
    await runAxe(page);
    const title = await page.textContent('#card-heading');
    assert.match(title, /Fiche de transparence/i);
    assert.equal(offOrigin.length, 0, offOrigin.join(', '));
    await context.close();
  });

  it('malicious name renders as literal text not HTML', async () => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(`http://127.0.0.1:${PORT}${BASE}/index.html`, { waitUntil: 'networkidle' });
    await page.click('#btn-start');
    await page.fill('#f-name', '<h2 id="forged">APPROVED</h2>');
    await page.fill('#f-purpose', 'Test');
    await page.fill('#f-accountable', 'Lead');
    await page.selectOption('#f-tool-type', 'summarisation');
    await page.selectOption('#f-deployment', 'org-approved');
    await page.fill('#f-input-lang', 'English');
    await page.fill('#f-output-lang', 'English');
    await page.click('#btn-next');
    await page.check('input[name="impact-I4"][value="yes"]');
    for (const id of ['I1', 'I2', 'I3']) await page.check(`input[name="impact-${id}"][value="no"]`);
    await page.click('#btn-next');
    await page.click('#btn-next');
    for (const id of ['S_ACCOUNTABLE_ROLE', 'S_OUTPUT_REVIEW', 'S_USER_TRAINING', 'S_DATA_MINIMISATION', 'S_RECORD_OF_USE']) {
      await page.check(`#sg-${id}`);
    }
    await page.click('#btn-next');
    await page.click('#btn-next');
    await page.waitForFunction(() => {
      const el = document.getElementById('card-preview-content') || document.getElementById('card-content');
      return el && el.childElementCount > 0;
    });
    const card = page.locator('#card-preview-content, #card-content').filter({ visible: true }).first();
    assert.equal(await card.locator('h2#forged').count(), 0);
    const text = await card.textContent();
    assert.ok(text.includes('<h2 id="forged">APPROVED</h2>'));
    await context.close();
  });

  it('step 4 preview reflects data screening changes', async () => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(`http://127.0.0.1:${PORT}${BASE}/index.html`, { waitUntil: 'networkidle' });
    await page.click('#btn-start');
    await page.fill('#f-name', 'Public tool');
    await page.fill('#f-purpose', 'Test');
    await page.fill('#f-accountable', 'Lead');
    await page.selectOption('#f-tool-type', 'public-chatbot');
    await page.selectOption('#f-deployment', 'public-consumer');
    await page.fill('#f-input-lang', 'English');
    await page.fill('#f-output-lang', 'English');
    await page.click('#btn-next');
    await page.check('input[name="impact-I4"][value="yes"]');
    for (const id of ['I1', 'I2', 'I3']) await page.check(`input[name="impact-${id}"][value="no"]`);
    await page.click('#btn-next');
    await page.check('#data-D2');
    await page.click('#btn-next');
    for (const id of ['S_ACCOUNTABLE_ROLE', 'S_OUTPUT_REVIEW', 'S_USER_TRAINING', 'S_DATA_MINIMISATION', 'S_RECORD_OF_USE']) {
      await page.check(`#sg-${id}`);
    }
    const box = page.locator('#decision-preview .decision-box').first();
    assert.ok(await box.evaluate((el) => el.classList.contains('red')));
    await context.close();
  });

  for (const width of [1280, 320]) {
    it(`step heading not covered by sticky header at ${width}px`, async () => {
      const context = await browser.newContext({ viewport: { width, height: 900 } });
      const page = await context.newPage();
      await page.goto(`http://127.0.0.1:${PORT}${BASE}/index.html`, { waitUntil: 'networkidle' });
      await page.click('#btn-start');
      await page.fill('#f-name', 'Test use');
      await page.fill('#f-purpose', 'Testing purpose');
      await page.fill('#f-accountable', 'Test lead');
      await page.selectOption('#f-tool-type', 'summarisation');
      await page.selectOption('#f-deployment', 'org-approved');
      await page.fill('#f-input-lang', 'English');
      await page.fill('#f-output-lang', 'English');
      await page.click('#btn-next');
      await page.waitForFunction(() => {
        const heading = document.getElementById('step-2-title');
        const header = document.querySelector('.site-header');
        if (!heading || !header) return false;
        const hRect = heading.getBoundingClientRect();
        const headerRect = header.getBoundingClientRect();
        return hRect.top >= headerRect.bottom - 2;
      });
      await context.close();
    });
  }

  for (const [n, decision] of [[1, 'green'], [2, 'amber'], [3, 'red']]) {
    it(`sample ${n} decision is ${decision}`, async () => {
      const context = await browser.newContext();
      const page = await context.newPage();
      await loadSample(page, n);
      await runAxe(page);
      const box = await page.locator('.decision-box').first();
      assert.ok(await box.evaluate((el, d) => el.classList.contains(d), decision));
      await context.close();
    });
  }

  for (const [n, format, btn] of [
    [1, 'letter', '#btn-print-letter'],
    [2, 'letter', '#btn-print-letter'],
    [3, 'letter', '#btn-print-letter'],
    [1, 'a4', '#btn-print-a4'],
    [2, 'a4', '#btn-print-a4'],
    [3, 'a4', '#btn-print-a4']
  ]) {
    it(`sample ${n} prints to one ${format} page via ${btn}`, async () => {
      const context = await browser.newContext();
      const page = await context.newPage();
      await loadSample(page, n);
      await page.click(btn);
      const hasA4 = await page.evaluate(() => document.body.classList.contains('print-a4'));
      await page.emulateMedia({ media: 'print' });
      if (format === 'a4') assert.ok(hasA4);
      const pdf = await page.pdf({
        format: format === 'a4' ? 'A4' : 'Letter',
        printBackground: true,
        margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' }
      });
      const count = pdfPageCount(pdf);
      assert.equal(count, 1, `expected 1 page, got ${count}`);
      await context.close();
    });
  }

  it('method page has no axe violations', async () => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(`http://127.0.0.1:${PORT}${BASE}/method.html`, { waitUntil: 'networkidle' });
    await runAxe(page);
    await context.close();
  });

  it('all-no impact answers show guidance on step 2', async () => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(`http://127.0.0.1:${PORT}${BASE}/index.html`, { waitUntil: 'networkidle' });
    await page.click('#btn-start');
    await page.fill('#f-name', 'Test use');
    await page.fill('#f-purpose', 'Testing purpose');
    await page.fill('#f-accountable', 'Test lead');
    await page.selectOption('#f-tool-type', 'summarisation');
    await page.selectOption('#f-deployment', 'org-approved');
    await page.fill('#f-input-lang', 'English');
    await page.fill('#f-output-lang', 'English');
    await page.click('#btn-next');
    for (const id of ['I1', 'I2', 'I3', 'I4']) {
      await page.check(`input[name="impact-${id}"][value="no"]`);
    }
    const text = await page.textContent('#tier-result');
    assert.match(text, /I4/);
    assert.match(text, /I3|organisation|organization/i);
    await context.close();
  });

  it('step 6 has only one save control', async () => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await loadSample(page, 1);
    const visible = await page.locator('#btn-save:visible, #btn-next:visible').allTextContents();
    const saveButtons = visible.filter((t) => /save|enregistrer/i.test(t));
    assert.equal(saveButtons.length, 1);
    await context.close();
  });

  it('desktop preview is visible at 1280px', async () => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    await loadSample(page, 1);
    const previewVisible = await page.locator('.card-preview').evaluate((el) => {
      const style = getComputedStyle(el);
      return style.display !== 'none' && el.offsetWidth > 0 && el.offsetHeight > 0;
    });
    assert.ok(previewVisible);
    const printHidden = await page.locator('#print-card').evaluate((el) => getComputedStyle(el).display === 'none');
    assert.ok(printHidden);
    await context.close();
  });

  it('French switch rerenders progress navigation on step 1', async () => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(`http://127.0.0.1:${PORT}${BASE}/index.html`, { waitUntil: 'networkidle' });
    await page.click('#btn-start');
    await page.click('#lang-switch');
    const status = await page.textContent('#step-progress-status');
    assert.match(status, /Étape 1 sur 6/i);
    assert.match(status, /Décrire l'utilisation/i);
    await context.close();
  });

  it('sample printable card includes synthetic notice', async () => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await loadSample(page, 1);
    const text = await page.locator('#print-card .card-synthetic-notice').textContent();
    assert.match(text, /Synthetic example/i);
    await page.emulateMedia({ media: 'print' });
    const pdf = await page.pdf({ format: 'Letter', printBackground: true });
    assert.equal(pdfPageCount(pdf), 1);
    await context.close();
  });

  it('dev server sends frame-ancestors CSP', async () => {
    const res = await fetch(`http://127.0.0.1:${PORT}${BASE}/index.html`);
    assert.equal(res.headers.get('content-security-policy'), "frame-ancestors 'none'");
  });

  it('unframed page renders normally', async () => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(`http://127.0.0.1:${PORT}${BASE}/index.html`, { waitUntil: 'networkidle' });
    const visibility = await page.evaluate(() => getComputedStyle(document.documentElement).visibility);
    assert.notEqual(visibility, 'hidden');
    assert.equal(await page.locator('#btn-start').isVisible(), true);
    await context.close();
  });

  it('home page offers download and delete for unreadable drafts', async () => {
    const context = await browser.newContext({ acceptDownloads: true });
    const page = await context.newPage();
    const corrupt = '{"broken":"draft"}';
    await page.goto(`http://127.0.0.1:${PORT}${BASE}/index.html`, { waitUntil: 'networkidle' });
    await page.evaluate((raw) => {
      localStorage.setItem('ai-transparency-card-draft', raw);
    }, corrupt);
    await page.reload({ waitUntil: 'networkidle' });
    await runAxe(page);

    const downloadBtn = page.getByRole('button', { name: /download unreadable draft/i });
    const deleteBtn = page.getByRole('button', { name: /delete unreadable draft/i });
    await downloadBtn.waitFor({ state: 'visible' });
    await deleteBtn.waitFor({ state: 'visible' });

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      downloadBtn.click()
    ]);
    const downloadPath = await download.path();
    assert.equal(await readFile(downloadPath, 'utf8'), corrupt);

    await deleteBtn.click();
    await page.waitForFunction(() => {
      const container = document.getElementById('invalid-draft-notices');
      return container?.hidden || container?.childElementCount === 0;
    });
    assert.equal(await deleteBtn.count(), 0);
    await context.close();
  });

  it('framed app document is hidden and not clickable', async () => {
    const context = await browser.newContext();
    const appUrl = `http://127.0.0.1:${PORT}${BASE}/index.html`;
    await context.route(appUrl, async (route) => {
      const response = await route.fetch();
      const headers = { ...response.headers() };
      delete headers['content-security-policy'];
      await route.fulfill({ response, headers });
    });
    const page = await context.newPage();
    await page.setContent(`<!DOCTYPE html><html><body>
      <iframe id="target" src="${appUrl}" width="800" height="600" title="Embedded app"></iframe>
    </body></html>`);
    const frame = page.frameLocator('#target');
    await frame.locator('html').waitFor({ state: 'attached' });
    const visibility = await frame.locator('html').evaluate((el) => getComputedStyle(el).visibility);
    assert.equal(visibility, 'hidden');
    assert.equal(await frame.locator('#btn-start').isVisible(), false);
    await context.close();
  });
});
