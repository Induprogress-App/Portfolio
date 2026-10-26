// Symulacje do interaktywnych dem. Bez DOM: działają w przeglądarce i w testach Node.js.
// Dane są syntetyczne — nie pochodzą z instalacji klienta ani z kodu klienta.

/* ------------------------------------------------------------------ HMI: nalewarka */

export const RECIPES = [
  { id: 'r1', name: 'Produkt A · 8 ml', doseMl: 8, tempC: 55 },
  { id: 'r2', name: 'Produkt B · 12 ml', doseMl: 12, tempC: 60 },
  { id: 'r3', name: 'Produkt C · 5 ml', doseMl: 5, tempC: 50 }
];

// Ten sam podział na bity co w przykładzie Structured Text (FB_SensorWatch).
export const ALARMS = {
  4: 'Popychacz nie wysunął się (czujnik S1105)',
  11: 'Brak potwierdzenia centrowania (czujnik S1112)',
  17: 'Zawór zbiornika nie otworzył się (S1118)',
  31: 'Za niskie ciśnienie zasilania (S1132)'
};

// Kroki cyklu i ich czas trwania w ms. checkMs: kiedy czujnik musi potwierdzić krok (domyślnie na końcu).
export const STEPS = [
  { id: 'CENTER', label: 'Centrowanie', ms: 600, sensorBit: 11 },
  { id: 'PUSH_IN', label: 'Dosuw opakowania', ms: 500, sensorBit: 4 },
  { id: 'DOSE', label: 'Dozowanie', ms: 1400, sensorBit: 17, checkMs: 200 },
  { id: 'PUSH_OUT', label: 'Wysuw', ms: 500 }
];

export function createFiller() {
  const s = {
    mode: 'AUTO',
    running: false,
    step: 'IDLE',
    stepMs: 0,
    recipe: RECIPES[0],
    tempC: 22,
    heater: true,
    pressureBar: 6,
    count: 0,
    target: 50,
    errorWord: 0,
    pendingFault: null,
    dosedMl: 0
  };

  const ready = () => s.errorWord === 0 && s.tempC >= s.recipe.tempC - 2 && s.pressureBar >= 4.5;

  return {
    get state() { return { ...s, ready: ready(), alarms: activeAlarms(s.errorWord) }; },

    start() {
      if (s.mode !== 'AUTO' || !ready()) return false;
      s.running = true;
      if (s.step === 'IDLE' || s.step === 'DONE') { s.step = STEPS[0].id; s.stepMs = 0; }
      return true;
    },
    stop() { s.running = false; },
    setMode(mode) { if (!s.running) s.mode = mode === 'MANUAL' ? 'MANUAL' : 'AUTO'; },
    setRecipe(id) { if (!s.running) s.recipe = RECIPES.find(r => r.id === id) ?? s.recipe; },
    setTarget(n) { s.target = Math.max(1, Math.min(9999, Math.round(n) || 1)); },
    resetCounter() { if (!s.running) s.count = 0; },
    toggleHeater() { if (s.mode === 'MANUAL') s.heater = !s.heater; },
    /** Usterka zadziała, gdy sekwencja dojdzie do kroku czekającego na dany czujnik. */
    injectFault(bit) { if (ALARMS[bit]) s.pendingFault = Number(bit); },
    ack() {
      s.errorWord = 0;
      s.pendingFault = null;
      if (s.pressureBar < 4.5) s.pressureBar = 6;
      s.dosedMl = 0;
      s.step = 'IDLE';
      s.stepMs = 0;
    },

    /** Krok symulacji o dtMs milisekund. */
    tick(dtMs) {
      // Grzanie: do zadanej temperatury, dryf w dół bez grzania.
      const set = s.recipe.tempC;
      s.tempC += s.heater ? Math.min(0.012 * dtMs, Math.max(0, set + 0.5 - s.tempC)) : -0.002 * dtMs;
      s.tempC = Math.max(20, s.tempC);
      s.pressureBar = s.pendingFault === 31 ? Math.max(3.2, s.pressureBar - 0.004 * dtMs) : s.pressureBar;
      if (s.pressureBar < 4.5 && s.errorWord === 0) raise(31);

      if (!s.running || s.errorWord) return;
      const def = STEPS.find(x => x.id === s.step);
      if (!def) return;
      s.stepMs += dtMs;
      // Czujnik potwierdza krok albo (wstrzyknięta usterka) nie — wtedy alarm i stop.
      const faulty = def.sensorBit !== undefined && s.pendingFault === def.sensorBit;
      if (faulty && s.stepMs >= (def.checkMs ?? def.ms)) { raise(def.sensorBit); return; }
      if (def.id === 'DOSE' && !faulty) s.dosedMl = Math.min(s.recipe.doseMl, (s.stepMs / def.ms) * s.recipe.doseMl);
      if (s.stepMs < def.ms) return;
      const next = STEPS.indexOf(def) + 1;
      if (next < STEPS.length) { s.step = STEPS[next].id; s.stepMs = 0; return; }
      s.count += 1;
      s.dosedMl = 0;
      s.step = 'DONE';
      s.stepMs = 0;
      if (s.count >= s.target) { s.running = false; return; }
      s.step = STEPS[0].id;
    }
  };

  function raise(bit) {
    s.errorWord = (s.errorWord | (1 << bit)) >>> 0;
    s.running = false;
    s.step = 'FAULT';
  }
}

export function activeAlarms(errorWord) {
  return Object.keys(ALARMS).map(Number).filter(bit => (errorWord >>> bit) & 1).map(bit => ({ bit, text: ALARMS[bit] }));
}

/* ------------------------------------------------------------------ SCADA: mieszalnik */

export const SIGNALS = [
  { id: 'tMix', label: 'Temperatura mieszalnika', unit: '°C', axis: 'temp', color: '#d9534f' },
  { id: 'tMotor', label: 'Temperatura silnika', unit: '°C', axis: 'temp', color: '#f0a03c' },
  { id: 'tBearing', label: 'Temperatura łożyska', unit: '°C', axis: 'temp', color: '#b07cc6' },
  { id: 'rpm', label: 'Obroty', unit: 'obr/min', axis: 'rpm', color: '#3f77a6' },
  { id: 'current', label: 'Prąd silnika', unit: 'A', axis: 'current', color: '#2fa58c' },
  { id: 'inlet', label: 'Klapa wejściowa', unit: '0/1', axis: 'bool', color: '#7f8b97' },
  { id: 'outlet', label: 'Klapa spustowa', unit: '0/1', axis: 'bool', color: '#455a64' }
];

export const PHASES = [
  { id: 'load', label: 'Załadunek', share: 0.15 },
  { id: 'mix', label: 'Mieszanie', share: 0.35 },
  { id: 'heat', label: 'Grzanie tarciem', share: 0.35 },
  { id: 'discharge', label: 'Rozładunek', share: 0.15 }
];

// Deterministyczny generator liczb pseudolosowych — te same dane przy każdym odświeżeniu.
function mulberry32(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const BATCHES = [
  { id: 'P-101', label: 'Partia P-101', seed: 101, minutes: 24, targetTemp: 92 },
  { id: 'P-102', label: 'Partia P-102', seed: 102, minutes: 27, targetTemp: 95 },
  { id: 'P-103', label: 'Partia P-103 (przegrzanie łożyska)', seed: 103, minutes: 25, targetTemp: 93, bearingFault: true }
];

/** Przebieg partii: próbka co 10 s, fazy cyklu i alarmy przekroczeń. */
export function generateBatch(batch) {
  const rnd = mulberry32(batch.seed);
  const n = Math.round((batch.minutes * 60) / 10) + 1;
  const t = Array.from({ length: n }, (_, i) => i * 10);
  const total = t.at(-1);
  const bounds = [];
  let acc = 0;
  for (const p of PHASES) { bounds.push({ ...p, from: acc * total, to: (acc + p.share) * total }); acc += p.share; }
  const phaseAt = sec => bounds.find(b => sec <= b.to) ?? bounds.at(-1);

  const series = Object.fromEntries(SIGNALS.map(s => [s.id, []]));
  let tMix = 20, tMotor = 30, tBearing = 28;
  for (const sec of t) {
    const ph = phaseAt(sec);
    const noise = (a) => (rnd() - 0.5) * a;
    const rpm = ph.id === 'load' ? 40 : ph.id === 'mix' ? 180 : ph.id === 'heat' ? 320 : 90;
    const current = rpm * 0.14 + (ph.id === 'heat' ? 9 : 2) + noise(2.5);
    if (ph.id === 'heat') tMix += (batch.targetTemp - tMix) * 0.06;
    else if (ph.id === 'mix') tMix += 0.25;
    else if (ph.id === 'discharge') tMix -= 0.4;
    tMotor += (35 + current * 0.6 - tMotor) * 0.05;
    const bearingTarget = 32 + rpm * 0.05 + (batch.bearingFault && sec > total * 0.55 ? 38 : 0);
    tBearing += (bearingTarget - tBearing) * 0.06;
    series.tMix.push(round(tMix + noise(0.6)));
    series.tMotor.push(round(tMotor + noise(0.4)));
    series.tBearing.push(round(tBearing + noise(0.4)));
    series.rpm.push(Math.max(0, Math.round(rpm + noise(8))));
    series.current.push(round(Math.max(0, current)));
    series.inlet.push(ph.id === 'load' ? 1 : 0);
    series.outlet.push(ph.id === 'discharge' ? 1 : 0);
  }

  const alarms = [];
  const limits = { tBearing: 75, tMotor: 80, tMix: 98 };
  for (const [id, limit] of Object.entries(limits)) {
    const i = series[id].findIndex(v => v > limit);
    if (i >= 0) alarms.push({ sec: t[i], signal: id, text: `${SIGNALS.find(s => s.id === id).label} > ${limit} °C`, value: series[id][i] });
  }
  return { id: batch.id, t, series, phases: bounds, alarms };
}

export function toCsv(data, signalIds) {
  const head = ['czas_s', ...signalIds].join(';');
  const rows = data.t.map((sec, i) => [sec, ...signalIds.map(id => String(data.series[id][i]).replace('.', ','))].join(';'));
  return [head, ...rows].join('\n');
}

const round = v => Math.round(v * 10) / 10;
