import { DomSafe } from '../../ports/presentation/public_combat_browser_support_capabilities.js';
import {
  COMBAT_INFO_ITEM_RARITY_BORDER_COLORS,
  RARITY_SORT_ORDER,
  RARITY_TEXT_COLORS,
} from '../../ports/presentation/public_combat_card_support_capabilities.js';

export function renderCombatInfoItems({ doc, itemEl, items, data }) {
  itemEl.textContent = '';
  if (!items.length) {
    const none = doc.createElement('span');
    none.style.cssText = 'font-size:10px;color:var(--text-dim);font-style:italic;';
    none.textContent = '없음';
    itemEl.appendChild(none);
    return;
  }

  const sorted = [...items].sort((a, b) => (
    (RARITY_SORT_ORDER[data.items[a]?.rarity || 'common'] ?? 3)
    - (RARITY_SORT_ORDER[data.items[b]?.rarity || 'common'] ?? 3)
  ));

  const frag = doc.createDocumentFragment();
  sorted.forEach((id) => {
    const item = data.items[id];
    if (!item) return;
    const rarity = item.rarity || 'common';

    const row = doc.createElement('div');
    row.style.cssText = `display:flex; gap:10px; align-items:flex-start; background:rgba(255,255,255,0.025); border:1px solid ${COMBAT_INFO_ITEM_RARITY_BORDER_COLORS[rarity]}; border-radius:8px; padding:8px 10px;`;

    const icon = doc.createElement('span');
    icon.style.cssText = 'font-size:20px;flex-shrink:0;line-height:1.2;';
    icon.textContent = item.icon;

    const info = doc.createElement('div');
    const name = doc.createElement('div');
    name.style.cssText = `font-family:'Cinzel',serif;font-size:9px;font-weight:700;color:${RARITY_TEXT_COLORS[rarity] || 'var(--white)'};line-height:1.5;`;
    name.textContent = item.name;
    const desc = doc.createElement('div');
    desc.style.cssText = 'font-size:9px;color:var(--text-dim);line-height:1.5;';
    desc.className = 'hud-item-tip-desc combat-info-item-desc';
    DomSafe.setHighlightedText(desc, item.desc);

    info.append(name, desc);
    row.append(icon, info);
    frag.appendChild(row);
  });

  itemEl.appendChild(frag);
}
