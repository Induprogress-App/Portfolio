import { stats, categories, projects, industries, competences, protocols, process, repoStandard, filterProjects } from './data.js';
import { initPreviews } from './media.js';
import { controlSchematic } from './schematic.js';
import { codeSamples } from './code-samples.js';
import { fefco201, fitsSheet, blankSvg } from './fefco.js';
import { highlight } from './highlight.js';
import { initHmiDemo } from './hmi-demo.js';
import { initScadaDemo } from './scada-demo.js';

const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const icons = {
  food: '<path d="M7 3v8a3 3 0 0 0 6 0V3M10 3v18M17 3c-2 2-2 6 0 8v10"/>',
  package: '<path d="M3 7l9-4 9 4v10l-9 4-9-4z"/><path d="M3 7l9 4 9-4M12 11v10"/>',
  wood: '<path d="M4 20h16M6 20V9l6-5 6 5v11"/><path d="M10 20v-5h4v5"/>',
  stone: '<circle cx="12" cy="12" r="8"/><path d="M12 4v16M4 12h16"/>',
  metal: '<path d="M4 8h16v3H4zM7 11v9M17 11v9M4 20h16"/>',
  robot: '<path d="M5 20h8M9 20v-5l6-6M15 9l3-3M15 9l2 4"/><circle cx="9" cy="15" r="1.5"/><circle cx="15" cy="9" r="1.5"/>',
  lab: '<path d="M9 3h6M10 3v6l-5 10a1 1 0 0 0 1 2h12a1 1 0 0 0 1-2l-5-10V3"/><path d="M7 15h10"/>',
  water: '<path d="M12 3c4 5 6 8 6 11a6 6 0 0 1-12 0c0-3 2-6 6-11z"/>',
  stage: '<path d="M3 4h18M5 4v16M19 4v16M5 8c3 3 4 8 4 12M19 8c-3 3-4 8-4 12"/>'
};
const icon = name => `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[name] || ''}</svg>`;

function renderStats() {
  $('stats').innerHTML = stats.map(s => `<div class="stat"><span class="stat__value">${esc(s.value)}</span><span class="stat__label">${esc(s.label)}</span></div>`).join('');
}

function renderFilters(active) {
  $('filters').innerHTML = categories.map(c => {
    const n = c === 'Wszystkie' ? projects.length : projects.filter(p => p.category === c).length;
    return `<button type="button" class="chip" aria-pressed="${c === active}" data-cat="${esc(c)}">${esc(c)} <span>${n}</span></button>`;
  }).join('');
}

function mediaBlock(p) {
  const m = p.media;
  return `<div class="card__media" data-video='${esc(JSON.stringify(m.video))}' data-preview="photo">
      <img src="${esc(m.photo)}" alt="${esc(m.alt)}" loading="lazy">
      <span class="card__cat">${esc(p.category)}</span><span class="card__badge">▶ Film producenta</span>
    </div>`;
}

function card(p) {
  return `<article class="card" id="karta-${esc(p.id)}">
    ${mediaBlock(p)}
    <div class="card__body">
      <h3>${esc(p.title)}</h3>
      <p class="card__sector">${esc(p.sector)}</p>
      <p>${esc(p.summary)}</p>
      <ul class="tags">${p.tech.map(t => `<li>${esc(t)}</li>`).join('')}</ul>
      <div class="card__actions">
        <button type="button" class="btn btn--sm" data-open="${esc(p.id)}">Zobacz więcej</button>
        <button type="button" class="preview-toggle"></button>
      </div>
    </div>
  </article>`;
}

let disposePreviews = () => {};
function renderProjects(category) {
  disposePreviews();
  $('projects').innerHTML = filterProjects(category).map(card).join('');
  disposePreviews = initPreviews($('projects'));
}

function modalMedia(p) {
  const { id, start } = p.media.video;
  const src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?start=${start}&rel=0&modestbranding=1`;
  return `<div class="modal__video"><iframe src="${esc(src)}" title="Film poglądowy producenta: ${esc(p.title)}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>
    <img class="modal__photo" src="${esc(p.media.photo)}" alt="${esc(p.media.alt)}">
    <p class="media-note">Zdjęcie i film poglądowe producenta maszyny. Pokazują maszynę tego typu, nie konkretną instalację klienta.</p>`;
}

function openProject(id) {
  const p = projects.find(x => x.id === id);
  if (!p) return;
  $('modal-body').innerHTML = `
    <button type="button" class="modal__close" data-close aria-label="Zamknij">×</button>
    <div class="modal__head">
      <p class="card__cat card__cat--inline">${esc(p.category)}</p>
      <h2 id="modal-title">${esc(p.title)}</h2>
      <p class="card__sector">${esc(p.sector)}</p>
    </div>
    <div class="modal__grid">
      <div class="modal__media">${modalMedia(p)}</div>
      <div class="modal__content">
        <dl class="facts">${p.facts.map(([v, l]) => `<div><dt>${esc(v)}</dt><dd>${esc(l)}</dd></div>`).join('')}</dl>
        <h3>Zadanie</h3><p>${esc(p.challenge)}</p>
        <h3>Rozwiązanie</h3><p>${esc(p.solution)}</p>
        <h3>Zakres prac</h3><ul class="checks">${p.scope.map(s => `<li>${esc(s)}</li>`).join('')}</ul>
      </div>
    </div>
    <section class="modal__schematic" aria-labelledby="sch-title">
      <h3 id="sch-title">Schemat sterowania</h3>
      <div class="schematic-wrap">${controlSchematic(p.control)}</div>
      <ul class="tags">${p.tech.map(t => `<li>${esc(t)}</li>`).join('')}</ul>
    </section>`;
  $('modal').showModal();
  history.replaceState(null, '', `#${p.id}`);
}

function closeModal() {
  const modal = $('modal');
  if (modal.open) modal.close();
}

function renderStatic() {
  $('industries').innerHTML = industries.map(i => `<div class="industry"><span class="industry__icon">${icon(i.icon)}</span><div><h3>${esc(i.title)}</h3><p>${esc(i.text)}</p></div></div>`).join('');
  $('competences').innerHTML = competences.map(c => `<div class="product"><div class="product__img"><img src="${esc(c.image)}" alt="" loading="lazy"></div><h3>${esc(c.title)}</h3><p>${esc(c.text)}</p></div>`).join('');
  $('protocols').innerHTML = protocols.map(p => `<li><img src="${esc(p.src)}" alt="${esc(p.name)}" loading="lazy"><span>${esc(p.name)}</span></li>`).join('');
  $('process').innerHTML = process.map((s, i) => `<li class="step"><span class="step__no">${i + 1}</span><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></li>`).join('');
  $('repo').innerHTML = `<li class="tree__root">PROJEKT/</li>` + repoStandard.map(r => `<li><b>${esc(r.name)}</b><span>${esc(r.text)}</span></li>`).join('');
  $('footer-projects').innerHTML = projects.slice(0, 5).map(p => `<li><a href="#${esc(p.id)}" data-open="${esc(p.id)}">${esc(p.title)}</a></li>`).join('');
  $('architecture').innerHTML = controlSchematic({
    top: ['Panel HMI', 'SCADA / baza SQL', 'Zdalny serwis (VPN)'],
    plc: 'Sterownik PLC (CODESYS)',
    bus: 'EtherCAT · EtherNet/IP · Modbus',
    field: ['Serwonapędy', 'Falowniki', 'Moduły I/O', 'Robot', 'Czujniki i zawory']
  }, 760);
  $('year').textContent = new Date().getFullYear();
}

async function renderCode() {
  const tabs = $('code-tabs');
  const panel = $('code-panel');
  tabs.innerHTML = codeSamples.map((s, i) => `<button type="button" role="tab" id="tab-${s.id}" aria-controls="code-panel" aria-selected="${i === 0}" data-sample="${s.id}">${esc(s.label)}</button>`).join('');
  const show = async id => {
    const s = codeSamples.find(x => x.id === id);
    tabs.querySelectorAll('[role=tab]').forEach(t => t.setAttribute('aria-selected', String(t.dataset.sample === id)));
    panel.setAttribute('aria-labelledby', `tab-${id}`);
    let code = s.code;
    if (s.src) {
      try { code = await (await fetch(s.src)).text(); } catch { code = '// Nie udało się wczytać pliku.'; }
    }
    panel.innerHTML = `<p class="code__note"><b>${esc(s.lang)}.</b> ${esc(s.note)}</p><pre><code>${highlight(code, s.lang)}</code></pre>`;
  };
  tabs.addEventListener('click', e => { const b = e.target.closest('[data-sample]'); if (b) show(b.dataset.sample); });
  await show(codeSamples[0].id);
}

function initFefcoDemo() {
  const form = $('fefco-form');
  const out = $('fefco-out');
  const update = () => {
    const v = name => Number(form.elements[name].value);
    try {
      const blank = fefco201({ L: v('L'), W: v('W'), H: v('H'), glue: v('glue') });
      const fit = fitsSheet(blank, { length: v('sheetL'), width: v('sheetW') });
      out.innerHTML = `<p class="fefco__result"><b>${blank.length} × ${blank.width} mm</b><span class="${fit.ok ? 'ok' : 'bad'}">${esc(fit.message)}</span></p>${blankSvg(blank)}`;
    } catch (err) {
      out.innerHTML = `<p class="fefco__result"><span class="bad">${esc(err.message)}</span></p>`;
    }
  };
  form.addEventListener('input', update);
  update();
}

function init() {
  let active = 'Wszystkie';
  renderStats();
  renderFilters(active);
  renderProjects(active);
  renderStatic();
  renderCode();
  initFefcoDemo();
  initHmiDemo($('hmi-demo'));
  initScadaDemo($('scada-demo'));

  $('filters').addEventListener('click', e => {
    const b = e.target.closest('[data-cat]');
    if (!b) return;
    active = b.dataset.cat;
    renderFilters(active);
    renderProjects(active);
  });

  document.addEventListener('click', e => {
    const open = e.target.closest('[data-open]');
    if (open) { e.preventDefault(); openProject(open.dataset.open); return; }
    if (e.target.closest('[data-close]') || e.target === $('modal')) closeModal();
  });
  // Zamknięcie okna usuwa też film z dokumentu, żeby nie grał w tle.
  $('modal').addEventListener('close', () => {
    $('modal-body').innerHTML = '';
    history.replaceState(null, '', location.pathname + location.search);
  });

  const burger = document.querySelector('.burger');
  const nav = $('nav');
  burger.addEventListener('click', () => {
    const open = burger.getAttribute('aria-expanded') !== 'true';
    burger.setAttribute('aria-expanded', open);
    nav.classList.toggle('nav--open', open);
  });
  nav.addEventListener('click', e => {
    if (e.target.closest('a')) { burger.setAttribute('aria-expanded', 'false'); nav.classList.remove('nav--open'); }
  });

  const openFromHash = () => {
    const hash = location.hash.slice(1);
    if (projects.some(p => p.id === hash)) openProject(hash);
  };
  window.addEventListener('hashchange', openFromHash);
  openFromHash();
}

init();
