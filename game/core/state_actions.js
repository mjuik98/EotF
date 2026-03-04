import { CombatInitializer } from '../combat/combat_initializer.js';

import { CONSTANTS } from '../data/constants.js';

const CONFIG_MAX_ENERGY_CAP = Number(CONSTANTS?.PLAYER?.MAX_ENERGY_CAP);
const MAX_ENERGY_CAP = Number.isFinite(CONFIG_MAX_ENERGY_CAP) && CONFIG_MAX_ENERGY_CAP >= 1
    ? Math.floor(CONFIG_MAX_ENERGY_CAP)
    : 5;

/*
 * state_actions.js 전역 Action 정의 + Reducer
 *
 * 모든 상태 변경은 Action을 통해 dispatch됩니다.
 * Reducer는 gs(state)를 통해 상태를 변경합니다.
 */

// ===========================================================================
//  Action Types
// ===========================================================================
export const Actions = {
    // Player
    PLAYER_DAMAGE: 'player:damage',
    PLAYER_HEAL: 'player:heal',
    PLAYER_SHIELD: 'player:shield',
    PLAYER_GOLD: 'player:gold',
    PLAYER_ENERGY: 'player:energy',
    PLAYER_ECHO: 'player:echo',
    PLAYER_SILENCE: 'player:silence',
    PLAYER_BUFF: 'player:buff',
    PLAYER_MAX_HP_GROWTH: 'player:max_hp_growth',
    PLAYER_MAX_ENERGY_GROWTH: 'player:max_energy_growth',
    PLAYER_DEATH: 'player:death',

    // Card
    CARD_DRAW: 'card:draw',
    CARD_PLAY: 'card:play',
    CARD_DISCARD: 'card:discard',

    // Enemy
    ENEMY_DAMAGE: 'enemy:damage',
    ENEMY_STATUS: 'enemy:status',
    ENEMY_DEATH: 'enemy:death',
    ENEMY_SPAWN: 'enemy:spawn',

    // Combat
    COMBAT_START: 'combat:start',
    COMBAT_END: 'combat:end',
    TURN_START: 'turn:start',
    TURN_END: 'turn:end',

    // System
    SCREEN_CHANGE: 'screen:change',
    GOLD_CHANGE: 'gold:change',
    MAP_MOVE: 'map:move',
};

// ===========================================================================
// Reducers (상태 변경 함수)
// ===========================================================================
export const Reducers = {
    [Actions.PLAYER_DAMAGE](gs, { amount, source = 'unknown' }) {
        const player = gs.player;
        let remaining = amount;

        // 방어막 우선 소모
        if (player.shield > 0) {
            const absorbed = Math.min(player.shield, remaining);
            player.shield -= absorbed;
            remaining -= absorbed;
        }

        if (remaining > 0) {
            player.hp = Math.max(0, player.hp - remaining);
            gs.stats.damageTaken += remaining;
        }

        gs.markDirty('hud');

        return {
            shieldAbsorbed: amount - remaining,
            actualDamage: remaining,
            hpAfter: player.hp,
            isDead: player.hp <= 0,
        };
    },

    [Actions.PLAYER_HEAL](gs, { amount }) {
        const player = gs.player;
        const actual = Math.min(amount, player.maxHp - player.hp);
        player.hp = Math.min(player.maxHp, player.hp + actual);
        gs.markDirty('hud');

        return { healed: actual, hpAfter: player.hp };
    },

    [Actions.PLAYER_SHIELD](gs, { amount }) {
        gs.player.shield = Math.max(0, gs.player.shield + amount);
        gs.markDirty('hud');
        return { shieldAfter: gs.player.shield };
    },

    [Actions.PLAYER_GOLD](gs, { amount }) {
        gs.player.gold += amount;
        gs.markDirty('hud');
        return { goldAfter: gs.player.gold, delta: amount };
    },

    [Actions.PLAYER_ENERGY](gs, { amount }) {
        const prevEnergy = Number(gs.player.energy || 0);
        if (amount > 0 && typeof gs.triggerItems === 'function') {
            const scaled = gs.triggerItems('energy_gain', { amount });
            if (typeof scaled === 'number' && Number.isFinite(scaled)) amount = scaled;
        }
        gs.player.energy = Math.max(0, gs.player.energy + amount);
        if (amount < 0 && prevEnergy > 0 && gs.player.energy === 0 && typeof gs.triggerItems === 'function') {
            gs.triggerItems('energy_empty', { previous: prevEnergy, delta: amount });
        }
        gs.markDirty('hud');
        return { energyAfter: gs.player.energy };
    },

    [Actions.PLAYER_ECHO](gs, { amount }) {
        gs.player.echo = Math.max(0, Math.min(gs.player.maxEcho, gs.player.echo + amount));
        gs.markDirty('hud');
        return { echoAfter: gs.player.echo };
    },

    [Actions.PLAYER_SILENCE](gs, { amount }) {
        gs.player.silenceGauge = Math.max(0, (gs.player.silenceGauge || 0) + amount);
        gs.markDirty('hud');
        return { silenceGauge: gs.player.silenceGauge };
    },

    [Actions.PLAYER_BUFF](gs, { id, stacks, data = {} }) {
        const buffs = gs.player.buffs;
        if (buffs[id]) {
            buffs[id].stacks += stacks;
            for (const key in data) {
                if (typeof data[key] === 'number') {
                    buffs[id][key] = (buffs[id][key] || 0) + data[key];
                } else {
                    buffs[id][key] = data[key];
                }
            }
        } else {
            buffs[id] = { stacks, ...data };
        }
    },

    [Actions.PLAYER_MAX_HP_GROWTH](gs, { amount }) {
        const player = gs.player;
        player.maxHp = Math.max(1, player.maxHp + amount);
        // 최대 체력 증가 시 현재 체력도 같은 양만큼 증가 (회복)
        if (amount > 0) {
            player.hp = Math.min(player.maxHp, player.hp + amount);
        } else {
            player.hp = Math.min(player.maxHp, player.hp);
        }
        gs.markDirty('hud');
        return { maxHpAfter: player.maxHp, hpAfter: player.hp };
    },

    [Actions.PLAYER_MAX_ENERGY_GROWTH](gs, { amount }) {
        const player = gs.player;
        const cap = Math.max(1, Number(player.maxEnergyCap || MAX_ENERGY_CAP));
        const previousMax = Math.max(1, Number(player.maxEnergy || 1));
        const previousEnergy = Math.max(0, Number(player.energy || 0));
        const requestedMax = Math.max(1, previousMax + amount);
        player.maxEnergy = Math.min(cap, requestedMax);
        // 최대 에너지 증가분만큼만 현재 에너지 보정
        if (amount > 0) {
            const actualIncrease = Math.max(0, player.maxEnergy - previousMax);
            player.energy = Math.min(player.maxEnergy, previousEnergy + actualIncrease);
        } else {
            player.energy = Math.min(player.maxEnergy, previousEnergy);
        }
        gs.markDirty('hud');
        return { maxEnergyAfter: player.maxEnergy, energyAfter: player.energy };
    },

    [Actions.CARD_DISCARD](gs, { cardId, exhaust = false, skipHandRemove = false }) {
        if (!skipHandRemove) {
            const idx = gs.player.hand.indexOf(cardId);
            if (idx >= 0) gs.player.hand.splice(idx, 1);
        }

        if (exhaust) {
            gs.player.exhausted.push(cardId);
            let preventedExhaust = false;
            if (typeof gs.triggerItems === 'function') {
                preventedExhaust = gs.triggerItems('card_exhaust', { cardId }) === true;
            }
            if (preventedExhaust) {
                const exIdx = gs.player.exhausted.lastIndexOf(cardId);
                if (exIdx >= 0) gs.player.exhausted.splice(exIdx, 1);
                gs.player.graveyard.push(cardId);
                gs.markDirty('hand');
                return { cardId, exhausted: false, preventedExhaust: true };
            }
        } else {
            gs.player.graveyard.push(cardId);
            if (typeof gs.triggerItems === 'function') {
                gs.triggerItems('card_discard', { cardId });
            }
        }
        gs.markDirty('hand');
        return { cardId, exhausted: exhaust };
    },

    [Actions.CARD_DRAW](gs, { count }) {
        let drewCards = false;
        const previousHandLength = gs.player.hand.length;
        const handCap = Math.max(1, 8 - Math.max(0, Number(gs.player._handCapMinus || 0)));

        for (let i = 0; i < count; i++) {
            if (!gs.player.drawPile || gs.player.drawPile.length === 0) {
                if (!gs.player.graveyard || gs.player.graveyard.length === 0) break;

                // Graveyard를 drawPile로 옮겨 넣음
                gs.player.drawPile = [...gs.player.graveyard];
                // 배열 순서 섞기 (Fisher-Yates)
                for (let j = gs.player.drawPile.length - 1; j > 0; j--) {
                    const k = Math.floor(Math.random() * (j + 1));
                    [gs.player.drawPile[j], gs.player.drawPile[k]] = [gs.player.drawPile[k], gs.player.drawPile[j]];
                }
                gs.player.graveyard = [];
                if (typeof gs.addLog === 'function') {
                    gs.addLog('🌀 버린 카드 더미를 뽑기 더미로 섞었습니다.', 'system');
                }
            }
            if (gs.player.hand.length < handCap) {
                const cardId = gs.player.drawPile.pop();
                gs.player.hand.push(cardId);
                drewCards = true;

                if (typeof gs.triggerItems === 'function') {
                    gs.triggerItems('card_draw', { cardId });
                }
            }
        }

        if (drewCards) {
            gs.markDirty('hand');
            gs.markDirty('hud');
        }

        const drawn = gs.player.hand.length - previousHandLength;
        return { drewCards: drawn, drawn };
    },

    [Actions.ENEMY_DAMAGE](gs, { amount, targetIdx }) {
        const enemy = gs.combat.enemies[targetIdx];
        if (!enemy) return { actualDamage: 0 };

        let remaining = amount;
        if (enemy.shield > 0) {
            const absorbed = Math.min(enemy.shield, remaining);
            enemy.shield -= absorbed;
            remaining -= absorbed;
        }
        enemy.hp = Math.max(0, enemy.hp - remaining);
        gs.stats.damageDealt += remaining;

        return {
            shieldAbsorbed: amount - remaining,
            actualDamage: remaining,
            totalDamage: amount,
            hpAfter: enemy.hp,
            isDead: enemy.hp <= 0,
            targetIdx,
        };
    },

    [Actions.ENEMY_STATUS](gs, { status, duration, targetIdx }) {
        const enemy = gs.combat.enemies[targetIdx];
        if (!enemy) return {};
        if (!enemy.statusEffects) enemy.statusEffects = {};
        enemy.statusEffects[status] = (enemy.statusEffects[status] || 0) + duration;
        return { status, duration: enemy.statusEffects[status], targetIdx };
    },

    [Actions.COMBAT_START](gs, { enemies = [] }) {
        gs.combat.active = true;
        gs.combat.turn = 0;
        gs.combat.playerTurn = true;
        gs.combat.log = [];
        gs.currentScreen = 'game';
        gs.markDirty('hud');
        gs.markDirty('hand');
        return { enemyCount: enemies.length };
    },

    [Actions.COMBAT_END](gs, { victory = true }) {
        const activeRegionId = Number(gs._activeRegionId);
        const stagnationActive = activeRegionId === 5;
        const preCombatGraveyard = Array.isArray(gs.player.graveyard) ? [...gs.player.graveyard] : [];
        const preCombatExhausted = Array.isArray(gs.player.exhausted) ? [...gs.player.exhausted] : [];

        gs.combat.active = false;
        gs.combat.playerTurn = true;

        gs.player.hand = [];
        CombatInitializer.resetCombatState(gs);

        if (stagnationActive && Array.isArray(gs.player.deck)) {
            const combinedPool = [...preCombatGraveyard, ...preCombatExhausted];
            if (combinedPool.length > 0) {
                // 무작위로 최대 2장 선택
                const countToRemove = Math.min(combinedPool.length, 2);
                const toRemove = [];
                const poolCopy = [...combinedPool];

                for (let i = 0; i < countToRemove; i++) {
                    const randIdx = Math.floor(Math.random() * poolCopy.length);
                    toRemove.push(poolCopy.splice(randIdx, 1)[0]);
                }

                const removed = [];
                toRemove.forEach((cardId) => {
                    const idx = gs.player.deck.indexOf(cardId);
                    if (idx >= 0) {
                        gs.player.deck.splice(idx, 1);
                        removed.push(cardId);
                    }
                });

                if (removed.length > 0) {
                    if (!Array.isArray(gs._stagnationVault)) gs._stagnationVault = [];
                    gs._stagnationVault.push(...removed);
                    if (typeof gs.addLog === 'function') {
                        gs.addLog(`🕳️ 정체 영역이 카드 ${removed.length}장을 삼켰습니다.`, 'damage');
                    }
                }
            }
        }

        gs.player.graveyard = [];
        gs.player.exhausted = [];
        gs.player.drawPile = [];
        gs.player.discardPile = [];

        gs.player.silenceGauge = 0;
        gs._maskCount = 0;
        gs._batteryUsedTurn = false;
        gs._temporalTurn = 0;
        gs._activeRegionId = null;

        gs.markDirty('hud');
        return { victory };
    },

    [Actions.TURN_START](gs, { isPlayerTurn }) {
        gs.combat.turn++;
        gs.combat.playerTurn = isPlayerTurn;
        return { turn: gs.combat.turn, isPlayerTurn };
    },

    [Actions.TURN_END](gs, { isPlayerTurn }) {
        return { turn: gs.combat.turn, isPlayerTurn };
    },

    [Actions.SCREEN_CHANGE](gs, { screen }) {
        const prev = gs.currentScreen;
        gs.currentScreen = screen;
        return { prev, current: screen };
    },
};
