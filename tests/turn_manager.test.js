import { describe, expect, it, vi } from 'vitest';
import { TurnManager } from '../game/features/combat/ports/public_compat_capabilities.js';

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
    stats: {
      damageDealt: 0,
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
    gs.player.echoChain = 3;
    gs.triggerItems = vi.fn();

    const result = TurnManager.endPlayerTurnLogic(gs, { cards: {} }, {
      canPlayFn: () => false,
    });

    expect(result).not.toBeNull();
    expect(gs.player.buffs.dodge?.stacks).toBe(1);
    expect(gs.triggerItems).toHaveBeenCalledWith('turn_end');
    expect(gs.triggerItems).toHaveBeenCalledWith('chain_break', { chain: 3 });
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

  it('does not apply enemy effects when the enemy is already dead', () => {
    const gs = createTurnState();
    const enemy = {
      name: 'Dead Enemy',
      hp: 0,
      atk: 10,
      statusEffects: {},
    };

    const result = TurnManager.handleEnemyEffect('self_atk_up', gs, enemy, { baseRegion: 0, data: {} });

    expect(result).toBeUndefined();
    expect(enemy.atk).toBe(10);
  });

  it('tracks reflected and status-tick damage in damageDealt stats', () => {
    const gs = createTurnState();
    const enemy = {
      name: 'Status Dummy',
      hp: 20,
      atk: 10,
      statusEffects: {},
    };
    gs.combat.enemies = [enemy];
    gs.onEnemyDeath = vi.fn();

    gs.player.buffs.mirror = { stacks: 1 };
    TurnManager.processEnemyAttack(gs, enemy, 0, { dmg: 7, intent: '공격' });
    expect(gs.stats.damageDealt).toBe(7);

    enemy.statusEffects = { poisoned: 2, burning: 1, marked: 1 };
    TurnManager.processEnemyStatusTicks(gs);

    // Remaining HP 13 -> poison(10), burn(3) = 13 additional dealt
    expect(gs.stats.damageDealt).toBe(20);
  });

  it('adds one extra draw at turn start in region 5', () => {
    const gs = createTurnState();
    gs._activeRegionId = 5;
    gs.drawCards = vi.fn();

    TurnManager.startPlayerTurnLogic(gs);

    expect(gs.drawCards).toHaveBeenCalledWith(6, { skipRift: true });
  });
});
