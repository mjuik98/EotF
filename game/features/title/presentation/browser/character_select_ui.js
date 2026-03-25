import {
  createCharacterSelectRuntime,
} from '../../application/create_character_select_runtime.js';
import { createCharacterSelectRuntimeBindings } from '../../platform/browser/create_character_select_runtime_bindings.js';
import { ensureCharacterSelectUiStyle } from './character_select_ui_style.js';

const runtimeBindings = createCharacterSelectRuntimeBindings();
const CHARS = runtimeBindings.chars;

export const CharacterSelectUI = {
  CHARS,
  _runtime: null,

  onEnter() {
    this._runtime?.onEnter?.();
  },

  resetSelectionState() {
    this._runtime?.resetSelectionState?.();
  },

  showPendingSummaries() {
    this._runtime?.showPendingSummaries?.();
  },

  getSelectionSnapshot() {
    return this._runtime?.getSelectionSnapshot?.() || null;
  },

  mount(deps = {}) {
    const owner = this;
    ensureCharacterSelectUiStyle(deps?.doc);
    owner._runtime = createCharacterSelectRuntime(deps, runtimeBindings);

    return {
      destroy() {
        const runtime = owner._runtime;
        owner._runtime = null;
        runtime?.destroy?.();
      },
    };
  },
};
