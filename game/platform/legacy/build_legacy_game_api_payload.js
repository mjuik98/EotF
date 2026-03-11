export function buildLegacyGameApiPayload({ commandBindings, queryBindings }) {
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
  };
}
