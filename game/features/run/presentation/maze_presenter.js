import {
  drawMazeFrame,
  resizeMazeCanvas,
  updateMazeHud,
} from './browser/maze_system_render_ui.js';

export function createMazePresenter({ dom, state, deps = {} }) {
  function getRequestAnimationFrame() {
    return deps.requestAnimationFrame || dom.getWin()?.requestAnimationFrame?.bind?.(dom.getWin()) || null;
  }

  function draw() {
    drawMazeFrame({
      canvas: state.canvas,
      ctx: state.ctx,
      minimap: state.minimap,
      mmCtx: state.mmCtx,
      map: state.map,
      W: state.W,
      H: state.H,
      px: state.px,
      py: state.py,
      shakeX: state.shakeX,
      shakeY: state.shakeY,
      tileSize: state.tileSize,
      fovActive: state.fovActive,
      fovEngine: deps.fovEngine || null,
      now: Date.now(),
      requestAnimationFrame: getRequestAnimationFrame(),
      redraw: draw,
    });
  }

  function resize() {
    resizeMazeCanvas(state.canvas, draw);
  }

  function updateHud() {
    updateMazeHud(dom.getDoc(), deps.gs, state.stepCount);
  }

  return {
    draw,
    resize,
    updateHud,
  };
}
