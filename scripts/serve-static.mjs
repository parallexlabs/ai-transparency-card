import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname, resolve } from 'node:path';

const mime = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png'
};

const SECURITY_HEADERS = {
  'Content-Security-Policy': "frame-ancestors 'none'"
};

/**
 * @param {string} urlPath
 * @param {string} basePath
 */
function matchesBasePath(urlPath, basePath) {
  if (urlPath === basePath || urlPath === `${basePath}/`) return true;
  return urlPath.startsWith(`${basePath}/`);
}

/**
 * @param {string} webRoot absolute path to static site root
 * @param {string} basePath URL base path (e.g. /ai-transparency-card)
 */
export function createStaticHandler(webRoot, basePath) {
  const rootResolved = resolve(webRoot);

  return (req, res) => {
    let urlPath;
    try {
      urlPath = decodeURIComponent(req.url.split('?')[0]);
    } catch {
      res.writeHead(400, SECURITY_HEADERS);
      res.end('Bad request');
      return;
    }

    if (urlPath === basePath || urlPath === `${basePath}/`) {
      urlPath = `${basePath}/index.html`;
    }
    if (!matchesBasePath(urlPath, basePath)) {
      res.writeHead(404, SECURITY_HEADERS);
      res.end('Not found');
      return;
    }
    const rel = urlPath.slice(basePath.length) || '/index.html';
    const filePath = resolve(join(webRoot, rel));
    if (!filePath.startsWith(rootResolved + '/') && filePath !== rootResolved) {
      res.writeHead(403, SECURITY_HEADERS);
      res.end('Forbidden');
      return;
    }
    try {
      if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
        res.writeHead(404, SECURITY_HEADERS);
        res.end('Not found');
        return;
      }
      const body = readFileSync(filePath);
      res.writeHead(200, {
        'Content-Type': mime[extname(filePath)] || 'application/octet-stream',
        ...SECURITY_HEADERS
      });
      res.end(body);
    } catch {
      res.writeHead(500, SECURITY_HEADERS);
      res.end('Internal server error');
    }
  };
}

export function startStaticServer(webRoot, basePath, port) {
  return new Promise((resolvePromise) => {
    const server = createServer(createStaticHandler(webRoot, basePath));
    server.listen(port, '127.0.0.1', () => resolvePromise(server));
  });
}
