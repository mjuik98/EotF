import { bindCharacterInfoLoadoutControls } from './character_select_info_panel_loadout_controls.js';
import { DescriptionUtils } from '../../../../utils/description_utils.js';

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

function bindTabInteractions(panel, hover) {
  const tabButtons = panel.querySelectorAll('.char-info-tab');
  const tabPanes = panel.querySelectorAll('.char-info-pane');
  const activateTab = (tabName) => {
    tabButtons.forEach((btn) => {
      const active = btn.dataset.tab === tabName;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    tabPanes.forEach((pane) => pane.classList.toggle('is-active', pane.dataset.pane === tabName));
  };

  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!btn.classList.contains('is-active')) hover?.();
      activateTab(btn.dataset.tab);
    });
  });
}

function bindEchoBadge(panel, selectedChar, hover, echo, openModal) {
  const echoBadge = panel.querySelector('#echoBadge');
  if (!echoBadge) return;

  echoBadge.addEventListener('mouseenter', () => {
    hover?.();
    echoBadge.style.borderColor = `${selectedChar.accent}aa`;
    echoBadge.style.background = `linear-gradient(135deg,${selectedChar.accent}1e,${selectedChar.color}1a)`;
    echoBadge.style.boxShadow = `0 0 16px ${selectedChar.accent}33`;
  });
  echoBadge.addEventListener('mouseleave', () => {
    echoBadge.style.borderColor = `${selectedChar.accent}44`;
    echoBadge.style.background = `linear-gradient(135deg,${selectedChar.accent}0e,${selectedChar.color}08)`;
    echoBadge.style.boxShadow = 'none';
  });
  echoBadge.addEventListener('click', () => {
    echo?.();
    openModal?.(selectedChar.echoSkill, selectedChar.accent);
  });
}

function bindRelicTooltips(panel, generalTooltip, doc, win, hover) {
  const relicBadges = typeof panel.querySelectorAll === 'function'
    ? Array.from(panel.querySelectorAll('.relic-inner') || [])
    : [];
  const fallbackRelicBadge = relicBadges.length === 0 ? panel.querySelector('.relic-inner') : null;

  (fallbackRelicBadge ? [fallbackRelicBadge] : relicBadges).forEach((relicBadge) => {
    if (!relicBadge) return;
    relicBadge.addEventListener('mouseenter', (event) => {
      hover?.();
      generalTooltip.showGeneralTooltip(
        event,
        relicBadge.dataset.relicTitle || '',
        DescriptionUtils.highlight(relicBadge.dataset.relicDesc || ''),
        { doc, win },
      );
    });
    relicBadge.addEventListener('mouseleave', () => generalTooltip.hideGeneralTooltip({ doc, win }));
  });
}

function bindDeckCardTooltips(panel, cardTooltip, cards, hover) {
  const mockGs = { getBuff: () => null, player: { echoChain: 0 } };
  panel.querySelectorAll('.deck-card').forEach((element) => {
    element.addEventListener('mouseenter', (event) => {
      hover?.();
      cardTooltip.showTooltip(event, element.dataset.cid, { data: { cards }, gs: mockGs });
    });
    element.addEventListener('mouseleave', () => cardTooltip.hideTooltip());
  });
}

export function bindCharacterInfoPanelInteractions({
  panel,
  selectedChar,
  cards,
  generalTooltipUI,
  cardTooltipUI,
  doc,
  win,
  hover,
  echo,
  openModal,
  loadoutState,
  onSaveLoadoutPreset,
  onClearLoadoutPreset,
} = {}) {
  const generalTooltip = generalTooltipUI || createNullGeneralTooltipApi();
  const cardTooltip = cardTooltipUI || createNullCardTooltipApi();
  generalTooltip.hideGeneralTooltip({ doc, win });

  bindTabInteractions(panel, hover);
  bindEchoBadge(panel, selectedChar, hover, echo, openModal);
  bindRelicTooltips(panel, generalTooltip, doc, win, hover);
  bindDeckCardTooltips(panel, cardTooltip, cards, hover);
  bindCharacterInfoLoadoutControls({
    panel,
    selectedChar,
    loadoutState,
    onSaveLoadoutPreset,
    onClearLoadoutPreset,
  });
}
