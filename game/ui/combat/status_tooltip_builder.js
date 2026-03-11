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
import {
  ensureStatusTooltipRoot,
  positionStatusTooltipFromEvent,
  positionStatusTooltipToRect,
  renderStatusTooltipElement,
  scheduleStatusTooltipHide,
} from './status_tooltip_runtime_ui.js';

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

function resolveTooltipDoc(options = {}) {
  return options.doc ?? options.win?.document ?? null;
}

function resolveTooltipWin(options = {}, doc = null) {
  return options.win ?? doc?.defaultView ?? null;
}

export const StatusTooltipUI = {
  show(event, statusKey, infoKR, buff, options = {}) {
    clearTimeout(_hideTipTimer);

    const doc = resolveTooltipDoc(options);
    const win = resolveTooltipWin(options, doc);

    const el = ensureStatusTooltipRoot(doc);
    renderStatusTooltipElement(el, statusKey, infoKR, buff, buildStatusTooltipHTML(statusKey, infoKR, buff, options), options);
    this._position(event, el, win);
    el.classList.add('visible');
  },

  showForAnchor(anchorEl, statusKey, infoKR, buff, options = {}) {
    if (!anchorEl || typeof anchorEl.getBoundingClientRect !== 'function') return;

    clearTimeout(_hideTipTimer);

    const doc = resolveTooltipDoc(options);
    const win = resolveTooltipWin(options, doc);
    const rect = anchorEl.getBoundingClientRect();
    const el = ensureStatusTooltipRoot(doc);

    renderStatusTooltipElement(el, statusKey, infoKR, buff, buildStatusTooltipHTML(statusKey, infoKR, buff, options), options);
    positionStatusTooltipToRect(rect, el, win);
    el.classList.add('visible');
  },

  hide(options = {}) {
    const doc = resolveTooltipDoc(options);
    _hideTipTimer = scheduleStatusTooltipHide(doc);
  },

  cancelHide() {
    clearTimeout(_hideTipTimer);
  },

  _position(event, el, win) {
    positionStatusTooltipFromEvent(event, el, win);
  },
};
