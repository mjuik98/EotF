import { GS } from '../../core/game_state.js';
import {
  drawMazeFrame,
  resizeMazeCanvas,
  updateMazeHud,
} from './maze_system_render_ui.js';
import {
  handleMazeExit,
  prepareMazeOpenState,
  resolveMazeMove,
} from './maze_system_runtime_ui.js';


let _deps = {};

let canvas;
let ctx;
let minimap;
let mmCtx;
let W;
let H;
let map;
let px;
let py;
let stepCount = 0;
let pendingCombat = false;
let fovActive = false;
let shakeX = 0;
let shakeY = 0;
let shakeFrm = 0;

const TILE = 40;

function _doc() {
  return _deps.doc || document;
}

function _win() {
  return _deps.win || window;
}

function _fov() {
  return _deps.fovEngine || window.FovEngine;
}

function _gs() {
  return _deps.gs;
}

function _init() {
  const doc = _doc();
  canvas = doc.getElementById('mazeCanvas');
  minimap = doc.getElementById('mazeMinimap');
  if (!canvas || !minimap) return false;
  ctx = canvas.getContext('2d');
  mmCtx = minimap.getContext('2d');
  return true;
}

function _resizeCanvas() {
  resizeMazeCanvas(canvas, _draw);
}

function _updateHUD() {
  updateMazeHud(_doc(), _gs(), stepCount);
}

function _draw() {
  drawMazeFrame({
    canvas,
    ctx,
    minimap,
    mmCtx,
    map,
    W,
    H,
    px,
    py,
    shakeX,
    shakeY,
    tileSize: TILE,
    fovActive,
    fovEngine: _fov(),
    now: Date.now(),
    requestAnimationFrame: _win().requestAnimationFrame.bind(_win()),
    redraw: _draw,
  });
}

function _shakeAnim() {
  shakeFrm = 6;
  const loop = () => {
    if (shakeFrm-- <= 0) {
      shakeX = 0;
      shakeY = 0;
      _draw();
      return;
    }
    shakeX = (Math.random() - 0.5) * 8;
    shakeY = (Math.random() - 0.5) * 8;
    _draw();
    _win().requestAnimationFrame(loop);
  };
  _win().requestAnimationFrame(loop);
}

function _onExit() {
  MazeSystem.close();
  handleMazeExit({
    pendingCombat,
    showWorldMemoryNotice: _deps.showWorldMemoryNotice,
    startCombat: _deps.startCombat,
    setTimeoutFn: _win().setTimeout?.bind(_win()) || setTimeout,
  });
}

export const MazeSystem = {
  configure(nextDeps = {}) {
    _deps = { ..._deps, ...nextDeps };
  },

  init() {
    _init();
  },

  open(isBoss) {
    if (!_init()) return;

    const fovEngine = _fov();
    const nextState = prepareMazeOpenState(fovEngine, isBoss);
    if (!nextState) return;
    pendingCombat = nextState.pendingCombat;
    stepCount = nextState.stepCount;
    W = nextState.W;
    H = nextState.H;
    map = nextState.map;
    px = nextState.px;
    py = nextState.py;
    fovActive = nextState.fovActive;

    _resizeCanvas();
    _win().addEventListener('resize', _resizeCanvas);

    const overlay = _doc().getElementById('mazeOverlay');
    if (overlay) overlay.style.display = 'flex';
    _updateHUD();
    _draw();
  },

  close() {
    fovActive = false;
    _win().removeEventListener('resize', _resizeCanvas);
    const doc = _doc();
    const overlay = doc.getElementById('mazeOverlay');
    if (overlay) overlay.style.display = 'none';
    doc.getElementById('mazeGuide')?.remove();
  },

  move(dx, dy) {
    const result = resolveMazeMove({
      dx,
      dy,
      px,
      py,
      map,
      stepCount,
      W,
      H,
    });
    if (!result.moved) {
      _shakeAnim();
      return false;
    }

    px = result.px;
    py = result.py;
    stepCount = result.stepCount;
    _updateHUD();
    _draw();

    if (result.shouldExit) {
      _onExit();
      return true;
    }
    return true;
  },
};
