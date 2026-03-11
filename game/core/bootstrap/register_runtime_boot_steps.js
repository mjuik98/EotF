import {
  buildGameBootPayload,
  configureMazeSystem,
  mountCharacterSelect,
  registerInitSequenceBindings,
  setupStorySystemBridge,
} from '../init_sequence_steps.js';

export function registerRuntimeBootSteps({ modules, fns, deps, doc, win }) {
  const StorySystem = setupStorySystemBridge({ modules, deps });
  registerInitSequenceBindings({ game: modules.GAME, modules, fns });

  configureMazeSystem({
    mazeSystem: modules.MazeSystem,
    gs: modules.GS,
    fovEngine: modules.FovEngine,
    fns,
    doc,
    win,
  });

  setTimeout(() => {
    mountCharacterSelect({
      modules,
      deps,
      fns,
      doc,
    });
  }, 50);

  modules.exposeGlobals({
    _syncVolumeUI: () => modules.GameInit.syncVolumeUI(modules.AudioEngine),
  });

  try {
    modules.GameInit.boot(buildGameBootPayload({ modules, deps, fns }));
  } catch (e) {
    console.error('Critical Boot Error:', e);
  }

  return { StorySystem };
}
