import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fefco201, fitsSheet, blankSvg } from '../assets/js/fefco.js';
import { controlSchematic } from '../assets/js/schematic.js';
import { highlight } from '../assets/js/highlight.js';
import { codeSamples } from '../assets/js/code-samples.js';
import { existsSync } from 'node:fs';

test('FEFCO 201: formatka według wzoru z panelu', () => {
  const b = fefco201({ L: 400, W: 300, H: 200, glue: 30 });
  assert.equal(b.length, 30 + 2 * 400 + 2 * 300);
  assert.equal(b.width, 200 + 300);
  assert.deepEqual(b.panels, [30, 400, 300, 400, 300]);
  assert.deepEqual(b.creases, [150, 350]);
  assert.equal(b.panels.reduce((a, x) => a + x, 0), b.length);
});

test('FEFCO 201: błędne wymiary są odrzucane', () => {
  assert.throws(() => fefco201({ L: 0, W: 300, H: 200 }), RangeError);
  assert.throws(() => fefco201({ L: 400, W: Number.NaN, H: 200 }), /W musi być/);
});

test('FEFCO 201: kontrola arkusza wejściowego', () => {
  const b = fefco201({ L: 400, W: 300, H: 200, glue: 30 });
  assert.equal(fitsSheet(b, { length: 1500, width: 750 }).ok, true);
  const tooSmall = fitsSheet(b, { length: 1000, width: 750 });
  assert.equal(tooSmall.ok, false);
  assert.match(tooSmall.message, /1430 × 500/);
});

test('FEFCO 201: rysunek SVG ma linie cięcia i bigi', () => {
  const svg = blankSvg(fefco201({ L: 400, W: 300, H: 200 }));
  assert.match(svg, /^<svg[^>]+viewBox=/);
  assert.equal((svg.match(/class="blank-cut"/g) || []).length, 2);
  assert.match(svg, /class="blank-fold"/);
});

test('schemat sterowania: wszystkie elementy i escapowanie', () => {
  const svg = controlSchematic({ top: ['HMI'], plc: 'PLC <AX>', bus: 'EtherCAT', field: ['Serwo', 'Falownik', 'I/O'] });
  for (const label of ['HMI', 'PLC &lt;AX&gt;', 'EtherCAT', 'Serwo', 'Falownik', 'I/O']) assert.ok(svg.includes(label), label);
  assert.ok(!svg.includes('<AX>'));
  assert.equal((svg.match(/class="sch-field"/g) || []).length, 3);
});

test('podświetlanie składni: tokeny i escapowanie HTML', () => {
  const html = highlight('IF a < b THEN // test\n  x := 10;\nEND_IF', 'Structured Text');
  assert.match(html, /<span class="tok-k">IF<\/span>/);
  assert.match(html, /<span class="tok-c">\/\/ test<\/span>/);
  assert.match(html, /<span class="tok-n">10<\/span>/);
  assert.match(html, /a &lt; b/);
});

test('przykłady kodu: treść albo istniejący plik źródłowy', () => {
  assert.ok(codeSamples.length >= 3);
  for (const s of codeSamples) {
    assert.ok(s.code || existsSync(new URL(`../${s.src}`, import.meta.url)), s.id);
    if (s.code) assert.doesNotMatch(s.code, /\b\d{1,3}(\.\d{1,3}){3}\b|hasł|password/i);
  }
});
