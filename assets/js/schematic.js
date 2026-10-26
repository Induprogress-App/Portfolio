// Schemat sterowania jako SVG: poziom nadrzędny → sterownik → sieć → urządzenia wykonawcze.
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

function row(items, y, h, cls, width) {
  const gap = 10;
  const w = (width - gap * (items.length - 1)) / items.length;
  return items.map((label, i) => {
    const x = i * (w + gap);
    return { x, w, cx: x + w / 2, svg: `<g class="${cls}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4"/><foreignObject x="${x}" y="${y}" width="${w}" height="${h}"><div xmlns="http://www.w3.org/1999/xhtml">${esc(label)}</div></foreignObject></g>` };
  });
}

export function controlSchematic({ top, plc, bus, field }, width = 560) {
  const topY = 0, plcY = 92, busY = 178, fieldY = 214, boxH = 52;
  const tops = row(top, topY, boxH, 'sch-top', width);
  const plcW = Math.min(260, width * 0.6);
  const plcX = (width - plcW) / 2;
  const fields = row(field, fieldY, 60, 'sch-field', width);
  const links = tops.map(t => `<path d="M${t.cx} ${topY + boxH}V${plcY - 10}H${width / 2}V${plcY}" />`).join('');
  const drops = fields.map(f => `<path d="M${f.cx} ${busY}V${fieldY}" />`).join('');
  return `<svg class="schematic" viewBox="-2 -2 ${width + 4} ${fieldY + 64}" role="img" aria-label="Schemat sterowania: ${esc([...top, plc, bus, ...field].join(', '))}">
  <g class="sch-links">${links}<path d="M${width / 2} ${plcY + boxH}V${busY}" />${drops}</g>
  <path class="sch-bus" d="M${fields[0].cx} ${busY}H${fields.at(-1).cx}" />
  <text class="sch-bus-label" x="${width / 2 + 8}" y="${busY - 8}">${esc(bus)}</text>
  ${tops.map(t => t.svg).join('')}
  <g class="sch-plc"><rect x="${plcX}" y="${plcY}" width="${plcW}" height="${boxH}" rx="4"/><foreignObject x="${plcX}" y="${plcY}" width="${plcW}" height="${boxH}"><div xmlns="http://www.w3.org/1999/xhtml">${esc(plc)}</div></foreignObject></g>
  ${fields.map(f => f.svg).join('')}
</svg>`;
}
