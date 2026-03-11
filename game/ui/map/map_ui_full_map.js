import {
  FULL_MAP_HOVER_THRESHOLD,
  createFullMapLayout,
  createFullMapParticles,
  createFullMapScene,
  drawFullMapFrame,
  findClosestNodeEntry,
  updateFullMapTooltip,
} from './map_ui_full_map_render.js';

function getDoc(deps) {
  return deps?.doc || document;
}

function resolveNodeMeta(deps = {}) {
  return deps.nodeMeta || {};
}

function getWin(deps = {}) {
  return deps.win || { innerWidth: 1280, innerHeight: 720 };
}

function requestFrame(cb, deps = {}) {
  if (typeof deps.requestAnimationFrame === 'function') {
    return deps.requestAnimationFrame(cb);
  }
  return setTimeout(cb, 16);
}

function cancelFrame(handle, deps = {}) {
  if (typeof deps.cancelAnimationFrame === 'function') {
    deps.cancelAnimationFrame(handle);
    return;
  }
  clearTimeout(handle);
}

export function showFullMapOverlay(deps = {}) {
  const gs = deps.gs;
  const doc = getDoc(deps);
  const win = getWin(deps);
  if (!gs || !gs.mapNodes?.length) return;

  const existing = doc.getElementById('fullMapOverlay');
  if (existing) {
    if (typeof existing._closeFullMap === 'function') existing._closeFullMap();
    else existing.remove();
    return;
  }

  let overlay = null;
  let closed = false;
  let animFrame = null;
  let onOverlayKeyDown = null;

  const closeOverlay = () => {
    if (closed) return;
    closed = true;
    if (onOverlayKeyDown) {
      doc.removeEventListener('keydown', onOverlayKeyDown, true);
    }
    if (typeof animFrame === 'number') cancelFrame(animFrame, deps);
    overlay.remove();
  };

  onOverlayKeyDown = (event) => {
    if (event.key !== 'Escape') return;
    event.preventDefault();
    event.stopPropagation();
    if (typeof event.stopImmediatePropagation === 'function') {
      event.stopImmediatePropagation();
    }
    closeOverlay();
  };
  doc.addEventListener('keydown', onOverlayKeyDown, true);

  const getRegionData = deps.getRegionData;
  const regionData = typeof getRegionData === 'function' ? getRegionData(gs.currentRegion, gs) : { name: 'Region' };
  const viewportW = Number(win.innerWidth || 1280);
  const viewportH = Number(win.innerHeight || 720);
  const cw = Math.min(720, viewportW - 60);
  const ch = Math.min(600, viewportH - 200);
  const maxFloorNum = Math.max(...gs.mapNodes.map(n => n.floor));
  const floorSpacing = 110;
  const contentHeight = Math.max(ch, (maxFloorNum + 1) * floorSpacing + 80);
  let canvas = null;
  let canvasContainer = null;
  let glitchCanvas = null;
  let tooltip = null;
  let tooltipDesc = null;
  let tooltipStatus = null;
  let tooltipTitle = null;
  const layout = createFullMapLayout(doc, {
    ch,
    cw,
    nodeMeta: resolveNodeMeta(deps),
    onClose: closeOverlay,
    titleText: `${regionData.name} - ${gs.currentFloor || 0}F`,
  });
  ({
    canvas,
    canvasContainer,
    glitchCanvas,
    overlay,
    tooltip,
    tooltipDesc,
    tooltipStatus,
    tooltipTitle,
  } = layout);

  overlay._closeFullMap = closeOverlay;
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) closeOverlay();
  });

  canvas.height = contentHeight;
  const gctx = glitchCanvas.getContext('2d');
  const glitchState = { timer: 22 };
  const particles = createFullMapParticles(50, cw, contentHeight);

  const ctx = canvas.getContext('2d');
  const padX = 60;
  const nodeMeta = resolveNodeMeta(deps);
  const scene = createFullMapScene(gs, cw, contentHeight, padX);

  const draw = () => {
    if (closed) return;
    drawFullMapFrame({
      ch,
      contentHeight,
      ctx,
      cw,
      floorSpacing,
      gctx,
      glitchCanvas,
      glitchState,
      gs,
      nodeMeta,
      padX,
      particles,
      scene,
    });
    animFrame = requestFrame(draw, deps);
  };

  draw();

  canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    const mx = event.clientX - rect.left;
    const my = event.clientY - rect.top;
    const closest = findClosestNodeEntry(scene.nodeEntries, mx, my, FULL_MAP_HOVER_THRESHOLD + 5);
    updateFullMapTooltip({
      tooltip,
      tooltipDesc,
      tooltipStatus,
      tooltipTitle,
    }, closest?.node || null, event, nodeMeta);
    canvas.style.cursor = closest ? 'pointer' : 'default';
  });
  canvas.addEventListener('mouseleave', () => updateFullMapTooltip({
    tooltip,
    tooltipDesc,
    tooltipStatus,
    tooltipTitle,
  }, null, null, nodeMeta));

  doc.body.appendChild(overlay);
  const startY = scene.nodeY({ floor: gs.currentFloor });
  canvasContainer.scrollTop = startY - ch / 2;
}
