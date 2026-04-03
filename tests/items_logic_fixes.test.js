import { describe, expect, it, vi } from 'vitest';
import { ITEMS } from '../data/items.js';
import { CARDS } from '../data/cards.js';
import { Trigger } from '../game/data/triggers.js';
import { Actions, Reducers } from '../game/core/state_actions.js';
import { startPlayerTurnPolicy } from '../game/features/combat/domain/turn/start_player_turn_policy.js';
import { createStartPlayerTurnPolicyCommands } from '../game/features/combat/ports/player_turn_policy_ports.js';
import { getEnemyAction } from '../game/features/combat/domain/enemy_turn_domain.js';
import { beginPlayerTurnState } from '../game/features/combat/state/player_turn_state_commands.js';
import { applyEnemyDeathState } from '../game/features/combat/application/enemy_death_state.js';
import { CombatLifecycle } from '../game/features/combat/application/combat_lifecycle_facade.js';
import { handleCombatPlayerDeath } from '../game/features/combat/application/death_flow_player_runtime.js';
import { cleanupCombatAfterAbandon } from '../game/features/combat/application/help_pause_abandon_combat_actions.js';
import { ItemSystem } from '../game/shared/progression/item_system.js';
import { SetBonusSystem } from '../game/shared/progression/set_bonus_system.js';
import { CardCostUtils } from '../game/utils/card_cost_utils.js';

function createTurnStartRuntime({
    items = [],
    drawPile = [],
    energy = 0,
    maxEnergy = 3,
    hp = 20,
    maxHp = 20,
} = {}) {
    return {
        currentRegion: 0,
        player: {
            items: [...items],
            buffs: {},
            deck: [...drawPile],
            drawPile: [...drawPile],
            hand: [],
            graveyard: [],
            exhausted: [],
            drawCount: 0,
            energy,
            maxEnergy,
            hp,
            maxHp,
            silenceGauge: 0,
        },
        combat: {
            active: true,
            playerTurn: false,
            turn: 0,
            enemies: [],
        },
        addLog: vi.fn(),
        markDirty: vi.fn(),
        drawCards(count) {
            for (let i = 0; i < count; i += 1) {
                if (!this.player.drawPile.length) break;
                this.player.hand.push(this.player.drawPile.pop());
            }
        },
        triggerItems(trigger, data) {
            return ItemSystem.triggerItems(this, trigger, data);
        },
    };
}

function runActualTurnStart(gs) {
    return startPlayerTurnPolicy(gs, {
        beginPlayerTurnState,
    });
}

function createCombatEndOutcomeHost({ isBoss = false } = {}) {
    return {
        combat: {
            active: true,
            enemies: isBoss ? [{ hp: 10, isBoss: true }] : [],
            playerTurn: true,
            turn: 1,
        },
        stats: {
            damageDealt: 0,
            damageTaken: 0,
        },
        player: {
            items: ['void_shard', 'balanced_scale', 'mana_battery', 'energy_core'],
            buffs: {},
            hand: [],
            graveyard: [],
            exhausted: [],
            drawPile: [],
            discardPile: [],
            drawCount: 1,
            silenceGauge: 0,
            timeRiftGauge: 0,
            echo: 60,
            energy: 0,
            maxEnergy: 3,
            hp: 40,
            maxHp: 40,
            shield: 0,
            kills: 0,
            echoChain: 0,
            _itemState: {
                energy_core: { count: 0 },
            },
        },
        _itemRuntime: {
            balanced_scale: { active: true, drawReset: true },
            mana_battery: { stored: 2 },
        },
        currentRegion: 0,
        currentNode: isBoss ? { type: 'boss' } : null,
        addLog: vi.fn(),
        addEcho(amount) {
            this.player.echo += Number(amount || 0);
            return { echoAfter: this.player.echo };
        },
        markDirty: vi.fn(),
        dispatch(action, payload = {}) {
            return Reducers[action]?.(this, payload);
        },
        triggerItems(trigger, data) {
            return ItemSystem.triggerItems(this, trigger, data);
        },
    };
}

describe('item logic fixes', () => {
    it('echo_gauntlet stuns a random alive enemy on CHAIN_REACH_5 and does not reset chain', () => {
        const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.99);
        const gs = {
            player: { echoChain: 5 },
            combat: { enemies: [{ hp: 12 }, { hp: 18 }, { hp: 0 }] },
            applyEnemyStatus: vi.fn(),
            addLog: vi.fn(),
        };

        ITEMS.echo_gauntlet.passive(gs, Trigger.CHAIN_REACH_5, { chain: 5 });

        expect(gs.applyEnemyStatus).toHaveBeenCalledWith('stunned', 1, 1);
        expect(gs.player.echoChain).toBe(5);
        randomSpy.mockRestore();
    });

    it('void_crown grants echo only when played card cost is 0', () => {
        const gs = {
            player: {},
            addEcho: vi.fn(),
        };

        ITEMS.void_crown.passive(gs, Trigger.CARD_PLAY, { cardId: 'strike', cost: 1 });
        ITEMS.void_crown.passive(gs, Trigger.CARD_PLAY, { cardId: 'resonance_plus', cost: 0 });

        expect(gs.addEcho).toHaveBeenCalledTimes(1);
        expect(gs.addEcho).toHaveBeenCalledWith(10, { name: '공허의 왕관', type: 'item' });
    });

    it('void_eye applies weaken only for attack card plays and uses explicit hit targets when provided', () => {
        const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.1);
        const gs = {
            combat: { enemies: [{ hp: 20 }, { hp: 18 }, { hp: 15 }] },
            applyEnemyStatus: vi.fn(),
            addLog: vi.fn(),
        };

        ITEMS.void_eye.passive(gs, Trigger.CARD_PLAY, { cardId: 'defend', cost: 1 });
        ITEMS.void_eye.passive(gs, Trigger.CARD_PLAY, { cardId: 'strike', cost: 1, targetIdxs: [0, 2, 2] });

        expect(gs.applyEnemyStatus).toHaveBeenCalledTimes(2);
        expect(gs.applyEnemyStatus).toHaveBeenNthCalledWith(1, 'weakened', 1, 0);
        expect(gs.applyEnemyStatus).toHaveBeenNthCalledWith(2, 'weakened', 1, 2);
        randomSpy.mockRestore();
    });

    it('keeps desc aligned for target and max-hp growth item behavior', () => {
        expect(ITEMS.void_eye.desc).toBe('공격 카드 사용 시 20% 확률: 대상에게 약화 1 부여 / 여러 적 타격 시 모두 적용\n[세트: 공허의 삼위일체]');
        expect(ITEMS.merchants_pendant.desc).toBe('상점 구매 시: 최대 체력 +1 / 체력 1 회복');
        expect(ITEMS.soul_magnet.desc).toBe('적 처치 시: 최대 체력 +2 / 체력 2 회복');
        expect(ITEMS.thin_codex.desc).toBe('전투 시작: 덱 10장 이하일 때 카드 1장 드로우 및 방어막 4 획득');
    });

    it('dusk_mark applies extra weaken only when dealing damage to a weakened target', () => {
        const gs = {
            _selectedTarget: 0,
            combat: {
                enemies: [
                    { hp: 12, statusEffects: { weakened: 1 } },
                    { hp: 10, statusEffects: {} },
                ],
            },
            applyEnemyStatus: vi.fn(),
        };

        ITEMS.dusk_mark.passive(gs, Trigger.CARD_PLAY, { cardId: 'defend', cost: 1 });
        ITEMS.dusk_mark.passive(gs, Trigger.DEAL_DAMAGE, 7);

        expect(gs.applyEnemyStatus).toHaveBeenCalledTimes(1);
        expect(gs.applyEnemyStatus).toHaveBeenCalledWith('weakened', 1, 0, { name: '황혼의 낙인', type: 'item' });
    });

    it('routes soul_magnet healing through the enemy_kill runtime path so titan_heart can still block the heal', () => {
        const gs = {
            combat: {
                enemies: [{ hp: 0, gold: 12, name: 'Slime', id: 'slime' }],
            },
            player: {
                items: ['titan_heart', 'soul_magnet'],
                hp: 10,
                maxHp: 40,
                kills: 0,
            },
            meta: {},
            addLog: vi.fn(),
            addGold: vi.fn(),
            heal(amount) {
                const adjusted = this.triggerItems('heal_amount', amount);
                const resolved = typeof adjusted === 'number' ? adjusted : amount;
                this.player.hp = Math.min(this.player.maxHp, this.player.hp + Math.max(0, resolved));
                return { healed: resolved };
            },
            triggerItems(trigger, data) {
                return ItemSystem.triggerItems(this, trigger, data);
            },
        };

        applyEnemyDeathState(gs, gs.combat.enemies[0], 0, {
            addGold: gs.addGold,
            addLog: gs.addLog,
            triggerItems: gs.triggerItems.bind(gs),
            recordEnemyWorldKill: vi.fn(),
        });

        expect(gs.player.maxHp).toBe(42);
        expect(gs.player.hp).toBe(10);
    });

    it('fires liquid_memory on the live region-2 forced exhaust path instead of leaving the card stranded in exhausted', () => {
        const gs = createTurnStartRuntime({
            items: ['liquid_memory'],
            drawPile: [],
        });
        gs.currentRegion = 2;
        gs.player.hand = ['strike'];
        gs.player.graveyard = [];

        startPlayerTurnPolicy(gs, createStartPlayerTurnPolicyCommands({
            beginPlayerTurnState,
            drawCardsState(state, count) {
                state.drawCards(count);
                return { drewCards: Math.min(count, state.player.hand.length) };
            },
            resolveActiveRegionId: () => 2,
        }));

        expect(gs.player.exhausted).toEqual([]);
        expect(gs.player.hand).toContain('strike');
        expect(gs._itemRuntime.liquid_memory.used).toBe(true);
    });

    it('paradox_contract does not permanently increase max energy when combat start triggers twice', () => {
        const relic = ITEMS.paradox_contract;
        const gs = {
            player: { maxEnergy: 3, energy: 3 },
        };

        relic.passive(gs, Trigger.COMBAT_START);
        relic.passive(gs, Trigger.COMBAT_START);
        expect(gs.player.maxEnergy).toBe(4);

        relic.passive(gs, Trigger.COMBAT_END);
        expect(gs.player.maxEnergy).toBe(3);
        expect(gs._itemRuntime.paradox_contract.active).toBe(false);
        expect(gs._itemRuntime.paradox_contract.baseMax).toBeUndefined();

        relic.passive(gs, Trigger.COMBAT_START);
        expect(gs.player.maxEnergy).toBe(4);
    });

    it('paradox_contract reverts max energy on death cleanup', () => {
        const relic = ITEMS.paradox_contract;
        const gs = {
            player: { maxEnergy: 3, energy: 5 },
        };

        relic.passive(gs, Trigger.COMBAT_START);
        relic.passive(gs, 'death');

        expect(gs.player.maxEnergy).toBe(3);
        expect(gs.player.energy).toBe(3);
        expect(gs._itemRuntime.paradox_contract.active).toBe(false);
    });

    it('restores the original max energy after paradox_contract and eternal_fragment stack during the same combat', () => {
        const gs = {
            player: {
                items: ['paradox_contract', 'eternal_fragment'],
                maxEnergy: 3,
                energy: 3,
                drawCount: 0,
            },
            addLog: vi.fn(),
            markDirty: vi.fn(),
        };

        ItemSystem.triggerItems(gs, Trigger.COMBAT_START);

        expect(gs.player.maxEnergy).toBe(5);
        expect(gs.player.drawCount).toBe(1);

        ItemSystem.triggerItems(gs, Trigger.COMBAT_END);

        expect(gs.player.maxEnergy).toBe(3);
        expect(gs.player.energy).toBe(3);
        expect(gs.player.drawCount).toBe(0);
    });

    it('magnifying_glass lowers enemy attack intents through the live enemy action path without ai wrapping', () => {
        const gs = {
            player: { items: ['magnifying_glass'] },
            triggerItems(trigger, data) {
                return ItemSystem.triggerItems(this, trigger, data);
            },
        };
        const enemy = {
            hp: 20,
            ai: () => ({ type: 'strike', intent: '공격 10', dmg: 10 }),
        };

        const action = getEnemyAction(enemy, 1, gs);

        expect(action.dmg).toBe(9);
        expect(action.intent).toContain('9');
        expect(enemy.ai(1)).toEqual({ type: 'strike', intent: '공격 10', dmg: 10 });
    });

    it('everlasting_oil discounts a card after the actual turn-start draw path populates the hand', () => {
        const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);
        const gs = createTurnStartRuntime({
            items: ['everlasting_oil'],
            drawPile: ['strike'],
        });

        runActualTurnStart(gs);

        expect(gs.player.hand).toEqual(['strike']);
        expect(CardCostUtils.calcEffectiveCost('strike', CARDS.strike, gs.player, 0, {
            triggerItems: gs.triggerItems.bind(gs),
        })).toBe(0);
        randomSpy.mockRestore();
    });

    it('everlasting_oil only discounts the selected duplicate card instance', () => {
        const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.999);
        const gs = createTurnStartRuntime({
            items: ['everlasting_oil'],
            drawPile: ['strike', 'strike'],
        });

        runActualTurnStart(gs);

        expect(gs.player.hand).toEqual(['strike', 'strike']);
        expect(CardCostUtils.calcEffectiveCost('strike', CARDS.strike, gs.player, 0, {
            triggerItems: gs.triggerItems.bind(gs),
        })).toBe(CARDS.strike.cost);
        expect(CardCostUtils.calcEffectiveCost('strike', CARDS.strike, gs.player, 1, {
            triggerItems: gs.triggerItems.bind(gs),
        })).toBe(0);
        randomSpy.mockRestore();
    });

    it('everlasting_oil keeps its target aligned after an earlier hand card is discarded', () => {
        const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.999);
        const gs = createTurnStartRuntime({
            items: ['everlasting_oil'],
            drawPile: ['strike', 'bash'],
        });
        gs.dispatch = (action, payload = {}) => Reducers[action]?.(gs, payload);

        runActualTurnStart(gs);
        Reducers[Actions.CARD_DISCARD](gs, { cardId: 'bash', exhaust: false });

        expect(gs.player.hand).toEqual(['strike']);
        expect(CardCostUtils.calcEffectiveCost('strike', CARDS.strike, gs.player, 0, {
            triggerItems: gs.triggerItems.bind(gs),
        })).toBe(0);
        randomSpy.mockRestore();
    });

    it('glitch_circuit applies both the zero-cost and surcharge effects to cards drawn on turn start', () => {
        const randomSpy = vi.spyOn(Math, 'random')
            .mockReturnValueOnce(0)
            .mockReturnValueOnce(0.999);
        const gs = createTurnStartRuntime({
            items: ['glitch_circuit'],
            drawPile: ['strike', 'defend'],
        });

        runActualTurnStart(gs);

        expect(gs.player.hand).toEqual(['defend', 'strike']);
        expect(CardCostUtils.calcEffectiveCost('defend', CARDS.defend, gs.player, 0, {
            triggerItems: gs.triggerItems.bind(gs),
        })).toBe(0);
        expect(CardCostUtils.calcEffectiveCost('strike', CARDS.strike, gs.player, 1, {
            triggerItems: gs.triggerItems.bind(gs),
        })).toBe(2);
        randomSpy.mockRestore();
    });

    it('glitch_circuit can distinguish duplicate card instances in the same hand', () => {
        const randomSpy = vi.spyOn(Math, 'random')
            .mockReturnValueOnce(0)
            .mockReturnValueOnce(0.6);
        const gs = createTurnStartRuntime({
            items: ['glitch_circuit'],
            drawPile: ['defend', 'strike', 'strike'],
        });

        runActualTurnStart(gs);

        expect(gs.player.hand).toEqual(['strike', 'strike', 'defend']);
        expect(CardCostUtils.calcEffectiveCost('strike', CARDS.strike, gs.player, 0, {
            triggerItems: gs.triggerItems.bind(gs),
        })).toBe(0);
        expect(CardCostUtils.calcEffectiveCost('strike', CARDS.strike, gs.player, 1, {
            triggerItems: gs.triggerItems.bind(gs),
        })).toBe(CARDS.strike.cost + 1);
        expect(CardCostUtils.calcEffectiveCost('defend', CARDS.defend, gs.player, 2, {
            triggerItems: gs.triggerItems.bind(gs),
        })).toBe(CARDS.defend.cost);
        randomSpy.mockRestore();
    });

    it('glitch_circuit keeps remapped targets aligned after an earlier hand card is discarded', () => {
        const randomSpy = vi.spyOn(Math, 'random')
            .mockReturnValueOnce(0.34)
            .mockReturnValueOnce(0.999);
        const gs = createTurnStartRuntime({
            items: ['glitch_circuit'],
            drawPile: ['defend', 'bash', 'strike'],
        });
        gs.dispatch = (action, payload = {}) => Reducers[action]?.(gs, payload);

        runActualTurnStart(gs);
        Reducers[Actions.CARD_DISCARD](gs, { cardId: 'strike', exhaust: false });

        expect(gs.player.hand).toEqual(['bash', 'defend']);
        expect(CardCostUtils.calcEffectiveCost('bash', CARDS.bash, gs.player, 0, {
            triggerItems: gs.triggerItems.bind(gs),
        })).toBe(0);
        expect(CardCostUtils.calcEffectiveCost('defend', CARDS.defend, gs.player, 1, {
            triggerItems: gs.triggerItems.bind(gs),
        })).toBe(CARDS.defend.cost + 1);
        randomSpy.mockRestore();
    });

    it('eternity_core grants overcap energy on the actual turn-start runtime path', () => {
        const gs = createTurnStartRuntime({
            items: ['eternity_core'],
            drawPile: ['strike'],
            energy: 0,
            maxEnergy: 3,
        });

        runActualTurnStart(gs);

        expect(gs.player.energy).toBe(4);
    });

    it('mana_battery carries stored energy into the next turn above max energy', () => {
        const gs = createTurnStartRuntime({
            items: ['mana_battery'],
            drawPile: ['strike'],
            energy: 2,
            maxEnergy: 3,
        });

        ITEMS.mana_battery.passive(gs, Trigger.TURN_END);
        runActualTurnStart(gs);

        expect(gs.player.energy).toBe(5);
    });

    it('clockwork_butterfly restores a full energy bar on the third turn start', () => {
        const gs = createTurnStartRuntime({
            items: ['clockwork_butterfly'],
            drawPile: [],
            energy: 0,
            maxEnergy: 3,
        });

        runActualTurnStart(gs);
        runActualTurnStart(gs);
        runActualTurnStart(gs);

        expect(gs.player.energy).toBe(6);
    });

    it('clockwork_butterfly does not erase overcap energy restored earlier in the same turn-start path', () => {
        const gs = createTurnStartRuntime({
            items: ['mana_battery', 'clockwork_butterfly'],
            drawPile: [],
            energy: 2,
            maxEnergy: 3,
        });

        ITEMS.mana_battery.passive(gs, Trigger.TURN_END);
        runActualTurnStart(gs);
        gs.player.energy = 2;
        ITEMS.mana_battery.passive(gs, Trigger.TURN_END);
        runActualTurnStart(gs);
        gs.player.energy = 2;
        ITEMS.mana_battery.passive(gs, Trigger.TURN_END);

        runActualTurnStart(gs);

        expect(gs.player.energy).toBe(8);
    });

    it('dimension_pocket leaves curse_noise in the combat draw pile instead of auto-drawing it on the same turn', () => {
        const gs = createTurnStartRuntime({
            items: ['dimension_pocket'],
            drawPile: ['strike', 'defend', 'bash', 'strike', 'defend'],
        });

        runActualTurnStart(gs);

        expect(gs.player.hand).not.toContain('curse_noise');
        expect(gs.player.drawPile).toEqual(['curse_noise']);
    });

    it('balanced_scale clears its queued extra draw when combat ends before the next turn', () => {
        const gs = createTurnStartRuntime({
            items: ['balanced_scale'],
            drawPile: ['strike'],
            energy: 0,
        });

        ItemSystem.triggerItems(gs, Trigger.TURN_END);
        ItemSystem.triggerItems(gs, Trigger.COMBAT_END);
        runActualTurnStart(gs);

        expect(gs.player.drawCount).toBe(0);
        expect(gs._itemRuntime.balanced_scale.active).toBe(false);
        expect(gs._itemRuntime.balanced_scale.drawReset).toBe(false);
    });

    it('mana_battery drops stored carry-over when combat ends before the next turn', () => {
        const gs = createTurnStartRuntime({
            items: ['mana_battery'],
            drawPile: [],
            energy: 2,
            maxEnergy: 3,
        });

        ItemSystem.triggerItems(gs, Trigger.TURN_END);
        ItemSystem.triggerItems(gs, Trigger.COMBAT_END);
        gs.player.energy = 0;

        runActualTurnStart(gs);

        expect(gs.player.energy).toBe(3);
    });

    it('glitch_circuit clears turn-only cost overrides when combat ends', () => {
        const randomSpy = vi.spyOn(Math, 'random')
            .mockReturnValueOnce(0)
            .mockReturnValueOnce(0.999);
        const gs = createTurnStartRuntime({
            items: ['glitch_circuit'],
            drawPile: ['strike', 'defend'],
        });

        runActualTurnStart(gs);
        ItemSystem.triggerItems(gs, Trigger.COMBAT_END);

        gs.player.drawPile = ['strike'];
        gs.player.hand = [];
        gs.player.graveyard = [];
        gs.player.exhausted = [];
        gs.player.energy = 0;

        runActualTurnStart(gs);

        expect(CardCostUtils.calcEffectiveCost('strike', CARDS.strike, gs.player, 0, {
            triggerItems: gs.triggerItems.bind(gs),
        })).toBe(CARDS.strike.cost);
        randomSpy.mockRestore();
    });

    it('crystal_ball picks up to three unique card types for its combat discount set', () => {
        const randomSpy = vi.spyOn(Math, 'random')
            .mockReturnValueOnce(0)
            .mockReturnValueOnce(0.26)
            .mockReturnValueOnce(0.51);
        const gs = {
            player: {
                items: ['crystal_ball'],
                deck: ['strike', 'strike', 'defend', 'bash'],
            },
            addLog: vi.fn(),
        };

        ItemSystem.triggerItems(gs, Trigger.COMBAT_START);

        expect([...gs._itemRuntime.crystal_ball.discounted]).toEqual(expect.arrayContaining(['strike', 'defend', 'bash']));
        expect(gs._itemRuntime.crystal_ball.discounted.size).toBe(3);
        randomSpy.mockRestore();
    });

    it('boss_soul_mirror revival does not restore hp above the reduced max hp', () => {
        const gs = {
            player: { maxHp: 20, hp: 20 },
        };

        ITEMS.boss_soul_mirror.onAcquire(gs);
        gs.player.hp = 0;

        expect(ITEMS.boss_soul_mirror.passive(gs, Trigger.PRE_DEATH)).toBe(true);
        expect(gs.player.hp).toBe(5);
    });

    it('counts abyssal trinity relics toward the actual 심연의 삼위일체 set runtime', () => {
        const gs = {
            player: {
                items: ['abyssal_eye', 'abyssal_hand'],
            },
        };

        expect(SetBonusSystem.getOwnedSetCounts(gs).abyssal_set).toBe(2);
        expect(SetBonusSystem.getActiveSets(gs)).toEqual([
            expect.objectContaining({ key: 'abyssal_set', count: 2 }),
        ]);
    });

    it('keeps void trio on a separate 공허 set runtime', () => {
        const gs = {
            player: {
                items: ['void_eye', 'void_crown'],
            },
        };

        expect(SetBonusSystem.getOwnedSetCounts(gs).void_set).toBe(2);
        expect(SetBonusSystem.getOwnedSetCounts(gs).abyssal_set).toBe(0);
        expect(SetBonusSystem.getActiveSets(gs)).toEqual([
            expect.objectContaining({ key: 'void_set', count: 2 }),
        ]);
    });

    it.each([
        {
            label: 'victory',
            runner: async (gs) => {
                const endCombatPromise = CombatLifecycle.endCombat.call(gs, {
                    runRules: { onCombatEnd: vi.fn() },
                    doc: { getElementById: vi.fn(() => null) },
                    win: {},
                    tooltipUI: { hideTooltip: vi.fn() },
                    cleanupAllTooltips: vi.fn(),
                    hudUpdateUI: { resetCombatUI: vi.fn(), hideNodeOverlay: vi.fn() },
                    updateChainUI: vi.fn(),
                    renderHand: vi.fn(),
                    renderCombatCards: vi.fn(),
                    updateUI: vi.fn(),
                    audioEngine: { playItemGet: vi.fn() },
                    showCombatSummary: vi.fn(),
                    showRewardScreen: vi.fn(),
                });

                await vi.runAllTimersAsync();
                await endCombatPromise;
            },
            isBoss: false,
            expectedMaxEnergy: 3,
            expectedCount: 0,
        },
        {
            label: 'boss victory',
            runner: async (gs) => {
                const endCombatPromise = CombatLifecycle.endCombat.call(gs, {
                    runRules: { onCombatEnd: vi.fn() },
                    doc: { getElementById: vi.fn(() => null) },
                    win: {},
                    tooltipUI: { hideTooltip: vi.fn() },
                    cleanupAllTooltips: vi.fn(),
                    hudUpdateUI: { resetCombatUI: vi.fn(), hideNodeOverlay: vi.fn() },
                    updateChainUI: vi.fn(),
                    renderHand: vi.fn(),
                    renderCombatCards: vi.fn(),
                    updateUI: vi.fn(),
                    audioEngine: { playItemGet: vi.fn() },
                    showCombatSummary: vi.fn(),
                    showRewardScreen: vi.fn(),
                });

                await vi.runAllTimersAsync();
                await endCombatPromise;
            },
            isBoss: true,
            expectedMaxEnergy: 4,
            expectedCount: 1,
        },
        {
            label: 'defeat',
            runner: async (gs) => {
                handleCombatPlayerDeath(gs, {
                    doc: {
                        body: { style: {}, appendChild: vi.fn() },
                        createElement: vi.fn(() => ({
                            style: {},
                            appendChild: vi.fn(),
                            remove: vi.fn(),
                            textContent: '',
                        })),
                        getElementById: vi.fn(() => ({ classList: { remove: vi.fn() } })),
                    },
                    win: {
                        innerWidth: 1280,
                        innerHeight: 720,
                    },
                    showDeathScreen: vi.fn(),
                    audioEngine: {},
                    screenShake: { shake: vi.fn() },
                    particleSystem: { deathEffect: vi.fn() },
                });
                await vi.runAllTimersAsync();
            },
            isBoss: false,
            expectedMaxEnergy: 3,
            expectedCount: 0,
        },
        {
            label: 'abandon',
            runner: async (gs) => {
                cleanupCombatAfterAbandon({
                    gs,
                    doc: {
                        getElementById: vi.fn(() => ({ classList: { remove: vi.fn() } })),
                    },
                });
            },
            isBoss: false,
            expectedMaxEnergy: 3,
            expectedCount: 0,
        },
    ])('applies combat_end cleanup and rewards consistently on %s', async ({ runner, isBoss, expectedMaxEnergy, expectedCount }) => {
        vi.useFakeTimers();
        const gs = createCombatEndOutcomeHost({ isBoss });

        expect(gs._itemRuntime.balanced_scale.active).toBe(true);
        expect(gs._itemRuntime.balanced_scale.drawReset).toBe(true);
        expect(gs._itemRuntime.mana_battery.stored).toBe(2);

        await runner(gs);

        expect(gs.player.echo).toBe(80);
        expect(gs.player.drawCount).toBe(0);
        expect(gs._itemRuntime?.balanced_scale?.active ?? false).toBe(false);
        expect(gs._itemRuntime?.balanced_scale?.drawReset ?? false).toBe(false);
        expect(gs._itemRuntime?.mana_battery?.stored ?? 0).toBe(0);
        expect(gs.player.maxEnergy).toBe(expectedMaxEnergy);
        expect(gs.player._itemState.energy_core.count).toBe(expectedCount);
    });
});
