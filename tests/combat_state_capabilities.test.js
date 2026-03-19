import { describe, expect, it } from 'vitest';

import {
  addCombatEnemyState,
  applyCombatEndCleanupState,
  beginPlayerTurnState,
  consumePlayerBuffStackState,
  createCombatStateCapabilities,
  finalizePlayerTurnEndState,
  prepareCombatDeckState,
  resetCombatSetupState,
  syncCombatSelectedTargetState,
} from '../game/features/combat/ports/public_state_capabilities.js';

describe('combat state capabilities', () => {
  it('exposes the canonical combat state command surface', () => {
    const capabilities = createCombatStateCapabilities();

    expect(capabilities.addCombatEnemyState).toBe(addCombatEnemyState);
    expect(capabilities.applyCombatEndCleanupState).toBe(applyCombatEndCleanupState);
    expect(capabilities.beginPlayerTurnState).toBe(beginPlayerTurnState);
    expect(capabilities.consumePlayerBuffStackState).toBe(consumePlayerBuffStackState);
    expect(capabilities.finalizePlayerTurnEndState).toBe(finalizePlayerTurnEndState);
    expect(capabilities.prepareCombatDeckState).toBe(prepareCombatDeckState);
    expect(capabilities.resetCombatSetupState).toBe(resetCombatSetupState);
    expect(capabilities.syncCombatSelectedTargetState).toBe(syncCombatSelectedTargetState);
  });
});
