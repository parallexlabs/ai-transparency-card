#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outPath = join(root, 'web/js/core/card-validator.js');
const before = readFileSync(outPath, 'utf8');

execSync('node scripts/generate_validator.mjs', { cwd: root, stdio: 'pipe' });

const after = readFileSync(outPath, 'utf8');
if (before !== after) {
  console.error('card-validator.js is stale: run npm run gen:validator and commit the result');
  process.exit(1);
}
console.log('check:validator OK');
