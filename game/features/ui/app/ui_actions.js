import { playUiClick } from '../../../domain/audio/audio_event_helpers.js';

export function createUiActions(modules, fns, ports) {
  function getDeckModalDeps() {
    return {
      ...ports.getDeckModalDeps(),
      DescriptionUtils: modules.DescriptionUtils,
      descriptionUtils: modules.DescriptionUtils,
      hideTooltip: () => modules.TooltipUI?.hideTooltip?.(ports.getTooltipDeps()),
      showTooltip: (event, cardId) => modules.TooltipUI?.showTooltip?.(event, cardId, ports.getTooltipDeps()),
    };
  }

  return {
    updateUI() {
      modules.HudUpdateUI?.updateUI?.(ports.getHudUpdateDeps());
    },

    _doUpdateUI() {
      modules.HudUpdateUI?.doUpdateUI?.(ports.getHudUpdateDeps());
    },

    _updateEndBtnWarn() {
      modules.HudUpdateUI?.updateEndBtnWarn?.(ports.getHudUpdateDeps());
    },

    updateStatusDisplay() {
      const doc = ports.doc;
      if (!doc?.getElementById) return;

      const containerIds = ['statusEffects', 'ncFloatingHpStatusBadges']
        .filter((id, idx, arr) => arr.indexOf(id) === idx)
        .filter((id) => doc.getElementById(id));

      if (!containerIds.length) {
        containerIds.push('statusEffects');
      }

      containerIds.forEach((statusContainerId) => {
        modules.StatusEffectsUI?.updateStatusDisplay?.({
          doc,
          gs: modules.GS,
          refreshCombatInfoPanel: () => fns._refreshCombatInfoPanel?.(),
          statusContainerId,
          tooltipUI: modules.TooltipUI,
          win: doc.defaultView || null,
        });
      });
    },

    _resetCombatInfoPanel() {
      modules.CombatInfoUI?.reset?.(ports.getCombatInfoDeps());
    },

    toggleCombatInfo() {
      modules.CombatInfoUI?.toggle?.(ports.getCombatInfoDeps());
    },

    _refreshCombatInfoPanel() {
      modules.CombatInfoUI?.refresh?.(ports.getCombatInfoDeps());
    },

    updateChainUI(chain) {
      modules.CombatHudUI?.updateChainUI?.(chain, ports.getCombatHudDeps());
    },

    updateNoiseWidget() {
      modules.CombatHudUI?.updateNoiseWidget?.(ports.getCombatHudDeps());
    },

    updateClassSpecialUI() {
      modules.CombatHudUI?.updateClassSpecialUI?.(ports.getCombatHudDeps());
    },

    setBar(id, pct) {
      modules.DomValueUI?.setBar?.(id, pct, { doc: ports.doc });
    },

    setText(id, value) {
      modules.DomValueUI?.setText?.(id, value, { doc: ports.doc });
    },

    showDeckView() {
      modules.DeckModalUI?.showDeckView?.(getDeckModalDeps());
    },

    _renderDeckModal() {
      modules.DeckModalUI?.renderDeckModal?.(getDeckModalDeps());
    },

    setDeckFilter(type) {
      modules.DeckModalUI?.setDeckFilter?.(type, getDeckModalDeps());
    },

    closeDeckView() {
      modules.DeckModalUI?.closeDeckView?.(ports.getDeckModalDeps());
    },

    openCodex() {
      playUiClick(modules.AudioEngine);
      modules.CodexUI?.openCodex?.(ports.getCodexDeps());
    },

    setCodexTab(tab) {
      modules.CodexUI?.setCodexTab?.(tab, ports.getCodexDeps());
    },

    renderCodexContent() {
      modules.CodexUI?.renderCodexContent?.(ports.getCodexDeps());
    },

    closeCodex() {
      modules.CodexUI?.closeCodex?.(ports.getCodexDeps());
    },

    showTooltip(event, cardId) {
      modules.TooltipUI?.showTooltip?.(event, cardId, ports.getTooltipDeps());
    },

    hideTooltip() {
      modules.TooltipUI?.hideTooltip?.(ports.getTooltipDeps());
    },

    attachCardTooltips() {
      modules.TooltipUI?.attachCardTooltips?.(ports.getTooltipDeps());
    },

    showItemTooltip(event, itemId) {
      modules.TooltipUI?.showItemTooltip?.(event, itemId, ports.getTooltipDeps());
    },

    hideItemTooltip() {
      modules.TooltipUI?.hideItemTooltip?.(ports.getTooltipDeps());
    },

    showGeneralTooltip(event, title, content) {
      modules.TooltipUI?.showGeneralTooltip?.(event, title, content, ports.getTooltipDeps());
    },

    hideGeneralTooltip() {
      modules.TooltipUI?.hideGeneralTooltip?.(ports.getTooltipDeps());
    },

    switchScreen(screen) {
      modules.ScreenUI?.switchScreen?.(screen, ports.getScreenDeps());
    },
  };
}
