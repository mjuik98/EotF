import { CombatInitializer } from '../combat/combat_initializer.js';

/**
 * state_actions.js ??Action ?뺤쓽 + Reducer
 *
 * 紐⑤뱺 ?곹깭 蹂寃쎌? Action???듯빐 dispatch?⑸땲??
 * 媛?Reducer??gs(state)瑜?吏곸젒 蹂寃쏀븯怨? 蹂寃??댁슜??諛섑솚?⑸땲??
 */

// ?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧??
//  Action Types
// ?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧??
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

// ?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧??
//  Reducers (?곹깭 蹂寃??⑥닔)
// ?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧??
export const Reducers = {
    [Actions.PLAYER_DAMAGE](gs, { amount, source = 'unknown' }) {
        const player = gs.player;
        let remaining = amount;

        // 諛⑹뼱留??곗꽑 ?뚮え
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
        gs.player.energy = Math.max(0, gs.player.energy + amount);
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

    [Actions.CARD_DISCARD](gs, { cardId, exhaust = false, skipHandRemove = false }) {
        if (!skipHandRemove) {
            const idx = gs.player.hand.indexOf(cardId);
            if (idx >= 0) gs.player.hand.splice(idx, 1);
        }

        if (exhaust) {
            gs.player.exhausted.push(cardId);
        } else {
            gs.player.graveyard.push(cardId);
        }
        gs.markDirty('hand');
        return { cardId, exhausted: exhaust };
    },

    [Actions.CARD_DRAW](gs, { count }) {
        let drewCards = false;
        const previousHandLength = gs.player.hand.length;

        for (let i = 0; i < count; i++) {
            if (!gs.player.drawPile || gs.player.drawPile.length === 0) {
                if (!gs.player.graveyard || gs.player.graveyard.length === 0) break;

                // Graveyard瑜?drawPile濡??욎뼱 ?ｌ쓬
                gs.player.drawPile = [...gs.player.graveyard];
                // 諛곗뿴 ?쒖꽌 ?욊린 (Fisher-Yates)
                for (let j = gs.player.drawPile.length - 1; j > 0; j--) {
                    const k = Math.floor(Math.random() * (j + 1));
                    [gs.player.drawPile[j], gs.player.drawPile[k]] = [gs.player.drawPile[k], gs.player.drawPile[j]];
                }
                gs.player.graveyard = [];
                if (typeof gs.addLog === 'function') {
                    gs.addLog('🌀 버린 카드 더미를 뽑기 더미로 섞었습니다.', 'system');
                }
            }
            if (gs.player.hand.length < 8) {
                gs.player.hand.push(gs.player.drawPile.pop());
                drewCards = true;
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

