import {
  buildGameBootPayload,
  configureMazeSystem,
  mountCharacterSelect,
  registerInitSequenceBindings,
  setupStorySystemBridge,
} from '../init_sequence_steps.js';
import { getModuleRegistryScope } from '../bindings/module_registry_scopes.js';

export function buildRuntimeBootBindings({ modules, fns, deps, doc, win, schedule = setTimeout }) {
  const coreModules = getModuleRegistryScope(modules, 'core');
  const runModules = getModuleRegistryScope(modules, 'run');
  const StorySystem = setupStorySystemBridge({ modules, deps });

  return {
    StorySystem,
    bootGameInit() {
      try {
        coreModules.GameInit.boot(buildGameBootPayload({ modules, deps, fns }));
      } catch (e) {
        console.error('Critical Boot Error:', e);
      }
    },
    configureMaze() {
      configureMazeSystem({
        mazeSystem: runModules.MazeSystem,
        gs: coreModules.GS,
        fovEngine: coreModules.FovEngine,
        fns,
        doc,
        win,
      });
    },
    exposeRuntimeGlobals() {
      modules.exposeGlobals({
        _syncVolumeUI: () => coreModules.GameInit.syncVolumeUI(coreModules.AudioEngine),
      });
    },
    registerBindings() {
      registerInitSequenceBindings({
        game: coreModules.GAME,
        finalizeRunOutcome: runModules.finalizeRunOutcome,
        fns,
      });
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
