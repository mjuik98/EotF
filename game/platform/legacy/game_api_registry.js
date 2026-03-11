import { buildLegacyGameAPICommandBindings } from './game_api_command_bindings.js';
import { buildLegacyGameAPIQueryBindings } from './game_api_query_bindings.js';
import { createLegacyGameApi } from './create_legacy_game_api.js';
import { registerLegacyGameModules } from './game_module_registry.js';

export function registerLegacyGameAPIBindings(modules, fns, deps, runtimeMetrics) {
  const commandBindings = buildLegacyGameAPICommandBindings(modules, fns);
  const queryBindings = buildLegacyGameAPIQueryBindings(modules, deps, runtimeMetrics);

  Object.assign(modules.GAME.API, createLegacyGameApi({
    codexActions: {
      closeCodex: commandBindings.closeCodex,
      closeDeckView: commandBindings.closeDeckView,
      openCodex: commandBindings.openCodex,
      setCodexTab: commandBindings.setCodexTab,
      setDeckFilter: commandBindings.setDeckFilter,
    },
    combatActions: {
      closeBattleChronicle: commandBindings.closeBattleChronicle,
      drawCards: commandBindings.drawCards,
      endPlayerTurn: commandBindings.endPlayerTurn,
      executePlayerDraw: commandBindings.executePlayerDraw,
      showEchoSkillTooltip: commandBindings.showEchoSkillTooltip,
      hideEchoSkillTooltip: commandBindings.hideEchoSkillTooltip,
      takeDamage: commandBindings.takeDamage,
      toggleBattleChronicle: commandBindings.toggleBattleChronicle,
      toggleHudPin: commandBindings.toggleHudPin,
    },
    queryBindings,
    rewardActions: {
      hideSkipConfirm: commandBindings.hideSkipConfirm,
      showSkipConfirm: commandBindings.showSkipConfirm,
      skipReward: commandBindings.skipReward,
    },
    runActions: {
      refreshRunModePanel: commandBindings.refreshRunModePanel,
      selectFragment: commandBindings.selectFragment,
      shiftAscension: commandBindings.shiftAscension,
      showWorldMemoryNotice: commandBindings.showWorldMemoryNotice,
      startGame: commandBindings.startGame,
    },
    settingsActions: {
      applySettingAccessibility: commandBindings.applySettingAccessibility,
      applySettingVisual: commandBindings.applySettingVisual,
      applySettingVolume: commandBindings.applySettingVolume,
      closeSettings: commandBindings.closeSettings,
      openSettings: commandBindings.openSettings,
      resetSettings: commandBindings.resetSettings,
      setSettingsTab: commandBindings.setSettingsTab,
      startSettingsRebind: commandBindings.startSettingsRebind,
      toggleSettingMute: commandBindings.toggleSettingMute,
    },
    uiActions: {
      continueRun: commandBindings.continueRun,
      openRunSettings: commandBindings.openRunSettings,
      quitGame: commandBindings.quitGame,
      selectClass: commandBindings.selectClass,
      showCharacterSelect: commandBindings.showCharacterSelect,
    },
  }));
}

export { registerLegacyGameModules } from './game_module_registry.js';
