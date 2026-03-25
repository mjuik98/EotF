import { activateCombat } from '../ports/public_state_capabilities.js';

function resolveCombatMode(mode) {
  if (mode === true) return 'boss';
  if (mode === false) return 'normal';
  return typeof mode === 'string' ? mode : 'normal';
}

function runCombatStartLogs(gs) {
  gs.addLog?.('⚔️ 전투 시작!', 'system');
  gs.addLog?.(`── 턴 ${gs.combat.turn} ──`, 'turn-divider');
}

function setActiveCombatRegion(gs, region) {
  const regionId = Number(region?.id);
  gs._activeRegionId = Number.isFinite(regionId) ? regionId : null;
  return gs._activeRegionId;
}

function applyCombatStartState(gs, region, deps = {}) {
  if (typeof deps.setActiveCombatRegionState === 'function') {
    deps.setActiveCombatRegionState(gs, region);
  } else {
    setActiveCombatRegion(gs, region);
  }

  if (typeof deps.enterCombatState === 'function') {
    deps.enterCombatState(gs);
    return;
  }

  activateCombat(gs);
}

function runBossEntryEffects({ isBoss, isMiniBoss, spawnResult, playBossPhase, audioEngine, showWorldMemoryNotice, setTimeoutFn }) {
  if (isBoss) {
    playBossPhase?.(audioEngine);
    if (spawnResult.isHiddenBoss && typeof showWorldMemoryNotice === 'function') {
      setTimeoutFn(() => showWorldMemoryNotice('⚠️ 봉인된 심연이 깨어난다! 근원의 잔향이 모습을 드러낸다!'), 600);
    }
    return;
  }

  if (isMiniBoss) {
    playBossPhase?.(audioEngine);
  }
}

function runClassCombatStart(gs, classMechanics) {
  const playerClass = gs.player?.class;
  const classMech = classMechanics?.[playerClass];
  if (typeof classMech?.onCombatStart === 'function') {
    classMech.onCombatStart(gs);
  }
}

export function startCombatFlowUseCase(mode = 'normal', deps = {}) {
  const gs = deps.gs;
  const data = deps.data;
  const getRegionData = deps.getRegionData;
  const getBaseRegionIndex = deps.getBaseRegionIndex;
  const getRegionCount = deps.getRegionCount;
  const difficultyScaler = deps.difficultyScaler;
  const audioEngine = deps.audioEngine;
  const runRules = deps.runRules;
  const classMechanics = deps.classMechanics;
  const setTimeoutFn = typeof deps.setTimeoutFn === 'function' ? deps.setTimeoutFn : setTimeout;
  const resetCombatState = deps.resetCombatState;
  const spawnEnemies = deps.spawnEnemies;
  const applyRegionDebuffs = deps.applyRegionDebuffs;
  const initDeck = deps.initDeck;

  if (
    !gs
    || !data?.enemies
    || typeof getRegionData !== 'function'
    || typeof resetCombatState !== 'function'
    || typeof spawnEnemies !== 'function'
    || typeof applyRegionDebuffs !== 'function'
    || typeof initDeck !== 'function'
  ) {
    console.error('[CombatStart] Missing dependencies');
    return null;
  }

  const combatMode = resolveCombatMode(mode);
  const isBoss = combatMode === 'boss';
  const isMiniBoss = combatMode === 'mini_boss';
  const region = getRegionData(gs.currentRegion, gs);

  resetCombatState(gs);
  applyCombatStartState(gs, region, deps);
  runCombatStartLogs(gs);

  const spawnResult = spawnEnemies(gs, data, combatMode, {
    getRegionData,
    getBaseRegionIndex,
    getRegionCount,
    difficultyScaler,
  });

  runBossEntryEffects({
    isBoss,
    isMiniBoss,
    spawnResult,
    playBossPhase: deps.playBossPhase,
    audioEngine,
    showWorldMemoryNotice: deps.showWorldMemoryNotice,
    setTimeoutFn,
  });

  applyRegionDebuffs(gs, getBaseRegionIndex, { runRules });
  runClassCombatStart(gs, classMechanics);

  initDeck(gs, {
    shuffleArrayFn: deps.shuffleArray,
    drawCardsFn: deps.api?.drawCards,
  });
  gs.triggerItems?.('combat_start');
  if (typeof runRules?.onCombatDeckReady === 'function') {
    runRules.onCombatDeckReady(gs);
  }

  return {
    combatMode,
    isBoss,
    isMiniBoss,
    region,
    spawnResult,
  };
}
