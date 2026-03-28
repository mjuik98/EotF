import { bindTooltipTrigger } from '../../../ui/ports/public_tooltip_support_capabilities.js';

function createNullGeneralTooltipApi() {
  return {
    hideGeneralTooltip() {},
    showGeneralTooltip() {},
  };
}

function createNullCardTooltipApi() {
  return {
    hideTooltip() {},
    showTooltip() {},
  };
}

export function createCharacterInfoTooltipApis({ generalTooltipUI, cardTooltipUI } = {}) {
  return {
    cardTooltip: cardTooltipUI || createNullCardTooltipApi(),
    generalTooltip: generalTooltipUI || createNullGeneralTooltipApi(),
  };
}

export function bindCharacterInfoRelicTooltips(panel, generalTooltip, { doc, win, hover } = {}) {
  const relicBadges = typeof panel.querySelectorAll === 'function'
    ? Array.from(panel.querySelectorAll('.relic-inner') || [])
    : [];
  const fallbackRelicBadge = relicBadges.length === 0 ? panel.querySelector('.relic-inner') : null;

  (fallbackRelicBadge ? [fallbackRelicBadge] : relicBadges).forEach((relicBadge) => {
    if (!relicBadge) return;
    bindTooltipTrigger(relicBadge, {
      label: `${relicBadge.dataset.relicTitle || ''}. ${relicBadge.dataset.relicDesc || ''}`,
      show(event) {
        hover?.();
        generalTooltip.showGeneralTooltip(
          event,
          relicBadge.dataset.relicTitle || '',
          relicBadge.dataset.relicDesc || '',
          { doc, win },
        );
      },
      hide() {
        generalTooltip.hideGeneralTooltip({ doc, win });
      },
    });
  });
}

export function bindCharacterInfoDeckCardTooltips(panel, cardTooltip, { cards, hover, gs } = {}) {
  panel.querySelectorAll('.deck-card').forEach((element) => {
    const ariaLabel = element.dataset.cardLabel || element.dataset.cid || '카드';
    bindTooltipTrigger(element, {
      label: ariaLabel,
      show(event) {
        hover?.();
        cardTooltip.showTooltip(event, element.dataset.cid, { data: { cards }, gs });
      },
      hide() {
        cardTooltip.hideTooltip();
      },
    });
  });
}
