import { DomSafe } from '../../ports/presentation/public_combat_browser_support_capabilities.js';

export function computeItemToastDuration(item, options = {}) {
  const text = `${options?.typeLabel || ''} ${item?.name || ''} ${item?.desc || ''}`.trim();
  return Math.min(
    5200,
    3000 + text.length * 18,
  );
}

export function buildCombatSummaryToastView(doc, {
  dealt,
  taken,
  kills,
  className,
} = {}) {
  const el = doc.createElement('div');
  el.className = className;

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
}

export function buildItemToastView(doc, {
  item,
  rarity,
  options = {},
  className,
  highlightDescription,
  rarityLabels,
  rarityTextColors,
  mergedCount = 1,
} = {}) {
  const borderColor = {
    common: 'var(--border)',
    uncommon: 'rgba(123,47,255,0.5)',
    rare: 'rgba(240,180,41,0.5)',
  };
  const el = doc.createElement('div');
  el.className = className;
  el.style.borderColor = borderColor[rarity] || 'var(--border)';

  const icon = doc.createElement('div');
  icon.className = 'toast-icon';
  icon.textContent = item.icon || '•';

  const content = doc.createElement('div');
  content.style.cssText = 'display:flex;min-width:0;flex-direction:column;';
  const rarityInfo = doc.createElement('div');
  rarityInfo.className = 'toast-rarity';
  rarityInfo.textContent = options?.typeLabel || `${rarityLabels[rarity] || rarity} 아이템 획득`;

  const name = doc.createElement('div');
  name.className = 'toast-text';
  name.style.color = rarityTextColors[rarity] || 'var(--white)';
  name.textContent = item.name;

  const sub = doc.createElement('div');
  sub.className = 'toast-sub';
  if (typeof highlightDescription === 'function') {
    sub.innerHTML = highlightDescription(item.desc || '');
  } else {
    DomSafe.setHighlightedText(sub, item.desc || '');
  }

  const countBadge = doc.createElement('div');
  countBadge.className = 'stack-toast-count';
  countBadge.style.cssText = 'display:none;margin-top:8px;padding:3px 8px;border-radius:999px;background:rgba(123,47,255,0.16);';
  countBadge.textContent = `x${mergedCount}`;
  el._toastCountEl = countBadge;

  content.append(rarityInfo, name, sub, countBadge);
  el.append(icon, content);
  return el;
}
