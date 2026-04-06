import { playUiClick } from '../../ports/public_audio_presentation_capabilities.js';
import { createCodexBrowserModuleCapabilities } from '../../integration/codex_browser_modules.js';

const codexBrowserModules = createCodexBrowserModuleCapabilities();

export function createUiActions(modules, fns, ports) {
  const coreModules = modules?.featureScopes?.core || {};
  const legacyModules = modules?.legacyModules || {};

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
      const hudUpdateDeps = ports.getHudUpdateDeps();

      const containerIds = ['statusEffects', 'ncFloatingHpStatusBadges']
        .filter((id, idx, arr) => arr.indexOf(id) === idx)
        .filter((id) => doc.getElementById(id));

      if (!containerIds.length) {
        containerIds.push('statusEffects');
      }

      containerIds.forEach((statusContainerId) => {
        modules.StatusEffectsUI?.updateStatusDisplay?.({
          doc,
          gs: hudUpdateDeps.gs || coreModules.GS || legacyModules.GS || modules.GS,
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

    togglePause() {
      modules.HelpPauseUI?.togglePause?.(ports.getHelpPauseDeps());
    },

    async openCodex() {
      playUiClick(modules.AudioEngine);
      await codexBrowserModules.ensurePrimary(modules);
      modules.CodexUI?.openCodex?.(ports.getCodexDeps());
    },

    async setCodexTab(tab) {
      await codexBrowserModules.ensurePrimary(modules);
      modules.CodexUI?.setCodexTab?.(tab, ports.getCodexDeps());
    },

    async renderCodexContent() {
      await codexBrowserModules.ensurePrimary(modules);
      modules.CodexUI?.renderCodexContent?.(ports.getCodexDeps());
    },

    async closeCodex() {
      await codexBrowserModules.ensurePrimary(modules);
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
