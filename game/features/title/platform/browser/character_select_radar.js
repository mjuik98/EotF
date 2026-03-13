const STAT_LABELS = {
  HP: 'HP',
  ATK: 'ATK',
  DEF: 'DEF',
  ECH: 'ECH',
  RHY: 'RHY',
  RES: 'RES',
};

export function buildCharacterRadar(stats, accent, cmp = null, size = 240) {
  const keys = Object.keys(stats);
  const count = keys.length;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size / 2 - 35;
  const angleAt = (i) => (i * 2 * Math.PI / count) - Math.PI / 2;
  const pointAt = (i, r) => [cx + r * Math.cos(angleAt(i)), cy + r * Math.sin(angleAt(i))];
  const toPath = (points) => points.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join('') + 'Z';
  const statPoints = keys.map((key, i) => pointAt(i, (stats[key] / 100) * maxR));
  const comparePath = cmp ? toPath(keys.map((key, i) => pointAt(i, (cmp[key] / 100) * maxR))) : '';
  const filterId = `glow${String(accent || '').replace('#', '')}`;

  const grids = [0.25, 0.5, 0.75, 1].map((level) => {
    const points = keys.map((_, i) => {
      const [x, y] = pointAt(i, maxR * level);
      return `${x},${y}`;
    }).join(' ');
    return `<polygon points="${points}" fill="none" stroke="rgba(255,255,255,.05)" stroke-width="1.5"/>`;
  }).join('');

  const axes = keys.map((_, i) => {
    const [x, y] = pointAt(i, maxR);
    return `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="rgba(255,255,255,.05)" stroke-width="1.5"/>`;
  }).join('');

  const compareLayer = comparePath
    ? `<path d="${comparePath}" fill="rgba(255,255,255,.05)" stroke="rgba(255,255,255,.18)" stroke-width="1.5"/>`
    : '';
  const statLayer = `<path d="${toPath(statPoints)}" fill="${accent}22" stroke="${accent}" stroke-width="2" filter="url(#${filterId})"/>`;
  const dots = statPoints.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.5" fill="${accent}"/>`).join('');
  const labels = keys.map((key, i) => {
    const [x, y] = pointAt(i, maxR + 22);
    return `<text x="${x}" y="${y + 4}" text-anchor="middle" font-size="11" fill="${accent}" font-family="'Share Tech Mono',monospace" font-weight="bold">${STAT_LABELS[key] || key}</text>`;
  }).join('');

  return `<svg width="${size}" height="${size}" style="overflow:visible"><defs><filter id="${filterId}"><feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="${accent}" flood-opacity=".6"/></filter></defs>${grids}${axes}${compareLayer}${statLayer}${dots}${labels}</svg>`;
}
