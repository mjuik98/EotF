import {
  applyNodeTraversalState,
  resolveNodeByRef,
} from '../../../shared/state/map_state_commands.js';
import {
  consumeBossRewardFlags,
  resetRuntimeInteractionState,
  setNodeMovementLocked,
} from '../../../shared/state/runtime_flow_controls.js';
import {
  applyRunStartLoadout,
  createRunStartPlayer,
  createRunStateCommands,
  resetRunConfig,
  resetRuntimeState,
} from '../state/run_state_commands.js';
import {
  applyPlayerMaxHpPenalty,
  applyRunOutcomeRewards,
  applySilenceCurseTurnStart,
  beginRunOutcomeCommit,
  captureRunOutcomeTiming,
  recordDefeatProgress,
  recordVictoryProgress,
  syncRunOutcomeMeta,
} from '../state/run_outcome_state_commands.js';
import {
  buildRunAnalyticsSnapshot,
  ensureRunAnalytics,
  recordRunAnalytics,
} from '../domain/run_analytics.js';

export function createRunStateCapabilities() {
  return {
    applyNodeTraversalState,
    applyPlayerMaxHpPenalty,
    applyRunOutcomeRewards,
    applyRunStartLoadout,
    applySilenceCurseTurnStart,
    beginRunOutcomeCommit,
    buildRunAnalyticsSnapshot,
    captureRunOutcomeTiming,
    consumeBossRewardFlags,
    createRunStartPlayer,
    createRunStateCommands,
    recordDefeatProgress,
    recordRunAnalytics,
    resetRunConfig,
    resetRuntimeState,
    resetRuntimeInteractionState,
    recordVictoryProgress,
    resolveNodeByRef,
    setNodeMovementLocked,
    syncRunOutcomeMeta,
    ensureRunAnalytics,
  };
}

export {
  applyNodeTraversalState,
  applyPlayerMaxHpPenalty,
  applyRunOutcomeRewards,
  applyRunStartLoadout,
  applySilenceCurseTurnStart,
  beginRunOutcomeCommit,
  buildRunAnalyticsSnapshot,
  captureRunOutcomeTiming,
  consumeBossRewardFlags,
  createRunStartPlayer,
  createRunStateCommands,
  recordDefeatProgress,
  recordRunAnalytics,
  resetRunConfig,
  resetRuntimeState,
  resetRuntimeInteractionState,
  recordVictoryProgress,
  resolveNodeByRef,
  setNodeMovementLocked,
  syncRunOutcomeMeta,
  ensureRunAnalytics,
};
