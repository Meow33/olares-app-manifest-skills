#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const defaultLocales = ['en-US', 'zh-CN', 'fr-FR', 'de-DE', 'ja-JP', 'it-IT', 'es-ES'];
const required = [
  ['metadata', 'title'],
  ['metadata', 'description'],
  ['spec', 'fullDescription'],
  ['spec', 'upgradeDescription'],
];
const errors = [];
const warnings = [];

function usage(message) {
  if (message) console.error(`ERROR ${message}\n`);
  console.error('Usage: validate-manifests.mjs [root] [--source locale] [--locales a,b,...] [--file name] [--map file.json]');
  process.exit(2);
}

function parseArgs(argv) {
  const options = {
    root: '.',
    source: 'en-US',
    locales: [...defaultLocales],
    fileName: 'OlaresManifest.yaml',
    mapFile: null,
  };
  let rootSet = false;
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = () => {
      const value = argv[++index];
      if (!value) usage(`${arg} requires a value`);
      return value;
    };
    if (arg === '--source') options.source = next();
    else if (arg === '--locales') options.locales = next().split(',').map((item) => item.trim()).filter(Boolean);
    else if (arg === '--file') options.fileName = next();
    else if (arg === '--map') options.mapFile = next();
    else if (arg === '--help' || arg === '-h') usage();
    else if (arg.startsWith('-')) usage(`unknown option: ${arg}`);
    else if (!rootSet) {
      options.root = arg;
      rootSet = true;
    } else usage(`unexpected argument: ${arg}`);
  }
  if (!options.locales.includes(options.source)) options.locales.unshift(options.source);
  return options;
}

const options = parseArgs(process.argv.slice(2));

function resolveManifestMap() {
  if (options.mapFile) {
    const mapFile = path.resolve(options.mapFile);
    let parsed;
    try {
      parsed = JSON.parse(fs.readFileSync(mapFile, 'utf8'));
    } catch (error) {
      usage(`unable to read manifest map ${mapFile}: ${error.message}`);
    }
    if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') usage('manifest map must be a JSON object');
    const base = path.dirname(mapFile);
    return new Map(options.locales.map((locale) => {
      const mapped = parsed[locale];
      if (typeof mapped !== 'string' || !mapped) usage(`manifest map is missing ${locale}`);
      return [locale, path.resolve(base, mapped)];
    }));
  }

  const inputRoot = path.resolve(options.root);
  const directSource = path.join(inputRoot, options.source, options.fileName);
  const nestedRoot = path.join(inputRoot, 'i18n');
  const nestedSource = path.join(nestedRoot, options.source, options.fileName);
  const localeRoot = fs.existsSync(directSource) || !fs.existsSync(nestedSource) ? inputRoot : nestedRoot;
  return new Map(options.locales.map((locale) => [locale, path.join(localeRoot, locale, options.fileName)]));
}

const manifestFiles = resolveManifestMap();

function parseTargetFields(text, file) {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const found = new Map();
  let section = null;
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const top = line.match(/^(metadata|spec):\s*(?:#.*)?$/);
    if (top) {
      section = top[1];
      continue;
    }
    if (/^[^\s#][^:]*:/.test(line)) section = null;
    if (!section) continue;
    const field = line.match(/^  (title|description|fullDescription|upgradeDescription):(?:\s*(.*))?$/);
    if (!field) continue;
    const key = `${section}.${field[1]}`;
    if (found.has(key)) errors.push(`${file}: duplicate ${key}`);
    const raw = field[2] ?? '';
    let value = raw.trim();
    if (/^[|>][+-]?$/.test(value)) {
      const block = [];
      for (let cursor = index + 1; cursor < lines.length; cursor += 1) {
        if (lines[cursor].trim() && !/^    /.test(lines[cursor])) break;
        block.push(lines[cursor].replace(/^    /, ''));
        index = cursor;
      }
      value = block.join('\n').trim();
    }
    found.set(key, value.replace(/^(['"])(.*)\1$/, '$2'));
  }
  return found;
}

function protectedTokens(value) {
  return [
    ...(value.match(/`[^`]+`/g) || []),
    ...(value.match(/https?:\/\/[^\s)>]+/g) || []),
    ...(value.match(/\b(?:v?\d+(?:\.\d+){1,3}(?:[-+][A-Za-z0-9.-]+)?)\b/g) || []),
  ].sort();
}

function structuralTokens(value) {
  return [
    ...(value.match(/\{\{?[A-Za-z_][A-Za-z0-9_.-]*\}?\}/g) || []).map((token) => `placeholder:${token}`),
    ...(value.match(/<\/?[A-Za-z][^>]*>/g) || []).map((token) => {
      const match = token.match(/^<(\/)?([A-Za-z][A-Za-z0-9-]*)/);
      return `html:${match?.[1] || ''}${match?.[2] || token}`;
    }),
    ...(value.match(/\[[^\]]*\]\(([^)]+)\)/g) || []).map((link) => `link-target:${link.replace(/^.*\]\(/, '').slice(0, -1)}`),
    ...(value.match(/^#{1,6}\s+/gm) || []).map((heading) => `heading:${heading.trim().length - 1}`),
    ...(value.match(/^\s*[-*+]\s+/gm) || []).map(() => 'list-item'),
  ].sort();
}

const manifests = new Map();
for (const locale of options.locales) {
  const file = manifestFiles.get(locale);
  if (!fs.existsSync(file)) {
    errors.push(`${file}: missing required locale manifest`);
    continue;
  }
  const text = fs.readFileSync(file, 'utf8');
  const fields = parseTargetFields(text, file);
  for (const [section, name] of required) {
    const key = `${section}.${name}`;
    if (!fields.has(key)) errors.push(`${file}: missing ${key}`);
    else if (!fields.get(key) && key !== 'spec.upgradeDescription') errors.push(`${file}: empty ${key}`);
  }
  const short = fields.get('metadata.description') || '';
  if (/[.!?。！？]$/.test(short)) warnings.push(`${file}: metadata.description ends with punctuation`);
  manifests.set(locale, fields);
}

const source = manifests.get(options.source);
if (source) {
  for (const locale of options.locales.filter((locale) => locale !== options.source)) {
    const target = manifests.get(locale);
    if (!target) continue;
    if (target.get('metadata.title') !== source.get('metadata.title')) {
      warnings.push(`${locale}: title differs from ${options.source}; confirm that an official localized product name exists`);
    }
    for (const [section, name] of required) {
      const key = `${section}.${name}`;
      const expected = protectedTokens(source.get(key) || '');
      const actual = protectedTokens(target.get(key) || '');
      if (JSON.stringify(expected) !== JSON.stringify(actual)) {
        errors.push(`${locale}: protected code, URL, or version tokens differ in ${key}`);
      }
      const expectedStructure = structuralTokens(source.get(key) || '');
      const actualStructure = structuralTokens(target.get(key) || '');
      if (JSON.stringify(expectedStructure) !== JSON.stringify(actualStructure)) {
        errors.push(`${locale}: placeholders, HTML, links, headings, or list structure differ in ${key}`);
      }
    }
    const sameLongCopy = ['description', 'fullDescription', 'upgradeDescription'].filter((name) => {
      const key = name === 'description' ? 'metadata.description' : `spec.${name}`;
      const value = source.get(key) || '';
      return value.length > 20 && value === (target.get(key) || '');
    });
    if (sameLongCopy.length) warnings.push(`${locale}: unchanged English text in ${sameLongCopy.join(', ')}`);
  }
}

for (const warning of warnings) console.warn(`WARN ${warning}`);
for (const error of errors) console.error(`ERROR ${error}`);
if (errors.length) {
  console.error(`\nValidation failed with ${errors.length} error(s) and ${warnings.length} warning(s).`);
  process.exit(1);
}
console.log(`Validated ${manifests.size} locale manifest(s) with ${warnings.length} warning(s).`);
