export async function endCombatUseCase({
  buildOutcome,
  beforeCombatEndCleanup,
  clock,
  combatStateCommands,
  combatUiPort,
  dispatchCombatEnd,
  gs,
  onError,
  rewardFlowPort,
  runRules,
  audioPort,
} = {}) {
  if (!gs?.combat?.active) return { skipped: true, reason: 'inactive' };
  if (!combatStateCommands?.beginResolution?.(gs)) {
    return { skipped: true, reason: 'locked' };
  }

  const outcome = typeof buildOutcome === 'function' ? buildOutcome(gs) : {};

  try {
    runRules?.onCombatEnd?.(gs);
    beforeCombatEndCleanup?.(gs, outcome);
    dispatchCombatEnd?.(gs);

    combatUiPort?.resetAfterCombat?.(outcome.uiReset);
    audioPort?.playItemGet?.();
    combatUiPort?.showSummary?.(outcome.summary);

    if (outcome.bossRewardState) {
      combatStateCommands?.setBossRewardState?.(gs, outcome.bossRewardState);
    }

    if (outcome.returnDirectlyToRun) {
      await clock?.delay?.(outcome.delays?.directReturnMs || 300);
      rewardFlowPort?.returnFromReward?.();
      return outcome;
    }

    combatUiPort?.hideNodeOverlay?.();
    await clock?.delay?.(outcome.delays?.rewardScreenMs || 1000);
    combatStateCommands?.setCombatActive?.(gs, false);
    rewardFlowPort?.openReward?.(outcome.rewardMode);

    return outcome;
  } catch (error) {
    onError?.(error);
    return {
      ...outcome,
      error,
    };
  } finally {
    combatStateCommands?.completeResolution?.(gs);
  }
}
