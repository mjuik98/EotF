import { describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  endPlayerTurnUseCase: vi.fn(),
  runEnemyTurnUseCase: vi.fn(),
}));

vi.mock('../game/features/combat/application/end_player_turn_use_case.js', () => ({
  endPlayerTurnUseCase: hoisted.endPlayerTurnUseCase,
}));

vi.mock('../game/features/combat/application/run_enemy_turn_use_case.js', () => ({
  runEnemyTurnUseCase: hoisted.runEnemyTurnUseCase,
}));

import { createCombatTurnRuntime } from '../game/features/combat/application/create_combat_turn_runtime.js';

describe('create_combat_turn_runtime', () => {
  it('routes player turn end through injected runtime ports', () => {
    hoisted.endPlayerTurnUseCase.mockReturnValue({ ok: true });
    const runtime = createCombatTurnRuntime({
      cleanupTurnUi: vi.fn(),
      scheduleEnemyTurn: vi.fn(),
      showEnemyTurnUi: vi.fn(),
    });
    const deps = {
      gs: { id: 'gs' },
      data: { id: 'data' },
      cardCostUtils: { canPlay: vi.fn() },
      classMechanics: { guardian: {} },
      enemyTurn: vi.fn(),
      updateChainUI: vi.fn(),
    };

    const result = runtime.endPlayerTurn(deps);

    expect(result).toEqual({ ok: true });
    expect(hoisted.endPlayerTurnUseCase).toHaveBeenCalledWith(expect.objectContaining({
      gs: deps.gs,
      data: deps.data,
      canPlay: deps.cardCostUtils.canPlay,
      classMechanics: deps.classMechanics,
      endTurnPolicyOptions: expect.any(Object),
      resetChainUi: expect.any(Function),
      cleanupTurnUi: expect.any(Function),
      showEnemyTurnUi: expect.any(Function),
      runEnemyTurn: expect.any(Function),
      scheduleEnemyTurn: expect.any(Function),
    }));
  });

  it('routes enemy turn flow through injected runtime ports', async () => {
    hoisted.runEnemyTurnUseCase.mockResolvedValue({ done: true });
    const runtime = createCombatTurnRuntime({
      cleanupTurnUi: vi.fn(),
      dispatchUiAction: vi.fn(),
      playEnemyAttackHit: vi.fn(),
      playStatusTickEffects: vi.fn(),
      shouldAbortTurn: vi.fn(() => false),
      showBossPhaseShift: vi.fn(),
      showPlayerTurnUi: vi.fn(),
      syncCombatEnergy: vi.fn(),
      waitForCombat: vi.fn(async () => true),
    });
    const deps = {
      api: { applyPlayerDamage: vi.fn() },
      gs: { addLog: vi.fn() },
      data: { id: 'data' },
      shuffleArray: vi.fn(),
      classMechanics: { guardian: {} },
      renderCombatEnemies: vi.fn(),
      runRules: { onTurnStart: vi.fn() },
    };

    const result = await runtime.enemyTurn(deps);

    expect(result).toEqual({ done: true });
    expect(hoisted.runEnemyTurnUseCase).toHaveBeenCalledWith(expect.objectContaining({
      api: deps.api,
      gs: deps.gs,
      data: deps.data,
      shuffleArray: deps.shuffleArray,
      classMechanics: deps.classMechanics,
      cleanupTooltips: expect.any(Function),
      shouldAbortTurn: expect.any(Function),
      waitForCombat: expect.any(Function),
      playStatusTickEffects: expect.any(Function),
      renderCombatEnemies: expect.any(Function),
      showBossPhaseShift: expect.any(Function),
      playEnemyAttackHit: expect.any(Function),
      dispatchUiAction: expect.any(Function),
      syncCombatEnergy: expect.any(Function),
      onTurnStart: expect.any(Function),
      onPlayerTurnStarted: expect.any(Function),
      startPlayerTurn: expect.any(Function),
    }));
  });
});
