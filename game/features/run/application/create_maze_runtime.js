import { createMazeDomAdapter } from '../platform/browser/maze_dom_adapter.js';
import { createMazePresenter } from '../presentation/maze_presenter.js';
import {
  handleMazeExit,
  prepareMazeOpenState,
  resolveMazeMove,
} from '../../../ui/map/maze_system_runtime_ui.js';

function getRequestAnimationFrame(dom, deps = {}) {
  return deps.requestAnimationFrame || dom.getWin()?.requestAnimationFrame?.bind?.(dom.getWin()) || null;
}

function getSetTimeout(dom, deps = {}) {
  return deps.setTimeoutFn || dom.getWin()?.setTimeout?.bind?.(dom.getWin()) || setTimeout;
}

export function createMazeRuntime(deps = {}) {
  const dom = createMazeDomAdapter(deps);
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
  const presenter = createMazePresenter({ dom, state, deps });

  function initCanvas() {
    state.canvas = dom.getCanvas();
    state.minimap = dom.getMinimap();
    if (!state.canvas || !state.minimap) return false;
    state.ctx = state.canvas.getContext('2d');
    state.mmCtx = state.minimap.getContext('2d');
    return true;
  }

  function shakeAnim() {
    state.shakeFrm = 6;
    const raf = getRequestAnimationFrame(dom, deps);
    const loop = () => {
      if (state.shakeFrm-- <= 0) {
        state.shakeX = 0;
        state.shakeY = 0;
        presenter.draw();
        return;
      }
      state.shakeX = (Math.random() - 0.5) * 8;
      state.shakeY = (Math.random() - 0.5) * 8;
      presenter.draw();
      raf?.(loop);
    };
    raf?.(loop);
  }

  function close() {
    state.fovActive = false;
    dom.getWin()?.removeEventListener?.('resize', presenter.resize);
    dom.hideOverlay();
    dom.removeGuide();
  }

  function onExit() {
    close();
    handleMazeExit({
      pendingCombat: state.pendingCombat,
      showWorldMemoryNotice: deps.showWorldMemoryNotice,
      startCombat: deps.startCombat,
      setTimeoutFn: getSetTimeout(dom, deps),
    });
  }

  return {
    init() {
      initCanvas();
    },

    open(isBoss) {
      if (!initCanvas()) return;

      const nextState = prepareMazeOpenState(deps.fovEngine || null, isBoss);
      if (!nextState) return;

      state.pendingCombat = nextState.pendingCombat;
      state.stepCount = nextState.stepCount;
      state.W = nextState.W;
      state.H = nextState.H;
      state.map = nextState.map;
      state.px = nextState.px;
      state.py = nextState.py;
      state.fovActive = nextState.fovActive;

      presenter.resize();
      dom.getWin()?.addEventListener?.('resize', presenter.resize);
      dom.showOverlay();
      presenter.updateHud();
      presenter.draw();
    },

    close,

    move(dx, dy) {
      const result = resolveMazeMove({
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
      presenter.updateHud();
      presenter.draw();

      if (result.shouldExit) {
        onExit();
        return true;
      }

      return true;
    },
  };
}
