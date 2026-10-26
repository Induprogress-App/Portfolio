// Kalkulator formatki FEFCO 201 (klapowe pudło z zakładką klejową).
// Ten sam moduł działa w przeglądarce (demo na stronie) i w Node.js (testy jednostkowe).

/** Wymiary w milimetrach: L – długość, W – szerokość, H – wysokość pudełka, glue – zakładka klejowa. */
export function fefco201({ L, W, H, glue = 30 }) {
  for (const [name, value] of Object.entries({ L, W, H, glue })) {
    if (!Number.isFinite(value) || value <= 0) throw new RangeError(`${name} musi być liczbą dodatnią`);
  }
  const flap = W / 2;
  return {
    length: glue + 2 * L + 2 * W,
    width: H + W,
    flap,
    // Kolejne panele wzdłuż formatki: zakładka, ściana L, ściana W, ściana L, ściana W.
    panels: [glue, L, W, L, W],
    // Bigi poprzeczne: między klapą dolną, ścianą i klapą górną.
    creases: [flap, flap + H]
  };
}

/** Sprawdza, czy formatka mieści się w arkuszu wejściowym (bez obracania arkusza). */
export function fitsSheet(blank, sheet) {
  const ok = blank.length <= sheet.length && blank.width <= sheet.width;
  return {
    ok,
    message: ok
      ? 'Formatka mieści się w arkuszu wejściowym.'
      : `Arkusz za mały: potrzeba ${blank.length} × ${blank.width} mm.`
  };
}

/** Rysunek rozkroju jako SVG: linie cięcia ciągłe, bigi przerywane. */
export function blankSvg(blank, { maxWidth = 520 } = {}) {
  const scale = maxWidth / blank.length;
  const w = blank.length * scale;
  const h = blank.width * scale;
  const pad = 12;
  let x = 0;
  const cuts = [];
  const folds = [];
  blank.panels.forEach((panel, i) => {
    x += panel;
    if (i < blank.panels.length - 1) {
      const px = x * scale;
      folds.push(`M${px} 0V${h}`);
      // Nacięcia klap między panelami (bez zakładki klejowej).
      if (i > 0) cuts.push(`M${px} 0V${blank.flap * scale}M${px} ${blank.creases[1] * scale}V${h}`);
    }
  });
  const glueW = blank.panels[0] * scale;
  for (const c of blank.creases) folds.push(`M${glueW} ${c * scale}H${w}`);
  const outline = `M${glueW} 0H${w}V${h}H${glueW}V${blank.creases[1] * scale}L0 ${(blank.creases[1] - 6) * scale}V${(blank.creases[0] + 6) * scale}L${glueW} ${blank.creases[0] * scale}Z`;
  return `<svg viewBox="${-pad} ${-pad} ${w + 2 * pad} ${h + 2 * pad}" role="img" aria-label="Rozkrój formatki ${blank.length} na ${blank.width} mm">
  <path d="${outline}" class="blank-cut"/>
  <path d="${cuts.join('')}" class="blank-cut"/>
  <path d="${folds.join('')}" class="blank-fold"/>
</svg>`;
}
