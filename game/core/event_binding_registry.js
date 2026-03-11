export const WINDOW_EXPOSE_NAMES = [
  'shiftAscension', 'toggleEndlessMode', 'cycleRunCurse', 'selectRunCurse',
  'openCodexFromTitle', 'showCharacterSelect', 'continueRun', 'backToTitle', 'openRunSettings',
  'closeRunSettings', 'startGame', 'selectClass', 'showDmgPopup', 'showCombatSummary',
  'showItemTooltip', 'hideItemTooltip', 'showWorldMemoryNotice', 'quitGame',
  'showFullMap', 'toggleHudPin', 'showIntentTooltip', 'hideIntentTooltip',
  'renderCombatEnemies', 'updateEnemyHpUI', 'renderCombatCards', 'renderHand',
  'updateEchoSkillBtn', 'updateCombatLog', 'updateHandFanEffect',
  'closeDeckView', 'closeCodex', 'updateNoiseWidget', 'updateClassSpecialUI',
  'selectTarget', 'showRewardScreen', 'takeRewardItem', 'takeRewardUpgrade',
  'takeRewardRemove', 'setMasterVolume', 'setSfxVolume', 'setAmbientVolume',
  'endPlayerTurn', 'takeRewardCard', 'moveToNode', 'toggleHelp', 'togglePause',
  'abandonRun', 'confirmAbandon', 'showDeckView', 'useEchoSkill', 'drawCard',
  'resolveEvent', 'returnToGame', 'openCodex', 'toggleCombatInfo', 'updateStatusDisplay',
  'showCardPlayEffect',
  'openSettings', 'closeSettings', 'setSettingsTab', 'resetSettings',
  'applySettingVolume', 'applySettingVisual', 'applySettingAccessibility',
  'startSettingsRebind', 'toggleSettingMute',
];

const MODULE_REGISTRY_NAMES = [
  'EventUI',
  'CombatUI',
  'HudUpdateUI',
  'StatusEffectsUI',
  'MazeSystem',
  'StoryUI',
  'CodexUI',
  'EndingScreenUI',
  'RunModeUI',
  'MetaProgressionUI',
  'HelpPauseUI',
  'SettingsUI',
  'TooltipUI',
  'FeedbackUI',
  'ScreenUI',
  'RunSetupUI',
  'RunStartUI',
  'ClassMechanics',
  'RunRules',
  'CardCostUtils',
  'GameAPI',
];

function resolveBindingRoot(modules) {
  const gameDeps = modules?.GAME?.getDeps?.() || {};
  if (gameDeps.win) return gameDeps.win;
  if (gameDeps.doc?.defaultView) return gameDeps.doc.defaultView;
  try {
    const host = Function('return this')();
    return host?.window || host || null;
  } catch {
    return null;
  }
}

export function exposeBindingsToWindow(modules, fns, deps) {
  const root = resolveBindingRoot(modules);
  if (!root) return;

  WINDOW_EXPOSE_NAMES.forEach((name) => {
    if (fns[name]) root[name] = fns[name];
  });

  root.updateUI = () => modules.HudUpdateUI?.updateUI?.(deps.getHudUpdateDeps());
  root._syncVolumeUI = () => modules.GameInit?.syncVolumeUI?.(modules.AudioEngine);
  root.showEnemyStatusTooltip = (event, statusKey) => modules.CombatUI?.showEnemyStatusTooltip?.(event, statusKey, modules.GAME.getDeps());
  root.hideEnemyStatusTooltip = () => modules.CombatUI?.hideEnemyStatusTooltip?.(modules.GAME.getDeps());
  root.DescriptionUtils = modules.DescriptionUtils;
  root.CardCostUtils = modules.CardCostUtils;
  root._resetCombatInfoPanel = fns._resetCombatInfoPanel;
}

export function registerGameAPIBindings(modules, fns, deps, runtimeMetrics) {
  Object.assign(modules.GAME.API, {
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
    getSaveOutboxMetrics: () => modules.SaveSystem?.getOutboxMetrics?.() || null,
    flushSaveOutbox: () => modules.SaveSystem?.flushOutbox?.() || 0,
    getRuntimeMetrics: (options) => runtimeMetrics.getRuntimeMetrics(options),
    resetRuntimeMetrics: () => runtimeMetrics.resetRuntimeMetrics(),
    updateUI: () => modules.HudUpdateUI?.updateUI?.(deps.getHudUpdateDeps()),
    updateCombatLog: fns.updateCombatLog,
    updateEchoSkillBtn: (overrideDeps) => modules.CombatHudUI?.updateEchoSkillBtn?.(overrideDeps || modules.GAME.getDeps()),
    refreshRunModePanel: fns.refreshRunModePanel,
    startGame: fns.startGame,
    useEchoSkill: fns.useEchoSkill,
    takeDamage: (amt) => modules.GameAPI?.applyPlayerDamage?.(amt, modules.GS),
    drawCards: (count, gs) => modules.GameAPI?.drawCards?.(count, gs),
    executePlayerDraw: (gs) => modules.GameAPI?.executePlayerDraw?.(gs),
    drawCard: fns.drawCard,
    endPlayerTurn: fns.endPlayerTurn,
    renderCombatCards: fns.renderCombatCards,
    processDirtyFlags: () => modules.HudUpdateUI?.processDirtyFlags?.(deps.getHudUpdateDeps()),
    setCodexTab: (tab) => fns.setCodexTab(tab),
    closeCodex: fns.closeCodex,
    openCodex: fns.openCodex,
    setDeckFilter: (filterValue) => fns.setDeckFilter(filterValue),
    closeDeckView: fns.closeDeckView,
    toggleHudPin: fns.toggleHudPin,
    toggleBattleChronicle: fns.toggleBattleChronicle,
    openBattleChronicle: fns.openBattleChronicle,
    closeBattleChronicle: fns.closeBattleChronicle,
    showEchoSkillTooltip: fns.showEchoSkillTooltip,
    hideEchoSkillTooltip: fns.hideEchoSkillTooltip,
    showSkipConfirm: fns.showSkipConfirm,
    skipReward: fns.skipReward,
    hideSkipConfirm: fns.hideSkipConfirm,
    showWorldMemoryNotice: fns.showWorldMemoryNotice,
    selectFragment: fns.selectFragment,
    shiftAscension: fns.shiftAscension,
    openSettings: fns.openSettings,
    closeSettings: fns.closeSettings,
    setSettingsTab: fns.setSettingsTab,
    resetSettings: fns.resetSettings,
    applySettingVolume: fns.applySettingVolume,
    applySettingVisual: fns.applySettingVisual,
    applySettingAccessibility: fns.applySettingAccessibility,
    startSettingsRebind: fns.startSettingsRebind,
    toggleSettingMute: fns.toggleSettingMute,
    SettingsUI: modules.SettingsUI,
  });
}

export function registerGameModules(modules) {
  MODULE_REGISTRY_NAMES.forEach((name) => {
    modules.GAME.register(name, modules[name]);
  });
}
