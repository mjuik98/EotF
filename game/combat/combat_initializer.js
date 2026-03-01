/**
 * combat_initializer.js ???꾪닾 珥덇린??鍮꾩쫰?덉뒪 濡쒖쭅 (?쒖닔 Model)
 *
 * DOM/window ?묎렐 ?놁씠 寃뚯엫 ?곹깭(gs)留?蹂寃쏀빀?덈떎.
 */

// ?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧??
//  ?좏떥
// ?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧??
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

// ?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧??
//  CombatInitializer (?쒖닔 濡쒖쭅)
// ?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧?먥븧??
export const CombatInitializer = {

    /**
     * ?꾪닾 ?곹깭 由ъ뀑 (??紐⑸줉, ?먮꼫吏, 諛⑹뼱留???珥덇린??
     */
    resetCombatState(gs) {
        const combat = gs.combat;
        const player = gs.player;

        combat.enemies = [];
        combat.turn = 1;
        combat.playerTurn = true;
        combat.log = [];
        player.shield = 0;
        player.echoChain = 0;
        player.energy = player.maxEnergy;
        player.zeroCost = false;
        player.costDiscount = 0;
        player._nextCardDiscount = 0;
        player._freeCardUses = 0;
        player._cascadeCards = new Map();
        player._traitCardDiscounts = {};
        player._mageCastCounter = 0;
        player._mageLastDiscountTarget = null;
        combat.active = true;
        combat.bossDefeated = false; // 蹂댁뒪 ?ㅼ씤 ?먯젙 諛⑹?
        gs._endCombatScheduled = false;
        gs._endCombatRunning = false;
        gs._selectedTarget = null;
        gs._combatStartDmg = gs.stats.damageDealt;
        gs._combatStartTaken = gs.stats.damageTaken;
        gs._combatStartKills = gs.player.kills;
    },

    /**
     * ???ㅽ룿 (蹂댁뒪 / ?섎━??/ ?쇰컲)
     * @returns {string[]} ?ㅽ룿??????紐⑸줉 (肄붾뜳???깅줉??
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

        // 肄붾뜳???깅줉
        if (gs.meta.codex) {
            spawnedKeys.forEach(k => gs.meta.codex.enemies.add(k));
        }

        return { spawnedKeys, isHiddenBoss: isBoss && spawnedKeys[0] === 'echo_origin' };
    },

    /**
     * 吏??퀎 ?꾪닾 ?쒖옉 ?붾쾭??遺??
     */
    applyRegionDebuffs(gs, getBaseRegionIndex) {
        if (typeof getBaseRegionIndex !== 'function') return;

        const regIdx = getBaseRegionIndex(gs.currentRegion);

        if (regIdx === 2 && Math.random() < 0.5) {
            const memoryDebuffs = ['weakened', 'burning', 'confusion'];
            const debuff = memoryDebuffs[Math.floor(Math.random() * memoryDebuffs.length)];
            gs.player.buffs[debuff] = { stacks: 1 };
            gs.addLog?.(`?몓截??쒓끝??湲곗뼲: ${debuff} 遺??`, 'damage');
        }

        if (regIdx === 3) {
            const debuffs = ['weakened', 'slowed', 'burning'];
            const debuff = debuffs[Math.floor(Math.random() * debuffs.length)];
            gs.player.buffs[debuff] = { stacks: 2 };
            gs.addLog?.(`?좑툘 ?좎쓽 臾대뜡: ${debuff} 遺??`, 'damage');
        }

        const runRules = globalThis.GAME?.Modules?.['RunRules'];
        if (runRules && typeof runRules.onCombatStart === 'function') {
            runRules.onCombatStart(gs);
        }
    },

    /**
     * ??珥덇린??(?꾪닾??drawPile ?명똿)
     */
    initDeck(gs, { shuffleArrayFn, drawCardsFn } = {}) {
        gs.player.drawPile = [...(gs.player.deck || [])];
        gs.player.discardPile = [];
        gs.player.hand = [];
        if (shuffleArrayFn) shuffleArrayFn(gs.player.drawPile);

        // 5???쒕줈??
        if (drawCardsFn) {
            drawCardsFn(5, gs);
        } else if (typeof gs.drawCards === 'function') {
            gs.drawCards(5);
        } else {
            for (let i = 0; i < 5; i++) {
                if (gs.player.drawPile.length > 0) gs.player.hand.push(gs.player.drawPile.pop());
            }
        }

        // 泥??앹〈 ???寃?
        const firstAlive = gs.combat.enemies.findIndex(e => e.hp > 0);
        gs._selectedTarget = firstAlive >= 0 ? firstAlive : null;
    },
};
