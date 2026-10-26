// Interaktywne demo SCADA mieszalnika: trendy, porównanie partii, kursor czasu, alarmy, raport, CSV.
// Dane są syntetyczne (sim.js), układ ekranu wzorowany na naszych systemach SCADA.
import { SIGNALS, BATCHES, generateBatch, toCsv } from './sim.js';

const W = 760, H = 330, PAD = { l: 48, r: 56, t: 26, b: 30 };
// Lewa oś: °C i A (0–120), prawa oś: obroty (0–400).
const RANGES = { temp: [0, 120], rpm: [0, 400], current: [0, 120] };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const mmss = sec => `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;

export function initScadaDemo(root) {
  const cache = new Map();
  const data = id => cache.get(id) ?? cache.set(id, generateBatch(BATCHES.find(b => b.id === id))).get(id);
  const state = { view: 'trend', batch: BATCHES[0].id, compare: '', selected: new Set(['tMix', 'rpm', 'current', 'outlet']), cursor: null };

  root.innerHTML = `
  <div class="scada">
    <nav class="scada__nav" aria-label="Widoki SCADA">
      <button type="button" data-view="trend" aria-pressed="true">Trendy</button>
      <button type="button" data-view="alarms" aria-pressed="false">Alarmy <span id="scada-alarm-count"></span></button>
      <button type="button" data-view="report" aria-pressed="false">Raport partii</button>
    </nav>
    <div class="scada__main">
      <div class="scada__toolbar">
        <label>Partia <select id="scada-batch">${BATCHES.map(b => `<option value="${b.id}">${esc(b.label)}</option>`).join('')}</select></label>
        <label>Porównaj z <select id="scada-compare"><option value="">—</option>${BATCHES.map(b => `<option value="${b.id}">${esc(b.label)}</option>`).join('')}</select></label>
        <button type="button" class="scada__csv" id="scada-csv">Eksport CSV</button>
      </div>
      <div id="scada-view"></div>
    </div>
  </div>`;

  const $ = id => root.querySelector(`#${id}`);
  root.querySelector('.scada__nav').addEventListener('click', e => {
    const b = e.target.closest('[data-view]');
    if (!b) return;
    state.view = b.dataset.view;
    root.querySelectorAll('[data-view]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    render();
  });
  $('scada-batch').addEventListener('change', e => { state.batch = e.target.value; state.cursor = null; render(); });
  $('scada-compare').addEventListener('change', e => { state.compare = e.target.value; render(); });
  $('scada-csv').addEventListener('click', () => {
    const csv = toCsv(data(state.batch), [...state.selected]);
    const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: `partia-${state.batch}.csv` });
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });

  function render() {
    const d = data(state.batch);
    $('scada-alarm-count').textContent = d.alarms.length ? `(${d.alarms.length})` : '';
    $('scada-alarm-count').className = d.alarms.length ? 'is-alarm' : '';
    if (state.view === 'trend') renderTrend(d);
    else if (state.view === 'alarms') renderAlarms(d);
    else renderReport(d);
  }

  function renderTrend(d) {
    const cmp = state.compare && state.compare !== state.batch ? data(state.compare) : null;
    const tMax = Math.max(d.t.at(-1), cmp?.t.at(-1) ?? 0);
    const x = sec => PAD.l + (sec / tMax) * (W - PAD.l - PAD.r);
    const plotH = H - PAD.t - PAD.b;
    const y = (sig, v) => {
      if (sig.axis === 'bool') return PAD.t + plotH - 4 - v * 18 - (sig.id === 'outlet' ? 0 : 24);
      const [lo, hi] = RANGES[sig.axis];
      return PAD.t + plotH - ((v - lo) / (hi - lo)) * plotH;
    };
    const line = (data, sig, dashed) => {
      const pts = data.t.map((sec, i) => `${x(sec).toFixed(1)},${y(sig, data.series[sig.id][i]).toFixed(1)}`).join(' ');
      return `<polyline points="${pts}" stroke="${sig.color}" class="scada-line${dashed ? ' is-compare' : ''}"/>`;
    };
    const active = SIGNALS.filter(s => state.selected.has(s.id));
    const gridY = [0, 30, 60, 90, 120].map(v => `<line x1="${PAD.l}" x2="${W - PAD.r}" y1="${y({ axis: 'temp' }, v)}" y2="${y({ axis: 'temp' }, v)}" class="scada-grid"/><text x="${PAD.l - 6}" y="${y({ axis: 'temp' }, v) + 4}" class="scada-axis" text-anchor="end">${v}</text><text x="${W - PAD.r + 6}" y="${y({ axis: 'temp' }, v) + 4}" class="scada-axis">${Math.round(v / 120 * 400)}</text>`).join('');
    const gridX = Array.from({ length: Math.floor(tMax / 300) + 1 }, (_, i) => i * 300).map(sec => `<text x="${x(sec)}" y="${H - 8}" class="scada-axis" text-anchor="middle">${mmss(sec)}</text>`).join('');
    const phases = d.phases.map((p, i) => `<rect x="${x(p.from)}" y="${PAD.t}" width="${x(p.to) - x(p.from)}" height="${plotH}" class="scada-phase${i % 2 ? ' is-odd' : ''}"/><text x="${x(p.from) + 4}" y="${PAD.t + 12}" class="scada-phase-label">${esc(p.label)}</text>`).join('');
    const alarms = d.alarms.map(a => `<line x1="${x(a.sec)}" x2="${x(a.sec)}" y1="${PAD.t}" y2="${PAD.t + plotH}" class="scada-alarm-line"/>`).join('');

    $('scada-view').innerHTML = `
      <div class="scada__chart">
        <svg viewBox="0 0 ${W} ${H}" id="scada-svg" tabindex="0" role="img" aria-label="Wykres trendów partii ${esc(d.id)}. Strzałki w lewo i prawo przesuwają kursor czasu.">
          ${phases}${gridY}${gridX}${alarms}
          <text x="${PAD.l - 6}" y="${PAD.t - 12}" class="scada-axis" text-anchor="end">°C / A</text>
          <text x="${W - PAD.r + 6}" y="${PAD.t - 12}" class="scada-axis">obr/min</text>
          ${cmp ? active.map(s => line(cmp, s, true)).join('') : ''}
          ${active.map(s => line(d, s, false)).join('')}
          <g id="scada-cursor"></g>
        </svg>
        <div class="scada__readout" id="scada-readout" aria-live="polite">Najedź na wykres, aby odczytać wartości.</div>
      </div>
      <fieldset class="scada__signals"><legend>Widoczne sygnały</legend>
        ${SIGNALS.map(s => `<label><input type="checkbox" value="${s.id}" ${state.selected.has(s.id) ? 'checked' : ''}><i style="background:${s.color}"></i>${esc(s.label)} <small>${s.unit}</small></label>`).join('')}
      </fieldset>
      ${cmp ? `<p class="scada__note">Linie przerywane: ${esc(BATCHES.find(b => b.id === state.compare).label)}.</p>` : ''}`;

    $('scada-view').querySelector('.scada__signals').addEventListener('change', e => {
      const id = e.target.value;
      if (e.target.checked) state.selected.add(id); else state.selected.delete(id);
      render();
    });

    const svg = $('scada-svg');
    const setCursor = sec => {
      state.cursor = Math.max(0, Math.min(d.t.at(-1), Math.round(sec / 10) * 10));
      const i = state.cursor / 10;
      $('scada-cursor').innerHTML = `<line x1="${x(state.cursor)}" x2="${x(state.cursor)}" y1="${PAD.t}" y2="${PAD.t + plotH}" class="scada-cursor"/>`;
      const phase = d.phases.find(p => state.cursor <= p.to) ?? d.phases.at(-1);
      $('scada-readout').innerHTML = `<b>${mmss(state.cursor)}</b> · ${esc(phase.label)}` +
        active.map(s => ` · <span style="color:${s.color}">${esc(s.label)}: <b>${d.series[s.id][i]}</b> ${s.unit}</span>`).join('');
    };
    svg.addEventListener('pointermove', e => {
      const r = svg.getBoundingClientRect();
      const px = ((e.clientX - r.left) / r.width) * W;
      setCursor(((px - PAD.l) / (W - PAD.l - PAD.r)) * tMax);
    });
    svg.addEventListener('keydown', e => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault();
      setCursor((state.cursor ?? 0) + (e.key === 'ArrowRight' ? 30 : -30));
    });
    if (state.cursor !== null) setCursor(state.cursor);
  }

  function renderAlarms(d) {
    $('scada-view').innerHTML = d.alarms.length
      ? `<table class="scada__table"><thead><tr><th>Czas</th><th>Alarm</th><th>Wartość</th></tr></thead><tbody>${d.alarms.map(a => `<tr class="is-alarm"><td>${mmss(a.sec)}</td><td>${esc(a.text)}</td><td>${a.value} °C</td></tr>`).join('')}</tbody></table>`
      : `<p class="scada__empty">Partia ${esc(d.id)} przebiegła bez alarmów. Wybierz partię P-103, aby zobaczyć przegrzanie łożyska.</p>`;
  }

  function renderReport(d) {
    const max = id => Math.max(...d.series[id]);
    const avg = id => (d.series[id].reduce((a, v) => a + v, 0) / d.series[id].length).toFixed(1);
    const rows = [
      ['Czas cyklu', mmss(d.t.at(-1))],
      ['Maks. temperatura mieszalnika', `${max('tMix')} °C`],
      ['Maks. temperatura łożyska', `${max('tBearing')} °C`],
      ['Średni prąd silnika', `${avg('current')} A`],
      ['Maks. obroty', `${max('rpm')} obr/min`],
      ['Alarmy', String(d.alarms.length)],
      ...d.phases.map(p => [`Faza: ${p.label}`, mmss(Math.round(p.to - p.from))])
    ];
    $('scada-view').innerHTML = `<table class="scada__table"><caption>Raport partii ${esc(d.id)}</caption><tbody>${rows.map(([k, v]) => `<tr><th scope="row">${esc(k)}</th><td>${esc(v)}</td></tr>`).join('')}</tbody></table>`;
  }

  render();
}
