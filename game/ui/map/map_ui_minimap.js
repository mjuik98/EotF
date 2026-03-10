import {
  bindMinimapHover,
  buildMinimapScene,
  drawMinimapScene,
  updateMinimapHint,
} from './map_ui_minimap_render.js';

function getDoc(deps) {
  return deps?.doc || document;
}

function resolveNodeMeta(deps = {}) {
  return deps.nodeMeta || (typeof NODE_META !== 'undefined' ? NODE_META : {});
}

export function renderMinimapUI(deps = {}) {
  const gs = deps.gs;
  const canvas = deps.minimapCanvas;
  const ctx = deps.minimapCtx;
  if (!gs || !canvas || !ctx || !gs.mapNodes?.length) {
    if (canvas?._minimapHintEl) {
      updateMinimapHint(canvas, null, canvas._minimapNodeMeta || {});
    }
    return;
  }

  const doc = getDoc(deps);
  const nodeMeta = resolveNodeMeta(deps);
  const minimapHint = deps.minimapNodeHint || doc.getElementById('minimapNodeHint');
  canvas._minimapHintEl = minimapHint || null;
  canvas._minimapNodeMeta = nodeMeta;
  bindMinimapHover(canvas);

  const scene = buildMinimapScene(gs);
  canvas._minimapHoverData = drawMinimapScene(ctx, canvas, gs, nodeMeta, scene);
}
