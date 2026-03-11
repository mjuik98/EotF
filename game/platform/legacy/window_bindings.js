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

export function attachLegacyWindowBindings(modules, fns, deps) {
  const root = resolveBindingRoot(modules);
  if (!root) return;

  WINDOW_EXPOSE_NAMES.forEach((name) => {
    if (fns[name]) root[name] = fns[name];
  });

  root.updateUI = () => modules.HudUpdateUI?.updateUI?.(deps.getHudUpdateDeps());
  root._syncVolumeUI = () => modules.GameInit?.syncVolumeUI?.(modules.AudioEngine);
  root.showEnemyStatusTooltip = (event, statusKey) =>
    modules.CombatUI?.showEnemyStatusTooltip?.(event, statusKey, modules.GAME.getDeps());
  root.hideEnemyStatusTooltip = () =>
    modules.CombatUI?.hideEnemyStatusTooltip?.(modules.GAME.getDeps());
  root.DescriptionUtils = modules.DescriptionUtils;
  root.CardCostUtils = modules.CardCostUtils;
  root._resetCombatInfoPanel = fns._resetCombatInfoPanel;
}
