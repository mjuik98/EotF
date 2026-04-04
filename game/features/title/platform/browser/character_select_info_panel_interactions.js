import { bindCharacterInfoLoadoutControls } from './character_select_info_panel_loadout_controls.js';
import {
  bindCharacterInfoDeckCardTooltips,
  bindCharacterInfoRelicTooltips,
  createCharacterInfoTooltipApis,
} from './character_select_info_panel_tooltips.js';

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

function bindEchoBadge(panel, _selectedChar, hover, echo, openModal) {
  const echoBadge = panel.querySelector('#echoBadge');
  if (!echoBadge) return;

  const applyHoverState = () => {
    hover?.();
    echoBadge.classList?.add('is-emphasized');
  };
  const clearHoverState = () => {
    echoBadge.classList?.remove('is-emphasized');
  };
  echoBadge.addEventListener('mouseenter', applyHoverState);
  echoBadge.addEventListener('mouseleave', clearHoverState);
  echoBadge.addEventListener('focus', applyHoverState);
  echoBadge.addEventListener('blur', clearHoverState);
  echoBadge.addEventListener('click', () => {
    echo?.();
    openModal?.(_selectedChar.echoSkill, _selectedChar.accent);
  });
}

export function bindCharacterInfoPanelInteractions({
  panel,
  selectedChar,
  cards,
  gs,
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
  onSelectLoadoutPresetSlot,
} = {}) {
  const { generalTooltip, cardTooltip } = createCharacterInfoTooltipApis({
    generalTooltipUI,
    cardTooltipUI,
  });
  generalTooltip.hideGeneralTooltip({ doc, win });

  bindTabInteractions(panel, hover);
  bindEchoBadge(panel, selectedChar, hover, echo, openModal);
  bindCharacterInfoRelicTooltips(panel, generalTooltip, { doc, win, hover });
  bindCharacterInfoDeckCardTooltips(panel, cardTooltip, { cards, hover, gs });
  bindCharacterInfoLoadoutControls({
    panel,
    selectedChar,
    loadoutState,
    onSaveLoadoutPreset,
    onClearLoadoutPreset,
    onSelectLoadoutPresetSlot,
  });
}
