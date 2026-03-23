import { describe, expect, it, vi } from 'vitest';
import { endPlayerTurnService } from '../game/features/combat/public.js';

describe('endPlayerTurnService', () => {
  it('delegates end-turn logic and invokes class onTurnEnd hook', () => {
    const gs = {
      player: {
        class: 'guardian',
        hand: [],
        graveyard: [],
        buffs: {},
        echoChain: 0,
        silenceGauge: 0,
      },
      combat: {
        active: true,
        playerTurn: true,
      },
      triggerItems: vi.fn(),
      addLog: vi.fn(),
    };
    const onTurnEnd = vi.fn();

    const outcome = endPlayerTurnService({
      gs,
      data: { cards: {} },
      canPlay: vi.fn(() => false),
      classMechanics: {
        guardian: { onTurnEnd },
      },
    });

    expect(outcome).toEqual({
      result: { skippableCards: 0 },
      ui: {
        resetChain: true,
        setEnemyTurn: true,
        cleanupTooltips: true,
        enemyTurnDelayMs: 700,
      },
    });
    expect(onTurnEnd).toHaveBeenCalledWith(gs);
  });

  it('returns null when combat turn cannot end', () => {
    const gs = {
      player: { class: 'guardian' },
      combat: { active: false, playerTurn: false },
    };

    const outcome = endPlayerTurnService({
      gs,
      data: { cards: {} },
      canPlay: vi.fn(),
      classMechanics: {},
    });

    expect(outcome).toBeNull();
  });
});
