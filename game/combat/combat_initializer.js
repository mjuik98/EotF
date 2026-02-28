/**
 * combat_initializer.js — 전투 초기화 비즈니스 로직 (순수 Model)
 *
 * DOM/window 접근 없이 게임 상태(gs)만 변경합니다.
 */

// ═══════════════════════════════════════
//  유틸
// ═══════════════════════════════════════
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

// ═══════════════════════════════════════
//  CombatInitializer (순수 로직)
// ═══════════════════════════════════════
export const CombatInitializer = {

    /**
     * 전투 상태 리셋 (적 목록, 에너지, 방어막 등 초기화)
     */
    resetCombatState(gs) {
        gs.combat.enemies = [];
        gs.combat.turn = 1;
        gs.combat.playerTurn = true;
        gs.combat.log = [];
        gs.player.shield = 0;
        gs.player.echoChain = 0;
        gs.player.energy = gs.player.maxEnergy;
        gs.player.zeroCost = false;
        gs.player.costDiscount = 0;
        gs.player._nextCardDiscount = 0;
        gs.player._freeCardUses = 0;
        gs.player._cascadeCards = new Map();
        gs.player._traitCardDiscounts = {};
        gs.player._mageCastCounter = 0;
        gs.player._mageLastDiscountTarget = null;
        gs.combat.active = true;
        gs.combat.bossDefeated = false; // 보스 오인 판정 방지
        gs._endCombatScheduled = false;
        gs._endCombatRunning = false;
        gs._selectedTarget = null;
        gs._combatStartDmg = gs.stats.damageDealt;
        gs._combatStartTaken = gs.stats.damageTaken;
        gs._combatStartKills = gs.player.kills;
    },

    /**
     * 적 스폰 (보스 / 엘리트 / 일반)
     * @returns {string[]} 스폰된 적 키 목록 (코덱스 등록용)
     */
    spawnEnemies(gs, data, isBoss, {
        getRegionData,
        getBaseRegionIndex,
        getRegionCount,
        difficultyScaler,
    }) {
        const region = getRegionData(gs.currentRegion, gs);
        if (!region) return [];

        const spawnedKeys = [];

        if (isBoss) {
            const isHiddenEligible = _isLastBaseRegion(gs, getBaseRegionIndex, getRegionCount) &&
                (gs.worldMemory.savedMerchant || 0) >= 1 &&
                gs.meta.storyPieces.length >= 5;

            let bossKey;
            if (isHiddenEligible) {
                bossKey = 'echo_origin';
            } else {
                const bossArray = region.boss || ['ancient_echo'];
                bossKey = Array.isArray(bossArray) ? bossArray[Math.floor(Math.random() * bossArray.length)] : bossArray;
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
                const regIdx = typeof getBaseRegionIndex === 'function' ? getBaseRegionIndex(gs.currentRegion) : gs.currentRegion;

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

        // 코덱스 등록
        if (gs.meta.codex) {
            spawnedKeys.forEach(k => gs.meta.codex.enemies.add(k));
        }

        return { spawnedKeys, isHiddenBoss: isBoss && spawnedKeys[0] === 'echo_origin' };
    },

    /**
     * 지역별 전투 시작 디버프 부여
     */
    applyRegionDebuffs(gs, getBaseRegionIndex) {
        if (typeof getBaseRegionIndex !== 'function') return;

        const regIdx = getBaseRegionIndex(gs.currentRegion);

        if (regIdx === 2 && Math.random() < 0.5) {
            const memoryDebuffs = ['weakened', 'burning', 'confusion'];
            const debuff = memoryDebuffs[Math.floor(Math.random() * memoryDebuffs.length)];
            gs.player.buffs[debuff] = { stacks: 1 };
            gs.addLog?.(`👁️ 왜곡된 기억: ${debuff} 부여!`, 'damage');
        }

        if (regIdx === 3) {
            const debuffs = ['weakened', 'slowed', 'burning'];
            const debuff = debuffs[Math.floor(Math.random() * debuffs.length)];
            gs.player.buffs[debuff] = { stacks: 2 };
            gs.addLog?.(`⚠️ 신의 무덤: ${debuff} 부여!`, 'damage');
        }

        const runRules = window.GAME?.Modules?.['RunRules'];
        if (runRules && typeof runRules.onCombatStart === 'function') {
            runRules.onCombatStart(gs);
        }
    },

    /**
     * 덱 초기화 (전투용 drawPile 세팅)
     */
    initDeck(gs, { shuffleArrayFn, drawCardsFn } = {}) {
        gs.player.drawPile = [...(gs.player.deck || [])];
        gs.player.discardPile = [];
        gs.player.hand = [];
        if (shuffleArrayFn) shuffleArrayFn(gs.player.drawPile);

        // 5장 드로우
        if (drawCardsFn) {
            drawCardsFn(5, gs);
        } else if (typeof gs.drawCards === 'function') {
            gs.drawCards(5);
        } else {
            for (let i = 0; i < 5; i++) {
                if (gs.player.drawPile.length > 0) gs.player.hand.push(gs.player.drawPile.pop());
            }
        }

        // 첫 생존 적 타겟
        const firstAlive = gs.combat.enemies.findIndex(e => e.hp > 0);
        gs._selectedTarget = firstAlive >= 0 ? firstAlive : null;
    },
};
