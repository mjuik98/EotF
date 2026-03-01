import { describe, expect, it, vi } from 'vitest';
import { TurnManager } from '../game/combat/turn_manager.js';

function createTurnState() {
  return {
    player: {
      hp: 60,
      maxHp: 60,
      energy: 3,
      maxEnergy: 3,
      hand: [],
      graveyard: [],
      buffs: {},
      echoChain: 0,
      costDiscount: 0,
      _nextCardDiscount: 0,
      zeroCost: false,
      _freeCardUses: 0,
    },
    combat: {
      active: true,
      playerTurn: true,
      enemies: [],
      turn: 1,
    },
    addLog: () => {},
    addEcho: () => {},
    takeDamage: () => {},
  };
}

describe('TurnManager dodge handling', () => {
  it('keeps dodge until enemy turn when ending player turn', () => {
    const gs = createTurnState();
    gs.player.buffs.dodge = { stacks: 1 };

    const result = TurnManager.endPlayerTurnLogic(gs, { cards: {} }, {
      canPlayFn: () => false,
    });

    expect(result).not.toBeNull();
    expect(gs.player.buffs.dodge?.stacks).toBe(1);
  });

  it('consumes dodge and prevents damage on enemy attack', () => {
    const gs = createTurnState();
    gs.player.buffs.dodge = { stacks: 1 };
    gs.takeDamage = vi.fn();

    const enemy = {
      name: 'Test Enemy',
      hp: 20,
      atk: 10,
      statusEffects: {},
    };
    const action = { dmg: 12, intent: '공격' };

    const hitResults = TurnManager.processEnemyAttack(gs, enemy, 0, action);

    expect(gs.takeDamage).not.toHaveBeenCalled();
    expect(gs.player.buffs.dodge).toBeUndefined();
    expect(hitResults).toHaveLength(0);
  });
});
