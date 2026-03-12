import { createTitleCanvasRuntime } from '../../../../ui/title/title_canvas_runtime.js';

let _runtime = null;

function _getDoc(deps) {
  return deps?.doc || document;
}

export const TitleCanvasUI = {
  init(deps = {}) {
    const doc = _getDoc(deps);
    const canvas = doc.getElementById('titleCanvas');
    if (!canvas) return;
    const runtimeDeps = { doc };
    const win = deps?.win || doc?.defaultView || null;
    if (win) runtimeDeps.win = win;
    _runtime = createTitleCanvasRuntime(runtimeDeps);
    _runtime.init(canvas);
  },

  resize() {
    _runtime?.resize?.();
  },

  animate() {
    _runtime?.animate?.();
  },

  stop() {
    _runtime?.stop?.();
  },
};
