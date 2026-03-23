import {
  getEnemyStatusMeta,
  getEnemyStatusName,
  getPlayerStatusMeta,
  getStatusTooltipMeta,
  isInfiniteStatusDuration,
  resolveStatusTooltipPalette,
} from '../../ports/public_presentation_support_capabilities.js';

function resolveTooltipInfo(statusKey, infoKR) {
  const playerMeta = getPlayerStatusMeta(statusKey);
  const enemyMeta = getEnemyStatusMeta(statusKey);

  return {
    icon: infoKR?.icon ?? playerMeta?.icon ?? enemyMeta?.icon ?? '',
    name: infoKR?.name ?? playerMeta?.name ?? getEnemyStatusName(statusKey) ?? statusKey,
    buff: typeof infoKR?.buff === 'boolean'
      ? infoKR.buff
      : (typeof playerMeta?.buff === 'boolean' ? playerMeta.buff : false),
    desc: infoKR?.desc ?? playerMeta?.desc ?? enemyMeta?.desc ?? '',
  };
}

function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  const normalized = clean.length === 3
    ? clean.split('').map((char) => char + char).join('')
    : clean;
  const value = parseInt(normalized, 16);
  return `${(value >> 16) & 255},${(value >> 8) & 255},${value & 255}`;
}

export function ensureStatusTooltipRoot(doc) {
  let el = doc.getElementById('statusTooltip');
  if (!el) {
    el = doc.createElement('div');
    el.id = 'statusTooltip';
    el.className = 'stt';
    doc.body.appendChild(el);
  }
  return el;
}

export function renderStatusTooltipElement(el, statusKey, infoKR, buff, html, options = {}) {
  el.innerHTML = html;
  el.dataset.statusKey = statusKey;
  el.dataset.statusContainerId = options.statusContainerId || '';

  const resolvedInfo = resolveTooltipInfo(statusKey, infoKR);
  const isBuff = !!resolvedInfo.buff;
  const pal = resolveStatusTooltipPalette(statusKey, isBuff, {
    isInfinite: isInfiniteStatusDuration(statusKey, buff) || getStatusTooltipMeta(statusKey)?.gauge?.infinite,
  });
  const glowAlpha = isBuff ? ',.1)' : ',.18)';
  const rgb = pal.accent.startsWith('#')
    ? hexToRgb(pal.accent)
    : '255,51,102';
  el.style.boxShadow = `0 16px 48px rgba(0,0,0,.88),0 0 22px rgba(${rgb}${glowAlpha}`;
  return el;
}

export function positionStatusTooltipToRect(rect, el, win) {
  const tooltipWidth = 280;
  const margin = 10;
  let x = rect.right + margin;
  let y = rect.top;
  if (x + tooltipWidth > win.innerWidth - 8) x = rect.left - tooltipWidth - margin;
  const tooltipHeight = el.offsetHeight || 320;
  if (y + tooltipHeight > win.innerHeight - 8) y = win.innerHeight - tooltipHeight - 8;
  el.style.left = `${Math.max(8, x)}px`;
  el.style.top = `${Math.max(8, y)}px`;
  return { x: Math.max(8, x), y: Math.max(8, y) };
}

export function positionStatusTooltipFromEvent(event, el, win) {
  const rect = event.currentTarget.getBoundingClientRect();
  return positionStatusTooltipToRect(rect, el, win);
}

export function scheduleStatusTooltipHide(doc, setTimeoutFn = setTimeout) {
  return setTimeoutFn(() => {
    doc.getElementById('statusTooltip')?.classList.remove('visible');
  }, 80);
}
