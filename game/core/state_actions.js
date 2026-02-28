/**
 * state_actions.js — Action 정의 + Reducer
 *
 * 모든 상태 변경은 Action을 통해 dispatch됩니다.
 * 각 Reducer는 gs(state)를 직접 변경하고, 변경 내용을 반환합니다.
 */

// ═══════════════════════════════════════
//  Action Types
// ═══════════════════════════════════════
export const Actions = {
    // Player
    PLAYER_DAMAGE: 'player:damage',
    PLAYER_HEAL: 'player:heal',
    PLAYER_SHIELD: 'player:shield',
    PLAYER_GOLD: 'player:gold',
    PLAYER_ENERGY: 'player:energy',
    PLAYER_ECHO: 'player:echo',
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

// ═══════════════════════════════════════
//  Reducers (상태 변경 함수)
// ═══════════════════════════════════════
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

        if (actual > 0 && gs.combat?.active) {
            const cm = window.GAME?.Modules?.['ClassMechanics']?.[player.class];
            if (cm && typeof cm.onHeal === 'function') {
                cm.onHeal(gs, actual);
            }
        }

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
        gs.markDirty('hud');
        return { buff: id, stacks: buffs[id].stacks };
    },

    [Actions.CARD_DRAW](gs, { count = 1 }) {
        let drawn = 0;
        for (let i = 0; i < count; i++) {
            if (gs.player.deck.length === 0) {
                if (gs.player.graveyard.length === 0) break;
                gs.player.deck = [...gs.player.graveyard];
                gs.player.graveyard = [];
                gs.addLog?.('🔄 덱을 섞었다', 'system');
            }
            if (gs.player.hand.length < 8) {
                gs.player.hand.push(gs.player.deck.pop());
                drawn++;
            }
        }
        if (drawn > 0) {
            gs.markDirty('hand');
            gs.markDirty('hud');
        }
        return { drawn, handSize: gs.player.hand.length };
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
        gs.currentScreen = 'combat';
        gs.markDirty('hud');
        gs.markDirty('hand');
        return { enemyCount: enemies.length };
    },

    [Actions.COMBAT_END](gs, { victory = true }) {
        gs.combat.active = false;
        gs.combat.playerTurn = true;

        // 전투 중 파편화된 덱 복구
        const fullDeck = [
            ...(gs.player.deck || []),
            ...(gs.player.hand || []),
            ...(gs.player.graveyard || []),
            ...(gs.player.exhausted || [])
        ];
        gs.player.deck = fullDeck;
        gs.player.hand = [];
        gs.player.graveyard = [];
        gs.player.exhausted = [];
        gs.player.drawPile = [];
        gs.player.discardPile = [];

        // 플레이어 상태 초기화
        gs.player.shield = 0;
        gs.player.echoChain = 0;
        gs.player.energy = gs.player.maxEnergy;
        gs.player.buffs = {};
        gs.player.costDiscount = 0;
        gs.player._nextCardDiscount = 0;
        gs.player.zeroCost = false;
        gs.player._freeCardUses = 0;
        gs.player._cascadeCards = new Map();
        gs.player.silenceGauge = 0;
        gs._maskCount = 0;
        gs._batteryUsedTurn = false;
        gs._temporalTurn = 0;

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
