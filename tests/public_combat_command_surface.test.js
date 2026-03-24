import { describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  createCombatApplicationCapabilities: vi.fn(),
  applyEnemyDamageState: vi.fn(),
  applyEnemyDamageRuntime: vi.fn(),
  discardStateCard: vi.fn(),
  endCombatRuntime: vi.fn(),
  playRuntimeCard: vi.fn(),
}));

vi.mock('../game/features/combat/ports/public_application_capabilities.js', () => ({
  createCombatApplicationCapabilities: hoisted.createCombatApplicationCapabilities,
}));

import {
  applyCombatEnemyDamage,
  discardCombatCard,
  endCombatRuntimeFlow,
  playCombatRuntimeCard,
} from '../game/features/combat/platform/public_combat_command_surface.js';

describe('public_combat_command_surface', () => {
  it('falls back from state damage to runtime damage when no actualDamage is returned', () => {
    hoisted.applyEnemyDamageState.mockReturnValueOnce({});
    hoisted.applyEnemyDamageRuntime.mockReturnValueOnce(9);
    hoisted.createCombatApplicationCapabilities.mockReturnValueOnce({
      applyEnemyDamageState: hoisted.applyEnemyDamageState,
      applyEnemyDamageRuntime: hoisted.applyEnemyDamageRuntime,
      discardStateCard: hoisted.discardStateCard,
      endCombatRuntime: hoisted.endCombatRuntime,
      playRuntimeCard: hoisted.playRuntimeCard,
    });

    const result = applyCombatEnemyDamage({
      amount: 9,
      targetIdx: 1,
      gs: { id: 'gs' },
      runtimeDeps: { updateUI: vi.fn() },
    });

    expect(result).toBe(9);
    expect(hoisted.applyEnemyDamageState).toHaveBeenCalledWith({ id: 'gs' }, { amount: 9, targetIdx: 1 });
    expect(hoisted.applyEnemyDamageRuntime).toHaveBeenCalledWith({ id: 'gs' }, {
      amount: 9,
      targetIdx: 1,
      deps: { updateUI: expect.any(Function) },
    });
  });

  it('delegates play, discard, and endCombat runtime calls through combat application capabilities', () => {
    const logger = { info: vi.fn() };
    hoisted.createCombatApplicationCapabilities.mockReturnValue({
      applyEnemyDamageState: hoisted.applyEnemyDamageState,
      applyEnemyDamageRuntime: hoisted.applyEnemyDamageRuntime,
      discardStateCard: hoisted.discardStateCard,
      endCombatRuntime: hoisted.endCombatRuntime,
      playRuntimeCard: hoisted.playRuntimeCard,
    });

    discardCombatCard({
      cardId: 'strike',
      isExhaust: true,
      gs: { id: 'gs' },
      skipHandRemove: true,
      logger,
    });
    playCombatRuntimeCard({
      cardId: 'strike',
      handIdx: 0,
      gs: { id: 'gs' },
      deps: { card: { id: 'strike' } },
      discardCard: vi.fn(),
      logger,
    });
    endCombatRuntimeFlow({
      gs: { id: 'gs' },
      runtimeDeps: { win: {} },
    });

    expect(hoisted.discardStateCard).toHaveBeenCalledWith('strike', true, { id: 'gs' }, true, logger);
    expect(hoisted.playRuntimeCard).toHaveBeenCalledWith({
      cardId: 'strike',
      handIdx: 0,
      gs: { id: 'gs' },
      deps: { card: { id: 'strike' } },
      discardCard: expect.any(Function),
      logger,
    });
    expect(hoisted.endCombatRuntime).toHaveBeenCalledWith({ id: 'gs' }, { win: {} });
  });
});
