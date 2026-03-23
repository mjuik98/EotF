import { describe, expect, it, vi } from 'vitest';

import { DeathHandler } from '../game/combat/death_handler.js';
import { handleEnemyDeathFlow } from '../game/combat/death_handler_enemy_death_flow.js';
import { buildDeathOutcomePayload } from '../game/combat/death_handler_outcome.js';
import { EndingScreenUI } from '../game/features/ui/public.js';

describe('DeathHandler', () => {
  it('routes defeat results through the cinematic ending screen', () => {
    const finalizeRunOutcome = vi.fn();
    const selectFragment = vi.fn();
    const showOutcomeSpy = vi.spyOn(EndingScreenUI, 'showOutcome').mockReturnValue(true);

    const gs = {
      meta: {
        echoFragments: 3,
        inscriptions: {},
      },
      player: { kills: 5 },
      stats: { maxChain: 9 },
    };

    DeathHandler.showDeathScreen.call(gs, {
      endingScreenUI: EndingScreenUI,
      finalizeRunOutcome,
      selectFragment,
      win: {},
    });

    expect(finalizeRunOutcome).toHaveBeenCalledWith('defeat', { echoFragments: 3 }, { gs });
    expect(showOutcomeSpy).toHaveBeenCalledWith('defeat', expect.objectContaining({
      gs,
      endingActions: expect.objectContaining({
        selectFragment: expect.any(Function),
      }),
      selectFragment,
    }));
  });

  it('builds a defeat outcome payload with resolved ending actions before showing the screen', () => {
    const gs = { player: { kills: 2 }, stats: {}, meta: {} };
    const selectFragment = vi.fn();
    const payload = buildDeathOutcomePayload(gs, {
      endingScreenUI: EndingScreenUI,
      finalizeRunOutcome: vi.fn(),
      selectFragment,
    }, {});

    expect(payload.gs).toBe(gs);
    expect(payload.endingScreenUI).toBe(EndingScreenUI);
    expect(payload.endingActions).toEqual(expect.objectContaining({
      selectFragment: expect.any(Function),
    }));
    payload.endingActions.selectFragment('fortune');
    expect(selectFragment).toHaveBeenCalledWith('fortune');
  });

  it('plays the player death reaction event instead of the generic legacy death sound', () => {
    vi.useFakeTimers();
    const combatOverlay = { classList: { remove: vi.fn() } };
    const doc = {
      body: { style: {} },
      createElement: vi.fn(() => ({
        style: {},
        appendChild: vi.fn(),
        remove: vi.fn(),
        textContent: '',
      })),
      getElementById: vi.fn((id) => (id === 'combatOverlay' ? combatOverlay : null)),
    };
    doc.body.appendChild = vi.fn();

    const gs = {
      combat: { active: true },
      triggerItems: vi.fn(() => false),
    };
    const showDeathScreen = vi.fn();
    const audioEngine = {
      playEvent: vi.fn(),
      playDeath: vi.fn(),
    };
    const screenShake = { shake: vi.fn() };
    const particleSystem = { deathEffect: vi.fn() };

    try {
      DeathHandler.onPlayerDeath.call(gs, {
        audioEngine,
        doc,
        showDeathScreen,
        win: { innerWidth: 1280, innerHeight: 720 },
        screenShake,
        particleSystem,
      });

      expect(audioEngine.playEvent).toHaveBeenCalledWith('reaction', 'playerDeath');
      expect(audioEngine.playDeath).not.toHaveBeenCalled();
      expect(screenShake.shake).toHaveBeenCalledWith(20, 1.2);
      expect(particleSystem.deathEffect).toHaveBeenCalledWith(640, 360);
      expect(gs.combat.active).toBe(false);

      vi.runAllTimers();
      expect(showDeathScreen).toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });

  it('spawns a region enemy and refreshes combat render hooks on the player turn', () => {
    const gs = {
      currentRegion: 0,
      currentFloor: 1,
      combat: {
        enemies: [],
        playerTurn: true,
      },
      meta: {
        runCount: 1,
      },
    };
    const renderCombatEnemies = vi.fn();
    const enableActionButtons = vi.fn();

    DeathHandler.spawnEnemy.call(gs, {
      doc: { querySelectorAll: vi.fn(() => []) },
      hudUpdateUI: { enableActionButtons },
      renderCombatEnemies,
      win: {},
    });

    expect(gs.combat.enemies).toHaveLength(1);
    expect(renderCombatEnemies).toHaveBeenCalledTimes(1);
    expect(enableActionButtons).toHaveBeenCalledTimes(1);
  });

  it('routes enemy death side effects through the extracted use case', () => {
    const cleanupTooltips = vi.fn();
    const lockCombatEndInputs = vi.fn();
    const queueCombatEnd = vi.fn();
    const removeDeadEnemies = vi.fn();
    const syncSelectedTarget = vi.fn();
    const renderCombatEnemies = vi.fn();
    const scheduleEnemyRemoval = vi.fn((idx, onRemove) => {
      expect(idx).toBe(2);
      onRemove();
    });
    const updateUi = vi.fn();
    const applyEnemyDeath = vi.fn().mockReturnValue({
      shouldEndCombat: true,
    });
    const gs = { combat: { enemies: [{ hp: 0 }] } };

    const result = handleEnemyDeathFlow({
      enemy: { name: 'Wisp', hp: 0 },
      gs,
      idx: 2,
      applyEnemyDeath,
      runtimePort: {
        cleanupTooltips,
        lockCombatEndInputs,
        queueCombatEnd,
        removeDeadEnemies,
        renderCombatEnemies,
        scheduleEnemyRemoval,
        syncSelectedTarget,
        updateUi,
      },
    });

    expect(result).toEqual({ shouldEndCombat: true });
    expect(cleanupTooltips).toHaveBeenCalledTimes(1);
    expect(scheduleEnemyRemoval).toHaveBeenCalledTimes(1);
    expect(removeDeadEnemies).toHaveBeenCalledTimes(1);
    expect(syncSelectedTarget).toHaveBeenCalledTimes(1);
    expect(renderCombatEnemies).toHaveBeenCalledTimes(1);
    expect(lockCombatEndInputs).toHaveBeenCalledTimes(1);
    expect(queueCombatEnd).toHaveBeenCalledTimes(1);
    expect(updateUi).toHaveBeenCalledTimes(1);
  });
});
