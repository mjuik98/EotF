import { getLinkedChildren } from './map_ui_full_map_render_helpers.js';

export function drawFullMapFrame({
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
  now = Date.now(),
  random = Math.random,
}) {
  ctx.clearRect(0, 0, cw, contentHeight);

  particles.forEach((particle) => {
    particle.y += particle.vy;
    particle.x += particle.vx;
    if (particle.y < 0) particle.y = contentHeight;
    if (particle.x < 0) particle.x = cw;
    if (particle.x > cw) particle.x = 0;
    ctx.fillStyle = `rgba(155, 79, 255, ${0.12 + random() * 0.05})`;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
    ctx.fill();
  });

  const mapNodes = gs.mapNodes;
  const currentFloor = gs.currentFloor;
  const currentNodeId = gs.currentNode?.id;
  const maxFloorNum = Math.max(...mapNodes.map((node) => node.floor));
  for (let floor = 0; floor <= maxFloorNum; floor += 1) {
    const fy = contentHeight - 65 - floorSpacing * floor;
    const isCurrentFloor = floor === currentFloor;
    ctx.strokeStyle = isCurrentFloor ? 'rgba(0, 255, 204, 0.2)' : 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padX - 25, fy);
    ctx.lineTo(cw - 25, fy);
    ctx.stroke();

    ctx.fillStyle = isCurrentFloor ? '#00ffcc' : 'rgba(255,255,255,0.25)';
    ctx.font = isCurrentFloor ? 'bold 16px "Share Tech Mono"' : '12px "Share Tech Mono"';
    ctx.textAlign = 'right';
    ctx.fillText(`${floor}F`, padX - 35, fy + 5);
  }

  mapNodes.forEach((node) => {
    if (!scene.visibleNodeIds.has(node.id)) return;
    const linkedChildren = getLinkedChildren(node, scene.nodesByFloor, scene.nodeMap);
    if (!linkedChildren.length) return;
    const entry = scene.nodeEntryById.get(node.id);
    if (!entry) return;
    linkedChildren.forEach((child) => {
      if (!scene.visibleNodeIds.has(child.id)) return;
      const childEntry = scene.nodeEntryById.get(child.id);
      if (!childEntry || !(node.visited && child.visited)) return;
      ctx.beginPath();
      ctx.moveTo(entry.x, entry.y);
      ctx.lineTo(childEntry.x, childEntry.y);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 8]);
      ctx.stroke();
      ctx.setLineDash([]);
    });
  });

  const pulseVal = Math.sin(now / 450) * 0.5 + 0.5;
  scene.nodeEntries.forEach((entry) => {
    const { node, x, y } = entry;
    const metaInfo = nodeMeta[node.type] || { color: '#666', icon: '?' };
    const isPlayerAt = currentNodeId === node.id;
    let radius = 16;
    if (node.type === 'boss') radius = 25;
    else if (node.type === 'mini_boss') radius = 22;
    else if (node.type === 'elite') radius = 20;

    if (isPlayerAt) {
      ctx.shadowColor = '#00ffcc';
      ctx.shadowBlur = 18 + pulseVal * 12;
      ctx.beginPath();
      ctx.arc(x, y, radius + 6 + pulseVal * 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 255, 204, 0.18)';
      ctx.fill();
    }

    ctx.save();
    if (node.visited && !isPlayerAt) {
      ctx.globalAlpha = 0.8;
      ctx.filter = 'grayscale(30%) brightness(0.9)';
    }

    const isTarget = node.accessible && !node.visited && node.floor === currentFloor + 1;
    ctx.fillStyle = isPlayerAt
      ? '#00ffcc'
      : (isTarget ? '#fff' : (node.visited ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.1)'));
    ctx.font = `bold ${radius * 1.6}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(metaInfo.icon || '?', x, y);

    if (node.floor > gs.currentFloor + 1) {
      ctx.fillStyle = `rgba(0, 0, 0, ${Math.min(0.75, (node.floor - currentFloor - 0.4) * 0.45)})`;
      ctx.beginPath();
      ctx.arc(x, y, radius + 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
    ctx.shadowBlur = 0;
  });

  if (glitchState.timer > 0) {
    gctx?.clearRect(0, 0, cw, ch);
    if (glitchCanvas) glitchCanvas.style.opacity = (glitchState.timer / 20).toString();
    for (let i = 0; i < 6; i += 1) {
      gctx.fillStyle = `rgba(155, 79, 255, ${0.2 + random() * 0.2})`;
      gctx.fillRect(random() * cw, random() * ch, random() * 120, random() * 4);
    }
    glitchState.timer -= 1;
  } else if (glitchCanvas) {
    glitchCanvas.style.opacity = '0';
  }
}
