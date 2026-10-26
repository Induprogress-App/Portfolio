import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { projects, categories, competences, protocols, filterProjects } from '../assets/js/data.js';

const exists = src => existsSync(new URL(`../${src}`, import.meta.url));

test('portfolio pokazuje od 5 do 10 realizacji', () => {
  assert.ok(projects.length >= 5 && projects.length <= 10, `realizacji: ${projects.length}`);
});

test('każda realizacja ma komplet treści i unikalne id', () => {
  const ids = new Set();
  for (const p of projects) {
    for (const key of ['id', 'title', 'category', 'sector', 'summary', 'challenge', 'solution']) {
      assert.ok(p[key], `${p.id}: brak pola ${key}`);
    }
    assert.equal(p.facts.length, 3, `${p.id}: oczekiwane 3 liczby`);
    assert.ok(p.scope.length >= 3 && p.tech.length >= 3, `${p.id}: za krótki zakres`);
    assert.ok(categories.includes(p.category), `${p.id}: nieznana kategoria`);
    assert.ok(!ids.has(p.id), `${p.id}: zdublowane id`);
    ids.add(p.id);
  }
});

test('każda maszyna ma zdjęcie oraz film albo galerię producenta', () => {
  for (const { id, media } of projects) {
    assert.ok(media.photo && media.alt, `${id}: brak zdjęcia lub opisu`);
    if (media.screen) continue; // aplikacje software pokazują prawdziwy zrzut ekranu
    assert.ok(media.video || media.gallery?.length, `${id}: brak filmu i galerii`);
    if (media.video) {
      assert.match(media.video.id, /^[\w-]{11}$/, `${id}: niepoprawne id filmu`);
      assert.ok(Number.isInteger(media.video.start) && media.video.start >= 0, `${id}: niepoprawny start`);
    }
  }
  assert.ok(projects.filter(p => p.media.video).length >= 5, 'co najmniej 5 realizacji z filmem');
});

test('każda realizacja ma schemat sterowania', () => {
  for (const { id, control } of projects) {
    assert.ok(control?.plc && control.bus, `${id}: brak sterownika lub sieci`);
    assert.ok(control.top.length >= 1 && control.top.length <= 4, `${id}: poziom nadrzędny 1–4`);
    assert.ok(control.field.length >= 2 && control.field.length <= 6, `${id}: urządzenia 2–6`);
  }
});

test('każda kategoria filtra ma co najmniej jedną realizację', () => {
  for (const c of categories) assert.ok(filterProjects(c).length > 0, c);
});

test('wszystkie obrazy istnieją lokalnie', () => {
  const images = [
    ...projects.flatMap(p => [p.media.photo, ...(p.media.gallery || []).map(g => g.src)]),
    ...competences.map(c => c.image),
    ...protocols.map(p => p.src)
  ];
  for (const src of images) assert.ok(exists(src), src);
});

test('treści nie zawierają danych dostępowych, adresów IP ani e-maili', () => {
  const text = JSON.stringify(projects);
  assert.doesNotMatch(text, /\b\d{1,3}(\.\d{1,3}){3}\b/);
  assert.doesNotMatch(text, /hasł|password|login|@/i);
});
