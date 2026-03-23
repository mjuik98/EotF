import { describe, expect, it } from 'vitest';

import {
  activateCombat,
  addCombatEnemyState,
  applyCombatEndCleanupState,
  beginPlayerTurnState,
  consumePlayerBuffStackState,
  createCombatStateCapabilities,
  deactivateCombat,
  finalizePlayerTurnEndState,
  prepareCombatDeckState,
  resetCombatSetupState,
  syncGuardianPreservedShield,
  syncCombatSelectedTargetState,
} from '../game/features/combat/ports/public_state_capabilities.js';

describe('combat state capabilities', () => {
  it('exposes the canonical combat state command surface', () => {
    const capabilities = createCombatStateCapabilities();

    expect(capabilities.activateCombat).toBe(activateCombat);
    expect(capabilities.addCombatEnemyState).toBe(addCombatEnemyState);
    expect(capabilities.applyCombatEndCleanupState).toBe(applyCombatEndCleanupState);
    expect(capabilities.beginPlayerTurnState).toBe(beginPlayerTurnState);
    expect(capabilities.consumePlayerBuffStackState).toBe(consumePlayerBuffStackState);
    expect(capabilities.deactivateCombat).toBe(deactivateCombat);
    expect(capabilities.finalizePlayerTurnEndState).toBe(finalizePlayerTurnEndState);
    expect(capabilities.prepareCombatDeckState).toBe(prepareCombatDeckState);
    expect(capabilities.resetCombatSetupState).toBe(resetCombatSetupState);
    expect(capabilities.syncGuardianPreservedShield).toBe(syncGuardianPreservedShield);
    expect(capabilities.syncCombatSelectedTargetState).toBe(syncCombatSelectedTargetState);
  });
});
