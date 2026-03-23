import { describe, expect, it } from 'vitest';

import {
  applyNodeTraversalState,
  applyPlayerMaxHpPenalty,
  applyRunOutcomeRewards,
  applyRunStartLoadout,
  applySilenceCurseTurnStart,
  beginRunOutcomeCommit,
  captureRunOutcomeTiming,
  consumeBossRewardFlags,
  createRunStartPlayer,
  createRunStateCapabilities,
  createRunStateCommands,
  recordDefeatProgress,
  resetRunConfig,
  resetRuntimeInteractionState,
  resetRuntimeState,
  recordVictoryProgress,
  resolveNodeByRef,
  setNodeMovementLocked,
  syncRunOutcomeMeta,
} from '../game/features/run/ports/public_state_capabilities.js';

describe('run state capabilities', () => {
  it('exposes the canonical run state command surface', () => {
    const capabilities = createRunStateCapabilities();

    expect(capabilities.applyNodeTraversalState).toBe(applyNodeTraversalState);
    expect(capabilities.applyPlayerMaxHpPenalty).toBe(applyPlayerMaxHpPenalty);
    expect(capabilities.applyRunOutcomeRewards).toBe(applyRunOutcomeRewards);
    expect(capabilities.applyRunStartLoadout).toBe(applyRunStartLoadout);
    expect(capabilities.applySilenceCurseTurnStart).toBe(applySilenceCurseTurnStart);
    expect(capabilities.beginRunOutcomeCommit).toBe(beginRunOutcomeCommit);
    expect(capabilities.captureRunOutcomeTiming).toBe(captureRunOutcomeTiming);
    expect(capabilities.consumeBossRewardFlags).toBe(consumeBossRewardFlags);
    expect(capabilities.createRunStartPlayer).toBe(createRunStartPlayer);
    expect(capabilities.createRunStateCommands).toBe(createRunStateCommands);
    expect(capabilities.recordDefeatProgress).toBe(recordDefeatProgress);
    expect(capabilities.resetRunConfig).toBe(resetRunConfig);
    expect(capabilities.resetRuntimeInteractionState).toBe(resetRuntimeInteractionState);
    expect(capabilities.resetRuntimeState).toBe(resetRuntimeState);
    expect(capabilities.recordVictoryProgress).toBe(recordVictoryProgress);
    expect(capabilities.resolveNodeByRef).toBe(resolveNodeByRef);
    expect(capabilities.setNodeMovementLocked).toBe(setNodeMovementLocked);
    expect(capabilities.syncRunOutcomeMeta).toBe(syncRunOutcomeMeta);
  });
});
