function getRequestAnimationFrame(host, deps = {}) {
  return deps.requestAnimationFrame || host?.requestAnimationFrame || null;
}

function getSetTimeout(host, deps = {}) {
  return deps.setTimeoutFn || host?.setTimeoutFn || setTimeout;
}

export function createMazeRuntime(deps = {}) {
  const dom = deps.mazeDom;
  const host = deps.mazeHost || null;
  const state = {
    canvas: null,
    ctx: null,
    minimap: null,
    mmCtx: null,
    W: 0,
    H: 0,
    map: null,
    px: 0,
    py: 0,
    stepCount: 0,
    pendingCombat: false,
    fovActive: false,
    shakeX: 0,
    shakeY: 0,
    shakeFrm: 0,
    tileSize: 40,
  };
  const presenter = typeof deps.createMazePresenter === 'function'
    ? deps.createMazePresenter({ dom, state, deps })
    : null;

  function initCanvas() {
    if (!dom?.getCanvas || !dom?.getMinimap) return false;
    state.canvas = dom.getCanvas();
    state.minimap = dom.getMinimap();
    if (!state.canvas || !state.minimap) return false;
    state.ctx = state.canvas.getContext('2d');
    state.mmCtx = state.minimap.getContext('2d');
    return true;
  }

  function shakeAnim() {
    state.shakeFrm = 6;
    const raf = getRequestAnimationFrame(host, deps);
    const loop = () => {
      if (state.shakeFrm-- <= 0) {
        state.shakeX = 0;
        state.shakeY = 0;
        presenter?.draw?.();
        return;
      }
      state.shakeX = (Math.random() - 0.5) * 8;
      state.shakeY = (Math.random() - 0.5) * 8;
      presenter?.draw?.();
      raf?.(loop);
    };
    raf?.(loop);
  }

  function close() {
    state.fovActive = false;
    host?.removeWindowListener?.('resize', presenter.resize);
    dom.hideOverlay();
    dom.removeGuide();
  }

  function onExit() {
    close();
    deps.handleMazeExit?.({
      pendingCombat: state.pendingCombat,
      showWorldMemoryNotice: deps.showWorldMemoryNotice,
      startCombat: deps.startCombat,
      setTimeoutFn: getSetTimeout(host, deps),
    });
  }

  return {
    init() {
      initCanvas();
    },

    open(isBoss) {
      if (!initCanvas()) return;

      const nextState = deps.prepareMazeOpenState?.(deps.fovEngine || null, isBoss);
      if (!nextState) return;

      state.pendingCombat = nextState.pendingCombat;
      state.stepCount = nextState.stepCount;
      state.W = nextState.W;
      state.H = nextState.H;
      state.map = nextState.map;
      state.px = nextState.px;
      state.py = nextState.py;
      state.fovActive = nextState.fovActive;

      presenter?.resize?.();
      host?.addWindowListener?.('resize', presenter.resize);
      dom.showOverlay();
      presenter?.updateHud?.();
      presenter?.draw?.();
    },

    close,

    move(dx, dy) {
      const result = deps.resolveMazeMove?.({
        dx,
        dy,
        px: state.px,
        py: state.py,
        map: state.map,
        stepCount: state.stepCount,
        W: state.W,
        H: state.H,
      });
      if (!result.moved) {
        shakeAnim();
        return false;
      }

      state.px = result.px;
      state.py = result.py;
      state.stepCount = result.stepCount;
      presenter?.updateHud?.();
      presenter?.draw?.();

      if (result.shouldExit) {
        onExit();
        return true;
      }

      return true;
    },
  };
}
