import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const dist = new URL('../dist/', import.meta.url);

before(() => {
  execFileSync(process.execPath, [fileURLToPath(new URL('../scripts/build.mjs', import.meta.url))], { stdio: 'pipe' });
});

async function textFiles(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true, recursive: true })) {
    if (e.isFile() && /\.(html|js|css|svg|json)$/.test(e.name)) out.push(`${e.parentPath ?? e.path}/${e.name}`);
  }
  return out;
}

test('build tworzy stronę z wersjonowanymi zasobami', async () => {
  const html = await readFile(new URL('index.html', dist), 'utf8');
  assert.match(html, /assets\/css\/style\.css\?v=[0-9a-f]{10}/);
  assert.match(html, /assets\/js\/app\.js\?v=[0-9a-f]{10}/);
  assert.ok(existsSync(new URL('.nojekyll', dist)));
});

test('wszystkie lokalne odnośniki z index.html istnieją w dist', async () => {
  const html = await readFile(new URL('index.html', dist), 'utf8');
  const refs = [...html.matchAll(/(?:src|href)="(assets\/[^"?#]+)/g)].map(m => m[1]);
  assert.ok(refs.length > 0);
  for (const ref of refs) assert.ok(existsSync(new URL(ref, dist)), ref);
});

test('opublikowane pliki nie zawierają adresów IP, haseł ani e-maili', async () => {
  for (const file of await textFiles(dist)) {
    const text = await readFile(file, 'utf8');
    assert.doesNotMatch(text, /\b(?:10|172|192)\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/, file);
    assert.doesNotMatch(text, /hasło|password\s*[:=]/i, file);
    assert.doesNotMatch(text, /[\w.+-]+@[\w-]+\.[a-z]{2,}/i, file);
  }
});
