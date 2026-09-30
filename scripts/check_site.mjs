#!/usr/bin/env node
import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { startStaticServer } from './serve-static.mjs';
import { findEmDashViolations } from './em_dash_policy.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const webRoot = join(root, 'web');
const BASE = '/ai-transparency-card';
const PORT = 4175;

function extractRefs(html, file) {
  const refs = [];
  const attrRe = /\b(?:href|src)=["']([^"']+)["']/gi;
  let m;
  while ((m = attrRe.exec(html)) !== null) {
    refs.push({ attr: m[0].startsWith('href') ? 'href' : 'src', value: m[1], file });
  }
  return refs;
}

function crawl() {
  const errors = [];
  const visited = new Set();
  const queue = [`${BASE}/index.html`, `${BASE}/method.html`];

  while (queue.length) {
    const urlPath = queue.shift();
    if (visited.has(urlPath)) continue;
    visited.add(urlPath);

    const rel = urlPath.slice(BASE.length) || '/index.html';
    const filePath = join(webRoot, rel);

    if (!existsSync(filePath)) {
      errors.push(`Missing page: ${urlPath}`);
      continue;
    }

    const html = readFileSync(filePath, 'utf8');
    if (/\b(?:href|src)=["']\/(?!\/)/.test(html)) {
      errors.push(`Root-absolute path in ${rel}`);
    }

    const refs = extractRefs(html, rel);
    for (const ref of refs) {
      const v = ref.value.split('#')[0];
      if (!v) continue;
      if (v.startsWith('http') || v.startsWith('mailto:') || v.startsWith('#') || v.startsWith('data:')) continue;
      if (v.startsWith('/')) {
        errors.push(`Root-absolute ${ref.attr} in ${rel}: ${v}`);
        continue;
      }
      const targetPath = resolve(dirname(join(webRoot, rel)), v).split(webRoot)[1];
      const abs = join(webRoot, targetPath.replace(/^\//, ''));
      if (!existsSync(abs)) {
        errors.push(`Broken ${ref.attr} in ${rel}: ${v} -> ${abs}`);
      } else if (v.endsWith('.html') || v.endsWith('/')) {
        queue.push(`${BASE}/${targetPath.replace(/^\//, '')}`);
      }
    }
  }

  return { errors, pageCount: visited.size, pages: [...visited] };
}

function checkModuleGraph() {
  const errors = [];
  const jsFiles = [];
  function walk(dir) {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name);
      if (statSync(p).isDirectory()) walk(p);
      else if (name.endsWith('.js')) jsFiles.push(p);
    }
  }
  walk(join(webRoot, 'js'));
  for (const file of jsFiles) {
    const src = readFileSync(file, 'utf8');
    const imports = [...src.matchAll(/from\s+['"]([^'"]+)['"]/g)];
    for (const imp of imports) {
      const spec = imp[1];
      if (spec.startsWith('.')) {
        const resolved = resolve(dirname(file), spec);
        const candidates = [resolved, `${resolved}.js`];
        if (!candidates.some((c) => existsSync(c))) {
          errors.push(`Broken import in ${file}: ${spec}`);
        }
      }
    }
  }
  return errors;
}

async function checkWithPlaywright(pages) {
  let chromium;
  try {
    ({ chromium } = await import('playwright'));
  } catch {
    return { ok: false, method: 'module-graph', errors: ['Playwright not installed'] };
  }

  const errors = [];
  const consoleErrors = [];
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', (err) => consoleErrors.push(err.message));

  for (const urlPath of pages) {
    consoleErrors.length = 0;
    await page.goto(`http://127.0.0.1:${PORT}${urlPath}`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(500);
    if (consoleErrors.length) errors.push(`${urlPath}: ${consoleErrors.join('; ')}`);
  }

  await browser.close();
  return { ok: errors.length === 0, method: 'playwright-chromium', errors };
}

const emDashErrors = findEmDashViolations();
const server = await startStaticServer(webRoot, BASE, PORT);
const { errors: crawlErrors, pageCount, pages } = crawl();
const graphErrors = checkModuleGraph();
const allErrors = [...emDashErrors, ...crawlErrors, ...graphErrors];

let browserResult = { ok: true, method: 'none', errors: [] };
if (!allErrors.length) {
  browserResult = await checkWithPlaywright(pages);
  allErrors.push(...browserResult.errors);
}

server.close();

if (allErrors.length) {
  console.error('check:site FAILED\n' + allErrors.join('\n'));
  process.exit(1);
}
console.log(`check:site OK (${pageCount} pages at ${BASE}, browser check: ${browserResult.method})`);
