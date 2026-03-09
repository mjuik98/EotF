import { registerCardDiscovered, registerItemFound } from '../../systems/codex_records_system.js';
import {
  createDefaultCombatState,
  createDefaultPlayerState,
  createDefaultRunConfig,
  createDefaultRuntimeState,
} from '../../core/game_state_defaults.js';

export function getInscriptionLevel(gs, id) {
  if (!gs?.meta?.inscriptions) return 0;
  const disabled = gs.runConfig?.disabledInscriptions || gs.meta.runConfig?.disabledInscriptions || [];
  if (disabled.includes(id)) return 0;
  const value = gs.meta.inscriptions[id];
  if (typeof value === 'boolean') return value ? 1 : 0;
  return Math.max(0, Math.floor(Number(value) || 0));
}

export function getActiveInscriptions(gs, data) {
  if (!data?.inscriptions) return [];
  const active = [];
  for (const [id, def] of Object.entries(data.inscriptions)) {
    const level = getInscriptionLevel(gs, id);
    if (level > 0) {
      active.push({ id, def, level: Math.min(level, def.maxLevel || 1) });
    }
  }
  return active;
}

export function getActiveSynergies(gs, data) {
  if (!data?.synergies) return [];
  const active = [];
  outer: for (const [id, syn] of Object.entries(data.synergies)) {
    const requirements = id.split('+');
    for (const requirement of requirements) {
      if (getInscriptionLevel(gs, requirement) < 1) continue outer;
    }
    active.push({ id, syn });
  }
  return active;
}

export function applyStartBonuses(gs, data) {
  if (!gs || !data) return;

  getActiveInscriptions(gs, data).forEach((item) => {
    const levelDef = item.def.levels?.[item.level - 1];
    if (levelDef && typeof levelDef.apply === 'function') {
      levelDef.apply(gs);
    }
  });

  getActiveSynergies(gs, data).forEach(({ syn }) => {
    if (syn.trigger === 'passive' && typeof syn.effect === 'function') {
      syn.effect(gs);
    }
  });
}

export function resolveRunSetupContext(deps, logger = console) {
  const selectedClass = deps.getSelectedClass?.();
  if (!selectedClass) return null;

  const gs = deps.gs;
  const data = deps.data;
  const classMeta = data?.classes?.[selectedClass];
  const runRules = deps.runRules;
  const audioEngine = deps.audioEngine;

  if (!gs || !data?.startDecks || !classMeta || !runRules || !audioEngine) {
    logger.error?.('[RunSetupUI] Missing dependencies:', {
      gs: !!gs,
      data: !!data,
      startDecks: !!data?.startDecks,
      classMeta: !!classMeta,
      runRules: !!runRules,
      audioEngine: !!audioEngine,
    });
    return null;
  }

  const maxHp = Number(classMeta?.stats?.HP);
  if (!Number.isFinite(maxHp) || maxHp <= 0) {
    logger.error?.('[RunSetupUI] Invalid class HP config for:', selectedClass, classMeta?.stats);
    return null;
  }

  return {
    audioEngine,
    classMeta,
    data,
    gs,
    maxHp,
    runRules,
    selectedClass,
  };
}

export function resetRunConfig(gs) {
  gs.runConfig = createDefaultRunConfig({
    ascension: gs.meta.runConfig.ascension || 0,
    endless: !!gs.meta.runConfig.endless,
    endlessMode: !!gs.meta.runConfig.endless,
    curse: gs.meta.runConfig.curse || 'none',
    disabledInscriptions: gs.meta.runConfig.disabledInscriptions || [],
  });
  gs._runOutcomeCommitted = false;
  gs._classMasteryRunStartApplied = false;
  gs._classMasteryAppliedClassId = null;
}

export function createRunStartPlayer(selectedClass, maxHp, data) {
  return createDefaultPlayerState({
    class: selectedClass,
    hp: maxHp,
    maxHp,
    echo: 0,
    gold: 10,
    deck: [...data.startDecks[selectedClass]],
  });
}

export function applyRunStartLoadout(gs, selectedClass, classMeta, data) {
  gs.player = createRunStartPlayer(selectedClass, Number(classMeta?.stats?.HP), data);

  if (!gs.meta.codex) {
    gs.meta.codex = { enemies: new Set(), cards: new Set(), items: new Set() };
  }
  gs.player.deck.forEach((id) => registerCardDiscovered(gs, id));

  const startItem = classMeta.startRelic;
  if (!startItem) return;
  gs.player.items.push(startItem);
  registerItemFound(gs, startItem);
  const itemDef = data.items?.[startItem];
  if (itemDef && typeof itemDef.onAcquire === 'function') {
    itemDef.onAcquire(gs);
  }
}

export function resetRuntimeState(gs, worldMemory) {
  const runStartTs = Date.now();
  gs.worldMemory = { ...worldMemory };
  Object.assign(gs, createDefaultRuntimeState({
    currentFloor: 0,
    worldMemory: gs.worldMemory,
    stats: {
      _runStartTs: runStartTs,
      _regionStartTs: runStartTs,
    },
  }));
  gs.combat = createDefaultCombatState();
}
