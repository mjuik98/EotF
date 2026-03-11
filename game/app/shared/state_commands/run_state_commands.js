import { registerCardDiscovered, registerItemFound } from '../../../systems/codex_records_system.js';
import {
  createDefaultCombatState,
  createDefaultPlayerState,
  createDefaultRunConfig,
  createDefaultRuntimeState,
} from '../../../core/game_state_defaults.js';

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
