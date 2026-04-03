import { afterEach, describe, expect, it, vi } from 'vitest';

import { handleCombatPlayerDeath } from '../game/features/combat/application/death_flow_player_runtime.js';
import { ItemSystem } from '../game/shared/progression/item_system.js';

function createDoc() {
  return {
    body: {
      style: {},
      appendChild: vi.fn(),
    },
    createElement: vi.fn(() => ({
      style: {},
      appendChild: vi.fn(),
      remove: vi.fn(),
      textContent: '',
    })),
    getElementById: vi.fn(() => ({
      classList: { remove: vi.fn() },
    })),
  };
}

describe('death_flow_player_runtime', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('publishes combat_end on defeat so combat-end relics still clean up and fire', async () => {
    vi.useFakeTimers();

    const doc = createDoc();
    const triggerOrder = [];
    const combatEndPayloads = [];
    const gs = {
      combat: {
        active: true,
        enemies: [],
      },
      player: {
        hp: 0,
        maxHp: 20,
        echo: 60,
        shield: 0,
        items: ['void_shard'],
      },
      addEcho(amount) {
        this.player.echo += amount;
      },
      addShield(amount) {
        this.player.shield += amount;
      },
      triggerItems(trigger, data) {
        triggerOrder.push(trigger);
        if (trigger === 'combat_end') {
          combatEndPayloads.push(data);
        }
        return ItemSystem.triggerItems(this, trigger, data);
      },
    };

    const showDeathScreen = vi.fn();
    handleCombatPlayerDeath(gs, {
      doc,
      win: {
        innerWidth: 1280,
        innerHeight: 720,
      },
      showDeathScreen,
      audioEngine: {},
      screenShake: { shake: vi.fn() },
      particleSystem: { deathEffect: vi.fn() },
    });

    expect(triggerOrder).toEqual(['pre_death', 'combat_end', 'death']);
    expect(combatEndPayloads).toEqual([{
      isBoss: false,
      victory: false,
      defeated: true,
      abandoned: false,
    }]);
    expect(gs.combat.active).toBe(false);
    expect(gs.player.echo).toBe(80);
    expect(gs.player.shield).toBe(0);

    await vi.runAllTimersAsync();

    expect(showDeathScreen).toHaveBeenCalledTimes(1);
  });

  it('cleans queued combat-end-only item runtime state on defeat', () => {
    vi.useFakeTimers();
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0.26)
      .mockReturnValueOnce(0.51);

    const doc = createDoc();
    const gs = {
      combat: {
        active: true,
        enemies: [],
      },
      player: {
        hp: 0,
        maxHp: 20,
        maxEnergy: 3,
        energy: 0,
        deck: ['strike', 'defend', 'bash'],
        hand: ['guard'],
        graveyard: [],
        exhausted: [],
        items: ['balanced_scale', 'crystal_ball', 'infinite_loop', 'ancient_scroll'],
      },
      addLog: vi.fn(),
      markDirty: vi.fn(),
      triggerItems(trigger, data) {
        return ItemSystem.triggerItems(this, trigger, data);
      },
    };

    gs.triggerItems('combat_start');
    gs.triggerItems('turn_end');
    gs.triggerItems('card_play', { cardId: 'strike', cost: 1 });
    gs.triggerItems('card_play', { cardId: 'defend', cost: 1 });

    expect(gs._itemRuntime.balanced_scale.active).toBe(true);
    expect(gs._itemRuntime.crystal_ball.discounted.size).toBe(3);
    expect(gs._itemRuntime.infinite_loop.count).toBe(2);
    expect(gs._itemRuntime.ancient_scroll.tempCardId).toBeTruthy();

    handleCombatPlayerDeath(gs, {
      doc,
      win: {
        innerWidth: 1280,
        innerHeight: 720,
      },
      showDeathScreen: vi.fn(),
      audioEngine: {},
      screenShake: { shake: vi.fn() },
      particleSystem: { deathEffect: vi.fn() },
    });

    expect(gs._itemRuntime.balanced_scale.active).toBe(false);
    expect(gs._itemRuntime.crystal_ball.discounted).toBeNull();
    expect(gs._itemRuntime.infinite_loop.count).toBe(0);
    expect(gs._itemRuntime.ancient_scroll.tempCardId).toBeNull();
  });

  it('does not consume multiple revive relics on a single death event', () => {
    vi.useFakeTimers();

    const doc = createDoc();
    const gs = {
      combat: {
        active: true,
        enemies: [],
      },
      player: {
        hp: 0,
        maxHp: 40,
        items: ['phoenix_feather', 'boss_soul_mirror'],
        _itemState: {
          phoenix_feather: {},
          boss_soul_mirror: { penaltyApplied: true },
        },
      },
      triggerItems(trigger, data) {
        return ItemSystem.triggerItems(this, trigger, data);
      },
    };

    handleCombatPlayerDeath(gs, {
      doc,
      win: {
        innerWidth: 1280,
        innerHeight: 720,
      },
      showDeathScreen: vi.fn(),
      audioEngine: {},
      screenShake: { shake: vi.fn() },
      particleSystem: { deathEffect: vi.fn() },
      updateUI: vi.fn(),
    });

    expect(gs.player.hp).toBe(20);
    expect(gs.player._itemState.phoenix_feather.used).toBe(true);
    expect(gs._itemRuntime?.boss_soul_mirror?.revived ?? false).toBe(false);
    expect(gs.combat.active).toBe(true);
  });

  it('does not let phoenix_feather bypass titan_heart healing lock on the live death path', async () => {
    vi.useFakeTimers();

    const doc = createDoc();
    const showDeathScreen = vi.fn();
    const gs = {
      combat: {
        active: true,
        enemies: [],
      },
      player: {
        hp: 0,
        maxHp: 40,
        items: ['titan_heart', 'phoenix_feather'],
        _itemState: {
          phoenix_feather: {},
        },
      },
      heal(amount) {
        const adjusted = this.triggerItems('heal_amount', amount);
        const resolved = typeof adjusted === 'number' ? adjusted : amount;
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + Math.max(0, resolved));
        return { healed: Math.max(0, resolved), hpAfter: this.player.hp };
      },
      triggerItems(trigger, data) {
        return ItemSystem.triggerItems(this, trigger, data);
      },
    };

    handleCombatPlayerDeath(gs, {
      doc,
      win: {
        innerWidth: 1280,
        innerHeight: 720,
      },
      showDeathScreen,
      audioEngine: {},
      screenShake: { shake: vi.fn() },
      particleSystem: { deathEffect: vi.fn() },
    });

    expect(gs.player.hp).toBe(0);
    expect(gs.player._itemState.phoenix_feather.used).not.toBe(true);
    expect(gs.combat.active).toBe(false);
    await vi.runAllTimersAsync();
    expect(showDeathScreen).toHaveBeenCalledTimes(1);
  });

  it('does not let boss_soul_mirror bypass titan_heart healing lock on the live death path', async () => {
    vi.useFakeTimers();

    const doc = createDoc();
    const showDeathScreen = vi.fn();
    const gs = {
      combat: {
        active: true,
        enemies: [],
      },
      player: {
        hp: 0,
        maxHp: 25,
        items: ['titan_heart', 'boss_soul_mirror'],
        _itemState: {
          boss_soul_mirror: { penaltyApplied: true },
        },
      },
      heal(amount) {
        const adjusted = this.triggerItems('heal_amount', amount);
        const resolved = typeof adjusted === 'number' ? adjusted : amount;
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + Math.max(0, resolved));
        return { healed: Math.max(0, resolved), hpAfter: this.player.hp };
      },
      triggerItems(trigger, data) {
        return ItemSystem.triggerItems(this, trigger, data);
      },
    };

    handleCombatPlayerDeath(gs, {
      doc,
      win: {
        innerWidth: 1280,
        innerHeight: 720,
      },
      showDeathScreen,
      audioEngine: {},
      screenShake: { shake: vi.fn() },
      particleSystem: { deathEffect: vi.fn() },
    });

    expect(gs.player.hp).toBe(0);
    expect(gs._itemRuntime?.boss_soul_mirror?.revived ?? false).toBe(false);
    expect(gs.combat.active).toBe(false);
    await vi.runAllTimersAsync();
    expect(showDeathScreen).toHaveBeenCalledTimes(1);
  });
});
