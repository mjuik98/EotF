import { DATA } from '../../data/game_data.js';
import { GAME } from '../core/global_bridge.js';
import { ClassProgressionSystem } from './class_progression_system.js';
import { ensureCodexRecords, ensureCodexState } from './codex_records_system.js';

const MIN_REGION_FLOORS = 6;
const MAX_REGION_FLOORS = 9;

function _rollRegionFloors() {
  return MIN_REGION_FLOORS + Math.floor(Math.random() * (MAX_REGION_FLOORS - MIN_REGION_FLOORS + 1));
}

function _resolveRegionFloors(gs, regionAbsIdx, baseFloors) {
  const fallback = Math.max(1, Math.floor(Number(baseFloors) || 1));
  if (!gs) return fallback;

  if (!gs.regionFloors || typeof gs.regionFloors !== 'object' || Array.isArray(gs.regionFloors)) {
    gs.regionFloors = {};
  }

  const key = String(Math.max(0, Math.floor(Number(regionAbsIdx) || 0)));
  const existing = Number(gs.regionFloors[key]);
  if (Number.isFinite(existing) && existing >= MIN_REGION_FLOORS && existing <= MAX_REGION_FLOORS) {
    return Math.floor(existing);
  }

  const rolled = _rollRegionFloors();
  gs.regionFloors[key] = rolled;
  return rolled;
}
export function getRegionCount() {
  const fromData = Array.isArray(DATA?.baseRegionSequence) ? DATA.baseRegionSequence : [];
  if (fromData.length > 0) return fromData.length;
  return 5;
}

function _getBaseRegionSequence() {
  const fromData = Array.isArray(DATA?.baseRegionSequence)
    ? DATA.baseRegionSequence
    : [];
  if (fromData.length > 0) {
    return fromData
      .map((v) => Math.max(0, Math.floor(Number(v) || 0)))
      .filter((v, idx, arr) => arr.indexOf(v) === idx);
  }
  return [0, 1, 2, 3, 4];
}

function _getRegionById(regionId) {
  if (!Array.isArray(DATA?.regions) || DATA.regions.length === 0) return null;
  const normalized = Math.max(0, Math.floor(Number(regionId) || 0));
  return DATA.regions.find((r) => Number(r?.id) === normalized) || null;
}

function _resolveRegionRouteMap(gs) {
  if (!gs) return null;
  if (!gs.regionRoute || typeof gs.regionRoute !== 'object' || Array.isArray(gs.regionRoute)) {
    gs.regionRoute = {};
  }
  return gs.regionRoute;
}

export function getBaseRegionIndex(regionIdx = 0) {
  const count = getRegionCount();
  if (!count) return 0;
  const idx = Math.max(0, Math.floor(Number(regionIdx) || 0));
  return idx % count;
}

export function getRegionIdForStage(regionIdx = 0, gsRef = null) {
  const count = getRegionCount();
  if (!count) return 0;

  const sequence = _getBaseRegionSequence();
  const idx = Math.max(0, Math.floor(Number(regionIdx) || 0));
  const baseIdx = getBaseRegionIndex(idx);
  const fallbackRegionId = sequence[baseIdx] ?? baseIdx;

  const gs = gsRef || GAME.State || null;
  const routeMap = _resolveRegionRouteMap(gs);
  if (!routeMap) return fallbackRegionId;

  const explicit = Number(routeMap[String(idx)]);
  if (Number.isFinite(explicit)) return Math.max(0, Math.floor(explicit));
  return fallbackRegionId;
}

export function getRegionData(regionIdx = 0, gsRef = null) {
  const count = getRegionCount();
  if (!count) return null;

  const idx = Math.max(0, Math.floor(Number(regionIdx) || 0));
  const baseIdx = getBaseRegionIndex(idx);
  const resolvedRegionId = getRegionIdForStage(idx, gsRef);

  const baseRegion = _getRegionById(resolvedRegionId)
    || _getRegionById(_getBaseRegionSequence()[baseIdx] ?? baseIdx)
    || _getRegionById(baseIdx);
  if (!baseRegion) return null;

  const gs = gsRef || GAME.State || null;
  const endless = !!(gs?.runConfig?.endlessMode || gs?.runConfig?.endless);
  const floors = _resolveRegionFloors(gs, idx, baseRegion.floors);
  const regionWithFloors = {
    ...baseRegion,
    floors,
    _baseRegion: baseIdx,
    _resolvedRegionId: resolvedRegionId,
  };
  if (!endless || idx < count) return regionWithFloors;

  const cycle = Math.floor(idx / count);
  return {
    ...regionWithFloors,
    _endlessCycle: cycle,
    name: `${baseRegion.name} · 순환 ${cycle + 1}`,
  };
}

export const RunRules = {
  blessings: {
    none: { id: 'none', name: '없음', desc: '시작 축복이 없습니다.' },
    vigor: { id: 'vigor', name: '활력의 축복', desc: '최대 HP +15로 시작합니다.' },
    wealth: { id: 'wealth', name: '풍요의 축복', desc: '골드 +35로 시작합니다.' },
    spark: { id: 'spark', name: '불꽃의 축복', desc: '잔향 +30으로 시작합니다.' },
  },

  curses: {
    none: { id: 'none', name: '없음', desc: '적용되는 저주가 없습니다.' },
    tax: { id: 'tax', name: '탐욕의 저주', desc: '상점 비용이 +20% 증가합니다.' },
    fatigue: { id: 'fatigue', name: '피로의 저주', desc: '회복량 -25%, 최대 방어막 -10.' },
    frail: { id: 'frail', name: '허약의 저주', desc: '최대 HP -10으로 시작합니다.' },
  },

  ensureMeta(meta) {
    if (!meta || typeof meta !== 'object') return;

    if (!meta.worldMemory || typeof meta.worldMemory !== 'object') meta.worldMemory = {};
    if (!meta.inscriptions || typeof meta.inscriptions !== 'object') {
      meta.inscriptions = { echo_boost: false, resilience: false, fortune: false };
    }
    if (!Array.isArray(meta.storyPieces)) meta.storyPieces = [];

    ensureCodexState({ meta });
    ensureCodexRecords({ meta });

    if (!meta.unlocks || typeof meta.unlocks !== 'object') meta.unlocks = {};
    if (typeof meta.unlocks.ascension !== 'boolean') meta.unlocks.ascension = (meta.runCount || 1) > 1;
    if (typeof meta.unlocks.endless !== 'boolean') meta.unlocks.endless = false;

    if (!Number.isFinite(meta.maxAscension)) {
      meta.maxAscension = meta.unlocks.ascension ? 1 : 0;
    }

    if (!meta.runConfig || typeof meta.runConfig !== 'object') {
      meta.runConfig = { ascension: 0, endless: false, blessing: 'none', curse: 'none', disabledInscriptions: [] };
    }
    if (!Array.isArray(meta.runConfig.disabledInscriptions)) {
      meta.runConfig.disabledInscriptions = [];
    }
    if (typeof meta.runConfig.endless !== 'boolean' && typeof meta.runConfig.endlessMode === 'boolean') {
      meta.runConfig.endless = meta.runConfig.endlessMode;
    }
    if (!Number.isFinite(meta.runConfig.ascension)) meta.runConfig.ascension = 0;
    if (typeof meta.runConfig.endless !== 'boolean') meta.runConfig.endless = false;
    if (!this.blessings[meta.runConfig.blessing]) meta.runConfig.blessing = 'none';
    if (!this.curses[meta.runConfig.curse]) meta.runConfig.curse = 'none';

    if (!meta.progress || typeof meta.progress !== 'object') {
      meta.progress = { echoShards: 0, totalDamage: 0, victories: 0, failures: 0, bossKills: {} };
    }
    if (!Number.isFinite(meta.progress.echoShards)) meta.progress.echoShards = 0;
    if (!Number.isFinite(meta.progress.totalDamage)) meta.progress.totalDamage = 0;
    if (!Number.isFinite(meta.progress.victories)) meta.progress.victories = 0;
    if (!Number.isFinite(meta.progress.failures)) meta.progress.failures = 0;
    if (!meta.progress.bossKills || typeof meta.progress.bossKills !== 'object') meta.progress.bossKills = {};

    meta.maxAscension = Math.max(0, Math.floor(meta.maxAscension));
    meta.runConfig.ascension = Math.max(0, Math.min(meta.maxAscension, Math.floor(meta.runConfig.ascension)));
    if (!meta.unlocks.endless) meta.runConfig.endless = false;

    const classIds = Object.keys(DATA?.classes || {});
    ClassProgressionSystem.ensureMeta(meta, classIds);
  },

  getAscension(gs) {
    const lvl = gs?.runConfig?.ascension;
    return Number.isFinite(lvl) ? Math.max(0, Math.floor(lvl)) : 0;
  },

  isEndless(gs) {
    return !!(gs?.runConfig?.endlessMode || gs?.runConfig?.endless);
  },

  getEnemyScaleMultiplier(gs, regionAbs = 0) {
    // 諛몃윴??議곗젙: ?뱀쿇 ?④퀎蹂??ㅼ??쇰쭅 ?꾪솕 (8% -> 6%) 諛??곹븳 ?곸슜
    let ascMul = 1 + this.getAscension(gs) * 0.06;
    if (ascMul > 1.5) ascMul = 1.5;

    const cycle = this.isEndless(gs) ? Math.floor(Math.max(0, regionAbs) / Math.max(1, getRegionCount())) : 0;
    const endlessMul = 1 + cycle * 0.12;
    return ascMul * endlessMul;
  },

  getHealAmount(gs, baseAmount) {
    const base = Math.max(0, Math.floor(Number(baseAmount) || 0));
    if (!base) return 0;
    let mult = 1 - this.getAscension(gs) * 0.02;
    if ((gs?.runConfig?.curse || 'none') === 'fatigue') mult *= 0.75;
    return Math.max(0, Math.floor(base * Math.max(0.2, mult)));
  },

  getShopCost(gs, baseCost) {
    const base = Math.max(1, Math.floor(Number(baseCost) || 1));
    let mult = 1 + this.getAscension(gs) * 0.03;
    if ((gs?.runConfig?.curse || 'none') === 'tax') mult *= 1.2;
    return Math.max(1, Math.ceil(base * mult));
  },

  applyRunStart(gs) {
    if (!gs?.meta || !gs?.player) return;
    this.ensureMeta(gs.meta);
    const asc = this.getAscension(gs);
    const cfg = gs.runConfig || {};

    const ascHpLoss = Math.min(20, asc * 2);
    if (ascHpLoss > 0) {
      gs.player.maxHp = Math.max(1, gs.player.maxHp - ascHpLoss);
      gs.player.hp = Math.min(gs.player.hp, gs.player.maxHp);
    }

    const blessing = cfg.blessing || 'none';
    if (blessing === 'vigor') {
      gs.player.maxHp += 15;
      gs.player.hp = Math.min(gs.player.maxHp, gs.player.hp + 15);
    } else if (blessing === 'wealth') {
      gs.player.gold += 35;
    } else if (blessing === 'spark') {
      gs.player.echo = Math.min(gs.player.maxEcho, gs.player.echo + 30);
    }

    const curse = cfg.curse || 'none';
    if (curse === 'frail') {
      gs.player.maxHp = Math.max(1, gs.player.maxHp - 10);
      gs.player.hp = Math.min(gs.player.hp, gs.player.maxHp);
    }

    ClassProgressionSystem.applyRunStartBonuses(gs, {
      classIds: Object.keys(DATA?.classes || {}),
      data: DATA,
    });
  },

  onCombatStart(gs) {
    if (!gs?.player) return;
    ClassProgressionSystem.applyCombatStartBonuses(gs, {
      classIds: Object.keys(DATA?.classes || {}),
    });
  },

  onCombatDeckReady(gs) {
    if (!gs?.player) return;
    ClassProgressionSystem.applyDeckReadyBonuses(gs, {
      classIds: Object.keys(DATA?.classes || {}),
      data: DATA,
    });
  },
  onTurnStart() { },

  onVictory(gs) {
    if (!gs?.meta) return 5;
    this.ensureMeta(gs.meta);

    gs.meta.unlocks.ascension = true;
    gs.meta.progress.victories = (gs.meta.progress.victories || 0) + 1;
    gs.meta.progress.echoShards = (gs.meta.progress.echoShards || 0) + 2;
    gs.meta.maxAscension = Math.max(gs.meta.maxAscension || 0, Math.min(20, gs.meta.progress.victories));

    if (gs.meta.progress.victories >= 3) {
      gs.meta.unlocks.endless = true;
    }
    return 5;
  },

  onDefeat(gs) {
    if (!gs?.meta) return 3;
    this.ensureMeta(gs.meta);
    gs.meta.progress.failures = (gs.meta.progress.failures || 0) + 1;
    return 3;
  },

  nextBlessingId(current = 'none') {
    const ids = Object.keys(this.blessings);
    const idx = Math.max(0, ids.indexOf(current));
    return ids[(idx + 1) % ids.length];
  },

  nextCurseId(current = 'none') {
    const ids = Object.keys(this.curses);
    const idx = Math.max(0, ids.indexOf(current));
    return ids[(idx + 1) % ids.length];
  },
};

export function finalizeRunOutcome(kind = 'defeat', options = {}) {
  const gs = GAME.State;
  if (!gs) return 0;
  if (gs._runOutcomeCommitted) return 0;
  gs._runOutcomeCommitted = true;

  RunRules.ensureMeta(gs.meta);
  Object.assign(gs.meta.worldMemory, gs.worldMemory || {});
  gs.meta.bestChain = Math.max(gs.meta.bestChain || 0, gs.stats?.maxChain || 0);

  const isVictory = kind === 'victory';
  let shardGain = 0;
  if (Number.isFinite(options.echoFragments)) {
    shardGain = Math.max(0, Math.floor(options.echoFragments));
    if (isVictory) RunRules.onVictory(gs);
    else RunRules.onDefeat(gs);
  } else {
    shardGain = isVictory ? RunRules.onVictory(gs) : RunRules.onDefeat(gs);
  }

  try {
    ClassProgressionSystem.awardRunXP(gs, kind, {
      ...options,
      classIds: Object.keys(DATA?.classes || {}),
      regionCount: getRegionCount(),
    });
  } catch (e) {
    console.warn('[RunRules] Class progression update failed:', e?.message || e);
  }

  gs.meta.runCount = Math.max(1, (gs.meta.runCount || 1) + 1);
  gs.meta.echoFragments = Math.max(0, (gs.meta.echoFragments || 0) + shardGain);

  if (GAME.Modules?.['SaveSystem']?.saveMeta) GAME.Modules['SaveSystem'].saveMeta();
  if (GAME.Modules?.['SaveSystem']?.clearSave) GAME.Modules['SaveSystem'].clearSave();

  return shardGain;
}






