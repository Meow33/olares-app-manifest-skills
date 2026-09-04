#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { parseDocument } from 'yaml';

const defaultLocales = ['en-US', 'zh-CN', 'fr-FR', 'de-DE', 'ja-JP', 'it-IT', 'es-ES'];
const alwaysRequired = ['metadata.title', 'metadata.description', 'spec.fullDescription'];
const copyFields = [...alwaysRequired, 'spec.upgradeDescription'];
const diagnostics = [];

function usage(message) {
  if (message) console.error(`ERROR ${message}\n`);
  console.error('Usage: validate-manifests.mjs [root] [--source locale] [--locales a,b,...] [--file name] [--map file.json] [--format text|json] [--strict]');
  process.exit(2);
}

function parseArgs(argv) {
  const options = { root: '.', source: 'en-US', locales: null, fileName: 'OlaresManifest.yaml', mapFile: null, format: 'text', strict: false };
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
    else if (arg === '--format') options.format = next();
    else if (arg === '--strict') options.strict = true;
    else if (arg === '--help' || arg === '-h') usage();
    else if (arg.startsWith('-')) usage(`unknown option: ${arg}`);
    else if (!rootSet) { options.root = arg; rootSet = true; }
    else usage(`unexpected argument: ${arg}`);
  }
  if (!['text', 'json'].includes(options.format)) usage('--format must be text or json');
  return options;
}

const options = parseArgs(process.argv.slice(2));

function add(severity, code, message, details = {}) {
  diagnostics.push({ severity: severity === 'warning' && options.strict ? 'error' : severity, code, message, ...details });
}

function readYaml(file, label) {
  let text;
  try { text = fs.readFileSync(file, 'utf8'); }
  catch (error) { add('error', 'missing-file', `Unable to read ${label}: ${error.message}`, { file }); return null; }
  const document = parseDocument(text, { prettyErrors: true, uniqueKeys: true });
  for (const error of document.errors) add('error', 'invalid-yaml', error.message, { file });
  if (document.errors.length) return null;
  return { file, text, value: document.toJS() };
}

function get(object, key) {
  return key.split('.').reduce((value, part) => value?.[part], object);
}

function lineFor(text, key) {
  const [section, field] = key.split('.');
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  let active = false;
  for (let index = 0; index < lines.length; index += 1) {
    if (new RegExp(`^${section}:\\s*(?:#.*)?$`).test(lines[index])) active = true;
    else if (/^[^\s#][^:]*:/.test(lines[index])) active = false;
    if (active && new RegExp(`^\\s+${field}:`).test(lines[index])) return index + 1;
  }
  return undefined;
}

function normalizeLocaleList(value) {
  if (!Array.isArray(value)) return null;
  return value.filter((item) => typeof item === 'string' && item.trim()).map((item) => item.trim());
}

function resolveLayout() {
  if (options.mapFile) {
    const mapFile = path.resolve(options.mapFile);
    let mapping;
    try { mapping = JSON.parse(fs.readFileSync(mapFile, 'utf8')); }
    catch (error) { usage(`unable to read manifest map ${mapFile}: ${error.message}`); }
    if (!mapping || Array.isArray(mapping) || typeof mapping !== 'object') usage('manifest map must be a JSON object');
    const locales = options.locales || Object.keys(mapping);
    if (!locales.includes(options.source)) locales.unshift(options.source);
    const base = path.dirname(mapFile);
    return { locales, files: new Map(locales.map((locale) => [locale, mapping[locale] ? path.resolve(base, mapping[locale]) : null])), rootManifest: null };
  }

  const inputRoot = path.resolve(options.root);
  const nestedRoot = path.join(inputRoot, 'i18n');
  const nestedSource = path.join(nestedRoot, options.source, options.fileName);
  const localeRoot = fs.existsSync(nestedSource) ? nestedRoot : inputRoot;
  const appRoot = localeRoot === nestedRoot ? inputRoot : path.dirname(localeRoot);
  const rootManifestPath = path.join(appRoot, options.fileName);
  const rootManifest = fs.existsSync(rootManifestPath) ? readYaml(rootManifestPath, 'root manifest') : null;
  const declared = normalizeLocaleList(get(rootManifest?.value, 'spec.locale'));
  const discovered = fs.existsSync(localeRoot)
    ? fs.readdirSync(localeRoot, { withFileTypes: true }).filter((entry) => entry.isDirectory() && fs.existsSync(path.join(localeRoot, entry.name, options.fileName))).map((entry) => entry.name).sort()
    : [];
  const locales = options.locales || declared || (discovered.length ? discovered : [...defaultLocales]);
  if (!locales.includes(options.source)) locales.unshift(options.source);

  if (declared) {
    const expected = [...new Set(declared)].sort();
    const actual = [...new Set(discovered)].sort();
    const missing = expected.filter((locale) => !actual.includes(locale));
    const extra = actual.filter((locale) => !expected.includes(locale));
    if (missing.length || extra.length) add('error', 'locale-set-mismatch', 'spec.locale and locale directories differ', { file: rootManifestPath, expected, actual, missing, extra });
  }
  return { locales, files: new Map(locales.map((locale) => [locale, path.join(localeRoot, locale, options.fileName)])), rootManifest };
}

function count(items) {
  const result = new Map();
  for (const item of items) result.set(item, (result.get(item) || 0) + 1);
  return result;
}

function tokenDifference(expected, actual) {
  const expectedCount = count(expected);
  const actualCount = count(actual);
  const missing = [];
  const extra = [];
  for (const [token, amount] of expectedCount) for (let i = actualCount.get(token) || 0; i < amount; i += 1) missing.push(token);
  for (const [token, amount] of actualCount) for (let i = expectedCount.get(token) || 0; i < amount; i += 1) extra.push(token);
  return { missing, extra };
}

function extractTokens(value) {
  let remainder = typeof value === 'string' ? value : '';
  const tokens = [];
  remainder = remainder.replace(/```([^\n`]*)\n?([\s\S]*?)```/g, (whole, language, body) => {
    tokens.push(`fenced-code:${language.trim()}\n${body.replace(/\n$/, '')}`);
    return ' ';
  });
  remainder = remainder.replace(/`([^`\n]+)`/g, (whole, body) => { tokens.push(`inline-code:${body}`); return ' '; });
  remainder = remainder.replace(/\[([^\]]*)\]\(([^)\s]+)\)/g, (whole, label, target) => { tokens.push(`link-target:${target}`); return label; });
  remainder = remainder.replace(/https?:\/\/[^\s<>]+/g, (whole) => {
    const target = whole.replace(/[.,;:!?。，；：！？]+$/u, '');
    tokens.push(`url:${target}`);
    return whole.slice(target.length);
  });
  for (const version of remainder.match(/\bv?\d+(?:\.\d+){1,3}\b/g) || []) tokens.push(`version:${version}`);
  for (const placeholder of remainder.match(/\{\{?[A-Za-z_][A-Za-z0-9_.-]*\}?\}/g) || []) tokens.push(`placeholder:${placeholder}`);
  for (const tag of remainder.match(/<\/?[A-Za-z][^>]*>/g) || []) tokens.push(`html:${tag}`);
  return tokens.sort();
}

function structure(value) {
  const text = typeof value === 'string' ? value : '';
  return [
    ...(text.match(/^\s*[-*+]\s+/gm) || []).map(() => 'unordered-item'),
    ...(text.match(/^\s*\d+\.\s+/gm) || []).map(() => 'ordered-item'),
    ...(text.match(/^\*\*[^*\n]+\*\*\s*$/gm) || []).map(() => 'bold-section'),
  ].sort();
}

function inspectRendering(manifest, locale) {
  for (const key of ['spec.fullDescription', 'spec.upgradeDescription']) {
    const value = get(manifest.value, key);
    if (typeof value !== 'string' || !value) continue;
    const details = { file: manifest.file, locale, field: key, line: lineFor(manifest.text, key) };
    if (/^#{1,6}\s+/m.test(value)) add('warning', 'atx-heading', 'Use a standalone bold section label instead of an ATX heading', details);
    if (/^\s*\|.*\|\s*$/m.test(value)) add('warning', 'table-review', 'Markdown table requires manual rendering review', details);
    if (/```/.test(value)) add('warning', 'fenced-code-review', 'Fenced code requires manual rendering review', details);
    if (/<[A-Za-z][^>]*>/.test(value)) add('warning', 'html-review', 'HTML requires manual rendering review', details);
    const lines = value.split('\n').length;
    const threshold = key === 'spec.fullDescription' ? 50 : 30;
    if (lines > threshold) add('warning', 'length-review', `${key} has ${lines} lines; review for unnecessary detail or accumulated history`, { ...details, actual: lines, expected: `<= ${threshold} preferred` });
  }
}

const layout = resolveLayout();
const manifests = new Map();
for (const locale of layout.locales) {
  const file = layout.files.get(locale);
  if (!file) { add('error', 'missing-map-entry', `Manifest map is missing ${locale}`, { locale }); continue; }
  const manifest = readYaml(file, `${locale} manifest`);
  if (!manifest) continue;
  manifests.set(locale, manifest);
  for (const key of alwaysRequired) {
    const value = get(manifest.value, key);
    if (value === undefined) add('error', 'missing-field', `Missing ${key}`, { file, locale, field: key });
    else if (typeof value !== 'string' || !value.trim()) add('error', 'empty-field', `Empty ${key}`, { file, locale, field: key, line: lineFor(manifest.text, key) });
  }
  const short = get(manifest.value, 'metadata.description');
  if (typeof short === 'string' && /[.!?。！？]$/u.test(short.trim())) add('warning', 'description-punctuation', 'metadata.description ends with punctuation', { file, locale, field: 'metadata.description', line: lineFor(manifest.text, 'metadata.description') });
  inspectRendering(manifest, locale);
}

const source = manifests.get(options.source);
if (source && layout.rootManifest) {
  for (const key of copyFields) {
    const rootValue = get(layout.rootManifest.value, key);
    const sourceValue = get(source.value, key);
    if ((rootValue !== undefined || sourceValue !== undefined) && rootValue !== sourceValue) add('error', 'source-drift', `Root manifest and ${options.source} differ in ${key}`, { file: layout.rootManifest.file, sourceFile: source.file, field: key, expected: rootValue, actual: sourceValue });
  }
}

if (source) {
  const sourceUpgrade = get(source.value, 'spec.upgradeDescription');
  for (const [locale, target] of manifests) {
    if (locale === options.source) continue;
    if (get(target.value, 'metadata.title') !== get(source.value, 'metadata.title')) add('warning', 'localized-title', `Title differs from ${options.source}; confirm an official localized product name exists`, { file: target.file, locale, field: 'metadata.title' });
    const targetUpgrade = get(target.value, 'spec.upgradeDescription');
    if (typeof sourceUpgrade === 'string' && sourceUpgrade.trim()) {
      if (typeof targetUpgrade !== 'string' || !targetUpgrade.trim()) add('error', 'missing-conditional-field', 'Source upgradeDescription is non-empty, so the target must contain a non-empty translation', { file: target.file, locale, field: 'spec.upgradeDescription' });
    } else if (typeof targetUpgrade === 'string' && targetUpgrade.trim()) add('error', 'target-only-upgrade', 'Target has upgradeDescription but the approved source does not', { file: target.file, locale, field: 'spec.upgradeDescription' });

    for (const key of copyFields) {
      if (key === 'spec.upgradeDescription' && !(typeof sourceUpgrade === 'string' && sourceUpgrade.trim())) continue;
      const expectedValue = get(source.value, key);
      const actualValue = get(target.value, key);
      if (typeof expectedValue !== 'string' || typeof actualValue !== 'string') continue;
      const tokenDiff = tokenDifference(extractTokens(expectedValue), extractTokens(actualValue));
      if (tokenDiff.missing.length || tokenDiff.extra.length) add('error', 'protected-token-mismatch', `Protected tokens differ in ${key}`, { file: target.file, sourceFile: source.file, locale, field: key, missing: tokenDiff.missing, extra: tokenDiff.extra, line: lineFor(target.text, key) });
      const structureDiff = tokenDifference(structure(expectedValue), structure(actualValue));
      if (structureDiff.missing.length || structureDiff.extra.length) add('error', 'structure-mismatch', `List or section structure differs in ${key}`, { file: target.file, sourceFile: source.file, locale, field: key, missing: structureDiff.missing, extra: structureDiff.extra, line: lineFor(target.text, key) });
    }
    const unchanged = ['metadata.description', 'spec.fullDescription', 'spec.upgradeDescription'].filter((key) => {
      const value = get(source.value, key);
      return typeof value === 'string' && value.length > 20 && value === get(target.value, key);
    });
    if (unchanged.length) add('warning', 'unchanged-source-copy', `Long source text is unchanged in ${unchanged.join(', ')}`, { file: target.file, locale, fields: unchanged });
  }
}

const errors = diagnostics.filter((item) => item.severity === 'error');
const warnings = diagnostics.filter((item) => item.severity === 'warning');
const summary = { manifests: manifests.size, locales: [...manifests.keys()], errors: errors.length, warnings: warnings.length };
if (options.format === 'json') console.log(JSON.stringify({ diagnostics, summary }, null, 2));
else {
  for (const item of diagnostics) {
    const location = [item.file, item.line].filter(Boolean).join(':');
    console[item.severity === 'error' ? 'error' : 'warn'](`${item.severity.toUpperCase()} ${item.code}${location ? ` ${location}` : ''}: ${item.message}`);
    if (item.missing?.length) console.error(`  missing: ${JSON.stringify(item.missing)}`);
    if (item.extra?.length) console.error(`  extra: ${JSON.stringify(item.extra)}`);
  }
  console[errors.length ? 'error' : 'log'](`Validated ${summary.manifests} locale manifest(s) with ${summary.errors} error(s) and ${summary.warnings} warning(s).`);
}
process.exit(errors.length ? 1 : 0);
