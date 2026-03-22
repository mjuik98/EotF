import { RARITY_SORT_ORDER } from '../../../../../data/rarity_meta.js';
import { COMBAT_TEXT } from './combat_copy.js';
import { renderCombatRelicRail } from './combat_relic_rail_ui.js';

function resolveSetBonusSystem(deps) {
  return deps.setBonusSystem
    || deps.SetBonusSystem
    || null;
}

function resolveTooltipUI(deps) {
  return deps.tooltipUI
    || deps.TooltipUI
    || null;
}

export function updateItemPanels({ gs, deps, doc, data }) {
  const setBonusSystem = resolveSetBonusSystem(deps);
  const tooltipUI = resolveTooltipUI(deps);
  const win = deps.win || doc?.defaultView || null;
  const itemEl = doc.getElementById('itemSlots');
  const showItemTooltip = (event, itemId) => {
    if (typeof deps.showItemTooltip === 'function') {
      deps.showItemTooltip(event, itemId);
      return;
    }
    if (typeof tooltipUI?.showItemTooltip === 'function') {
      tooltipUI.showItemTooltip(event, itemId, { doc, win, data, gs, setBonusSystem });
    }
  };

  const hideItemTooltip = () => {
    if (typeof deps.hideItemTooltip === 'function') {
      deps.hideItemTooltip();
      return;
    }
    if (typeof tooltipUI?.hideItemTooltip === 'function') {
      tooltipUI.hideItemTooltip({ doc, win });
    }
  };

  if (itemEl) {
    itemEl.textContent = '';
    if (!gs.player.items.length) {
      const none = doc.createElement('span');
      none.style.cssText = 'font-size:11px;color:var(--text-dim);font-style:italic;';
      none.textContent = COMBAT_TEXT.emptyItemSlot;
      itemEl.appendChild(none);
    } else {
      const sortedItems = [...gs.player.items]
        .sort((a, b) => {
          const ra = RARITY_SORT_ORDER[data?.items?.[a]?.rarity || 'common'] ?? 3;
          const rb = RARITY_SORT_ORDER[data?.items?.[b]?.rarity || 'common'] ?? 3;
          return ra - rb;
        });

      sortedItems.forEach((id) => {
        const item = data?.items?.[id];
        if (!item) return;
        const slot = doc.createElement('div');
        slot.className = `hud-item-slot ${item.rarity ? `item-slot-${item.rarity}` : ''}`;
        const inSet = setBonusSystem
          ? Object.values(setBonusSystem.sets || {}).some((setInfo) => setInfo.items.includes(id))
          : false;
        if (inSet) slot.style.outline = '1px dashed rgba(0,255,204,0.4)';
        slot.textContent = item.icon;
        slot.addEventListener('mouseenter', (event) => showItemTooltip(event, id));
        slot.addEventListener('mouseleave', () => hideItemTooltip());
        itemEl.appendChild(slot);
      });
    }
  }

  const setBonusPanel = doc.getElementById('setBonusPanel');
  if (setBonusPanel) {
    const activeSets = setBonusSystem?.getActiveSets?.(gs) || [];
    setBonusPanel.textContent = '';
    if (activeSets.length > 0) {
      setBonusPanel.style.display = 'block';
      activeSets.forEach((setInfo) => {
        const div = doc.createElement('div');
        div.style.cssText = 'background:rgba(0,255,204,0.06);border:1px solid rgba(0,255,204,0.2);border-radius:6px;padding:5px 8px;margin-bottom:4px;';
        const name = doc.createElement('div');
        name.style.cssText = "font-family:'Cinzel',serif;font-size:8px;letter-spacing:0.2em;color:var(--cyan);";
        name.textContent = `${setInfo.name} [${setInfo.count}/3]`;
        const bonus = doc.createElement('div');
        bonus.style.cssText = 'font-size:9px;color:var(--text-dim);margin-top:2px;';
        bonus.textContent = setInfo.bonus?.label || '';
        div.append(name, bonus);
        setBonusPanel.appendChild(div);
      });
      setBonusSystem?.applyPassiveBonuses?.(gs);
    } else {
      setBonusPanel.style.display = 'none';
    }
  }

  renderCombatRelicRail({
    doc,
    gs,
    data,
    deps: {
      showItemTooltip,
      hideItemTooltip,
    },
  });
}
