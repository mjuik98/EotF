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

export const CombatInitializer = {
    /**
     * 전투 상태 리셋
     */
    resetCombatState(gs) {
        const combat = gs.combat;
        const player = gs.player;

        // 영구 버프 보존 (잔향 스킬 등)
        const permanentBuffs = {};
        const PERMANENT_BUFF_IDS = ['echo_berserk', 'resonance'];
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
    spawnEnemies(gs, data, isBoss, {
        getRegionData,
        getBaseRegionIndex,
        getRegionCount,
        difficultyScaler,
    }) {
        const region = getRegionData(gs.currentRegion, gs);
        if (!region) return { spawnedKeys: [], isHiddenBoss: false };

        const spawnedKeys = [];

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

        if (drawCardsFn) {
            drawCardsFn(5, gs);
        } else if (typeof gs.drawCards === 'function') {
            gs.drawCards(5);
        } else {
            for (let i = 0; i < 5; i++) {
                if (gs.player.drawPile.length > 0) gs.player.hand.push(gs.player.drawPile.pop());
            }
        }

        const firstAlive = gs.combat.enemies.findIndex((enemy) => enemy.hp > 0);
        gs._selectedTarget = firstAlive >= 0 ? firstAlive : null;
    },
};
