import { getMapNodeVisualFallback } from '../../application/map_node_content_queries.js';
import {
  getLinkedChildren,
  MINIMAP_HOVER_THRESHOLD,
} from './map_ui_minimap_render_helpers.js';

export function drawMinimapScene(ctx, canvas, gs, nodeMeta, scene) {
  const w = canvas.width;
  const h = canvas.height;
  const mapNodes = gs.mapNodes;
  const currentFloor = gs.currentFloor;
  const currentNodeId = gs.currentNode?.id;
  const maxFloor = Math.max(...mapNodes.map((node) => node.floor));
  const floorH = (h - 20) / (maxFloor + 1);
  const nodeEntries = [];

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillRect(0, 0, w, h);

  mapNodes.forEach((node) => {
    if (!scene.visibleNodeIds.has(node.id)) return;
    const linkedChildren = getLinkedChildren(node, scene.nodesByFloor, scene.nodesById);
    if (!linkedChildren.length) return;
    const nx = w * (node.pos + 1) / (node.total + 1);
    const ny = h - 10 - floorH * node.floor;

    linkedChildren.forEach((child) => {
      if (!scene.visibleNodeIds.has(child.id)) return;
      const cx2 = w * (child.pos + 1) / (child.total + 1);
      const cy2 = h - 10 - floorH * child.floor;
      if (!(node.visited && child.visited)) return;
      ctx.beginPath();
      ctx.moveTo(nx, ny);
      ctx.lineTo(cx2, cy2);
      ctx.strokeStyle = 'rgba(123, 47, 255, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([]);
      ctx.stroke();
    });
  });

  mapNodes.forEach((node) => {
    if (!scene.visibleNodeIds.has(node.id)) return;
    const nx = w * (node.pos + 1) / (node.total + 1);
    const ny = h - 10 - floorH * node.floor;
    const r = node.type === 'boss' ? 8 : (node.type === 'mini_boss' ? 7 : 5);
    const isCurrent = currentNodeId === node.id;
    nodeEntries.push({ node, x: nx, y: ny });

    const nodeMetaInfo = nodeMeta[node.type] || { icon: '?' };
    if (isCurrent) {
      ctx.beginPath();
      ctx.arc(nx, ny, r + 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fill();
      ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
      ctx.shadowBlur = 12;
      ctx.fillStyle = '#fff';
    } else if (node.accessible && !node.visited && node.floor === currentFloor + 1) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.shadowBlur = 0;
    } else if (node.visited) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.shadowBlur = 0;
    } else {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.shadowBlur = 0;
    }

    ctx.font = `bold ${r * 1.5}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(nodeMetaInfo.icon || getMapNodeVisualFallback(node.type)?.icon || '?', nx, ny);
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
    ctx.globalAlpha = 1;

    if (isCurrent) {
      ctx.beginPath();
      ctx.arc(nx, ny, r + 1, 0, Math.PI * 2);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  });

  return {
    entries: nodeEntries,
    threshold: MINIMAP_HOVER_THRESHOLD,
  };
}
