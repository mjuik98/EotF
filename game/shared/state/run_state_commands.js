import {
  createDefaultCombatState,
  createDefaultPlayerState,
  createDefaultRunConfig,
  createDefaultRuntimeState,
} from '../../core/game_state_defaults.js';
import {
  addPlayerItemAndRegisterState,
  registerPlayerDeckCardsState,
} from './player_state_effects.js';
import { getHandScopedRuntimeState } from './hand_index_runtime_state.js';
import { resolveClassStartingLoadout } from '../progression/class_loadout_preset_use_case.js';

export function createRunStartPlayer(selectedClass, maxHp, data, deckOverride = null) {
  const baseDeck = Array.isArray(deckOverride) ? deckOverride : data.startDecks[selectedClass];
  return createDefaultPlayerState({
    class: selectedClass,
    hp: maxHp,
    maxHp,
    echo: 0,
    gold: 10,
    deck: [...baseDeck],
  });
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

export function applyRunStartLoadout(gs, selectedClass, classMeta, data) {
  const loadout = resolveClassStartingLoadout(gs?.meta, selectedClass, {
    classLevel: gs?.meta?.classProgress?.levels?.[selectedClass],
    classMeta,
    data,
  });

  gs.player = createRunStartPlayer(selectedClass, Number(classMeta?.stats?.HP), data, loadout.deck);

  if (!gs.meta.codex) {
    gs.meta.codex = { enemies: new Set(), cards: new Set(), items: new Set() };
  }
  registerPlayerDeckCardsState(gs, gs.player.deck);

  loadout.relicIds.forEach((itemId) => {
    const itemDef = data.items?.[itemId];
    addPlayerItemAndRegisterState(gs, itemId, itemDef);
  });
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
  getHandScopedRuntimeState(gs);
}

export function createRunStateCommands() {
  return {
    applyRunStartLoadout,
    createRunStartPlayer,
    resetRunConfig,
    resetRuntimeState,
    startRun({ gs, selectedClass, classMeta, data, worldMemory }) {
      resetRunConfig(gs);
      applyRunStartLoadout(gs, selectedClass, classMeta, data);
      resetRuntimeState(gs, worldMemory);
    },
  };
}
