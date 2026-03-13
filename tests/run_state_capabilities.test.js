import { describe, expect, it } from 'vitest';

import {
  applyPlayerMaxHpPenalty,
  applyRunOutcomeRewards,
  applySilenceCurseTurnStart,
  beginRunOutcomeCommit,
  captureRunOutcomeTiming,
  createRunStateCapabilities,
  recordDefeatProgress,
  recordVictoryProgress,
  syncRunOutcomeMeta,
} from '../game/features/run/ports/public_state_capabilities.js';

describe('run state capabilities', () => {
  it('exposes the canonical run state command surface', () => {
    const capabilities = createRunStateCapabilities();

    expect(capabilities.applyPlayerMaxHpPenalty).toBe(applyPlayerMaxHpPenalty);
    expect(capabilities.applyRunOutcomeRewards).toBe(applyRunOutcomeRewards);
    expect(capabilities.applySilenceCurseTurnStart).toBe(applySilenceCurseTurnStart);
    expect(capabilities.beginRunOutcomeCommit).toBe(beginRunOutcomeCommit);
    expect(capabilities.captureRunOutcomeTiming).toBe(captureRunOutcomeTiming);
    expect(capabilities.recordDefeatProgress).toBe(recordDefeatProgress);
    expect(capabilities.recordVictoryProgress).toBe(recordVictoryProgress);
    expect(capabilities.syncRunOutcomeMeta).toBe(syncRunOutcomeMeta);
  });
});
