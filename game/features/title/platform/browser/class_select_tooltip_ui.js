import { DomSafe } from '../../../../platform/browser/dom/public.js';

function getDoc(deps) {
  return deps?.doc || document;
}

function getWin(deps) {
  return deps?.win || globalThis;
}

function escapeHtml(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function showClassSelectTooltip(event, title, desc, deps = {}) {
  const doc = getDoc(deps);
  const win = getWin(deps);
  let tip = doc.getElementById('classSelectTooltip');
  if (!tip) {
    tip = doc.createElement('div');
    tip.id = 'classSelectTooltip';
    tip.className = 'class-select-tooltip';
    doc.body.appendChild(tip);
  }

  tip.innerHTML = '';
  if (Array.isArray(tip.children)) tip.children.length = 0;
  const titleEl = doc.createElement('div');
  titleEl.className = 'class-select-tooltip-title';
  titleEl.textContent = title || '';

  const descEl = doc.createElement('div');
  descEl.className = 'class-select-tooltip-desc';
  DomSafe.setHighlightedText(descEl, desc || '');
  tip.append(titleEl, descEl);

  if (typeof tip.innerHTML === 'string') {
    tip.innerHTML = `<div class="class-select-tooltip-title">${escapeHtml(titleEl.textContent)}</div><div class="class-select-tooltip-desc">${descEl.innerHTML}</div>`;
  }

  const anchor = event?.currentTarget || event?.target;
  const rect = anchor?.getBoundingClientRect?.() || { left: 0, bottom: 0 };
  tip.style.left = `${Math.min(rect.left, (win.innerWidth || 1280) - 300)}px`;
  tip.style.top = `${rect.bottom + 6}px`;
  tip.style.opacity = '1';
}

export function hideClassSelectTooltip(deps = {}) {
  const tip = getDoc(deps).getElementById('classSelectTooltip');
  if (tip) tip.style.opacity = '0';
}
