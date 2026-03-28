import { ASSET_MANIFEST } from './asset_manifest.js';

const previewUrlCache = new Map();

function escapeXml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function resolvePreviewPalette(domain, entry = {}) {
  if (domain === 'characters') {
    return {
      primary: entry.color || '#2f7eff',
      secondary: entry.accent || '#7b2fff',
      glow: entry.accent || entry.color || '#7b2fff',
    };
  }
  if (domain === 'cards') {
    const rarity = String(entry.rarity || 'common');
    if (rarity === 'legendary') return { primary: '#f4a423', secondary: '#ffdd66', glow: '#f4a423' };
    if (rarity === 'rare') return { primary: '#00c2ff', secondary: '#78f1ff', glow: '#00c2ff' };
    return { primary: '#5a6b8c', secondary: '#9db4d4', glow: '#9db4d4' };
  }
  if (domain === 'enemies') {
    return entry.boss
      ? { primary: '#7d1f3a', secondary: '#ff6b8e', glow: '#ff6b8e' }
      : { primary: '#37506a', secondary: '#83b7ff', glow: '#83b7ff' };
  }
  if (domain === 'items') {
    const rarity = String(entry.rarity || 'common');
    if (rarity === 'boss' || rarity === 'legendary') return { primary: '#5e3a0b', secondary: '#ffcf6e', glow: '#ffcf6e' };
    if (rarity === 'rare') return { primary: '#114d5c', secondary: '#65efff', glow: '#65efff' };
    return { primary: '#2f3a4b', secondary: '#d4dee8', glow: '#d4dee8' };
  }
  if (domain === 'statusEffects') {
    return entry.buff
      ? { primary: '#0f5744', secondary: '#6affcc', glow: '#6affcc' }
      : { primary: '#6a1c34', secondary: '#ff7b9a', glow: '#ff7b9a' };
  }
  return { primary: '#283446', secondary: '#9eb1cc', glow: '#9eb1cc' };
}

function buildPreviewLabel(id) {
  return String(id || '')
    .replaceAll('_', ' ')
    .slice(0, 18);
}

function buildPreviewSvg(domain, id, entry = {}) {
  const palette = resolvePreviewPalette(domain, entry);
  const icon = escapeXml(entry.value || '?');
  const label = escapeXml(buildPreviewLabel(id));

  return [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" role="img" aria-hidden="true">',
    '<defs>',
    `<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${palette.primary}"/><stop offset="100%" stop-color="${palette.secondary}"/></linearGradient>`,
    `<filter id="glow"><feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="${palette.glow}" flood-opacity="0.35"/></filter>`,
    '</defs>',
    '<rect width="96" height="96" rx="22" fill="#05070b"/>',
    '<rect x="6" y="6" width="84" height="84" rx="18" fill="url(#bg)" opacity="0.92"/>',
    `<circle cx="48" cy="28" r="18" fill="${palette.glow}" opacity="0.18"/>`,
    `<text x="48" y="50" text-anchor="middle" font-size="28" font-family="'Segoe UI Emoji','Apple Color Emoji',sans-serif" filter="url(#glow)">${icon}</text>`,
    `<text x="48" y="76" text-anchor="middle" font-size="8" letter-spacing="1.2" font-family="'IBM Plex Sans',sans-serif" fill="rgba(255,255,255,0.88)">${escapeXml(domain)}</text>`,
    `<text x="48" y="87" text-anchor="middle" font-size="7" font-family="'IBM Plex Sans',sans-serif" fill="rgba(255,255,255,0.74)">${label}</text>`,
    '</svg>',
  ].join('');
}

export function resolveAssetPreviewEntry(domain, id) {
  return ASSET_MANIFEST?.[domain]?.[id] || null;
}

export function resolveAssetPreviewUrl(domain, id) {
  const cacheKey = `${domain}:${id}`;
  if (previewUrlCache.has(cacheKey)) return previewUrlCache.get(cacheKey);

  const entry = resolveAssetPreviewEntry(domain, id);
  if (!entry) return '';

  const url = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(buildPreviewSvg(domain, id, entry))}`;
  previewUrlCache.set(cacheKey, url);
  return url;
}
