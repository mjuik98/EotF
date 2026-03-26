import { populateCombatCardFrame } from '../../../combat/ports/public_card_frame_capabilities.js';
import { DomSafe } from '../../../ui/ports/public_feature_support_capabilities.js';
import { bindTooltipTrigger, createTooltipTriggerEvent } from '../../../ui/ports/public_shared_support_capabilities.js';
import {
  getDescriptionUtils,
  getDoc,
  markRewardSelection,
  toRarityLabel,
  toTypeClass,
} from './reward_ui_helpers.js';

function callTooltipMethod(deps, method, ...args) {
  const tooltipUI = deps?.tooltipUI || deps?.TooltipUI;
  if (typeof tooltipUI?.[method] !== 'function') return;
  tooltipUI[method](...args);
}

function hideRewardTooltips(deps) {
  callTooltipMethod(deps, 'hideTooltip', deps);
  callTooltipMethod(deps, 'hideItemTooltip', deps);
  callTooltipMethod(deps, 'hideGeneralTooltip', deps);
}

function bindRewardTooltipHandlers(wrapper, deps, show, hideMethod) {
  if (typeof show !== 'function') return;
  bindTooltipTrigger(wrapper, {
    label: wrapper.getAttribute?.('aria-label') || '',
    show,
    hide() {
      callTooltipMethod(deps, hideMethod, deps);
    },
  });
}

function applyRewardCardShell(el, extraClasses = []) {
  el.className = [el.className, 'reward-card-shell', ...extraClasses].filter(Boolean).join(' ').trim();
}

function setHighlightedRewardText(el, text, descriptionUtils = null) {
  if (!el) return;
  if (descriptionUtils && typeof descriptionUtils.highlight === 'function') {
    el.innerHTML = descriptionUtils.highlight(text || '');
    return;
  }
  DomSafe.setHighlightedText(el, text || '');
}

export function renderRewardCardOption(container, cardId, data, gs, deps, onPick, idx) {
  const doc = getDoc(deps);
  const card = data.cards?.[cardId];
  if (!card) return;
  const isUpgradedReward = !!card.upgraded;

  const wrapper = doc.createElement('button');
  wrapper.type = 'button';
  wrapper.className = 'reward-card-wrapper';
  if (isUpgradedReward) {
    wrapper.classList.add('reward-upgraded-card');
    wrapper.title = '강화 카드 보상';
  }
  wrapper.style.animationDelay = `${idx * 0.08}s`;
  wrapper.setAttribute('aria-label', `${card.name || cardId} 카드 보상`);

  const cardEl = doc.createElement('div');
  const rarityClass = `rarity-${card.rarity || 'common'}`;
  const typeClass = toTypeClass(card.type);
  cardEl.className = `card card-frame-variant-reward ${rarityClass} ${typeClass}`.trim();
  applyRewardCardShell(cardEl);
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
  if (isUpgradedReward) {
    const highrollBadge = doc.createElement('div');
    highrollBadge.className = 'reward-upgraded-highroll-badge';
    highrollBadge.textContent = '강화 카드';
    wrapper.appendChild(highrollBadge);
  }
  bindRewardTooltipHandlers(
    wrapper,
    deps,
    (event) => callTooltipMethod(
      deps,
      'showTooltip',
      createTooltipTriggerEvent(event, wrapper),
      cardId,
      { ...deps, data, gs },
    ),
    'hideTooltip',
  );
  wrapper.addEventListener('click', () => {
    hideRewardTooltips(deps);
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
  wrapper.setAttribute('aria-label', `${item.name || item.id} 유물 보상`);
  const tooltipData = deps.data || { items: { [item.id]: item } };

  const cardEl = doc.createElement('div');
  const rarityClass = `rarity-${item.rarity || 'common'}`;
  cardEl.className = `card ${rarityClass}`;
  applyRewardCardShell(cardEl, ['reward-item-card']);

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
  setHighlightedRewardText(desc, item.desc || '', descriptionUtils);

  const rarity = doc.createElement('div');
  rarity.className = `card-type reward-card-type ${rarityClass}`.trim();
  rarity.textContent = `유물 · ${toRarityLabel(item.rarity)}`;

  cardEl.append(icon, name, desc, rarity);
  wrapper.appendChild(cardEl);
  bindRewardTooltipHandlers(
    wrapper,
    deps,
    (event) => callTooltipMethod(
      deps,
      'showItemTooltip',
      createTooltipTriggerEvent(event, wrapper),
      item.id,
      { ...deps, data: tooltipData, gs: deps.gs },
    ),
    'hideItemTooltip',
  );
  wrapper.addEventListener('click', () => {
    hideRewardTooltips(deps);
    markRewardSelection(container, wrapper);
    onPick?.();
  });
  container.appendChild(wrapper);
}

export function renderBlessingOption(container, blessing, deps, onPick, idx) {
  const doc = getDoc(deps);
  if (!blessing) return;
  const descriptionUtils = getDescriptionUtils(deps);

  const isDisabled = !!blessing.disabled;
  const wrapper = doc.createElement('button');
  wrapper.type = 'button';
  wrapper.className = 'reward-card-wrapper';
  wrapper.classList.add('reward-blessing-option');
  if (blessing.type) wrapper.classList.add(`reward-blessing-${blessing.type}`);
  wrapper.style.animationDelay = `${idx * 0.08}s`;
  wrapper.setAttribute('aria-label', `${blessing.name} 축복 보상`);

  if (isDisabled) {
    wrapper.setAttribute('aria-disabled', 'true');
    wrapper.classList.add('is-disabled');
    if (blessing.type === 'energy') wrapper.classList.add('reward-permanent-energy-disabled');
    if (blessing.disabledReason) wrapper.title = blessing.disabledReason;
  }

  const cardEl = doc.createElement('div');
  cardEl.className = 'card rarity-rare';
  cardEl.classList.add('reward-blessing-card');
  applyRewardCardShell(cardEl);
  const tooltipContent = blessing.disabledReason
    ? `${blessing.desc || ''}\n\n${blessing.disabledReason}`
    : blessing.desc || '';

  const icon = doc.createElement('div');
  icon.className = 'card-icon';
  icon.style.fontSize = '40px';
  icon.textContent = blessing.icon || '+';

  const name = doc.createElement('div');
  name.className = 'card-name reward-card-name';
  name.textContent = blessing.name;

  const desc = doc.createElement('div');
  desc.className = 'card-desc reward-card-desc';
  setHighlightedRewardText(desc, blessing.desc || '', descriptionUtils);

  const type = doc.createElement('div');
  type.className = 'card-type reward-card-type rarity-rare';
  type.textContent = '축복';

  cardEl.append(icon, name, desc, type);

  if (isDisabled && blessing.type === 'energy') {
    const overlay = doc.createElement('div');
    overlay.className = 'reward-disabled-overlay';
    overlay.setAttribute('aria-hidden', 'true');

    const badge = doc.createElement('div');
    badge.className = 'reward-disabled-state-badge';
    badge.textContent = '최대치 도달';

    const reason = doc.createElement('div');
    reason.className = 'reward-disabled-reason';
    reason.textContent = blessing.disabledReason || '현재는 선택할 수 없습니다.';

    cardEl.append(overlay, badge, reason);
  }

  wrapper.appendChild(cardEl);
  bindRewardTooltipHandlers(
    wrapper,
    deps,
    (event) => callTooltipMethod(
      deps,
      'showGeneralTooltip',
      createTooltipTriggerEvent(event, wrapper),
      blessing.name || '축복',
      tooltipContent,
      deps,
    ),
    'hideGeneralTooltip',
  );
  if (!isDisabled) {
    wrapper.addEventListener('click', () => {
      hideRewardTooltips(deps);
      markRewardSelection(container, wrapper);
      onPick?.();
    });
  }

  container.appendChild(wrapper);
}
