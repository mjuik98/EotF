import { populateCombatCardFrame } from '../../../combat/ports/public_card_frame_capabilities.js';
import {
  getDescriptionUtils,
  getDoc,
  markRewardSelection,
  toRarityLabel,
  toTypeClass,
} from './reward_ui_helpers.js';

function resolveTooltipUI(deps) {
  return deps?.tooltipUI || deps?.TooltipUI || null;
}

export function renderRewardCardOption(container, cardId, data, gs, deps, onPick, idx) {
  const doc = getDoc(deps);
  const card = data.cards?.[cardId];
  if (!card) return;

  const wrapper = doc.createElement('button');
  wrapper.type = 'button';
  wrapper.className = 'reward-card-wrapper';
  wrapper.style.animationDelay = `${idx * 0.08}s`;
  wrapper.setAttribute('aria-label', `${card.name || cardId} card reward`);

  const cardEl = doc.createElement('div');
  const rarityClass = `rarity-${card.rarity || 'common'}`;
  const typeClass = toTypeClass(card.type);
  cardEl.className = `card card-frame-variant-reward ${rarityClass} ${typeClass}`.trim();
  cardEl.style.cssText = 'width:170px;height:260px;padding:14px;display:flex;flex-direction:column;gap:8px;';
  const descriptionUtils = getDescriptionUtils(deps);
  populateCombatCardFrame(cardEl, doc, {
    cardId,
    card,
    canPlay: true,
    displayCost: card.cost ?? 0,
    anyFree: false,
    totalDisc: 0,
    cardW: 170,
    descriptionUtils,
  }, {
    variant: 'reward',
    showHotkey: false,
  });
  wrapper.appendChild(cardEl);

  wrapper.addEventListener('mouseenter', (ev) => {
    const tooltipUI = resolveTooltipUI(deps);
    if (typeof tooltipUI?.showTooltip === 'function') {
      tooltipUI.showTooltip(ev, cardId, { ...deps, data, gs });
    }
  });
  wrapper.addEventListener('mouseleave', () => {
    const tooltipUI = resolveTooltipUI(deps);
    if (typeof tooltipUI?.hideTooltip === 'function') {
      tooltipUI.hideTooltip();
    }
  });
  wrapper.addEventListener('click', () => {
    markRewardSelection(container, wrapper);
    onPick?.();
  });

  container.appendChild(wrapper);
}

export function renderItemOption(container, item, deps, onPick, idx) {
  const doc = getDoc(deps);
  if (!item) return;

  const wrapper = doc.createElement('button');
  wrapper.type = 'button';
  wrapper.className = 'reward-card-wrapper';
  wrapper.style.animationDelay = `${idx * 0.08}s`;
  wrapper.setAttribute('aria-label', `${item.name || item.id} item reward`);

  const cardEl = doc.createElement('div');
  const rarityClass = `rarity-${item.rarity || 'common'}`;
  cardEl.className = `card ${rarityClass}`;
  cardEl.style.cssText = 'width:170px;height:260px;padding:14px;display:flex;flex-direction:column;gap:8px;border-color:var(--gold);';

  const icon = doc.createElement('div');
  icon.className = 'card-icon';
  icon.style.fontSize = '40px';
  icon.textContent = item.icon || '@';

  const name = doc.createElement('div');
  name.className = 'card-name reward-card-name';
  name.textContent = item.name || item.id;

  const desc = doc.createElement('div');
  desc.className = 'card-desc reward-card-desc';
  const descriptionUtils = getDescriptionUtils(deps);
  if (descriptionUtils) desc.innerHTML = descriptionUtils.highlight(item.desc || '');
  else desc.textContent = item.desc || '';

  const rarity = doc.createElement('div');
  rarity.className = `card-type reward-card-type ${rarityClass}`.trim();
  rarity.textContent = `Item - ${toRarityLabel(item.rarity)}`;

  cardEl.append(icon, name, desc, rarity);
  wrapper.appendChild(cardEl);
  wrapper.addEventListener('click', () => {
    markRewardSelection(container, wrapper);
    onPick?.();
  });
  container.appendChild(wrapper);
}

export function renderBlessingOption(container, blessing, deps, onPick, idx) {
  const doc = getDoc(deps);
  if (!blessing) return;

  const isDisabled = !!blessing.disabled;
  const wrapper = doc.createElement('button');
  wrapper.type = 'button';
  wrapper.className = 'reward-card-wrapper';
  wrapper.classList.add('reward-blessing-option');
  if (blessing.type) wrapper.classList.add(`reward-blessing-${blessing.type}`);
  wrapper.style.animationDelay = `${idx * 0.08}s`;
  wrapper.setAttribute('aria-label', `${blessing.name} blessing reward`);

  if (isDisabled) {
    wrapper.disabled = true;
    wrapper.setAttribute('aria-disabled', 'true');
    wrapper.classList.add('is-disabled');
    if (blessing.type === 'energy') wrapper.classList.add('reward-permanent-energy-disabled');
    if (blessing.disabledReason) wrapper.title = blessing.disabledReason;
  }

  const cardEl = doc.createElement('div');
  cardEl.className = 'card rarity-rare';
  cardEl.classList.add('reward-blessing-card');
  cardEl.style.cssText = 'width:170px;height:260px;padding:14px;display:flex;flex-direction:column;gap:8px;border-color:var(--glow);box-shadow:0 0 15px var(--glow);';

  const icon = doc.createElement('div');
  icon.className = 'card-icon';
  icon.style.fontSize = '40px';
  icon.textContent = blessing.icon || '+';

  const name = doc.createElement('div');
  name.className = 'card-name reward-card-name';
  name.textContent = blessing.name;

  const desc = doc.createElement('div');
  desc.className = 'card-desc reward-card-desc';
  desc.textContent = blessing.desc;

  const type = doc.createElement('div');
  type.className = 'card-type reward-card-type rarity-rare';
  type.textContent = 'Blessing';

  cardEl.append(icon, name, desc, type);

  if (isDisabled && blessing.type === 'energy') {
    const overlay = doc.createElement('div');
    overlay.className = 'reward-disabled-overlay';
    overlay.setAttribute('aria-hidden', 'true');

    const badge = doc.createElement('div');
    badge.className = 'reward-disabled-state-badge';
    badge.textContent = 'Cap Reached';

    const reason = doc.createElement('div');
    reason.className = 'reward-disabled-reason';
    reason.textContent = blessing.disabledReason || 'This reward is unavailable.';

    cardEl.append(overlay, badge, reason);
  }

  wrapper.appendChild(cardEl);
  if (!isDisabled) {
    wrapper.addEventListener('click', () => {
      markRewardSelection(container, wrapper);
      onPick?.();
    });
  }

  container.appendChild(wrapper);
}
