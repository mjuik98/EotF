import { resolveScopedRuntimeModule } from './resolve_scoped_runtime_module.js';

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
    AudioEngine: resolveScopedRuntimeModule(modules, 'AudioEngine', ['core']),
    ParticleSystem: resolveScopedRuntimeModule(modules, 'ParticleSystem', ['core']),
    ScreenShake: resolveScopedRuntimeModule(modules, 'ScreenShake', ['core']),
    HitStop: resolveScopedRuntimeModule(modules, 'HitStop', ['core']),
    FovEngine: resolveScopedRuntimeModule(modules, 'FovEngine', ['core']),
    DifficultyScaler: resolveScopedRuntimeModule(modules, 'DifficultyScaler', ['core']),
    RandomUtils: resolveScopedRuntimeModule(modules, 'RandomUtils', ['core']),
    RunRules: resolveScopedRuntimeModule(modules, 'RunRules', ['core']),
    getRegionData: resolveScopedRuntimeModule(modules, 'getRegionData', ['core']),
    getBaseRegionIndex: resolveScopedRuntimeModule(modules, 'getBaseRegionIndex', ['core']),
    getRegionCount: resolveScopedRuntimeModule(modules, 'getRegionCount', ['core']),
    ClassMechanics: resolveScopedRuntimeModule(modules, 'ClassMechanics', ['core']),
    SetBonusSystem: resolveScopedRuntimeModule(modules, 'SetBonusSystem', ['core']),
    SaveSystem: resolveScopedRuntimeModule(modules, 'SaveSystem', ['core']),
    CardCostUtils: resolveScopedRuntimeModule(modules, 'CardCostUtils', ['core']),
    SettingsUI: resolveScopedRuntimeModule(modules, 'SettingsUI', ['screen']),
  };
}

export function buildLegacyUtilityQueries(modules) {
  return {
    DescriptionUtils: resolveScopedRuntimeModule(modules, 'DescriptionUtils', ['core']),
    CardCostUtils: resolveScopedRuntimeModule(modules, 'CardCostUtils', ['core']),
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
