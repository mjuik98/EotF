export function getGS(deps) {
  return deps?.gs;
}

function cloneSerializable(value, fallback) {
  if (value === undefined) return fallback;
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return fallback;
  }
}

function ensurePlayerItemState(player) {
  if (!player || typeof player !== 'object') return {};
  if (!player._itemState || typeof player._itemState !== 'object' || Array.isArray(player._itemState)) {
    player._itemState = {};
  }
  return player._itemState;
}

function stripLegacyItemStateFields(player) {
  if (!player || typeof player !== 'object') return player;
  delete player._phoenixUsed;
  delete player._energyCoreCount;
  delete player._ancientBatteryUsedFloor;
  delete player._itemDerivedHandCapMinus;
  return player;
}

export function buildMetaSave(gs, version) {
  if (!gs?.meta) return null;

  const meta = cloneSerializable(gs.meta, {}) || {};
  if (meta.codex) {
    meta.codex = {
      enemies: [...(gs.meta.codex?.enemies || [])],
      cards: [...(gs.meta.codex?.cards || [])],
      items: [...(gs.meta.codex?.items || [])],
    };
  }
  meta.version = version;
  return meta;
}

export function hydrateMetaState(gs, data) {
  if (!gs?.meta || !data) return;

  const nextData = cloneSerializable(data, {}) || {};
  if (data.codex) {
    nextData.codex = {
      enemies: new Set(data.codex.enemies || []),
      cards: new Set(data.codex.cards || []),
      items: new Set(data.codex.items || []),
    };
  }
  Object.assign(gs.meta, nextData);
}

export function ensureMetaRunConfig(meta) {
  if (!meta?.runConfig) meta.runConfig = {};
}

export function validateRunSaveData(data) {
  if (!data?.player) return false;
  if (!Number.isFinite(Number(data.version)) || Number(data.version) < 1) return false;

  const p = data.player;
  if (typeof p.hp !== 'number' || Number.isNaN(p.hp) || p.hp < 0) return false;
  if (typeof p.maxHp !== 'number' || p.maxHp <= 0 || p.maxHp > 9999) return false;
  if (p.hp > p.maxHp) return false;
  if (!Array.isArray(p.deck) || p.deck.length > 500) return false;
  if (typeof p.gold === 'number' && (p.gold < 0 || p.gold > 999999)) return false;
  if (typeof data.currentRegion === 'undefined') return false;
  return true;
}

export function buildRunSave(gs, version) {
  if (!gs?.player) return null;
  const player = stripLegacyItemStateFields({
    ...gs.player,
    buffs: gs.combat.active ? {} : { ...gs.player.buffs },
    hand: [],
    upgradedCards: [...(gs.player.upgradedCards instanceof Set ? gs.player.upgradedCards : [])],
    _cascadeCards: [],
  });

  return {
    version,
    player,
    currentRegion: gs.currentRegion,
    currentFloor: gs.currentFloor,
    regionFloors: cloneSerializable(gs.regionFloors, {}),
    regionRoute: cloneSerializable(gs.regionRoute, {}),
    mapNodes: cloneSerializable(gs.mapNodes, null),
    visitedNodes: gs.visitedNodes ? Array.from(gs.visitedNodes) : [],
    currentNode: gs.currentNode !== undefined ? gs.currentNode : null,
    stats: cloneSerializable(gs.stats, {}),
    worldMemory: cloneSerializable(gs.worldMemory, {}),
    ts: Date.now(),
  };
}

export function hydrateRunState(gs, data) {
  if (!gs || !data?.player) return;

  Object.assign(gs.player, data.player);
  resetHandScopedCascadeCards(gs);
  if (data.player.upgradedCards) {
    gs.player.upgradedCards = new Set(data.player.upgradedCards);
  }

  const loadedRegion = Number(data.currentRegion);
  const loadedFloor = Number(data.currentFloor);
  gs.currentRegion = Number.isFinite(loadedRegion) ? loadedRegion : 0;
  gs.currentFloor = Number.isFinite(loadedFloor) ? loadedFloor : 1;
  gs.regionFloors = (data.regionFloors && typeof data.regionFloors === 'object' && !Array.isArray(data.regionFloors))
    ? cloneSerializable(data.regionFloors, {})
    : {};
  gs.regionRoute = (data.regionRoute && typeof data.regionRoute === 'object' && !Array.isArray(data.regionRoute))
    ? cloneSerializable(data.regionRoute, {})
    : {};
  gs.stats = data.stats ? cloneSerializable(data.stats, gs.stats) : gs.stats;
  gs.worldMemory = data.worldMemory ? cloneSerializable(data.worldMemory, gs.worldMemory) : gs.worldMemory;

  if (data.mapNodes !== undefined) gs.mapNodes = cloneSerializable(data.mapNodes, null);
  if (data.visitedNodes) gs.visitedNodes = new Set(data.visitedNodes);
  if (data.currentNode !== undefined) gs.currentNode = data.currentNode;

  const itemIds = new Set(Array.isArray(gs.player.items) ? gs.player.items : []);
  const itemState = ensurePlayerItemState(gs.player);
  if (itemIds.has('phoenix_feather') && gs.player._phoenixUsed) {
    itemState.phoenix_feather = { ...(itemState.phoenix_feather || {}), used: true };
  }
  if (itemIds.has('energy_core') && Number.isFinite(Number(gs.player._energyCoreCount))) {
    itemState.energy_core = {
      ...(itemState.energy_core || {}),
      count: Number(gs.player._energyCoreCount || 0),
    };
  }
  if (itemIds.has('boss_soul_mirror')) {
    itemState.boss_soul_mirror = {
      ...(itemState.boss_soul_mirror || {}),
      penaltyApplied: true,
    };
  }
  if (itemIds.has('boss_black_lotus') && Number(gs.player._handCapMinus || 0) > 0) {
    const existingPenalty = Math.max(0, Number(itemState.boss_black_lotus?.handCapPenalty || 0));
    const derivedPenalty = existingPenalty || 1;
    itemState.boss_black_lotus = {
      ...(itemState.boss_black_lotus || {}),
      handCapPenalty: derivedPenalty,
      penaltyApplied: true,
    };
  }
  if (itemIds.has('ancient_battery') && Number.isFinite(Number(gs.player._ancientBatteryUsedFloor))) {
    itemState.ancient_battery = {
      ...(itemState.ancient_battery || {}),
      usedFloor: Number(gs.player._ancientBatteryUsedFloor),
    };
  }
  stripLegacyItemStateFields(gs.player);
}
import { resetHandScopedCascadeCards } from '../state/hand_index_runtime_state.js';
