import {
  findClosestNodeEntry,
  MINIMAP_HOVER_THRESHOLD,
  toCanvasCoords,
  updateMinimapHint,
} from './map_ui_minimap_render_helpers.js';

export function bindMinimapHover(canvas) {
  if (!canvas || canvas._minimapHoverPatched) return;
  canvas._minimapHoverPatched = true;

  canvas.addEventListener('mousemove', (event) => {
    const hoverData = canvas._minimapHoverData;
    if (!hoverData?.entries?.length) {
      canvas.style.cursor = 'default';
      updateMinimapHint(canvas, null, canvas._minimapNodeMeta || {});
      return;
    }

    const point = toCanvasCoords(canvas, event);
    if (!point) {
      canvas.style.cursor = 'default';
      updateMinimapHint(canvas, null, canvas._minimapNodeMeta || {});
      return;
    }

    const closest = findClosestNodeEntry(
      hoverData.entries,
      point.x,
      point.y,
      hoverData.threshold || MINIMAP_HOVER_THRESHOLD,
    );
    const nodeMeta = canvas._minimapNodeMeta || {};
    if (closest?.node) {
      canvas.style.cursor = 'pointer';
      updateMinimapHint(canvas, closest.node, nodeMeta);
      return;
    }

    canvas.style.cursor = 'default';
    updateMinimapHint(canvas, null, nodeMeta);
  });

  canvas.addEventListener('mouseleave', () => {
    canvas.style.cursor = 'default';
    updateMinimapHint(canvas, null, canvas._minimapNodeMeta || {});
  });
}
