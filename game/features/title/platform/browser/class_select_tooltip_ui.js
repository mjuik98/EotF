import { DescriptionUtils } from '../../../../utils/description_utils.js';

function getDoc(deps) {
  return deps?.doc || document;
}

function getWin(deps) {
  return deps?.win || globalThis;
}

export function showClassSelectTooltip(event, title, desc, deps = {}) {
  const doc = getDoc(deps);
  const win = getWin(deps);
  const highlightedDesc = DescriptionUtils.highlight(desc || '');
  let tip = doc.getElementById('classSelectTooltip');
  if (!tip) {
    tip = doc.createElement('div');
    tip.id = 'classSelectTooltip';
    tip.className = 'class-select-tooltip';
    doc.body.appendChild(tip);
  }

  tip.innerHTML = `
    <div class="class-select-tooltip-title">${title}</div>
    <div class="class-select-tooltip-desc">${highlightedDesc}</div>
  `;

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
