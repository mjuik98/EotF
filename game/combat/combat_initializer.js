/**
 * combat_initializer.js - ?꾪닾 珥덇린???쒖닔 濡쒖쭅
 *
 * DOM ?묎렐 ?놁씠 寃뚯엫 ?곹깭(gs)留?蹂寃쏀빀?덈떎.
 */

import { registerEnemyEncounter } from '../systems/codex_records_system.js';

function _isLastBaseRegion(gs, getBaseRegionIndex, getRegionCount) {
    if (!gs) return false;
    if (typeof getBaseRegionIndex !== 'function' || typeof getRegionCount !== 'function') return false;
    return getBaseRegionIndex(gs.currentRegion) === Math.max(0, getRegionCount() - 1);
}

function _spawnScaledEnemy(gs, enemyData, difficultyScaler, extra = {}) {
    if (!gs || !enemyData) return;
    const payload = { ...enemyData, statusEffects: {}, ...extra };
    const enemy = difficultyScaler?.scaleEnemy?.(payload, gs) || payload;
    gs.combat.enemies.push(enemy);
}

function _applyAbyssEmpowerment(enemy) {
    if (!enemy) return null;
    const roll = Math.floor(Math.random() * 4);
    enemy.statusEffects = enemy.statusEffects || {};

    if (roll === 0) {
        enemy.shield = (enemy.shield || 0) + 20;
        return 'shield';
    }
    if (roll === 1) {
        enemy.atk = Math.max(1, Math.ceil((enemy.atk || 1) * 1.3));
        return 'atk';
    }
    if (roll === 2) {
        enemy.statusEffects.abyss_regen = 5;
        return 'regen';
    }
    enemy.statusEffects.draw_block = 1;
    return 'draw_block';
}

function _applyAbyssRegionBuffs(gs, region) {
    if (!gs || !region || Number(region.id) !== 6) return;
    const labelByBuff = {
        shield: '?ъ뿰 媛뺥솕: 諛⑹뼱留?+20',
        atk: '?ъ뿰 媛뺥솕: 怨듦꺽??+30%',
        regen: '?ъ뿰 媛뺥솕: ?대떦 ?ъ깮 5',
        draw_block: '?ъ뿰 媛뺥솕: ?쒕줈??媛꾩꽠',
    };
    gs.combat.enemies.forEach((enemy) => {
        if (!enemy || enemy.hp <= 0) return;
        const buffKey = _applyAbyssEmpowerment(enemy);
        if (buffKey && typeof gs.addLog === 'function') {
            gs.addLog(`${enemy.name} ${labelByBuff[buffKey] || '?ъ뿰 媛뺥솕'}`, 'system');
        }
    });
}

export const CombatInitializer = {
    /**
     * ?꾪닾 ?곹깭 由ъ뀑
     */
    resetCombatState(gs) {
        const combat = gs.combat;
        const player = gs.player;

        // ?곴뎄 踰꾪봽 蹂댁〈 (?뷀뼢 ?ㅽ궗 ??
        const permanentBuffs = {};
        const PERMANENT_BUFF_IDS = ['echo_berserk'];
        if (player.buffs) {
            Object.keys(player.buffs).forEach(buffId => {
                if (PERMANENT_BUFF_IDS.includes(buffId)) {
                    permanentBuffs[buffId] = player.buffs[buffId];
                }
            });
        }

        combat.enemies = [];
        combat.turn = 1;
        combat.playerTurn = true;
        combat.log = [];
        player.shield = 0;
        player.echoChain = 0;
        player.energy = player.maxEnergy;
        player.buffs = permanentBuffs;
        player.zeroCost = false;
        player.costDiscount = 0;
        player._nextCardDiscount = 0;
        player._freeCardUses = 0;
        player._cascadeCards = new Map();
        player._traitCardDiscounts = {};
        player._mageCastCounter = 0;
        player._mageLastDiscountTarget = null;
        combat.bossDefeated = false;
        combat.miniBossDefeated = false;
        gs._endCombatScheduled = false;
        gs._endCombatRunning = false;
        gs._selectedTarget = null;
        gs._combatStartDmg = gs.stats.damageDealt;
        gs._combatStartTaken = gs.stats.damageTaken;
        gs._combatStartKills = gs.player.kills;
    },

    /**
     * ???ㅽ룿 (蹂댁뒪/?뺤삁/?쇰컲)
     */
    spawnEnemies(gs, data, mode, {
        getRegionData,
        getBaseRegionIndex,
        getRegionCount,
        difficultyScaler,
    }) {
        const region = getRegionData(gs.currentRegion, gs);
        if (!region) return { spawnedKeys: [], isHiddenBoss: false };

        const spawnedKeys = [];
        const combatMode = mode === true
            ? 'boss'
            : (mode === false ? 'normal' : (typeof mode === 'string' ? mode : 'normal'));
        const isBoss = combatMode === 'boss';
        const isMiniBoss = combatMode === 'mini_boss';

        if (isBoss) {
            const isHiddenEligible = _isLastBaseRegion(gs, getBaseRegionIndex, getRegionCount)
                && (gs.worldMemory.savedMerchant || 0) >= 1
                && gs.meta.storyPieces.length >= 5;

            let bossKey;
            if (isHiddenEligible) {
                bossKey = 'echo_origin';
            } else {
                const bossArray = region.boss || ['ancient_echo'];
                bossKey = Array.isArray(bossArray)
                    ? bossArray[Math.floor(Math.random() * bossArray.length)]
                    : bossArray;
            }

            const bossData = data.enemies[bossKey] || data.enemies.ancient_echo;
            _spawnScaledEnemy(gs, bossData, difficultyScaler, { phase: 1 });
            spawnedKeys.push(bossKey);

            gs.triggerItems?.('boss_start');
        } else if (isMiniBoss) {
            const miniBossPool = Array.isArray(region.miniBoss) && region.miniBoss.length > 0
                ? region.miniBoss
                : (Array.isArray(region.elites) && region.elites.length > 0
                    ? region.elites
                    : (Array.isArray(region.boss) && region.boss.length > 0 ? region.boss : ['ancient_echo']));
            const miniBossKey = miniBossPool[Math.floor(Math.random() * miniBossPool.length)];
            const miniBossData = data.enemies[miniBossKey] || data.enemies.ancient_echo;
            _spawnScaledEnemy(gs, miniBossData, difficultyScaler, { phase: 1, isMiniBoss: true, isBoss: false });
            spawnedKeys.push(miniBossKey);
        } else {
            const isEliteNode = gs.currentNode?.type === 'elite';
            if (isEliteNode && region.elites?.length) {
                const eliteKey = region.elites[Math.floor(Math.random() * region.elites.length)];
                if (data.enemies[eliteKey]) {
                    _spawnScaledEnemy(gs, data.enemies[eliteKey], difficultyScaler);
                    spawnedKeys.push(eliteKey);
                }
            } else {
                let count = 1;
                const regIdx = typeof getBaseRegionIndex === 'function'
                    ? getBaseRegionIndex(gs.currentRegion)
                    : gs.currentRegion;

                if (gs.currentFloor > 1) {
                    if (regIdx === 0) {
                        count = Math.random() < 0.4 ? 2 : 1;
                    } else {
                        const roll = Math.random();
                        if (roll < 0.2) count = 3;
                        else if (roll < 0.7) count = 2;
                        else count = 1;
                    }
                }

                for (let i = 0; i < count; i++) {
                    const enemyKey = region.enemies[Math.floor(Math.random() * region.enemies.length)];
                    if (!data.enemies[enemyKey]) continue;
                    _spawnScaledEnemy(gs, data.enemies[enemyKey], difficultyScaler);
                    spawnedKeys.push(enemyKey);
                }
            }
        }

        _applyAbyssRegionBuffs(gs, region);

        const encounterCounts = {};
        spawnedKeys.forEach((key) => {
            if (!key) return;
            encounterCounts[key] = (encounterCounts[key] || 0) + 1;
        });
        Object.entries(encounterCounts).forEach(([key, count]) => {
            registerEnemyEncounter(gs, key, count);
        });

        return { spawnedKeys, isHiddenBoss: isBoss && spawnedKeys[0] === 'echo_origin' };
    },

    /**
     * ?꾪닾 ?쒖옉 ??怨듯넻 ??     *
     * 李멸퀬:
     * - 吏??洹쒖튃? turn_manager.js?먯꽌 泥섎━?⑸땲??
     */
    applyRegionDebuffs(gs, _getBaseRegionIndex) {
        const runRules = globalThis.GAME?.Modules?.['RunRules'];
        if (runRules && typeof runRules.onCombatStart === 'function') {
            runRules.onCombatStart(gs);
        }
    },

    /**
     * ??珥덇린??(?꾪닾??draw/discard/hand)
     */
    initDeck(gs, { shuffleArrayFn, drawCardsFn } = {}) {
        gs.player.drawPile = [...(gs.player.deck || [])];
        gs.player.discardPile = [];
        gs.player.hand = [];
        if (shuffleArrayFn) shuffleArrayFn(gs.player.drawPile);

        const masteryOpeningDraw = Math.max(0, Math.floor(Number(gs.player._classMasteryOpeningDrawBonus || 0)));
        const openingDrawCount = 5 + masteryOpeningDraw;

        if (drawCardsFn) {
            drawCardsFn(openingDrawCount, gs);
        } else if (typeof gs.drawCards === 'function') {
            gs.drawCards(openingDrawCount);
        } else {
            for (let i = 0; i < openingDrawCount; i++) {
                if (gs.player.drawPile.length > 0) gs.player.hand.push(gs.player.drawPile.pop());
            }
        }

        const firstAlive = gs.combat.enemies.findIndex((enemy) => enemy.hp > 0);
        gs._selectedTarget = firstAlive >= 0 ? firstAlive : null;
    },
};



