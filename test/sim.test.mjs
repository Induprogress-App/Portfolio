import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createFiller, activeAlarms, RECIPES, STEPS, BATCHES, SIGNALS, PHASES, generateBatch, toCsv } from '../assets/js/sim.js';

const run = (m, ms, step = 100) => { for (let t = 0; t < ms; t += step) m.tick(step); };
const cycleMs = STEPS.reduce((a, s) => a + s.ms, 0);

test('HMI: start zablokowany, dopóki produkt się nie nagrzeje', () => {
  const m = createFiller();
  assert.equal(m.start(), false);
  run(m, 10_000);
  assert.equal(m.state.ready, true);
  assert.equal(m.start(), true);
  assert.equal(m.state.step, 'CENTER');
});

test('HMI: pełny cykl liczy sztuki i zatrzymuje się na zadanej ilości', () => {
  const m = createFiller();
  run(m, 10_000);
  m.setTarget(3);
  m.start();
  run(m, cycleMs * 3 + 500);
  assert.equal(m.state.count, 3);
  assert.equal(m.state.running, false);
});

test('HMI: usterka czujnika ustawia bit w słowie błędów i zatrzymuje cykl', () => {
  const m = createFiller();
  run(m, 10_000);
  m.injectFault(4);
  m.start();
  run(m, cycleMs);
  const s = m.state;
  assert.equal(s.step, 'FAULT');
  assert.equal(s.running, false);
  assert.equal(s.errorWord, 1 << 4);
  assert.deepEqual(s.alarms.map(a => a.bit), [4]);
  assert.equal(m.start(), false, 'start z aktywnym alarmem jest zablokowany');
  m.ack();
  assert.equal(m.state.errorWord, 0);
  assert.equal(m.start(), true);
});

test('HMI: usterka zaworu zatrzymuje dozowanie na początku, bez nalanej dawki', () => {
  const m = createFiller();
  run(m, 10_000);
  m.injectFault(17);
  m.start();
  run(m, cycleMs);
  assert.deepEqual(m.state.alarms.map(a => a.bit), [17]);
  assert.equal(m.state.dosedMl, 0);
});

test('HMI: spadek ciśnienia zgłasza alarm bitu 31', () => {
  const m = createFiller();
  m.injectFault(31);
  run(m, 2000);
  assert.deepEqual(activeAlarms(m.state.errorWord).map(a => a.bit), [31]);
  m.ack();
  assert.ok(m.state.pressureBar >= 4.5);
});

test('HMI: receptury i tryb można zmienić tylko na postoju', () => {
  const m = createFiller();
  m.setRecipe(RECIPES[1].id);
  assert.equal(m.state.recipe.id, RECIPES[1].id);
  m.setMode('MANUAL');
  assert.equal(m.start(), false, 'w trybie ręcznym cykl automatyczny nie startuje');
  m.toggleHeater();
  assert.equal(m.state.heater, false);
});

test('SCADA: partia jest deterministyczna i ma wszystkie sygnały', () => {
  const a = generateBatch(BATCHES[0]);
  const b = generateBatch(BATCHES[0]);
  assert.deepEqual(a, b);
  assert.equal(a.t.length, BATCHES[0].minutes * 6 + 1);
  for (const s of SIGNALS) assert.equal(a.series[s.id].length, a.t.length, s.id);
  assert.equal(a.phases.length, PHASES.length);
  assert.equal(Math.round(a.phases.at(-1).to), a.t.at(-1));
});

test('SCADA: partia z usterką łożyska generuje alarm, poprawna nie', () => {
  assert.equal(generateBatch(BATCHES[0]).alarms.length, 0);
  const faulty = generateBatch(BATCHES[2]);
  assert.ok(faulty.alarms.some(a => a.signal === 'tBearing'));
});

test('SCADA: eksport CSV z wybranymi sygnałami', () => {
  const data = generateBatch(BATCHES[1]);
  const csv = toCsv(data, ['tMix', 'rpm']).split('\n');
  assert.equal(csv[0], 'czas_s;tMix;rpm');
  assert.equal(csv.length, data.t.length + 1);
  assert.match(csv[1], /^0;\d+(,\d)?;\d+$/);
});
