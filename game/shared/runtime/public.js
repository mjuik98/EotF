export {
  composeLegacyGameApiQueryGroups,
  composeLegacyGameApiPayload,
  buildLegacyMetricsQueryBindings,
  buildLegacySaveQueryBindings,
  composeLegacyGameApiRuntimeQueryGroups,
  composeLegacyWindowQueryGroups,
  flattenLegacyGameApiQueryGroups,
  flattenLegacyGameApiRuntimeQueryGroups,
} from './legacy_query_groups.js';

export function buildLegacySharedModuleQueries(modules) {
  return {
    AudioEngine: modules.AudioEngine,
    ParticleSystem: modules.ParticleSystem,
    ScreenShake: modules.ScreenShake,
    HitStop: modules.HitStop,
    FovEngine: modules.FovEngine,
    DifficultyScaler: modules.DifficultyScaler,
    RandomUtils: modules.RandomUtils,
    RunRules: modules.RunRules,
    getRegionData: modules.getRegionData,
    getBaseRegionIndex: modules.getBaseRegionIndex,
    getRegionCount: modules.getRegionCount,
    ClassMechanics: modules.ClassMechanics,
    SetBonusSystem: modules.SetBonusSystem,
    SaveSystem: modules.SaveSystem,
    CardCostUtils: modules.CardCostUtils,
    SettingsUI: modules.SettingsUI,
  };
}

export function buildLegacyUtilityQueries(modules) {
  return {
    DescriptionUtils: modules.DescriptionUtils,
    CardCostUtils: modules.CardCostUtils,
  };
}

export function buildLegacyGameApiActionGroups(commandBindings) {
  return {
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
    rewardActions: {
      hideSkipConfirm: commandBindings.hideSkipConfirm,
      returnFromReward: commandBindings.returnFromReward,
      returnToGame: commandBindings.returnToGame,
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
  };
}

export function mergeLegacyWindowQueryGroups(groups = {}) {
  return {
    ...(groups.ui || {}),
    ...(groups.utility || {}),
  };
}

export function assignLegacyCompatSurface(target, api) {
  if (!target || !api) return target;
  Object.assign(target, api);
  return target;
}
