#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import standaloneCode from 'ajv/dist/standalone/index.js';

const require = createRequire(import.meta.url);
const ucs2length = require('ajv/dist/runtime/ucs2length').default;

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const schemaPath = join(root, 'schema/card.schema.json');
const outPath = join(root, 'web/js/core/card-validator.js');
const uriSourcePath = join(root, 'web/js/core/ajv-formats-uri.js');
const dateSourcePath = join(root, 'web/js/core/ajv-formats-date.js');
const ajvLicensePath = join(dirname(require.resolve('ajv/package.json')), 'LICENSE');
const ajvFormatsLicensePath = join(dirname(require.resolve('ajv-formats/package.json')), 'LICENSE');

const schema = JSON.parse(readFileSync(schemaPath, 'utf8'));
const ajv = new Ajv2020({
  code: { source: true, esm: true, lines: true },
  allErrors: true,
  strict: false
});
addFormats(ajv);
const validate = ajv.compile(schema);
const raw = standaloneCode(ajv, validate);

function licenseBlock(title, licenseText) {
  const lines = licenseText.trim().split('\n').map((line) => ` * ${line}`);
  return `/*\n * ${title}\n${lines.join('\n')}\n */`;
}

const ajvLicense = readFileSync(ajvLicensePath, 'utf8');
const ajvFormatsLicense = readFileSync(ajvFormatsLicensePath, 'utf8');

function inlineVendoredFormat(sourcePath, fnName) {
  return readFileSync(sourcePath, 'utf8')
    .replace(/^export default function \w+/m, `function ${fnName}`)
    .trim();
}

const uriFn = inlineVendoredFormat(uriSourcePath, 'uriFormat');
const dateModule = inlineVendoredFormat(dateSourcePath, 'dateFormat');
const ucs2Notice = licenseBlock(
  'Ajv ucs2length runtime helper (MIT License). Source: ajv/dist/runtime/ucs2length',
  ajvLicense
);
const formatsNotice = licenseBlock(
  'ajv-formats vendored format validators (MIT License). Source: ajv-formats/dist/formats.js',
  ajvFormatsLicense
);

const moduleCode = raw
  .replace(
    'const func2 = require("ajv/dist/runtime/ucs2length").default;',
    `${ucs2Notice}\nconst func2 = ${ucs2length.toString()};`
  )
  .replace(
    'const formats0 = require("ajv-formats/dist/formats").fullFormats.date;',
    `${formatsNotice}\n${dateModule}\nconst formats0 = { validate: dateFormat };`
  )
  .replace(
    /const (formats\d+) = require\("ajv-formats\/dist\/formats"\)\.fullFormats\.uri;/,
    (_match, varName) => `${formatsNotice}\nconst ${varName} = ${uriFn};`
  );

const banner = `/* Generated from schema/card.schema.json: run npm run gen:validator */\n/* Vendored Ajv and ajv-formats code below is MIT-licensed; see inline notices. */\n`;
writeFileSync(outPath, banner + moduleCode);
console.log(`Wrote ${outPath} (${moduleCode.length} bytes)`);
