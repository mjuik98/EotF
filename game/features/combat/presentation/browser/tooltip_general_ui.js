export function showGeneralTooltipUi(event, title, content, deps = {}) {
  const doc = deps?.doc || document;
  const win = deps?.win || window;
  const previous = win._generalTipEl;
  if (previous) {
    previous.remove();
    win._generalTipEl = null;
  }

  const el = doc.createElement('div');
  el.id = '_generalTip';
  el.className = 'general-tooltip';
  el.style.cssText = [
    'position:fixed;z-index:10000;',
    'background:rgba(10,10,35,0.98);border:1px solid var(--echo);border-left:3px solid var(--echo);border-radius:8px;',
    'padding:12px;width:220px;pointer-events:none;',
    'backdrop-filter:blur(20px);',
    'box-shadow:0 10px 40px rgba(0,0,0,0.8);',
    'animation:fadeIn 0.15s ease both;',
  ].join('');

  const titleEl = doc.createElement('div');
  titleEl.className = 'general-tooltip-title';
  titleEl.style.cssText = "font-family:'Cinzel',serif;font-size:11px;font-weight:700;color:var(--gold);margin-bottom:6px;letter-spacing:0.05em;";
  titleEl.textContent = title;

  const contentEl = doc.createElement('div');
  contentEl.className = 'general-tooltip-desc';
  contentEl.style.cssText = 'font-size:11px;color:var(--text);line-height:1.6;';
  contentEl.innerHTML = content;

  el.append(titleEl, contentEl);

  const rect = event.currentTarget.getBoundingClientRect();
  let x = rect.right + 10;
  let y = rect.top;
  const margin = 8;
  const maxRight = Math.max(margin, win.innerWidth - margin);

  el.style.left = '0px';
  el.style.top = '0px';
  doc.body.appendChild(el);
  const tipRect = el.getBoundingClientRect();
  const tipW = Math.max(180, tipRect.width || 220);
  const tipH = Math.max(80, tipRect.height || 120);

  if (x + tipW > maxRight) x = rect.left - tipW - 10;
  if (x < margin) x = margin;
  if (x + tipW > maxRight) x = Math.max(margin, maxRight - tipW);

  if (y + tipH + margin > win.innerHeight) y = win.innerHeight - tipH - margin;
  if (y < margin) y = margin;

  el.style.left = `${Math.round(x)}px`;
  el.style.top = `${Math.round(y)}px`;
  win._generalTipEl = el;
}

export function hideGeneralTooltipUi(deps = {}) {
  const win = deps?.win || window;
  if (win._generalTipEl) {
    win._generalTipEl.remove();
    win._generalTipEl = null;
  }
}
