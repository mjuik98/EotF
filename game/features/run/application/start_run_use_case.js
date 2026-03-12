import { createRunStateCommands } from '../../../shared/state/run_state_commands.js';

export function createStartRunUseCase(options = {}) {
  const runStateCommands = options.runStateCommands || createRunStateCommands();

  return function startRun(input = {}) {
    const {
      gs,
      selectedClass,
      classMeta,
      data,
      runRules,
      audioEngine,
      shuffleArray,
      applyStartBonuses,
      resetDeckModalFilter,
      enterGameplay,
      enterRun,
      updateUI,
    } = input;

    if (!gs || !selectedClass || !classMeta || !data || !runRules || !audioEngine) {
      return null;
    }

    audioEngine.init?.();
    audioEngine.resume?.();
    runRules.ensureMeta?.(gs.meta);

    runStateCommands.resetRunConfig(gs);
    runStateCommands.applyRunStartLoadout(gs, selectedClass, classMeta, data);
    applyStartBonuses?.(gs, data);
    runRules.applyRunStart?.(gs);

    if (typeof shuffleArray === 'function') {
      shuffleArray(gs.player.deck);
    }

    runStateCommands.resetRuntimeState(gs, gs.meta.worldMemory);

    resetDeckModalFilter?.();
    enterGameplay?.();
    if (typeof enterGameplay !== 'function') enterRun?.();
    updateUI?.();
    gs.markDirty?.('hud');

    return {
      classId: selectedClass,
      player: gs.player,
      runConfig: gs.runConfig,
      worldMemory: gs.worldMemory || gs.meta?.worldMemory,
    };
  };
}
