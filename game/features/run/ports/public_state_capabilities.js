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

export function createRunStateCapabilities() {
  return {
    applyPlayerMaxHpPenalty,
    applyRunOutcomeRewards,
    applySilenceCurseTurnStart,
    beginRunOutcomeCommit,
    captureRunOutcomeTiming,
    recordDefeatProgress,
    recordVictoryProgress,
    syncRunOutcomeMeta,
  };
}

export {
  applyPlayerMaxHpPenalty,
  applyRunOutcomeRewards,
  applySilenceCurseTurnStart,
  beginRunOutcomeCommit,
  captureRunOutcomeTiming,
  recordDefeatProgress,
  recordVictoryProgress,
  syncRunOutcomeMeta,
};
