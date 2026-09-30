import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createStaticHandler, startStaticServer } from '../scripts/serve-static.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const webRoot = join(root, 'web');
const BASE = '/ai-transparency-card';

function request(handler, path) {
  return new Promise((resolve) => {
    const res = {
      statusCode: 0,
      headers: {},
      end(body) {
        resolve({ status: this.statusCode, headers: this.headers, body });
      },
      writeHead(code, headers) {
        this.statusCode = code;
        this.headers = headers;
      }
    };
    handler({ url: path }, res);
  });
}

describe('serve-static hardening', () => {
  const handler = createStaticHandler(webRoot, BASE);

  it('returns 400 for malformed URI escapes', async () => {
    const res = await request(handler, `${BASE}/%ZZ`);
    assert.equal(res.status, 400);
  });

  it('serves subsequent requests after malformed URI', async () => {
    await request(handler, `${BASE}/%ZZ`);
    const ok = await request(handler, `${BASE}/index.html`);
    assert.equal(ok.status, 200);
    assert.equal(ok.headers['Content-Security-Policy'], "frame-ancestors 'none'");
  });

  it('rejects base path without segment boundary', async () => {
    const res = await request(handler, `${BASE}extra/index.html`);
    assert.equal(res.status, 404);
  });

  it('startStaticServer keeps running after bad request', async () => {
    const server = await startStaticServer(webRoot, BASE, 4178);
    const bad = await fetch(`http://127.0.0.1:4178${BASE}/%ZZ`);
    assert.equal(bad.status, 400);
    const good = await fetch(`http://127.0.0.1:4178${BASE}/index.html`);
    assert.equal(good.status, 200);
    assert.equal(good.headers.get('content-security-policy'), "frame-ancestors 'none'");
    await new Promise((resolve) => server.close(resolve));
  });
});
