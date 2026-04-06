import { describe, expect, it, vi } from 'vitest';
import { Actions, Reducers } from '../game/core/state_actions.js';

function createBaseState() {
    const dirty = new Set();
    return {
        player: {
            hp: 30,
            maxHp: 30,
            shield: 0,
            gold: 0,
            energy: 3,
            maxEnergy: 3,
            maxEcho: 100,
            echo: 0,
            buffs: {},
            deck: [],
            hand: [],
            graveyard: [],
            exhausted: [],
        },
        combat: {
            active: false,
            enemies: [],
            playerTurn: true,
            turn: 0,
            log: [],
        },
        stats: {
            damageTaken: 0,
            damageDealt: 0,
        },
        markDirty(key) {
            dirty.add(key);
        },
        isDirty(key) {
            return dirty.has(key);
        },
        addLog() { },
    };
}

describe('Reducers', () => {
    it('PLAYER_DAMAGE consumes shield before HP', () => {
        const gs = createBaseState();
        gs.player.shield = 5;

        const result = Reducers[Actions.PLAYER_DAMAGE](gs, { amount: 8 });

        expect(result.shieldAbsorbed).toBe(5);
        expect(result.actualDamage).toBe(3);
        expect(gs.player.hp).toBe(27);
        expect(gs.player.shield).toBe(0);
        expect(gs.isDirty('hud')).toBe(true);
    });

    it('CARD_DRAW reshuffles graveyard into deck and draws up to hand limit', () => {
        const gs = createBaseState();
        gs.addLog = vi.fn();
        gs.player.deck = [];
        gs.player.graveyard = ['a', 'b', 'c'];
        gs.player.hand = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'h7'];

        const result = Reducers[Actions.CARD_DRAW](gs, { count: 3 });

        expect(result.drawn).toBe(1);
        expect(gs.player.hand.length).toBe(8);
        expect(gs.player.graveyard.length).toBe(0);
        expect(gs.addLog).toHaveBeenCalledWith('무덤의 카드를 덱으로 옮기고 섞었습니다.', 'system');
        expect(gs.isDirty('hand')).toBe(true);
    });

    it('CARD_DRAW uses an injected randomFn when reshuffling graveyard into deck', () => {
        const gs = createBaseState();
        gs.addLog = vi.fn();
        gs.player.drawPile = [];
        gs.player.graveyard = ['a', 'b', 'c'];
        gs.randomFn = vi.fn(() => 0);

        const result = Reducers[Actions.CARD_DRAW](gs, { count: 1 });

        expect(gs.randomFn).toHaveBeenCalledTimes(2);
        expect(result.drawn).toBe(1);
        expect(gs.player.hand).toEqual(['a']);
        expect(gs.player.drawPile).toEqual(['b', 'c']);
    });

    it('CARD_DISCARD dispatches correct item trigger by discard type', () => {
        const gs = createBaseState();
        gs.triggerItems = vi.fn();

        gs.player.hand = ['strike'];
        Reducers[Actions.CARD_DISCARD](gs, { cardId: 'strike', exhaust: false });
        expect(gs.player.graveyard).toContain('strike');
        expect(gs.triggerItems).toHaveBeenCalledWith('card_discard', { cardId: 'strike' });

        gs.player.hand = ['defend'];
        Reducers[Actions.CARD_DISCARD](gs, { cardId: 'defend', exhaust: true });
        expect(gs.player.exhausted).toContain('defend');
        expect(gs.triggerItems).toHaveBeenCalledWith('card_exhaust', { cardId: 'defend' });
    });

    it('CARD_DISCARD reindexes hand-scoped runtime selections after removing an earlier card', () => {
        const gs = createBaseState();
        gs.player.hand = ['strike', 'defend', 'bash'];
        gs.player._cascadeCards = new Map([[2, 'bash']]);
        gs._handScopedRuntime = {
            costTargets: {
                oilTargetIndex: 2,
                glitch0Index: 2,
                glitchPlusIndex: 1,
            },
        };

        Reducers[Actions.CARD_DISCARD](gs, { cardId: 'strike', exhaust: false });

        expect(gs.player.hand).toEqual(['defend', 'bash']);
        expect([...gs.player._cascadeCards.entries()]).toEqual([[1, 'bash']]);
        expect(gs._handScopedRuntime.costTargets.oilTargetIndex).toBe(1);
        expect(gs._handScopedRuntime.costTargets.glitch0Index).toBe(1);
        expect(gs._handScopedRuntime.costTargets.glitchPlusIndex).toBe(0);
    });

    it('PLAYER_MAX_ENERGY_GROWTH is capped and does not grant extra energy at cap', () => {
        const gs = createBaseState();
        gs.player.maxEnergy = 5;
        gs.player.energy = 2;

        const result = Reducers[Actions.PLAYER_MAX_ENERGY_GROWTH](gs, { amount: 1 });

        expect(result.maxEnergyAfter).toBe(5);
        expect(result.energyAfter).toBe(2);
        expect(gs.player.maxEnergy).toBe(5);
        expect(gs.player.energy).toBe(2);
        expect(gs.isDirty('hud')).toBe(true);
    });

    it('PLAYER_MAX_ENERGY_GROWTH increases current energy only by actual max-energy gain', () => {
        const gs = createBaseState();
        gs.player.maxEnergy = 4;
        gs.player.energy = 1;

        const result = Reducers[Actions.PLAYER_MAX_ENERGY_GROWTH](gs, { amount: 3 });

        expect(result.maxEnergyAfter).toBe(5);
        expect(result.energyAfter).toBe(2);
        expect(gs.player.maxEnergy).toBe(5);
        expect(gs.player.energy).toBe(2);
    });

    it('PLAYER_BUFF marks the hud dirty when a new combat buff appears', () => {
        const gs = createBaseState();

        Reducers[Actions.PLAYER_BUFF](gs, {
            id: 'resonance',
            stacks: 99,
            data: { dmgBonus: 1 },
        });

        expect(gs.player.buffs.resonance).toEqual({ stacks: 99, dmgBonus: 1 });
        expect(gs.isDirty('hud')).toBe(true);
    });

    it('COMBAT_END in region 5 no longer removes cards from deck', () => {
        const gs = createBaseState();
        gs.combat.active = true;
        gs._activeRegionId = 5;
        gs.player.deck = ['strike', 'defend', 'bash'];
        gs.player.graveyard = ['strike'];
        gs.player.exhausted = ['defend'];
        gs._stagnationVault = [];

        const result = Reducers[Actions.COMBAT_END](gs, { victory: true });

        expect(result.victory).toBe(true);
        expect(gs.player.deck).toEqual(['strike', 'defend', 'bash']);
        expect(gs._stagnationVault).toEqual([]);
    });

    it('COMBAT_START centralizes base combat state before turn flow begins', () => {
        const gs = createBaseState();
        gs.currentScreen = 'title';
        gs.combat.turn = 7;
        gs.combat.playerTurn = false;
        gs.combat.log = ['stale'];

        const result = Reducers[Actions.COMBAT_START](gs, { enemies: [{ id: 'echo' }] });

        expect(result).toEqual({ enemyCount: 1 });
        expect(gs.combat.active).toBe(true);
        expect(gs.combat.turn).toBe(0);
        expect(gs.combat.playerTurn).toBe(true);
        expect(gs.combat.log).toEqual([]);
        expect(gs.currentScreen).toBe('game');
        expect(gs.isDirty('hud')).toBe(true);
        expect(gs.isDirty('hand')).toBe(true);
    });
});
