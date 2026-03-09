import { DescriptionUtils } from '../../utils/description_utils.js';
import { RARITY_LABELS, RARITY_TEXT_COLORS } from '../../../data/rarity_meta.js';

const toastQueue = [];
const activeToasts = [];
const TOAST_BASE_BOTTOM = 220;
const TOAST_STACK_GAP = 12;
const TOAST_FALLBACK_HEIGHT = 100;
const MAX_VISIBLE_TOASTS = 4;

function getDoc(deps) {
  return deps?.doc || document;
}

function highlightDescription(desc) {
  if (!desc) return '';
  return DescriptionUtils?.highlight?.(desc) || desc;
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

    const el = next.createEl(doc);
    if (!el) continue;

    if (!el.style.position) el.style.position = 'fixed';
    if (!el.style.right) el.style.right = '260px';
    if (!el.style.zIndex) el.style.zIndex = '9500';
    el.style.bottom = `${TOAST_BASE_BOTTOM}px`;

    doc.body.appendChild(el);
    const entry = {
      el,
      height: next.height || el.offsetHeight || TOAST_FALLBACK_HEIGHT,
    };
    activeToasts.push(entry);
    layoutToastStack();

    setTimeout(() => {
      next.onBeforeRemove?.(el);
      const removeDelay = Number(next.removeDelayMs) || 0;
      setTimeout(() => removeStackedToast(entry), removeDelay);
    }, Math.max(0, Number(next.durationMs) || 0));
  }
}

export function enqueueStackedToast(config) {
  toastQueue.push(config);
  drainToastQueue();
}

export function showCombatSummaryToast(dealt, taken, kills, deps = {}) {
  enqueueStackedToast({
    deps,
    durationMs: 4000,
    removeDelayMs: 600,
    height: 132,
    createEl: (doc) => {
      const el = doc.createElement('div');
      el.className = 'combat-stat-summary';

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
        val.style.cssText = `color:${color};font-weight:700;font-size:20px;font-family:${font};`;
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
      el.classList.add('fadeout');
    },
  });
}

export function showItemToastQueued(item, deps = {}, options = {}) {
  if (!item) return false;

  enqueueStackedToast({
    deps,
    durationMs: 3500,
    height: 108,
    createEl: (doc) => {
      const borderColor = {
        common: 'var(--border)',
        uncommon: 'rgba(123,47,255,0.5)',
        rare: 'rgba(240,180,41,0.5)',
      };
      const rarity = item.rarity || 'common';
      const el = doc.createElement('div');
      el.className = 'item-toast';
      el.style.borderColor = borderColor[rarity] || 'var(--border)';

      const icon = doc.createElement('div');
      icon.className = 'toast-icon';
      icon.textContent = item.icon || '•';

      const content = doc.createElement('div');
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

      content.append(rarityInfo, name, sub);
      el.append(icon, content);
      return el;
    },
  });

  return true;
}
