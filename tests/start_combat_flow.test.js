import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CombatInitializer } from '../game/features/combat/public.js';
import { startCombatFlowUseCase } from '../game/features/combat/public.js';
import { Logger } from '../game/features/combat/ports/combat_logging.js';
import { ItemSystem } from '../game/shared/progression/item_system.js';
import { CardCostUtils } from '../game/utils/card_cost_utils.js';
import { CARDS } from '../data/cards.js';

function createDeps() {
  return {
    gs: {
      currentRegion: 2,
      combat: { turn: 1, active: false },
      player: { class: 'guardian' },
      triggerItems: vi.fn(),
      addLog: vi.fn(),
    },
    data: {
      enemies: {
        ancient_echo: { name: 'Ancient Echo', hp: 100 },
      },
    },
    getRegionData: vi.fn(() => ({ id: '6', boss: ['ancient_echo'] })),
    getBaseRegionIndex: vi.fn(() => 0),
    getRegionCount: vi.fn(() => 5),
    difficultyScaler: {},
    runRules: {
      onCombatStart: vi.fn(),
      onCombatDeckReady: vi.fn(),
    },
    classMechanics: {
      guardian: { onCombatStart: vi.fn() },
    },
    showWorldMemoryNotice: vi.fn(),
    setTimeoutFn: vi.fn((fn) => fn()),
    shuffleArray: vi.fn(),
    api: {
      drawCards: vi.fn(),
    },
  };
}

function createOpeningHandCombatState({
  items = [],
  deck = ['strike'],
  energy = 1,
  maxEnergy = 1,
  hp = 40,
  maxHp = 40,
} = {}) {
  return {
    currentRegion: 2,
    currentScreen: 'map',
    combat: {
      turn: 1,
      active: false,
      enemies: [],
    },
    player: {
      class: 'guardian',
      items: [...items],
      deck: [...deck],
      drawPile: [],
      hand: [],
      graveyard: [],
      exhausted: [],
      hp,
      maxHp,
      buffs: {},
      energy,
      maxEnergy,
      drawCount: 0,
      _nextCardDiscount: 0,
      _freeCardUses: 0,
      _traitCardDiscounts: {},
      costDiscount: 0,
      zeroCost: false,
      echoChain: 0,
      silenceGauge: 0,
    },
    dispatch(action, payload) {
      if (action === 'combat:setup-reset') {
        this.combat.enemies = [];
        this.combat.turn = 1;
        this.combat.playerTurn = true;
        this.player.energy = this.player.maxEnergy;
        this.player.shield = 0;
        this.player.echoChain = 0;
        return {
          drawPile: this.player.drawPile,
          energy: this.player.energy,
          turn: this.combat.turn,
        };
      }
      if (action === 'combat:enemy-add') {
        this.combat.enemies.push(payload.enemy);
        return payload.enemy;
      }
      if (action === 'combat:deck-prepare') {
        this.player.drawPile = [...this.player.deck];
        this.player.hand = [];
        return {
          drawPile: this.player.drawPile,
          hand: this.player.hand,
        };
      }
      if (action === 'combat:selected-target-sync') {
        this._selectedTarget = this.combat.enemies.findIndex((enemy) => enemy.hp > 0);
        return this._selectedTarget;
      }
      if (action === 'card:draw') {
        let attempts = 0;
        const handCap = 8;
        for (let i = 0; i < Number(payload?.count || 0); i += 1) {
          if (!this.player.drawPile.length) break;
          attempts += 1;
          if (this.player.hand.length >= handCap) continue;
          this.player.hand.push(this.player.drawPile.pop());
        }
        return { attempts, drewCards: attempts };
      }
      if (action === 'player:energy') {
        this.player.energy = Math.max(0, Number(this.player.energy || 0) + Number(payload?.amount || 0));
        return { energyAfter: this.player.energy };
      }
      if (action === 'enemy:status') {
        const enemy = this.combat.enemies[payload.targetIdx];
        if (!enemy) return null;
        enemy.statusEffects = enemy.statusEffects || {};
        enemy.statusEffects[payload.status] = (enemy.statusEffects[payload.status] || 0) + payload.duration;
        return { status: payload.status, duration: enemy.statusEffects[payload.status], targetIdx: payload.targetIdx };
      }
      return {};
    },
    triggerItems(trigger, data) {
      return ItemSystem.triggerItems(this, trigger, data);
    },
    addLog: vi.fn(),
    markDirty: vi.fn(),
  };
}

function createOpeningHandCombatDeps(gs, overrides = {}) {
  return {
    gs,
    data: {
      enemies: {
        ancient_echo: { name: 'Ancient Echo', hp: 100 },
      },
    },
    getRegionData: vi.fn(() => ({ id: '2', enemies: ['ancient_echo'] })),
    getBaseRegionIndex: vi.fn(() => 0),
    getRegionCount: vi.fn(() => 5),
    difficultyScaler: {},
    runRules: {
      onCombatStart: vi.fn(),
      onCombatDeckReady: vi.fn(),
    },
    classMechanics: {
      guardian: { onCombatStart: vi.fn() },
    },
    showWorldMemoryNotice: vi.fn(),
    setTimeoutFn: vi.fn((fn) => fn()),
    shuffleArray: vi.fn(),
    enterCombatState: vi.fn((state) => {
      state.combat.active = true;
      state.currentScreen = 'game';
    }),
    setActiveCombatRegionState: vi.fn((state, region) => {
      state._activeRegionId = Number(region.id);
    }),
    playBossPhase: vi.fn(),
    applyRegionDebuffs: CombatInitializer.applyRegionDebuffs,
    initDeck: CombatInitializer.initDeck,
    resetCombatState: CombatInitializer.resetCombatState,
    spawnEnemies: CombatInitializer.spawnEnemies,
    ...overrides,
  };
}

describe('startCombatFlowUseCase', () => {
  beforeEach(() => {
    vi.spyOn(CombatInitializer, 'resetCombatState').mockImplementation(() => {});
    vi.spyOn(CombatInitializer, 'spawnEnemies').mockImplementation(() => ({
      spawnedKeys: ['ancient_echo'],
      isHiddenBoss: true,
    }));
    vi.spyOn(CombatInitializer, 'applyRegionDebuffs').mockImplementation(() => {});
    vi.spyOn(CombatInitializer, 'initDeck').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('orchestrates combat start state, spawn, class hooks, and deck setup', () => {
    const deps = createDeps();
    deps.enterCombatState = vi.fn((state) => {
      state.combat.active = true;
      state.currentScreen = 'game';
    });
    deps.setActiveCombatRegionState = vi.fn((state, region) => {
      state._activeRegionId = Number(region.id);
      return state._activeRegionId;
    });

    const result = startCombatFlowUseCase('boss', {
      ...deps,
      applyRegionDebuffs: CombatInitializer.applyRegionDebuffs,
      initDeck: CombatInitializer.initDeck,
      playBossPhase: vi.fn(),
      resetCombatState: CombatInitializer.resetCombatState,
      spawnEnemies: CombatInitializer.spawnEnemies,
    });

    expect(result).toMatchObject({
      combatMode: 'boss',
      isBoss: true,
      isMiniBoss: false,
      spawnResult: {
        spawnedKeys: ['ancient_echo'],
        isHiddenBoss: true,
      },
    });
    expect(deps.gs._activeRegionId).toBe(6);
    expect(deps.gs.combat.active).toBe(true);
    expect(deps.gs.currentScreen).toBe('game');
    expect(deps.setActiveCombatRegionState).toHaveBeenCalledWith(deps.gs, { id: '6', boss: ['ancient_echo'] });
    expect(deps.enterCombatState).toHaveBeenCalledWith(deps.gs);
    expect(CombatInitializer.resetCombatState).toHaveBeenCalledWith(deps.gs);
    expect(CombatInitializer.spawnEnemies).toHaveBeenCalledWith(
      deps.gs,
      deps.data,
      'boss',
      expect.objectContaining({
        getRegionData: deps.getRegionData,
        getBaseRegionIndex: deps.getBaseRegionIndex,
        getRegionCount: deps.getRegionCount,
        difficultyScaler: deps.difficultyScaler,
      }),
    );
    expect(CombatInitializer.applyRegionDebuffs).toHaveBeenCalledWith(
      deps.gs,
      deps.getBaseRegionIndex,
      { runRules: deps.runRules },
    );
    expect(deps.classMechanics.guardian.onCombatStart).toHaveBeenCalledWith(deps.gs);
    expect(deps.gs.triggerItems).toHaveBeenCalledWith('combat_start');
    expect(CombatInitializer.initDeck).toHaveBeenCalledWith(deps.gs, {
      shuffleArrayFn: deps.shuffleArray,
      drawCardsFn: deps.api.drawCards,
    });
    expect(deps.runRules.onCombatDeckReady).toHaveBeenCalledWith(deps.gs);
    expect(deps.gs.addLog).toHaveBeenNthCalledWith(1, '⚔️ 전투 시작!', 'system');
    expect(deps.gs.addLog).toHaveBeenNthCalledWith(2, '── 턴 1 ──', 'turn-divider');
    expect(deps.showWorldMemoryNotice).toHaveBeenCalledTimes(1);
  });

  it('fails fast when required combat dependencies are missing', () => {
    const loggerEmit = vi.spyOn(Logger, '_emit').mockImplementation(() => {});

    expect(startCombatFlowUseCase('normal', { gs: null })).toBeNull();
    expect(loggerEmit).toHaveBeenCalledWith('error', ['Missing dependencies'], 'CombatStart');
  });

  it('publishes opening-hand completion after deck-ready bonuses are applied', () => {
    const deps = createDeps();
    const events = [];
    deps.gs.triggerItems = vi.fn((trigger) => {
      events.push(`item:${trigger}`);
    });
    deps.runRules.onCombatDeckReady = vi.fn(() => {
      events.push('rule:onCombatDeckReady');
    });

    startCombatFlowUseCase('normal', {
      ...deps,
      applyRegionDebuffs: CombatInitializer.applyRegionDebuffs,
      initDeck: CombatInitializer.initDeck,
      resetCombatState: CombatInitializer.resetCombatState,
      spawnEnemies: CombatInitializer.spawnEnemies,
    });

    expect(events).toEqual([
      'item:combat_start',
      'rule:onCombatDeckReady',
      'item:turn_start',
      'item:turn_draw_complete',
    ]);
  });

  it('fires turn_start relics on the opening player turn of combat', () => {
    vi.restoreAllMocks();
    vi.spyOn(CombatInitializer, 'spawnEnemies').mockImplementation((state) => {
      state.combat.enemies.push({
        name: 'Ancient Echo',
        hp: 100,
        shield: 0,
        statusEffects: {},
      });
      return {
        spawnedKeys: ['ancient_echo'],
        isHiddenBoss: false,
      };
    });
    vi.spyOn(CombatInitializer, 'applyRegionDebuffs').mockImplementation(() => {});

    const gs = createOpeningHandCombatState({
      items: ['eternity_core', 'eye_of_storm'],
      deck: ['strike', 'defend', 'bash', 'guard', 'charge', 'slash'],
      energy: 0,
      maxEnergy: 3,
    });

    startCombatFlowUseCase('normal', createOpeningHandCombatDeps(gs));

    expect(gs.player.energy).toBe(4);
    expect(gs.player.hand).toHaveLength(6);
    expect(gs.combat.enemies[0].statusEffects.vulnerable).toBe(1);
  });

  it('keeps combat-start draw relics and temporary hand relics after the opening hand is prepared', () => {
    vi.restoreAllMocks();
    vi.spyOn(CombatInitializer, 'resetCombatState').mockImplementation(() => {});
    vi.spyOn(CombatInitializer, 'spawnEnemies').mockImplementation(() => ({
      spawnedKeys: ['ancient_echo'],
      isHiddenBoss: false,
    }));
    vi.spyOn(CombatInitializer, 'applyRegionDebuffs').mockImplementation(() => {});

    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);
    const gs = createOpeningHandCombatState({
      items: ['void_compass', 'ancient_scroll', 'bloody_contract'],
      deck: ['strike', 'defend', 'bash', 'guard', 'charge', 'slash', 'spark'],
      energy: 3,
      maxEnergy: 3,
    });

    startCombatFlowUseCase('normal', createOpeningHandCombatDeps(gs));

    expect(gs.player.hp).toBe(34);
    expect(gs.player.hand.length).toBe(8);
    expect(gs.player.hand).toContain(gs._itemRuntime?.ancient_scroll?.tempCardId);

    randomSpy.mockRestore();
  });

  it('applies hand-scoped opening-draw relics to the first combat hand', () => {
    vi.restoreAllMocks();
    vi.spyOn(CombatInitializer, 'resetCombatState').mockImplementation(() => {});
    vi.spyOn(CombatInitializer, 'spawnEnemies').mockImplementation(() => ({
      spawnedKeys: ['ancient_echo'],
      isHiddenBoss: false,
    }));
    vi.spyOn(CombatInitializer, 'applyRegionDebuffs').mockImplementation(() => {});

    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);
    const gs = createOpeningHandCombatState({
      items: ['everlasting_oil'],
      deck: ['strike'],
    });

    startCombatFlowUseCase('normal', createOpeningHandCombatDeps(gs));

    expect(gs.player.hand).toEqual(['strike']);
    expect(CardCostUtils.calcEffectiveCost('strike', CARDS.strike, gs.player, 0, {
      triggerItems: gs.triggerItems.bind(gs),
    })).toBe(0);

    randomSpy.mockRestore();
  });

  it('applies glitch_circuit hand-scoped modifiers to the first combat hand', () => {
    vi.restoreAllMocks();
    vi.spyOn(CombatInitializer, 'resetCombatState').mockImplementation(() => {});
    vi.spyOn(CombatInitializer, 'spawnEnemies').mockImplementation(() => ({
      spawnedKeys: ['ancient_echo'],
      isHiddenBoss: false,
    }));
    vi.spyOn(CombatInitializer, 'applyRegionDebuffs').mockImplementation(() => {});

    const randomSpy = vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0.999);
    const gs = createOpeningHandCombatState({
      items: ['glitch_circuit'],
      deck: ['strike', 'defend'],
    });

    startCombatFlowUseCase('normal', createOpeningHandCombatDeps(gs));

    expect(gs.player.hand).toEqual(['defend', 'strike']);
    expect(CardCostUtils.calcEffectiveCost('defend', CARDS.defend, gs.player, 0, {
      triggerItems: gs.triggerItems.bind(gs),
    })).toBe(0);
    expect(CardCostUtils.calcEffectiveCost('strike', CARDS.strike, gs.player, 1, {
      triggerItems: gs.triggerItems.bind(gs),
    })).toBe(2);

    randomSpy.mockRestore();
  });
});
