/**
 * combat_initializer.js - 전투 초기화 순수 로직
 *
 * DOM 접근 없이 게임 상태(gs)만 변경합니다.
 */

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

function _ensureCodexEnemySet(gs) {
    if (!gs?.meta?.codex) return null;
    const codex = gs.meta.codex;
    if (!(codex.enemies instanceof Set)) {
        codex.enemies = new Set(Array.isArray(codex.enemies) ? codex.enemies : []);
    }
    return codex.enemies;
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
        shield: '심연 강화: 방어막 +20',
        atk: '심연 강화: 공격력 +30%',
        regen: '심연 강화: 턴당 재생 5',
        draw_block: '심연 강화: 드로우 간섭',
    };
    gs.combat.enemies.forEach((enemy) => {
        if (!enemy || enemy.hp <= 0) return;
        const buffKey = _applyAbyssEmpowerment(enemy);
        if (buffKey && typeof gs.addLog === 'function') {
            gs.addLog(`${enemy.name} ${labelByBuff[buffKey] || '심연 강화'}`, 'system');
        }
    });
}

export const CombatInitializer = {
    /**
     * 전투 상태 리셋
     */
    resetCombatState(gs) {
        const combat = gs.combat;
        const player = gs.player;

        // 영구 버프 보존 (잔향 스킬 등)
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
     * 적 스폰 (보스/정예/일반)
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

        const codexEnemySet = _ensureCodexEnemySet(gs);
        if (codexEnemySet) {
            spawnedKeys.forEach((key) => codexEnemySet.add(key));
        }

        return { spawnedKeys, isHiddenBoss: isBoss && spawnedKeys[0] === 'echo_origin' };
    },

    /**
     * 전투 시작 시 공통 훅
     *
     * 참고:
     * - 지역 규칙은 turn_manager.js에서 처리합니다.
     */
    applyRegionDebuffs(gs, _getBaseRegionIndex) {
        const runRules = globalThis.GAME?.Modules?.['RunRules'];
        if (runRules && typeof runRules.onCombatStart === 'function') {
            runRules.onCombatStart(gs);
        }
    },

    /**
     * 덱 초기화 (전투용 draw/discard/hand)
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
