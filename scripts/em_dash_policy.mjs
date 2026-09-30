import { readFileSync, statSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const defaultRoot = join(__dirname, '..');
const EM_DASH = '\u2014';

/** Verbatim external quotations that may contain U+2014. SAFE AI tier quotes contain none. */
export const ALLOWED_EM_DASH_QUOTATIONS = [];

const SKIP_DIRS = new Set(['node_modules', '.git']);
const TEXT_SUFFIXES = [
  '.md', '.html', '.json', '.js', '.mjs', '.css', '.yml', '.yaml', '.cff', '.txt', '.sh'
];

export function findEmDashViolations(searchRoot = defaultRoot, allowed = ALLOWED_EM_DASH_QUOTATIONS) {
  const errors = [];
  function walk(dir) {
    for (const name of readdirSync(dir)) {
      if (SKIP_DIRS.has(name)) continue;
      const p = join(dir, name);
      const st = statSync(p);
      if (st.isDirectory()) {
        walk(p);
        continue;
      }
      if (!TEXT_SUFFIXES.some((suffix) => name.endsWith(suffix))) continue;
      let content = readFileSync(p, 'utf8');
      for (const quotation of allowed) {
        content = content.split(quotation).join('');
      }
      const rel = p.slice(searchRoot.length + 1);
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(EM_DASH)) {
          errors.push(`${rel}:${i + 1}: em dash (U+2014) found`);
        }
      }
    }
  }
  walk(searchRoot);
  return errors;
}
