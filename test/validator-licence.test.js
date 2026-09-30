import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const validatorPath = join(root, 'web/js/core/card-validator.js');

describe('generated validator licence notices', () => {
  const WARRANTY = 'THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND';

  it('includes MIT notices for every vendored Ajv and ajv-formats piece', () => {
    execSync('node scripts/generate_validator.mjs', { cwd: root, stdio: 'pipe' });
    const source = readFileSync(validatorPath, 'utf8');
    assert.match(source, /Ajv ucs2length runtime helper \(MIT License\)/);
    assert.match(source, /ajv-formats vendored format validators \(MIT License\)/);
    assert.match(source, /Copyright \(c\) 2015-2021 Evgeny Poberezkin/);
    assert.match(source, /Permission is hereby granted, free of charge/);
    assert.match(source, new RegExp(WARRANTY));
    const mitBlocks = source.match(/\/\*[\s\S]*?MIT License[\s\S]*?\*\//g) ?? [];
    assert.ok(mitBlocks.length >= 3, `expected at least 3 MIT blocks, got ${mitBlocks.length}`);
  });

  it('includes complete MIT licence in ajv-formats helper files', () => {
    for (const file of ['ajv-formats-date.js', 'ajv-formats-uri.js']) {
      const source = readFileSync(join(root, 'web/js/core', file), 'utf8');
      assert.match(source, /MIT License/);
      assert.match(source, new RegExp(WARRANTY));
      assert.match(source, /Copyright \(c\) 2020 Evgeny Poberezkin/);
    }
  });
});
