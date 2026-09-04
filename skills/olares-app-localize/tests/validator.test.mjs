import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const validator = new URL('../scripts/validate-manifests.mjs', import.meta.url);

function manifest({ description = 'A neutral app description', full = 'App is useful.', upgrade }) {
  const upgradeBlock = upgrade === undefined ? '' : `\n  upgradeDescription: |\n${upgrade.split('\n').map((line) => `    ${line}`).join('\n')}`;
  return `metadata:\n  title: App\n  description: ${description}\nspec:\n  fullDescription: |\n${full.split('\n').map((line) => `    ${line}`).join('\n')}${upgradeBlock}\n`;
}

function run(source, target, root) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'olares-validator-'));
  fs.mkdirSync(path.join(directory, 'i18n', 'en-US'), { recursive: true });
  fs.mkdirSync(path.join(directory, 'i18n', 'ja-JP'), { recursive: true });
  fs.writeFileSync(path.join(directory, 'i18n', 'en-US', 'OlaresManifest.yaml'), source);
  fs.writeFileSync(path.join(directory, 'i18n', 'ja-JP', 'OlaresManifest.yaml'), target);
  if (root) fs.writeFileSync(path.join(directory, 'OlaresManifest.yaml'), root);
  const result = spawnSync(process.execPath, [validator.pathname, directory, '--locales', 'en-US,ja-JP', '--format', 'json'], { encoding: 'utf8' });
  return { status: result.status, output: JSON.parse(result.stdout) };
}

test('upgradeDescription may be absent in source and target', () => {
  const result = run(manifest({}), manifest({ description: '中立的なアプリの説明', full: 'アプリは便利です。' }));
  assert.equal(result.status, 0);
});

test('non-empty source upgradeDescription is conditionally required', () => {
  const result = run(manifest({ upgrade: 'Updated to v1.2.3.' }), manifest({ description: '中立的なアプリの説明', full: 'アプリは便利です。' }));
  assert.equal(result.status, 1);
  assert.ok(result.output.diagnostics.some((item) => item.code === 'missing-conditional-field'));
});

test('target-only upgradeDescription is source drift', () => {
  const result = run(manifest({}), manifest({ description: '中立的なアプリの説明', full: 'アプリは便利です。', upgrade: 'v1.2.3に更新しました。' }));
  assert.equal(result.status, 1);
  assert.ok(result.output.diagnostics.some((item) => item.code === 'target-only-upgrade'));
});

test('sentence punctuation after a bare URL is not part of the token', () => {
  const source = manifest({ full: 'See https://example.com/release.' });
  const target = manifest({ description: '中立的なアプリの説明', full: '詳細：https://example.com/release。' });
  const result = run(source, target);
  assert.equal(result.status, 0);
});

test('fenced short token is parsed once and reported only as a rendering warning', () => {
  const full = 'Use ```--cpu``` mode.';
  const result = run(manifest({ full }), manifest({ description: '中立的なアプリの説明', full: '```--cpu```モードを使用します。' }));
  assert.equal(result.status, 0);
  assert.ok(result.output.diagnostics.some((item) => item.code === 'fenced-code-review'));
  assert.ok(!result.output.diagnostics.some((item) => item.code === 'protected-token-mismatch'));
});

test('protected token mismatch reports missing and extra values', () => {
  const result = run(manifest({ full: 'Use `OLD_VAR` with v1.2.3.' }), manifest({ description: '中立的なアプリの説明', full: '`NEW_VAR`をv1.2.4で使用します。' }));
  const diagnostic = result.output.diagnostics.find((item) => item.code === 'protected-token-mismatch');
  assert.deepEqual(diagnostic.missing, ['inline-code:OLD_VAR', 'version:v1.2.3']);
  assert.deepEqual(diagnostic.extra, ['inline-code:NEW_VAR', 'version:v1.2.4']);
});

test('root and en-US drift blocks validation', () => {
  const source = manifest({ full: 'Approved source.' });
  const root = manifest({ full: 'Different root copy.' });
  const result = run(source, manifest({ description: '中立的なアプリの説明', full: '承認済みの原文です。' }), root);
  assert.equal(result.status, 1);
  assert.ok(result.output.diagnostics.some((item) => item.code === 'source-drift' && item.field === 'spec.fullDescription'));
});

test('upgradeDescription presence drift between root and en-US is reported', () => {
  const source = manifest({});
  const root = manifest({ upgrade: 'Updated to v1.2.3.' });
  const result = run(source, manifest({ description: '中立的なアプリの説明', full: '承認済みの原文です。' }), root);
  assert.equal(result.status, 1);
  assert.ok(result.output.diagnostics.some((item) => item.code === 'source-drift' && item.field === 'spec.upgradeDescription'));
});

test('ATX headings are warnings by default', () => {
  const full = '## Overview\n\nText';
  const result = run(manifest({ full }), manifest({ description: '中立的なアプリの説明', full: '## 概要\n\n本文' }));
  assert.equal(result.status, 0);
  assert.ok(result.output.diagnostics.some((item) => item.code === 'atx-heading'));
});
