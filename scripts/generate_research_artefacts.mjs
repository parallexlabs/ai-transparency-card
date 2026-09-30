#!/usr/bin/env node
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { startStaticServer } from './serve-static.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const webRoot = join(root, 'web');
const researchRoot = join(root, 'research');
const BASE = '/ai-transparency-card';
const PORT = 4177;

function pdfPageCount(buffer) {
  const text = buffer.toString('latin1');
  return (text.match(/\/Type\s*\/Page\b/g) || []).length;
}

async function setLanguage(page, lang) {
  await page.goto(`http://127.0.0.1:${PORT}${BASE}/index.html`, { waitUntil: 'networkidle' });
  const current = await page.getAttribute('html', 'lang');
  if (current !== lang) {
    await page.evaluate((l) => {
      localStorage.setItem('ai-transparency-card-lang', l);
    }, lang);
    await page.reload({ waitUntil: 'networkidle' });
  }
}

async function loadSample(page, n) {
  await page.goto(`http://127.0.0.1:${PORT}${BASE}/index.html`, { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.removeItem('ai-transparency-card-draft'));
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.waitForSelector('#view-home');
  await page.waitForSelector('#view-home:not([hidden])');
  await page.evaluate((sampleNum) => {
    document.querySelector('.sample-menu')?.setAttribute('open', '');
    document.getElementById(`btn-sample-${sampleNum}`)?.click();
  }, n);
  await page.waitForSelector('#step-6:not([hidden])');
  await page.waitForFunction(() => document.getElementById('card-content')?.childElementCount > 0);
}

async function fillStep1(page, lang) {
  await page.click('#btn-start');
  await page.fill('#f-name', lang === 'fr' ? 'Utilisation de démonstration' : 'Review artefact use');
  await page.fill('#f-purpose', lang === 'fr' ? 'Captures d\'écran pour la revue.' : 'Phase 2 review screenshot flow.');
  await page.fill('#f-accountable', lang === 'fr' ? 'Responsable de programme' : 'Programme lead');
  await page.selectOption('#f-tool-type', 'summarisation');
  await page.selectOption('#f-deployment', 'org-approved');
  await page.fill('#f-input-lang', lang === 'fr' ? 'Français' : 'English');
  await page.fill('#f-output-lang', lang === 'fr' ? 'Français' : 'English');
}

async function answerImpact(page) {
  await page.check('input[name="impact-I4"][value="yes"]');
  for (const id of ['I1', 'I2', 'I3']) {
    await page.check(`input[name="impact-${id}"][value="no"]`);
  }
}

async function checkBaseSafeguards(page) {
  for (const id of ['S_ACCOUNTABLE_ROLE', 'S_OUTPUT_REVIEW', 'S_USER_TRAINING', 'S_DATA_MINIMISATION', 'S_RECORD_OF_USE']) {
    await page.check(`#sg-${id}`);
  }
}

async function screenshotStep(page, lang, step, width, height) {
  await page.setViewportSize({ width, height: height || 900 });
  const dir = join(researchRoot, 'screenshots', lang);
  mkdirSync(dir, { recursive: true });
  const suffix = height ? `${width}x${height}` : `${width}w`;
  const path = join(dir, `step-${step}-${suffix}.png`);
  await page.screenshot({ path, fullPage: true });
  return path;
}

async function captureWizardScreenshots(page, lang) {
  await setLanguage(page, lang);
  await fillStep1(page, lang);

  await screenshotStep(page, lang, 1, 1280, 900);
  await screenshotStep(page, lang, 1, 320, 900);
  await page.click('#btn-next');

  await answerImpact(page);
  await screenshotStep(page, lang, 2, 1280, 900);
  await screenshotStep(page, lang, 2, 320, 900);
  await page.click('#btn-next');

  await screenshotStep(page, lang, 3, 1280, 900);
  await screenshotStep(page, lang, 3, 320, 900);
  await page.click('#btn-next');

  await checkBaseSafeguards(page);
  await screenshotStep(page, lang, 4, 1280, 900);
  await screenshotStep(page, lang, 4, 320, 900);
  await page.click('#btn-next');

  await screenshotStep(page, lang, 5, 1280, 900);
  await screenshotStep(page, lang, 5, 320, 900);
  await page.click('#btn-next');

  await page.fill('#f-next-review', '2027-01-01');
  await screenshotStep(page, lang, 6, 1280, 900);
  await screenshotStep(page, lang, 6, 320, 900);
}

async function exportSamplePdf(page, lang, sample, format) {
  await setLanguage(page, lang);
  await loadSample(page, sample);
  await page.evaluate((fmt) => {
    document.body.classList.remove('print-a4');
    if (fmt === 'a4') document.body.classList.add('print-a4');
  }, format);
  const notice = await page.locator('#print-card .card-synthetic-notice').textContent();
  if (!notice || !/Synthetic example|Exemple fictif/i.test(notice)) {
    throw new Error(`sample-${sample} (${lang}) is missing synthetic label in printable card`);
  }
  await page.emulateMedia({ media: 'print' });
  const dir = join(researchRoot, 'pdfs', lang);
  mkdirSync(dir, { recursive: true });
  const path = join(dir, `sample-${sample}-${format}.pdf`);
  const pdf = await page.pdf({
    format: format === 'a4' ? 'A4' : 'Letter',
    printBackground: true,
    margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' }
  });
  writeFileSync(path, pdf);
  return { path, pages: pdfPageCount(pdf) };
}

async function main() {
  mkdirSync(researchRoot, { recursive: true });
  const server = await startStaticServer(webRoot, BASE, PORT);
  const { chromium } = await import('playwright');
  const browser = await chromium.launch({ headless: true });
  const pageCounts = [];

  for (const lang of ['en', 'fr']) {
    const shotPage = await browser.newPage();
    await captureWizardScreenshots(shotPage, lang);
    await shotPage.close();
  }

  const pdfPage = await browser.newPage();
  for (const lang of ['en', 'fr']) {
    for (const sample of [1, 2, 3]) {
      for (const format of ['letter', 'a4']) {
        const { path, pages } = await exportSamplePdf(pdfPage, lang, sample, format);
        pageCounts.push({ path: path.replace(`${root}/`, ''), pages });
        if (pages !== 1) {
          throw new Error(`${path} has ${pages} pages, expected 1`);
        }
      }
    }
  }

  writeFileSync(
    join(researchRoot, 'PDF_PAGE_COUNTS.json'),
    JSON.stringify(pageCounts, null, 2)
  );

  await pdfPage.close();
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
  console.log('Research artefacts written to research/');
  for (const row of pageCounts) console.log(`${row.path}: ${row.pages} page(s)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
