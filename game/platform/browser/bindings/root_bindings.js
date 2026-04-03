import { closeTopEscapeSurface } from '../overlay_escape_stack.js';
import { initRootEventHandlers } from './root_binding_events.js';
import { initRootHelpPauseUI } from './root_binding_help_pause.js';
import { isEscapeKey, isVisibleModal } from './root_binding_helpers.js';
import {
  loadRootVolumes,
  saveRootVolumes,
  syncRootVolumeUI,
} from './root_binding_settings.js';

function getBindingDoc(deps = {}) {
  if (deps.doc) return deps.doc;
  return typeof document !== 'undefined' ? document : null;
}

export const RootBindings = {
  boot(deps) {
    const doc = getBindingDoc(deps);
    this.loadVolumes(deps.audioEngine);
    deps.settingsUI?.applyOnBoot?.({
      doc,
      ScreenShake: deps.ScreenShake,
      HitStop: deps.HitStop,
      ParticleSystem: deps.ParticleSystem,
    });
    this.syncVolumeUI(deps.audioEngine, { doc });
    this.initEventHandlers(deps);
    this.initHelpPauseUI(deps);
    const gameBootDeps = deps.getGameBootDeps();
    deps.gameBootUI?.bootGame?.(gameBootDeps);
    deps.gameBootUI?.refreshTitleSaveState?.(gameBootDeps);
  },

  loadVolumes(audioEngine) {
    loadRootVolumes(audioEngine);
  },

  saveVolumes(audioEngine) {
    saveRootVolumes(audioEngine);
  },

  syncVolumeUI(audioEngine, deps = {}) {
    const doc = getBindingDoc(deps);
    syncRootVolumeUI(audioEngine, doc);
  },

  initEventHandlers(deps) {
    const doc = getBindingDoc(deps);
    initRootEventHandlers(deps, doc, { isEscapeKey, isVisibleModal });
  },

  initHelpPauseUI(deps) {
    const doc = getBindingDoc(deps);
    initRootHelpPauseUI(deps, doc, {
      closeTopEscapeSurface,
      isEscapeKey,
      isVisibleModal,
    });
  },
};
