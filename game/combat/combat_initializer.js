/**
 * combat_initializer.js - ?꾪닾 珥덇린???쒖닔 濡쒖쭅
 *
 * DOM ?묎렐 ?놁씠 寃뚯엫 ?곹깭(gs)留?蹂寃쏀빀?덈떎.
 */

import {
    addCombatEnemyState,
    prepareCombatDeckState,
    resetCombatSetupState,
    syncCombatSelectedTargetState,
} from '../features/combat/state/combat_setup_state_commands.js';
import { createEnemySpawnPlan } from '../features/combat/app/enemy_spawn_planner.js';
import { registerEnemyEncounter } from '../shared/codex/codex_records.js';

function _spawnScaledEnemy(gs, enemyData, difficultyScaler, extra = {}) {
    if (!gs || !enemyData) return;
    const payload = { ...enemyData, statusEffects: {}, ...extra };
    const enemy = difficultyScaler?.scaleEnemy?.(payload, gs) || payload;
    addCombatEnemyState(gs, enemy);
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
        resetCombatSetupState(gs);
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
        const plan = createEnemySpawnPlan({
            gs,
            data,
            mode,
            getRegionData,
            getBaseRegionIndex,
            getRegionCount,
        });
        const region = plan.region;
        if (!region) return { spawnedKeys: [], isHiddenBoss: false };
        plan.entries.forEach(({ key, extra }) => {
            const enemyData = data.enemies[key] || data.enemies.ancient_echo;
            _spawnScaledEnemy(gs, enemyData, difficultyScaler, extra);
        });
        if (plan.combatMode === 'boss') {
            gs.triggerItems?.('boss_start');
        }

        _applyAbyssRegionBuffs(gs, region);

        const encounterCounts = {};
        plan.spawnedKeys.forEach((key) => {
            if (!key) return;
            encounterCounts[key] = (encounterCounts[key] || 0) + 1;
        });
        Object.entries(encounterCounts).forEach(([key, count]) => {
            registerEnemyEncounter(gs, key, count);
        });

        return { spawnedKeys: plan.spawnedKeys, isHiddenBoss: plan.isHiddenBoss };
    },

    /**
     * ?꾪닾 ?쒖옉 ??怨듯넻 ??     *
     * 李멸퀬:
     * - 吏??洹쒖튃? turn_manager.js?먯꽌 泥섎━?⑸땲??
     */
    applyRegionDebuffs(gs, _getBaseRegionIndex, deps = {}) {
        const runRules = deps.runRules;
        if (runRules && typeof runRules.onCombatStart === 'function') {
            runRules.onCombatStart(gs);
        }
    },

    /**
     * ??珥덇린??(?꾪닾??draw/discard/hand)
     */
    initDeck(gs, { shuffleArrayFn, drawCardsFn } = {}) {
        prepareCombatDeckState(gs);
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

        syncCombatSelectedTargetState(gs);
    },
};



