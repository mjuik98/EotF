import { RARITY_LABELS } from '../../../../../data/rarity_meta.js';
import {
  buildItemTooltipFallbackParts,
  buildItemTooltipFallbackText,
} from './item_tooltip_fallback_text.js';
import { resolveItemDetailState } from './item_detail_state.js';

const RARITY_SORT_ORDER = {
  legendary: 0,
  epic: 1,
  rare: 2,
  uncommon: 3,
  common: 4,
};

function normalizeRarity(rarity) {
  return String(rarity || 'common').toLowerCase();
}

function isTouchLikeViewport(win) {
  if (!win) return false;
  return 'ontouchstart' in win || Number(win?.innerWidth || 0) < 900;
}

function setPanelOpen(detailPanel, isOpen, itemId = '') {
  if (!detailPanel?.dataset) return;
  detailPanel.dataset.open = isOpen ? 'true' : 'false';
  if (isOpen && itemId) detailPanel.dataset.itemId = itemId;
  else delete detailPanel.dataset.itemId;
  detailPanel.style.display = isOpen ? 'block' : 'none';
}

function markActiveSlot(slotsEl, activeSlot) {
  for (const slot of slotsEl?.children || []) {
    if (!slot) continue;
    if (slot === activeSlot) {
      if (slot.dataset) slot.dataset.active = 'true';
      slot.style.transform = 'translateY(-1px)';
      slot.style.borderColor = 'rgba(0, 255, 204, 0.36)';
      slot.style.background = 'rgba(0, 255, 204, 0.08)';
      slot.style.boxShadow = '0 0 0 1px rgba(0, 255, 204, 0.12), 0 10px 22px rgba(0, 0, 0, 0.25)';
    } else {
      if (slot.dataset) delete slot.dataset.active;
      slot.style.transform = '';
      slot.style.borderColor = '';
      slot.style.background = '';
      slot.style.boxShadow = '';
    }
  }
}

function applyDetailPanelStyles(detailPanel, detailPanelList) {
  if (detailPanel) {
    detailPanel.style.cssText = 'pointer-events:none;width:min(320px,calc(100vw - 36px));margin-top:10px;padding:12px;border-radius:14px;border:1px solid rgba(123,47,255,0.24);background:linear-gradient(180deg,rgba(8,8,24,0.96),rgba(6,6,18,0.92));box-shadow:0 18px 40px rgba(0,0,0,0.28);backdrop-filter:blur(18px);display:none;';
  }
  if (detailPanelList) {
    detailPanelList.style.cssText = 'display:flex;flex-direction:column;gap:8px;';
  }
}

function createPanelBlock(doc, className, text, style = '') {
  const el = doc.createElement('div');
  el.className = className;
  el.textContent = text;
  if (style) el.style.cssText = style;
  return el;
}

function resolveChargeText(liveCharge) {
  if (!liveCharge) return '';
  if (liveCharge.type === 'bool') return liveCharge.active ? '현재 활성화됨' : '비활성';
  if (liveCharge.type === 'num') return `${liveCharge.val} / ${liveCharge.max}`;
  return liveCharge.remaining > 0 ? `${liveCharge.remaining}회 남음` : '소진됨';
}

function renderDetailPanel({ doc, detailPanel, detailPanelList, slotsEl, activeSlot, itemId, item, data, gs, setBonusSystem }) {
  if (!detailPanelList) {
    setPanelOpen(detailPanel, false);
    return;
  }

  const state = resolveItemDetailState(itemId, item, data, gs, setBonusSystem);
  const rarityLabel = RARITY_LABELS[state.rarity] || state.rarity;
  const fallback = buildItemTooltipFallbackParts(item, itemId);

  detailPanelList.textContent = '';
  detailPanelList.appendChild(createPanelBlock(
    doc,
    'combat-relic-panel-title',
    `${item.icon || '?'} ${fallback.title || itemId}`,
    "font-family:'Cinzel',serif;font-size:14px;font-weight:700;color:var(--white);",
  ));
  detailPanelList.appendChild(createPanelBlock(
    doc,
    'combat-relic-panel-meta',
    `${rarityLabel} · ${state.triggerText}`,
    'font-size:9px;letter-spacing:0.16em;text-transform:uppercase;color:var(--cyan);',
  ));
  if (fallback.desc) {
    detailPanelList.appendChild(createPanelBlock(
      doc,
      'combat-relic-panel-desc',
      fallback.desc,
      'font-size:11px;line-height:1.6;color:var(--text);border-radius:10px;padding:8px 10px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);',
    ));
  }

  if (state.liveCharge) {
    detailPanelList.appendChild(
      createPanelBlock(
        doc,
        'combat-relic-panel-charge',
        `${state.liveCharge.label}: ${resolveChargeText(state.liveCharge)}`,
        'font-size:11px;line-height:1.6;color:var(--text);border-radius:10px;padding:8px 10px;background:rgba(0,255,204,0.05);border:1px solid rgba(0,255,204,0.12);',
      ),
    );
  }

  if (state.setDef) {
    detailPanelList.appendChild(
      createPanelBlock(
        doc,
        'combat-relic-panel-section-title',
        `세트 · ${state.setDef.name} (${state.setCount}/${state.setDef.items.length})`,
        "font-family:'Cinzel',serif;font-size:10px;letter-spacing:0.14em;color:#c4b5fd;margin-top:2px;",
      ),
    );

    state.setDef.items.forEach((memberId, index) => {
      const memberData = data?.items?.[memberId];
      const owned = state.setOwnedFlags[index] ? '보유 ' : '';
      detailPanelList.appendChild(
        createPanelBlock(
          doc,
          'combat-relic-panel-set-row',
          `${owned}${memberData?.icon || '?'} ${memberData?.name || memberId}`,
          'font-size:11px;line-height:1.6;color:var(--text);border-radius:10px;padding:8px 10px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);',
        ),
      );
    });

    const bonusEntries = Object.entries(state.setDef.bonuses || {}).sort(([left], [right]) => Number(left) - Number(right));
    bonusEntries.forEach(([tier, bonus]) => {
      const active = state.setCount >= Number(tier) ? '활성' : '대기';
      detailPanelList.appendChild(
        createPanelBlock(
          doc,
          'combat-relic-panel-bonus',
          `${tier}세트 ${active} · ${bonus?.label || ''}`,
          'font-size:11px;line-height:1.6;color:var(--text);border-radius:10px;padding:8px 10px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);',
        ),
      );
    });
  }

  setPanelOpen(detailPanel, true, itemId);
  markActiveSlot(slotsEl, activeSlot);
}

function closeDetailPanel(detailPanel, detailPanelList, slotsEl) {
  if (detailPanelList) detailPanelList.textContent = '';
  setPanelOpen(detailPanel, false);
  markActiveSlot(slotsEl, null);
}

export function renderCombatRelicRail({ doc, gs, data, deps = {} }) {
  const countEl = doc?.getElementById?.('combatRelicRailCount');
  const slotsEl = doc?.getElementById?.('combatRelicRailSlots');
  const detailPanel = doc?.getElementById?.('combatRelicPanel');
  const detailPanelList = detailPanel ? doc?.getElementById?.('combatRelicPanelList') : null;
  const win = deps?.win || doc?.defaultView || null;

  const touchLikeViewport = isTouchLikeViewport(win);
  const setBonusSystem = deps?.setBonusSystem || null;

  const items = Array.isArray(gs?.player?.items) ? gs.player.items : [];

  if (countEl) countEl.textContent = String(items.length);

  applyDetailPanelStyles(detailPanel, detailPanelList);
  closeDetailPanel(detailPanel, detailPanelList, slotsEl);

  if (!slotsEl) return;
  slotsEl.textContent = '';

  const sortedItems = [...items].filter((itemId) => {
    return !!data?.items?.[itemId];
  });

  const slotSortedItems = [...sortedItems].sort((leftId, rightId) => {
    const left = RARITY_SORT_ORDER[normalizeRarity(data?.items?.[leftId]?.rarity)] ?? 3;
    const right = RARITY_SORT_ORDER[normalizeRarity(data?.items?.[rightId]?.rarity)] ?? 3;
    return left - right;
  });

  slotSortedItems.forEach((itemId) => {
    const item = data?.items?.[itemId];
    if (!item) return;

    const slot = doc.createElement('button');
    slot.type = 'button';
    slot.textContent = item.icon || '';
    slot.title = buildItemTooltipFallbackText(item, itemId);

    slot.addEventListener('mouseenter', () => {
      renderDetailPanel({ doc, detailPanel, detailPanelList, slotsEl, activeSlot: slot, itemId, item, data, gs, setBonusSystem });
    });
    slot.addEventListener('focus', () => {
      renderDetailPanel({ doc, detailPanel, detailPanelList, slotsEl, activeSlot: slot, itemId, item, data, gs, setBonusSystem });
    });
    slot.addEventListener('mouseleave', () => {
      closeDetailPanel(detailPanel, detailPanelList, slotsEl);
    });
    slot.addEventListener('blur', () => {
      closeDetailPanel(detailPanel, detailPanelList, slotsEl);
    });

    if (touchLikeViewport) {
      slot.addEventListener('click', (event) => {
        event?.preventDefault?.();
        const isOpen = detailPanel?.dataset?.open === 'true' && detailPanel?.dataset?.itemId === itemId;
        if (isOpen) {
          closeDetailPanel(detailPanel, detailPanelList, slotsEl);
          return;
        }
        renderDetailPanel({ doc, detailPanel, detailPanelList, slotsEl, activeSlot: slot, itemId, item, data, gs, setBonusSystem });
      });
    }

    slotsEl.appendChild(slot);
  });
}
