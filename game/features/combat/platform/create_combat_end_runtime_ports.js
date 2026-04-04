import {
  createCombatEndAudioPort,
  createCombatEndClockPort,
  createCombatEndRewardFlowPort,
  createCombatEndUiPort,
} from './combat_end_ports.js';

function resolveCombatEndRuntimeContext({ deps = {}, doc = null, win = null } = {}) {
  const resolvedWin = win || deps.win || doc?.defaultView || null;
  return {
    doc: doc || deps.doc || resolvedWin?.document || null,
    win: resolvedWin,
  };
}

export function createCombatEndRuntimePorts({ deps = {}, doc = null, win = null } = {}) {
  const runtime = resolveCombatEndRuntimeContext({ deps, doc, win });

  return {
    combatUiPort: createCombatEndUiPort({
      cleanupAllTooltips: deps.cleanupAllTooltips || runtime.win?.CombatUI?.cleanupAllTooltips,
      doc: runtime.doc,
      hudUpdateUI: deps.hudUpdateUI || runtime.win?.HudUpdateUI,
      renderCombatCards: deps.renderCombatCards || runtime.win?.renderCombatCards,
      renderHand: deps.renderHand || runtime.win?.renderHand,
      showCombatSummary: deps.showCombatSummary || runtime.win?.showCombatSummary,
      tooltipUI: deps.tooltipUI || runtime.win?.TooltipUI,
      updateChainUI: deps.updateChainUI || runtime.win?.updateChainUI,
      updateUI: deps.updateUI || runtime.win?.updateUI,
      win: runtime.win,
    }),
    rewardFlowPort: createCombatEndRewardFlowPort({
      openReward: deps.rewardFlow?.openReward || deps.rewardActions?.openReward,
      returnFromReward:
        deps.rewardActions?.returnFromReward
        || deps.returnFromReward
        || runtime.win?.returnFromReward,
      returnToGame:
        deps.rewardActions?.returnToGame
        || deps.returnToGame
        || runtime.win?.returnToGame,
      showRewardScreen: deps.showRewardScreen || runtime.win?.showRewardScreen,
    }),
    audioPort: createCombatEndAudioPort({
      playItemGet: deps.playItemGet,
    }),
    clock: createCombatEndClockPort({
      setTimeoutFn: deps.setTimeoutFn || runtime.win?.setTimeout?.bind?.(runtime.win) || setTimeout,
    }),
  };
}
