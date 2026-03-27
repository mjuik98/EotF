function cloneArray(value) {
  return Array.isArray(value) ? [...value] : [];
}

function clonePlainObject(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || value instanceof Set || value instanceof Map) {
    return {};
  }
  return { ...value };
}

function cloneSet(value) {
  if (value instanceof Set) return new Set(value);
  if (Array.isArray(value)) return new Set(value);
  return new Set();
}

function cloneMap(value) {
  if (value instanceof Map) return new Map(value);
  if (Array.isArray(value)) return new Map(value);
  return new Map();
}

export function createDefaultRunConfig(overrides = {}) {
  const cfg = {
    ascension: 0,
    endless: false,
    curse: 'none',
    disabledInscriptions: [],
    ...overrides,
  };
  cfg.disabledInscriptions = cloneArray(overrides.disabledInscriptions);
  if (Object.prototype.hasOwnProperty.call(overrides, 'endlessMode')) {
    cfg.endlessMode = !!overrides.endlessMode;
  }
  return cfg;
}

export function createDefaultCodexState(overrides = {}) {
  return {
    enemies: cloneSet(overrides.enemies),
    cards: cloneSet(overrides.cards),
    items: cloneSet(overrides.items),
  };
}

export function createDefaultMetaState(overrides = {}) {
  const meta = {
    runCount: 1,
    totalKills: 0,
    bestChain: 0,
    echoFragments: 0,
    worldMemory: {},
    inscriptions: {
      echo_boost: false,
      resilience: false,
      fortune: false,
    },
    storyPieces: [],
    _hiddenEndingHinted: false,
    codex: createDefaultCodexState(),
    unlocks: {
      ascension: false,
      endless: false,
    },
    maxAscension: 0,
    recentRuns: [],
    activeSaveSlot: 1,
    runConfig: createDefaultRunConfig(),
    progress: {
      echoShards: 0,
      totalDamage: 0,
      victories: 0,
      failures: 0,
      bossKills: {},
    },
    ...overrides,
  };
  meta.worldMemory = clonePlainObject(overrides.worldMemory);
  meta.inscriptions = {
    echo_boost: false,
    resilience: false,
    fortune: false,
    ...clonePlainObject(overrides.inscriptions),
  };
  meta.storyPieces = cloneArray(overrides.storyPieces);
  meta.codex = createDefaultCodexState(overrides.codex);
  meta.unlocks = {
    ascension: false,
    endless: false,
    ...clonePlainObject(overrides.unlocks),
  };
  meta.recentRuns = cloneArray(overrides.recentRuns);
  meta.runConfig = createDefaultRunConfig(overrides.runConfig);
  meta.progress = {
    echoShards: 0,
    totalDamage: 0,
    victories: 0,
    failures: 0,
    bossKills: {},
    ...clonePlainObject(overrides.progress),
  };
  return meta;
}

export function createDefaultPlayerState(overrides = {}) {
  const player = {
    class: 'swordsman',
    hp: 80,
    maxHp: 80,
    shield: 0,
    echo: 0,
    maxEcho: 100,
    echoChain: 0,
    energy: 3,
    maxEnergy: 3,
    gold: 0,
    kills: 0,
    deck: [],
    hand: [],
    graveyard: [],
    exhausted: [],
    items: [],
    buffs: {},
    silenceGauge: 0,
    timeRiftGauge: 0,
    zeroCost: false,
    _freeCardUses: 0,
    costDiscount: 0,
    _nextCardDiscount: 0,
    _cascadeCards: new Map(),
    _traitCardDiscounts: {},
    _mageCastCounter: 0,
    _mageLastDiscountTarget: null,
    upgradedCards: new Set(),
    _cardUpgradeBonus: {},
    ...overrides,
  };
  player.deck = cloneArray(overrides.deck);
  player.hand = cloneArray(overrides.hand);
  player.graveyard = cloneArray(overrides.graveyard);
  player.exhausted = cloneArray(overrides.exhausted);
  player.items = cloneArray(overrides.items);
  player.buffs = clonePlainObject(overrides.buffs);
  player._cascadeCards = cloneMap(overrides._cascadeCards);
  player._traitCardDiscounts = clonePlainObject(overrides._traitCardDiscounts);
  player.upgradedCards = cloneSet(overrides.upgradedCards);
  player._cardUpgradeBonus = clonePlainObject(overrides._cardUpgradeBonus);
  return player;
}

export function createDefaultCombatState(overrides = {}) {
  const combat = {
    active: false,
    enemies: [],
    turn: 0,
    playerTurn: true,
    log: [],
    ...overrides,
  };
  combat.enemies = cloneArray(overrides.enemies);
  combat.log = cloneArray(overrides.log);
  return combat;
}

export function createDefaultStatsState(overrides = {}) {
  const stats = {
    damageDealt: 0,
    damageTaken: 0,
    cardsPlayed: 0,
    maxChain: 0,
    clearTimeMs: 0,
    regionClearTimes: {},
    _runStartTs: 0,
    _regionStartTs: 0,
    ...overrides,
  };
  stats.regionClearTimes = clonePlainObject(overrides.regionClearTimes);
  return stats;
}

export function createDefaultRuntimeState(overrides = {}) {
  const worldMemory = clonePlainObject(overrides.worldMemory);
  const stats = createDefaultStatsState(overrides.stats);
  const combat = createDefaultCombatState(overrides.combat);
  const handScopedRuntime = {
    cascadeCards: cloneMap(overrides._handScopedRuntime?.cascadeCards ?? overrides._cascadeCards),
    costTargets: {
      glitch0Index: null,
      glitchPlusIndex: null,
      oilTargetIndex: null,
      ...clonePlainObject(overrides._handScopedRuntime?.costTargets),
    },
  };

  return {
    currentRegion: 0,
    currentFloor: 1,
    regionFloors: clonePlainObject(overrides.regionFloors),
    regionRoute: clonePlainObject(overrides.regionRoute),
    mapNodes: cloneArray(overrides.mapNodes),
    currentNode: null,
    visitedNodes: cloneSet(overrides.visitedNodes),
    combat,
    _selectedTarget: null,
    _activeRegionId: null,
    _stagnationVault: cloneArray(overrides._stagnationVault),
    worldMemory,
    stats,
    _heartUsed: false,
    _temporalTurn: 0,
    _bossAdvancePending: false,
    _handScopedRuntime: handScopedRuntime,
    ...overrides,
    regionFloors: clonePlainObject(overrides.regionFloors),
    regionRoute: clonePlainObject(overrides.regionRoute),
    mapNodes: cloneArray(overrides.mapNodes),
    visitedNodes: cloneSet(overrides.visitedNodes),
    combat,
    worldMemory,
    stats,
    _stagnationVault: cloneArray(overrides._stagnationVault),
    _handScopedRuntime: handScopedRuntime,
  };
}

export function createDefaultGameStateShape() {
  const state = {
    meta: createDefaultMetaState(),
    player: createDefaultPlayerState(),
    ...createDefaultRuntimeState(),
    _dispatchDepth: 0,
    _dispatchSeq: 0,
  };
  getHandScopedRuntimeState(state);
  return state;
}
import { getHandScopedRuntimeState } from '../shared/state/hand_index_runtime_state.js';
