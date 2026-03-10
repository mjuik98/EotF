function getDoc(deps) {
  return deps?.doc || document;
}

function getWin(deps) {
  return deps?.win || globalThis.window || globalThis;
}

export function getGameCanvasRefs(state) {
  return {
    gameCanvas: state.gameCanvas,
    gameCtx: state.gameCtx,
    minimapCanvas: state.minimapCanvas,
    minimapCtx: state.minimapCtx,
    combatCanvas: state.combatCanvas,
  };
}

function patchMinimapClick(state, deps) {
  const win = getWin(deps);
  if (state.minimapCanvas && !state.minimapCanvas._mapOpenPatched) {
    state.minimapCanvas._mapOpenPatched = true;
    state.minimapCanvas.style.cursor = 'pointer';
    state.minimapCanvas.addEventListener('click', () => {
      if (typeof deps.showFullMap === 'function') {
        deps.showFullMap();
      } else if (typeof win.showFullMap === 'function') {
        win.showFullMap();
      }
    });
  }
}

export function resizeGameCanvasRuntime(state, deps = {}) {
  if (!state.gameCanvas) return;
  const win = getWin(deps);
  const resizeObserverCtor = deps?.resizeObserverCtor
    || globalThis.ResizeObserver
    || win.ResizeObserver;

  const rect = state.gameCanvas.getBoundingClientRect();
  state.gameCanvas.width = Math.max(rect.width || state.gameCanvas.offsetWidth || 0, 600);
  state.gameCanvas.height = Math.max(rect.height || state.gameCanvas.offsetHeight || 0, 400);

  if (resizeObserverCtor && !state.gameCanvas._resizeObserver) {
    const ro = new resizeObserverCtor(() => {
      const nextRect = state.gameCanvas.getBoundingClientRect();
      if (nextRect.width > 0) {
        state.gameCanvas.width = nextRect.width;
        state.gameCanvas.height = nextRect.height;
      }
    });
    ro.observe(state.gameCanvas);
    state.gameCanvas._resizeObserver = ro;
  }

  if (state.minimapCanvas) {
    state.minimapCanvas.width = state.minimapCanvas.offsetWidth || 200;
    state.minimapCanvas.height = 160;
  }
}

export function initGameCanvasRuntime(state, ui, deps = {}) {
  const doc = getDoc(deps);
  const win = getWin(deps);

  state.gameCanvas = doc.getElementById('gameCanvas');
  if (!state.gameCanvas) return null;
  state.gameCtx = state.gameCanvas.getContext('2d');

  state.minimapCanvas = doc.getElementById('minimapCanvas');
  state.minimapCtx = state.minimapCanvas?.getContext('2d');
  patchMinimapClick(state, deps);

  state.combatCanvas = state.gameCanvas;
  deps.particleSystem?.init?.(state.gameCanvas);
  ui.resize(deps);

  if (!state.resizeBound) {
    win.addEventListener('resize', () => ui.resize(deps));
    state.resizeBound = true;
  }

  return ui.getRefs();
}
