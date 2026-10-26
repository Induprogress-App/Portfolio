// Interaktywny ekran HMI nalewarki. Logika w sim.js, tu tylko widok i obsługa przycisków.
import { createFiller, RECIPES, STEPS, ALARMS } from './sim.js';

const TICK_MS = 100;
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

const MIMIC = `
<svg viewBox="0 0 320 240" class="hmi-mimic" aria-hidden="true">
  <rect x="110" y="14" width="100" height="70" rx="8" class="hmi-tank"/>
  <rect x="114" y="40" width="92" height="40" rx="5" class="hmi-tank-fill" id="hmi-tank-fill"/>
  <text x="160" y="34" text-anchor="middle" class="hmi-tank-label" id="hmi-tank-temp">22 °C</text>
  <path d="M154 84h12v18h-12z" class="hmi-pipe"/>
  <circle cx="160" cy="110" r="8" class="hmi-valve" id="hmi-valve"/>
  <g id="hmi-nozzle"><path d="M156 118h8v22l-4 6-4-6z" class="hmi-nozzle"/></g>
  <path d="M20 206h280" class="hmi-conveyor"/>
  <g id="hmi-bottle">
    <rect x="-14" y="-46" width="28" height="46" rx="4" class="hmi-bottle"/>
    <rect x="-12" y="-2" width="24" height="0" class="hmi-bottle-fill" id="hmi-bottle-fill"/>
  </g>
  <g id="hmi-pusher"><rect x="18" y="176" width="34" height="14" class="hmi-pusher"/></g>
  <rect x="112" y="168" width="10" height="30" class="hmi-jaw" id="hmi-jaw-l"/>
  <rect x="198" y="168" width="10" height="30" class="hmi-jaw" id="hmi-jaw-r"/>
  <circle cx="290" cy="30" r="9" class="hmi-lamp" id="hmi-lamp"/>
</svg>`;

export function initHmiDemo(root) {
  const m = createFiller();
  root.innerHTML = `
  <div class="hmi" role="group" aria-label="Symulowany panel operatorski nalewarki">
    <header class="hmi__bar">
      <span class="hmi__title">NALEWARKA · EKRAN GŁÓWNY</span>
      <span class="hmi__mode" id="hmi-mode-label">AUTO</span>
      <span class="hmi__state" id="hmi-state">POSTÓJ</span>
    </header>
    <div class="hmi__body">
      <div class="hmi__mimic">${MIMIC}<p class="hmi__step" id="hmi-step">Krok: —</p></div>
      <div class="hmi__side">
        <div class="hmi__values">
          <div><span>Temperatura</span><b id="hmi-temp">—</b></div>
          <div><span>Zadana</span><b id="hmi-temp-set">—</b></div>
          <div><span>Ciśnienie</span><b id="hmi-pressure">—</b></div>
          <div><span>Dawka</span><b id="hmi-dose">—</b></div>
          <div><span>Wykonano</span><b id="hmi-count">0</b></div>
          <div><span>Zlecenie</span><b><input id="hmi-target" type="number" min="1" max="9999" value="50" aria-label="Zadana ilość sztuk"></b></div>
        </div>
        <label class="hmi__field">Receptura
          <select id="hmi-recipe">${RECIPES.map(r => `<option value="${r.id}">${esc(r.name)} · ${r.tempC} °C</option>`).join('')}</select>
        </label>
        <div class="hmi__buttons">
          <button type="button" class="hmi-btn hmi-btn--start" id="hmi-start">START</button>
          <button type="button" class="hmi-btn hmi-btn--stop" id="hmi-stop">STOP</button>
          <button type="button" class="hmi-btn hmi-btn--ack" id="hmi-ack">KWITUJ</button>
          <button type="button" class="hmi-btn" id="hmi-mode" aria-pressed="false">TRYB RĘCZNY</button>
          <button type="button" class="hmi-btn" id="hmi-heater" aria-pressed="true">GRZAŁKA</button>
          <button type="button" class="hmi-btn" id="hmi-reset">ZERUJ LICZNIK</button>
        </div>
      </div>
    </div>
    <footer class="hmi__alarms" aria-live="polite">
      <ul id="hmi-alarms"></ul>
    </footer>
  </div>
  <div class="hmi-tools">
    <label>Symuluj usterkę czujnika
      <select id="hmi-fault"><option value="">— wybierz —</option>${Object.entries(ALARMS).map(([bit, text]) => `<option value="${bit}">bit ${bit}: ${esc(text)}</option>`).join('')}</select>
    </label>
    <p>Usterka zadziała w kroku, który czeka na dany czujnik. Panel pokaże opis bitu ze słowa błędów, a START będzie zablokowany do skwitowania.</p>
  </div>`;

  const $ = id => root.querySelector(`#${id}`);
  let bottleX = 70;
  const on = (id, fn) => $(id).addEventListener('click', () => { fn(); render(); });
  on('hmi-start', () => m.start());
  on('hmi-stop', () => m.stop());
  on('hmi-ack', () => { m.ack(); $('hmi-fault').value = ''; });
  on('hmi-mode', () => m.setMode(m.state.mode === 'AUTO' ? 'MANUAL' : 'AUTO'));
  on('hmi-heater', () => m.toggleHeater());
  on('hmi-reset', () => m.resetCounter());
  $('hmi-recipe').addEventListener('change', e => { m.setRecipe(e.target.value); render(); });
  $('hmi-target').addEventListener('change', e => { m.setTarget(Number(e.target.value)); render(); });
  $('hmi-fault').addEventListener('change', e => { if (e.target.value) m.injectFault(Number(e.target.value)); });

  function render() {
    const s = m.state;
    const def = STEPS.find(x => x.id === s.step);
    const progress = def ? Math.min(1, s.stepMs / def.ms) : 0;
    const status = s.errorWord ? 'ALARM' : s.running ? 'PRACA' : s.ready ? 'GOTOWA' : 'NAGRZEWANIE';
    $('hmi-state').textContent = status;
    $('hmi-state').dataset.status = status;
    $('hmi-mode-label').textContent = s.mode === 'AUTO' ? 'AUTO' : 'RĘCZNY';
    $('hmi-step').textContent = `Krok: ${def ? def.label : s.step === 'FAULT' ? 'zatrzymany przez alarm' : '—'}`;
    $('hmi-temp').textContent = `${s.tempC.toFixed(1)} °C`;
    $('hmi-temp-set').textContent = `${s.recipe.tempC} °C`;
    $('hmi-pressure').textContent = `${s.pressureBar.toFixed(1)} bar`;
    $('hmi-dose').textContent = `${s.dosedMl.toFixed(1)} / ${s.recipe.doseMl} ml`;
    $('hmi-count').textContent = `${s.count} / ${s.target}`;
    $('hmi-start').disabled = s.running || !s.ready || s.mode !== 'AUTO';
    $('hmi-stop').disabled = !s.running;
    $('hmi-ack').disabled = !s.errorWord;
    $('hmi-mode').setAttribute('aria-pressed', String(s.mode === 'MANUAL'));
    $('hmi-mode').disabled = s.running;
    $('hmi-heater').setAttribute('aria-pressed', String(s.heater));
    $('hmi-heater').disabled = s.mode !== 'MANUAL';
    $('hmi-recipe').disabled = s.running;
    $('hmi-reset').disabled = s.running;
    $('hmi-alarms').innerHTML = s.alarms.length
      ? s.alarms.map(a => `<li class="is-alarm">⚠ ErrorID.X${String(a.bit).padStart(2, '0')} — ${esc(a.text)}</li>`).join('')
      : `<li>${s.ready ? 'Brak aktywnych alarmów.' : `Interlock: temperatura poniżej ${s.recipe.tempC - 2} °C — START zablokowany.`}</li>`;

    // Animacja schematu: zbiornik, zawór, dysza, opakowanie, popychacz, szczęki centrujące.
    const heatShare = Math.min(1, Math.max(0, (s.tempC - 20) / (s.recipe.tempC - 20)));
    $('hmi-tank-fill').style.fill = `hsl(${210 - heatShare * 190} 70% 55%)`;
    $('hmi-tank-temp').textContent = `${s.tempC.toFixed(0)} °C`;
    const dosing = s.step === 'DOSE' && !s.errorWord;
    $('hmi-valve').classList.toggle('is-open', dosing);
    $('hmi-nozzle').setAttribute('transform', `translate(0 ${dosing ? 14 : 0})`);
    const positions = { PUSH_IN: 70 + 90 * progress, DOSE: 160, PUSH_OUT: 160 + 120 * progress };
    if (s.step !== 'FAULT') bottleX = positions[s.step] ?? 70;
    $('hmi-bottle').setAttribute('transform', `translate(${bottleX} 204)`);
    const fill = (s.dosedMl / s.recipe.doseMl) * 40;
    $('hmi-bottle-fill').setAttribute('y', String(-2 - fill));
    $('hmi-bottle-fill').setAttribute('height', String(fill));
    $('hmi-pusher').setAttribute('transform', `translate(${s.step === 'PUSH_IN' ? 90 * progress : 0} 0)`);
    const clamp = s.step === 'DOSE' ? 26 : 0;
    $('hmi-jaw-l').setAttribute('transform', `translate(${clamp} 0)`);
    $('hmi-jaw-r').setAttribute('transform', `translate(${-clamp} 0)`);
    $('hmi-lamp').dataset.status = status;
  }

  // Symulacja chodzi tylko, gdy panel jest widoczny.
  let timer;
  const runLoop = visible => {
    clearInterval(timer);
    if (visible && !document.hidden) timer = setInterval(() => { m.tick(TICK_MS); render(); }, TICK_MS);
  };
  let visible = false;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; runLoop(visible); }).observe(root);
  document.addEventListener('visibilitychange', () => runLoop(visible));
  render();
  return m;
}
