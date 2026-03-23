import { DescriptionUtils } from '../../../../utils/description_utils.js';
import { RARITY_LABELS, RARITY_TEXT_COLORS } from '../../../../../data/rarity_meta.js';

const toastQueue = [];
const activeToasts = [];
const TOAST_BASE_BOTTOM = 220;
const TOAST_STACK_GAP = 12;
const TOAST_FALLBACK_HEIGHT = 100;
const MAX_VISIBLE_TOASTS = 4;
const STACK_TOAST_EXIT_DELAY_MS = 320;
const ITEM_TOAST_MERGE_WINDOW_MS = 900;
const ITEM_TOAST_BASE_DURATION_MS = 3000;
const ITEM_TOAST_MAX_DURATION_MS = 5200;
const ITEM_TOAST_CHAR_DURATION_MS = 18;

function getDoc(deps) {
  return deps?.doc || document;
}

function highlightDescription(desc) {
  if (!desc) return '';
  return DescriptionUtils?.highlight?.(desc) || desc;
}

function buildStackedToastClassName(variantClass) {
  return ['stack-toast', variantClass].filter(Boolean).join(' ');
}

function getNow() {
  return Date.now();
}

function markToastExiting(el) {
  el?.classList?.add?.('stack-toast--exit');
}

function clearRemovalTimers(record) {
  if (record?.removeTimer) clearTimeout(record.removeTimer);
  if (record?.removeDelayTimer) clearTimeout(record.removeDelayTimer);
  record.removeTimer = null;
  record.removeDelayTimer = null;
}

function updateToastCount(el, count) {
  const countEl = el?._toastCountEl;
  if (!countEl) return;
  countEl.textContent = `x${count}`;
  countEl.style.display = count > 1 ? 'inline-flex' : 'none';
}

function scheduleToastRemoval(entry) {
  if (!entry || entry.isExiting) return;
  clearRemovalTimers(entry);
  entry.removeTimer = setTimeout(() => {
    entry.isExiting = true;
    entry.onBeforeRemove?.(entry.el, entry);
    entry.removeDelayTimer = setTimeout(() => removeStackedToast(entry), Number(entry.removeDelayMs) || 0);
  }, Math.max(0, Number(entry.durationMs) || 0));
}

function canMergeToastRecord(record, incoming, nowMs) {
  if (!record || !incoming || record.key !== incoming.key) return false;
  if (record.isExiting) return false;
  const mergeWindowMs = Number(record.mergeWindowMs) || Number(incoming.mergeWindowMs) || 0;
  if (!mergeWindowMs) return false;
  return nowMs - Number(record.createdAt || 0) <= mergeWindowMs;
}

function mergeToastRecord(record, incoming, nowMs) {
  record.mergedCount = Number(record.mergedCount || 1) + Number(incoming.mergedCount || 1);
  record.durationMs = Math.max(Number(record.durationMs) || 0, Number(incoming.durationMs) || 0);
  record.createdAt = nowMs;
  record.onMerge?.(record, record.mergedCount);
}

function findMergeTarget(config) {
  const nowMs = getNow();
  for (const entry of activeToasts) {
    if (canMergeToastRecord(entry, config, nowMs)) return { record: entry, nowMs };
  }
  for (const pending of toastQueue) {
    if (canMergeToastRecord(pending, config, nowMs)) return { record: pending, nowMs };
  }
  return null;
}

function computeItemToastDuration(item, options = {}) {
  const text = `${options?.typeLabel || ''} ${item?.name || ''} ${item?.desc || ''}`.trim();
  return Math.min(
    ITEM_TOAST_MAX_DURATION_MS,
    ITEM_TOAST_BASE_DURATION_MS + text.length * ITEM_TOAST_CHAR_DURATION_MS,
  );
}

function layoutToastStack() {
  let bottom = TOAST_BASE_BOTTOM;
  for (const entry of activeToasts) {
    if (!entry?.el?.isConnected) continue;
    const measured = entry.el.offsetHeight || entry.height || TOAST_FALLBACK_HEIGHT;
    entry.height = measured;
    entry.el.style.bottom = `${bottom}px`;
    bottom += measured + TOAST_STACK_GAP;
  }
}

function removeStackedToast(entry) {
  clearRemovalTimers(entry);
  const index = activeToasts.indexOf(entry);
  if (index >= 0) {
    activeToasts.splice(index, 1);
  }
  entry?.el?.remove?.();
  layoutToastStack();
  drainToastQueue();
}

function drainToastQueue() {
  while (toastQueue.length && activeToasts.length < MAX_VISIBLE_TOASTS) {
    const next = toastQueue.shift();
    if (!next || typeof next.createEl !== 'function') continue;
    const doc = getDoc(next.deps);
    if (!doc?.body) continue;

    const el = next.createEl(doc, next);
    if (!el) continue;

    if (!el.style.position) el.style.position = 'fixed';
    if (!el.style.right) el.style.right = '260px';
    if (!el.style.zIndex) el.style.zIndex = '9500';
    el.style.bottom = `${TOAST_BASE_BOTTOM}px`;

    doc.body.appendChild(el);
    const entry = {
      ...next,
      el,
      height: next.height || el.offsetHeight || TOAST_FALLBACK_HEIGHT,
      isExiting: false,
    };
    updateToastCount(el, entry.mergedCount || 1);
    activeToasts.push(entry);
    layoutToastStack();
    scheduleToastRemoval(entry);
  }
}

export function enqueueStackedToast(config) {
  const normalized = {
    ...config,
    createdAt: config?.createdAt || getNow(),
    mergedCount: Number(config?.mergedCount || 1),
  };
  const mergeTarget = findMergeTarget(normalized);
  if (mergeTarget) {
    mergeToastRecord(mergeTarget.record, normalized, mergeTarget.nowMs);
    if (activeToasts.includes(mergeTarget.record)) {
      scheduleToastRemoval(mergeTarget.record);
    }
    return;
  }

  toastQueue.push(normalized);
  drainToastQueue();
}

export function showCombatSummaryToast(dealt, taken, kills, deps = {}) {
  enqueueStackedToast({
    deps,
    durationMs: 4000,
    removeDelayMs: STACK_TOAST_EXIT_DELAY_MS,
    height: 132,
    createEl: (doc) => {
      const el = doc.createElement('div');
      el.className = buildStackedToastClassName('combat-stat-summary stack-toast--summary');

      const head = doc.createElement('div');
      head.style.cssText = "font-family:'Cinzel',serif;font-size:12px;letter-spacing:0.3em;color:var(--text-dim);margin-bottom:12px;text-align:center;";
      head.textContent = '전투 요약';

      const stats = doc.createElement('div');
      stats.style.cssText = 'display:flex;flex-direction:column;gap:8px;';

      const createRow = (label, value, color, font = "'Share Tech Mono'") => {
        const row = doc.createElement('div');
        row.style.cssText = 'display:flex;justify-content:space-between;gap:20px;align-items:center;';
        const lbl = doc.createElement('span');
        lbl.style.cssText = 'color:var(--text-dim);font-size:13px;';
        lbl.textContent = label;
        const val = doc.createElement('span');
        val.className = 'toast-summary-value';
        val.style.cssText = `color:${color};font-family:${font};`;
        val.textContent = value;
        row.append(lbl, val);
        return row;
      };

      stats.append(
        createRow('가한 피해', dealt, 'var(--danger)'),
        createRow('받은 피해', taken, '#ff8888'),
        createRow('처치', kills, 'var(--cyan)'),
      );

      el.append(head, stats);
      return el;
    },
    onBeforeRemove: (el) => {
      markToastExiting(el);
    },
  });
}

export function showItemToastQueued(item, deps = {}, options = {}) {
  if (!item) return false;
  const rarity = item.rarity || 'common';

  enqueueStackedToast({
    deps,
    key: `item:${rarity}:${options?.typeLabel || ''}:${item.name || ''}:${item.desc || ''}`,
    mergeWindowMs: ITEM_TOAST_MERGE_WINDOW_MS,
    durationMs: computeItemToastDuration(item, options),
    removeDelayMs: STACK_TOAST_EXIT_DELAY_MS,
    height: 108,
    createEl: (doc, config) => {
      const borderColor = {
        common: 'var(--border)',
        uncommon: 'rgba(123,47,255,0.5)',
        rare: 'rgba(240,180,41,0.5)',
      };
      const el = doc.createElement('div');
      el.className = buildStackedToastClassName('item-toast stack-toast--item');
      el.style.borderColor = borderColor[rarity] || 'var(--border)';

      const icon = doc.createElement('div');
      icon.className = 'toast-icon';
      icon.textContent = item.icon || '•';

      const content = doc.createElement('div');
      content.style.cssText = 'display:flex;min-width:0;flex-direction:column;';
      const rarityInfo = doc.createElement('div');
      rarityInfo.className = 'toast-rarity';
      rarityInfo.textContent = options?.typeLabel || `${RARITY_LABELS[rarity] || rarity} 아이템 획득`;

      const name = doc.createElement('div');
      name.className = 'toast-text';
      name.style.color = RARITY_TEXT_COLORS[rarity] || 'var(--white)';
      name.textContent = item.name;

      const sub = doc.createElement('div');
      sub.className = 'toast-sub';
      sub.innerHTML = highlightDescription(item.desc);

      const countBadge = doc.createElement('div');
      countBadge.className = 'stack-toast-count';
      countBadge.style.cssText = 'display:none;margin-top:8px;padding:3px 8px;border-radius:999px;background:rgba(123,47,255,0.16);';
      countBadge.textContent = `x${config?.mergedCount || 1}`;
      el._toastCountEl = countBadge;

      content.append(rarityInfo, name, sub, countBadge);
      el.append(icon, content);
      return el;
    },
    onMerge: (record, count) => {
      updateToastCount(record?.el, count);
    },
    onBeforeRemove: (el) => {
      markToastExiting(el);
    },
  });

  return true;
}
