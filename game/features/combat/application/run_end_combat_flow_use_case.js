import { buildCombatEndOutcome } from '../presentation/build_combat_end_outcome.js';
import {
  createCombatEndAudioPort,
  createCombatEndClockPort,
  createCombatEndRewardFlowPort,
  createCombatEndUiPort,
} from '../platform/combat_end_ports.js';
import { endCombatUseCase } from './end_combat_use_case.js';

export function runEndCombatFlow({
  combatStateCommands,
  beforeCombatEndCleanup,
  deps = {},
  dispatchCombatEnd,
  doc,
  getBaseRegionIndex,
  getRegionCount,
  gs,
  isEndlessRun,
  reportError,
  win,
} = {}) {
  const buildOutcome = (state) => buildCombatEndOutcome(state, {
    getBaseRegionIndex,
    getRegionCount,
    isEndlessRun,
  });

  const combatUiPort = createCombatEndUiPort({
    cleanupAllTooltips: deps.cleanupAllTooltips || win?.CombatUI?.cleanupAllTooltips,
    doc,
    hudUpdateUI: deps.hudUpdateUI || win?.HudUpdateUI,
    renderCombatCards: deps.renderCombatCards || win?.renderCombatCards,
    renderHand: deps.renderHand || win?.renderHand,
    showCombatSummary: deps.showCombatSummary || win?.showCombatSummary,
    tooltipUI: deps.tooltipUI || win?.TooltipUI,
    updateChainUI: deps.updateChainUI || win?.updateChainUI,
    updateUI: deps.updateUI || win?.updateUI,
    win,
  });
  const rewardFlowPort = createCombatEndRewardFlowPort({
    openReward: deps.rewardFlow?.openReward || deps.rewardActions?.openReward,
    returnFromReward: deps.rewardActions?.returnFromReward || deps.returnFromReward || win?.returnFromReward,
    returnToGame: deps.rewardActions?.returnToGame || deps.returnToGame || win?.returnToGame,
    showRewardScreen: deps.showRewardScreen || win?.showRewardScreen,
  });
  const audioPort = createCombatEndAudioPort({
    playItemGet: deps.playItemGet,
  });
  const clock = createCombatEndClockPort({
    setTimeoutFn: deps.setTimeoutFn || win?.setTimeout?.bind?.(win) || setTimeout,
  });

  return endCombatUseCase({
    audioPort,
    beforeCombatEndCleanup: beforeCombatEndCleanup || deps.beforeCombatEndCleanup,
    buildOutcome,
    clock,
    combatStateCommands,
    combatUiPort,
    dispatchCombatEnd,
    gs,
    onError: reportError,
    rewardFlowPort,
    runRules: deps.runRules,
  });
}
