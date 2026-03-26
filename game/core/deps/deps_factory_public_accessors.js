export const PUBLIC_DEP_ACCESSOR_CONTRACTS = Object.freeze({
  baseDeps: 'base',
  getStoryDeps: 'story',
  getCombatTurnBaseDeps: 'combatTurnBase',
  getEventDeps: 'event',
  getRewardDeps: 'reward',
  getRunReturnDeps: 'runReturn',
  getCombatFlowDeps: 'combatFlow',
  getEventFlowDeps: 'eventFlow',
  getRewardFlowDeps: 'rewardFlow',
  getHudUpdateDeps: 'hudUpdate',
  getCombatHudDeps: 'combatHud',
  getCardTargetDeps: 'cardTarget',
  baseCardDeps: 'baseCard',
  getFeedbackDeps: 'feedback',
  getCodexDeps: 'codex',
  getDeckModalDeps: 'deckModal',
  getTooltipDeps: 'tooltip',
  getScreenDeps: 'screen',
  getCombatInfoDeps: 'combatInfo',
  getClassSelectDeps: 'classSelect',
  getSaveSystemDeps: 'saveSystem',
  getRunModeDeps: 'runMode',
  getRunStartDeps: 'runStart',
  getRunSetupDeps: 'runSetup',
  getRunNodeHandoffDeps: 'runNodeHandoff',
  getMetaProgressionDeps: 'metaProgression',
  getRegionTransitionDeps: 'regionTransition',
  getHelpPauseDeps: 'helpPause',
  getWorldCanvasDeps: 'worldCanvas',
  getSettingsDeps: 'settings',
  getGameBootDeps: 'gameBoot',
});

export function createPublicDepAccessors(createDeps) {
  return Object.freeze(
    Object.fromEntries(
      Object.entries(PUBLIC_DEP_ACCESSOR_CONTRACTS).map(([accessorName, contractName]) => ([
        accessorName,
        () => createDeps(contractName),
      ])),
    ),
  );
}
