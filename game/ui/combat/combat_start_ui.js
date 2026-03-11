/**
 * combat_start_ui.js ???꾪닾 ?쒖옉 UI (?쒖닔 View)
 *
 * CombatInitializer?먯꽌 濡쒖쭅??泥섎━?섍퀬, ???뚯씪? DOM ?낅뜲?댄듃留??대떦?⑸땲??
 */
import { Trigger } from '../../data/triggers.js';
import { CombatInitializer } from '../../combat/combat_initializer.js';
import { playEventBossPhase } from '../../domain/audio/audio_event_helpers.js';
import {
  applyCombatEntryOverlay,
  finalizeCombatStartUi,
  resetCombatStartSurface,
  scheduleCombatEntryAnimations,
  scheduleCombatStartBanner,
  showCombatBossBanner,
  syncCombatStartButtons,
} from './combat_start_runtime_ui.js';

function _getDoc(deps) {
  return deps?.doc || document;
}

export const CombatStartUI = {
  startCombat(mode = 'normal', deps = {}) {
    const gs = deps.gs;
    const data = deps.data;
    const getRegionData = deps.getRegionData;
    const getBaseRegionIndex = deps.getBaseRegionIndex;
    const getRegionCount = deps.getRegionCount;
    const difficultyScaler = deps.difficultyScaler;
    const audioEngine = deps.audioEngine;
    const runRules = deps.runRules;
    const classMechanics = deps.classMechanics;

    if (!gs || !data?.enemies || typeof getRegionData !== 'function') {
      console.error('[CombatStart] Missing dependencies');
      return;
    }

    const combatMode = mode === true
      ? 'boss'
      : (mode === false ? 'normal' : (typeof mode === 'string' ? mode : 'normal'));
    const isBoss = combatMode === 'boss';
    const isMiniBoss = combatMode === 'mini_boss';

    const doc = _getDoc(deps);
    const region = getRegionData(gs.currentRegion, gs);
    gs._activeRegionId = Number.isFinite(Number(region?.id)) ? Number(region.id) : null;

    // ?? 濡쒖쭅: ?곹깭 由ъ뀑 ??
    CombatInitializer.resetCombatState(gs);
    gs.combat.active = true;

    // UI: 전투 시작 로그
    gs.addLog?.('⚔️ 전투 시작!', 'system');
    gs.addLog?.(`── 턴 ${gs.combat.turn} ──`, 'turn-divider');

    // ?? 濡쒖쭅: ???ㅽ룿 ??
    const spawnResult = CombatInitializer.spawnEnemies(gs, data, combatMode, {
      getRegionData,
      getBaseRegionIndex,
      getRegionCount,
      difficultyScaler,
    });

    // UI: boss entry effects
    if (isBoss) {
      playEventBossPhase(audioEngine);
      if (spawnResult.isHiddenBoss && typeof deps.showWorldMemoryNotice === 'function') {
        setTimeout(() => deps.showWorldMemoryNotice('⚠️ 봉인된 심연이 깨어난다! 근원의 잔향이 모습을 드러낸다!'), 600);
      }
    } else if (isMiniBoss) {
      playEventBossPhase(audioEngine);
    }

    // ?? 濡쒖쭅: 吏???붾쾭????
    CombatInitializer.applyRegionDebuffs(gs, getBaseRegionIndex, { runRules });

    // ?? 濡쒖쭅: ?대옒????猷?珥덇린????
    const playerClass = gs.player.class;
    const classMech = classMechanics?.[playerClass];
    if (classMech && typeof classMech.onCombatStart === 'function') {
      classMech.onCombatStart(gs);
    }
    // gs.triggerItems?.('combat_start'); // 以묐났 ?쒓굅
    gs.triggerItems?.(Trigger.COMBAT_START);

    // ?? 濡쒖쭅: ??珥덇린????
    CombatInitializer.initDeck(gs, {
      shuffleArrayFn: deps.shuffleArray,
      drawCardsFn: deps.api?.drawCards,
    });
    if (runRules && typeof runRules.onCombatDeckReady === 'function') {
      runRules.onCombatDeckReady(gs);
    }

    // UI updates
    resetCombatStartSurface(gs, deps);
    applyCombatEntryOverlay(gs, deps);

    if (isBoss || isMiniBoss) {
      showCombatBossBanner(gs, isMiniBoss, deps);
    }

    scheduleCombatEntryAnimations(deps);
    syncCombatStartButtons(gs, deps);
    scheduleCombatStartBanner(isBoss, isMiniBoss, deps);
    finalizeCombatStartUi(gs, deps);

  },
};
