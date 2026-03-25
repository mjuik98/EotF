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
    tip.style.cssText = `
      position:fixed; z-index:99999; pointer-events:none;
      background:rgba(10,10,25,0.95); border:1px solid rgba(0,255,204,0.3);
      border-radius:8px; padding:10px 14px; max-width:280px;
      box-shadow:0 4px 20px rgba(0,0,0,0.6); backdrop-filter:blur(8px);
      opacity:0; transition:opacity 0.15s;
    `;
    doc.body.appendChild(tip);
  }

  tip.innerHTML = `
    <div class="class-select-tooltip-title" style="font-family:'Cinzel',serif;font-size:11px;color:var(--cyan,#00ffcc);letter-spacing:0.05em;margin-bottom:4px;">${title}</div>
    <div class="class-select-tooltip-desc" style="font-size:10px;color:rgba(200,200,220,0.85);line-height:1.5;">${highlightedDesc}</div>
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
