#!/usr/bin/env node
import { startStaticServer } from './serve-static.mjs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const webRoot = join(root, 'web');
const BASE = '/ai-transparency-card';
const PORT = 4179;

const EXPECTED = "frame-ancestors 'none'";

function parseEnforcingCsp(headers) {
  const lines = headers.split(/\r?\n/);
  for (const line of lines) {
    const match = line.match(/^content-security-policy:\s*(.+)$/i);
    if (match) return match[1].trim();
  }
  return null;
}

function hasReportOnlyCsp(headers) {
  return /^content-security-policy-report-only:/im.test(headers);
}

const server = await startStaticServer(webRoot, BASE, PORT);
try {
  const res = await fetch(`http://127.0.0.1:${PORT}${BASE}/index.html`);
  const rawHeaders = [...res.headers.entries()]
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n');
  const csp = parseEnforcingCsp(rawHeaders);
  if (hasReportOnlyCsp(rawHeaders) && csp !== EXPECTED) {
    console.error('verify:headers FAILED: Report-Only CSP is not a substitute for enforcing CSP');
    process.exit(1);
  }
  if (csp !== EXPECTED) {
    console.error(`verify:headers FAILED: expected enforcing ${EXPECTED}, got ${csp}`);
    process.exit(1);
  }
  if (res.status !== 200) {
    console.error(`verify:headers FAILED: expected status 200, got ${res.status}`);
    process.exit(1);
  }
  console.log('verify:headers OK');
} finally {
  await new Promise((resolve) => server.close(resolve));
}
