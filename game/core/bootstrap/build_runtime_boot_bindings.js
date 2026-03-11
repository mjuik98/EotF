import {
  buildGameBootPayload,
  configureMazeSystem,
  mountCharacterSelect,
  registerInitSequenceBindings,
  setupStorySystemBridge,
} from '../init_sequence_steps.js';

export function buildRuntimeBootBindings({ modules, fns, deps, doc, win, schedule = setTimeout }) {
  const StorySystem = setupStorySystemBridge({ modules, deps });

  return {
    StorySystem,
    bootGameInit() {
      try {
        modules.GameInit.boot(buildGameBootPayload({ modules, deps, fns }));
      } catch (e) {
        console.error('Critical Boot Error:', e);
      }
    },
    configureMaze() {
      configureMazeSystem({
        mazeSystem: modules.MazeSystem,
        gs: modules.GS,
        fovEngine: modules.FovEngine,
        fns,
        doc,
        win,
      });
    },
    exposeRuntimeGlobals() {
      modules.exposeGlobals({
        _syncVolumeUI: () => modules.GameInit.syncVolumeUI(modules.AudioEngine),
      });
    },
    registerBindings() {
      registerInitSequenceBindings({ game: modules.GAME, modules, fns });
    },
    scheduleCharacterSelectMount() {
      schedule(() => {
        mountCharacterSelect({
          modules,
          deps,
          fns,
          doc,
        });
      }, 50);
    },
  };
}
