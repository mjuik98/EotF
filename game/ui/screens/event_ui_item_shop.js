import { EventManager } from '../../systems/event_manager.js';
import { RARITY_LABELS } from '../../../data/rarity_meta.js';
import {
  ITEM_SHOP_RARITY_BORDER_COLORS,
  ITEM_SHOP_RARITY_TEXT_COLORS,
} from '../../../data/ui_rarity_styles.js';
import { playUiItemGetFeedback } from '../../domain/audio/audio_event_helpers.js';
import { dismissTransientOverlay, getShopItemIcon } from './event_ui_helpers.js';

const ITEM_SHOP_RARITY_CONFIG = Object.freeze({
  common: {
    label: RARITY_LABELS.common,
    color: ITEM_SHOP_RARITY_TEXT_COLORS.common,
    border: ITEM_SHOP_RARITY_BORDER_COLORS.common,
  },
  uncommon: {
    label: RARITY_LABELS.uncommon,
    color: ITEM_SHOP_RARITY_TEXT_COLORS.uncommon,
    border: ITEM_SHOP_RARITY_BORDER_COLORS.uncommon,
  },
  rare: {
    label: RARITY_LABELS.rare,
    color: ITEM_SHOP_RARITY_TEXT_COLORS.rare,
    border: ITEM_SHOP_RARITY_BORDER_COLORS.rare,
  },
  legendary: {
    label: RARITY_LABELS.legendary,
    color: ITEM_SHOP_RARITY_TEXT_COLORS.legendary,
    border: ITEM_SHOP_RARITY_BORDER_COLORS.legendary,
  },
});

export function showEventItemShopOverlay(gs, data, runRules, deps = {}) {
  if (!gs?.player || !data?.items || !runRules) return;

  const shopStock = EventManager.generateItemShopStock(gs, data, runRules);
  const doc = deps.doc || document;
  const overlay = doc.createElement('div');
  overlay.id = 'itemShopOverlay';
  overlay.className = 'item-shop-overlay';

  const titleCont = doc.createElement('div');
  titleCont.className = 'item-shop-title';

  const eyebrow = doc.createElement('div');
  eyebrow.className = 'item-shop-eyebrow';
  eyebrow.textContent = 'ITEM SHOP';

  const bigTitle = doc.createElement('div');
  bigTitle.className = 'item-shop-main-title';
  bigTitle.textContent = 'What will you buy?';

  const goldInfo = doc.createElement('div');
  goldInfo.className = 'item-shop-gold';
  goldInfo.textContent = 'Gold: ';
  const goldVal = doc.createElement('span');
  goldVal.id = 'itemShopGold';
  goldVal.textContent = gs.player.gold;
  goldInfo.appendChild(goldVal);

  titleCont.append(eyebrow, bigTitle, goldInfo);

  const list = doc.createElement('div');
  list.id = 'itemShopList';
  list.className = 'item-shop-list';

  const closeBtn = doc.createElement('button');
  closeBtn.className = 'item-shop-close-btn';
  closeBtn.textContent = '\uB2EB\uAE30';
  closeBtn.onclick = () => dismissTransientOverlay(overlay);

  overlay.append(titleCont, list, closeBtn);
  doc.body.appendChild(overlay);

  const shopList = doc.getElementById('itemShopList');
  if (!shopList) return;

  const renderShopList = () => {
    goldVal.textContent = gs.player.gold;
    shopList.textContent = '';

    shopStock.forEach(({ item, cost, rarity }) => {
      const rc = ITEM_SHOP_RARITY_CONFIG[rarity] || ITEM_SHOP_RARITY_CONFIG.common;
      const alreadyOwned = (gs.player.items || []).includes(item.id);
      const canAfford = gs.player.gold >= cost;
      const purchasable = !alreadyOwned && canAfford;

      const card = doc.createElement('div');
      card.className = `item-shop-card rarity-${rarity}`;
      card.style.setProperty('--shop-border-color', rc.border);
      card.style.setProperty('--shop-rarity-color', rc.color);
      card.style.opacity = purchasable ? '1' : '0.5';
      card.style.cursor = purchasable ? 'pointer' : 'not-allowed';

      const rarityLabel = doc.createElement('div');
      rarityLabel.className = 'item-shop-rarity';
      rarityLabel.style.color = rc.color;
      rarityLabel.textContent = rc.label;

      const iconEl = doc.createElement('div');
      iconEl.className = 'item-shop-icon';
      iconEl.textContent = getShopItemIcon(item, rarity);

      const nameEl = doc.createElement('div');
      nameEl.className = 'item-shop-name';
      nameEl.style.color = rc.color;
      nameEl.textContent = item.name;

      const descEl = doc.createElement('div');
      descEl.className = 'item-shop-desc';
      if (deps.descriptionUtils?.highlight) descEl.innerHTML = deps.descriptionUtils.highlight(item.desc);
      else descEl.textContent = item.desc;

      const costEl = doc.createElement('div');
      costEl.className = 'item-shop-cost';
      costEl.textContent = `${cost} \uACE8\uB4DC`;

      card.append(rarityLabel, iconEl, nameEl, descEl, costEl);

      if (alreadyOwned) {
        const ownedOverlay = doc.createElement('div');
        ownedOverlay.className = 'item-shop-owned-overlay';
        const ownedLabel = doc.createElement('span');
        ownedLabel.className = 'item-shop-owned-label';
        ownedLabel.textContent = '\uBCF4\uC720 \uC911';
        ownedOverlay.appendChild(ownedLabel);
        card.appendChild(ownedOverlay);
      } else if (purchasable) {
        card.onmouseenter = () => {
          card.style.borderColor = 'var(--cyan)';
          card.style.transform = 'translateY(-3px)';
          card.style.boxShadow = '0 8px 24px rgba(0,255,204,0.2)';
        };
        card.onmouseleave = () => {
          card.style.borderColor = rc.border;
          card.style.transform = '';
          card.style.boxShadow = '';
        };
        card.onclick = () => {
          const result = EventManager.purchaseItem(gs, item, cost);
          if (!result.success) return;

          playUiItemGetFeedback(deps.playItemGet, deps.audioEngine);
          deps.showItemToast?.(item, { forceQueue: true });
          deps.updateUI?.();
          deps.refreshEventGoldBar?.();
          renderShopList();
        };
      }

      shopList.appendChild(card);
    });
  };

  renderShopList();
}
