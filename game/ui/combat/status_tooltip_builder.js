import {
  getEnemyStatusMeta,
  getEnemyStatusName,
  getPlayerStatusMeta,
} from '../../../data/status_effects_data.js';
import {
  getStatusTooltipMeta,
  resolveStatusTooltipPalette,
} from '../../../data/status_tooltip_meta_data.js';
import {
  getStatusTooltipTypeLabel,
} from './status_tooltip_copy.js';
import {
  buildStatusTooltipCountdownHTML,
  buildStatusTooltipGaugeHTML,
  buildStatusTooltipNextTurnHTML,
  buildStatusTooltipSourceHTML,
  buildStatusTooltipStatsHTML,
  buildStatusTooltipTagsHTML,
} from './status_tooltip_sections.js';
import {
  buildStatusTooltipHeaderHTML,
  composeStatusTooltipBodyHTML,
} from './status_tooltip_layout.js';
import { isInfiniteStatusDuration } from '../../utils/status_value_utils.js';

function _isInfiniteDurationStatus(statusKey, buff) {
  return isInfiniteStatusDuration(statusKey, buff);
}

function _resolveInfo(statusKey, infoKR) {
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

export function buildStatusTooltipHTML(statusKey, infoKR, buff, options = {}) {
  const { source = null, rawValue = null } = options;
  const resolvedInfo = _resolveInfo(statusKey, infoKR);
  const isBuff = !!resolvedInfo.buff;
  const meta = getStatusTooltipMeta(statusKey);
  const pal = resolveStatusTooltipPalette(statusKey, isBuff, {
    isInfinite: _isInfiniteDurationStatus(statusKey, buff),
  });
  const isInfinite = meta?.gauge?.infinite || _isInfiniteDurationStatus(statusKey, buff);
  const typeLabel = getStatusTooltipTypeLabel(meta?.typeLabel, isBuff, isInfinite);

  const header = buildStatusTooltipHeaderHTML(
    resolvedInfo,
    pal,
    meta,
    typeLabel,
    statusKey,
  );

  const sourceHtml = buildStatusTooltipSourceHTML(source);
  const isPoison = statusKey === 'poisoned';
  const durationValue = isPoison
    ? (options.poisonDuration ?? buff?.poisonDuration ?? 1)
    : (rawValue ?? (Number.isFinite(buff) ? buff : buff?.stacks));
  const countdownHtml = meta?.countdown ? buildStatusTooltipCountdownHTML(durationValue) : '';
  const tagsHtml = buildStatusTooltipTagsHTML(meta?.tags);
  const statsHtml = !meta?.tags && !meta?.countdown
    ? buildStatusTooltipStatsHTML(meta, buff, isPoison ? durationValue : rawValue)
    : '';

  let gaugeHtml = '';
  if (isInfinite && !meta?.countdown) {
    gaugeHtml = buildStatusTooltipGaugeHTML(99, true, pal.accent);
  } else if (!meta?.countdown) {
    const stacks = Number(durationValue);
    if (Number.isFinite(stacks) && stacks > 0) {
      gaugeHtml = buildStatusTooltipGaugeHTML(stacks, false, pal.accent);
    }
  }

  const nextTurnHtml = meta ? buildStatusTooltipNextTurnHTML(meta, buff, rawValue) : '';
  const descHtml = `<div class="stt-desc">${resolvedInfo.desc ?? ''}</div>`;
  return header + composeStatusTooltipBodyHTML([
    sourceHtml,
    countdownHtml,
    tagsHtml,
    statsHtml,
    gaugeHtml,
    nextTurnHtml,
    descHtml,
  ]);
}

let _hideTipTimer = null;

function _ensureTooltipRoot(doc) {
  let el = doc.getElementById('statusTooltip');
  if (!el) {
    el = doc.createElement('div');
    el.id = 'statusTooltip';
    el.className = 'stt';
    doc.body.appendChild(el);
  }
  return el;
}

function _renderTooltip(el, statusKey, infoKR, buff, options = {}) {
  el.innerHTML = buildStatusTooltipHTML(statusKey, infoKR, buff, options);
  el.dataset.statusKey = statusKey;
  el.dataset.statusContainerId = options.statusContainerId || '';

  const isBuff = !!_resolveInfo(statusKey, infoKR).buff;
  const pal = resolveStatusTooltipPalette(statusKey, isBuff, {
    isInfinite: _isInfiniteDurationStatus(statusKey, buff),
  });
  const glowAlpha = isBuff ? ',.1)' : ',.18)';
  const rgb = pal.accent.startsWith('#')
    ? _hexToRgb(pal.accent)
    : '255,51,102';
  el.style.boxShadow = `0 16px 48px rgba(0,0,0,.88),0 0 22px rgba(${rgb}${glowAlpha}`;
}

function _positionToRect(rect, el, win) {
  const tooltipWidth = 280;
  const margin = 10;
  let x = rect.right + margin;
  let y = rect.top;
  if (x + tooltipWidth > win.innerWidth - 8) x = rect.left - tooltipWidth - margin;
  const tooltipHeight = el.offsetHeight || 320;
  if (y + tooltipHeight > win.innerHeight - 8) y = win.innerHeight - tooltipHeight - 8;
  el.style.left = `${Math.max(8, x)}px`;
  el.style.top = `${Math.max(8, y)}px`;
}

export const StatusTooltipUI = {
  show(event, statusKey, infoKR, buff, options = {}) {
    clearTimeout(_hideTipTimer);

    const doc = options.doc ?? globalThis.document;
    const win = options.win ?? globalThis.window ?? globalThis;

    const el = _ensureTooltipRoot(doc);
    _renderTooltip(el, statusKey, infoKR, buff, options);
    this._position(event, el, win);
    el.classList.add('visible');
  },

  showForAnchor(anchorEl, statusKey, infoKR, buff, options = {}) {
    if (!anchorEl || typeof anchorEl.getBoundingClientRect !== 'function') return;

    clearTimeout(_hideTipTimer);

    const doc = options.doc ?? globalThis.document;
    const win = options.win ?? globalThis.window ?? globalThis;
    const rect = anchorEl.getBoundingClientRect();
    const el = _ensureTooltipRoot(doc);

    _renderTooltip(el, statusKey, infoKR, buff, options);
    _positionToRect(rect, el, win);
    el.classList.add('visible');
  },

  hide(options = {}) {
    const doc = options.doc ?? globalThis.document;
    _hideTipTimer = setTimeout(() => {
      doc.getElementById('statusTooltip')?.classList.remove('visible');
    }, 80);
  },

  cancelHide() {
    clearTimeout(_hideTipTimer);
  },

  _position(event, el, win) {
    const rect = event.currentTarget.getBoundingClientRect();
    _positionToRect(rect, el, win);
  },
};

function _hexToRgb(hex) {
  const clean = hex.replace('#', '');
  const normalized = clean.length === 3
    ? clean.split('').map((char) => char + char).join('')
    : clean;
  const value = parseInt(normalized, 16);
  return `${(value >> 16) & 255},${(value >> 8) & 255},${value & 255}`;
}
