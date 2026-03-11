export function resizeMazeCanvas(canvas, draw) {
  if (!canvas) return;
  canvas.width = canvas.offsetWidth || canvas.clientWidth || 800;
  canvas.height = canvas.offsetHeight || canvas.clientHeight || 500;
  draw?.();
}

export function updateMazeHud(doc, gs, stepCount) {
  const sc = doc?.getElementById?.('mazeStepCount');
  if (sc) sc.textContent = `이동: ${stepCount}`;
  const hp = doc?.getElementById?.('mazeHp');
  const echo = doc?.getElementById?.('mazeEcho');
  if (!gs?.player) return;
  if (hp) hp.textContent = `${gs.player.hp}/${gs.player.maxHp}`;
  if (echo) echo.textContent = Math.floor(gs.player.echo);
}

export function drawMazeMinimap({ mmCtx, minimap, map, W, H, px, py }) {
  if (!mmCtx || !minimap || !W || !H) return;
  const mW = minimap.width;
  const mH = minimap.height;
  const tS = Math.min(mW / W, mH / H);
  mmCtx.fillStyle = '#020210';
  mmCtx.fillRect(0, 0, mW, mH);
  const offX = (mW - W * tS) / 2;
  const offY = (mH - H * tS) / 2;
  for (let y = 0; y < H; y += 1) {
    for (let x = 0; x < W; x += 1) {
      if (x === px && y === py) mmCtx.fillStyle = 'rgba(0,255,204,1)';
      else if (x >= W - 2 && y >= H - 2) mmCtx.fillStyle = 'rgba(255,200,0,0.9)';
      else if (map[y][x] === 0) mmCtx.fillStyle = 'rgba(80,60,180,0.7)';
      else mmCtx.fillStyle = 'rgba(10,5,30,0.9)';
      mmCtx.fillRect(offX + x * tS, offY + y * tS, tS, tS);
    }
  }
  mmCtx.fillStyle = '#00ffcc';
  mmCtx.beginPath();
  mmCtx.arc(offX + (px + 0.5) * tS, offY + (py + 0.5) * tS, Math.max(1.5, tS * 0.6), 0, Math.PI * 2);
  mmCtx.fill();
}

export function drawMazeFrame({
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
  tileSize,
  fovActive,
  fovEngine,
  now,
  requestAnimationFrame,
  redraw,
}) {
  if (!ctx || !canvas || !map) return;
  const cW = canvas.width;
  const cH = canvas.height;
  const offX = Math.round(cW / 2 - (px + 0.5) * tileSize) + shakeX;
  const offY = Math.round(cH / 2 - (py + 0.5) * tileSize) + shakeY;

  ctx.fillStyle = '#020210';
  ctx.fillRect(0, 0, cW, cH);

  fovEngine?.computeFov?.(px, py, 6);
  const revealed = fovEngine?.getRevealed ? fovEngine.getRevealed() : null;
  const visible = fovEngine?.getVisible ? fovEngine.getVisible() : null;

  for (let y = 0; y < H; y += 1) {
    for (let x = 0; x < W; x += 1) {
      const tx = offX + x * tileSize;
      const ty = offY + y * tileSize;
      if (tx + tileSize < 0 || tx > cW || ty + tileSize < 0 || ty > cH) continue;

      const key = `${x},${y}`;
      const isVis = !visible || visible.has(key);
      const isRev = !revealed || revealed.has(key);
      if (!isRev && !isVis) continue;

      const alpha = isVis ? 1 : 0.3;
      const isWall = map[y][x] === 1;
      const isExit = x >= W - 2 && y >= H - 2;

      ctx.save();
      ctx.globalAlpha = alpha;
      if (isWall) {
        ctx.fillStyle = '#0d0830';
        ctx.fillRect(tx, ty, tileSize, tileSize);
        if (isVis) {
          ctx.strokeStyle = 'rgba(80,40,180,0.5)';
          ctx.lineWidth = 1;
          ctx.strokeRect(tx + 0.5, ty + 0.5, tileSize - 1, tileSize - 1);
          ctx.fillStyle = 'rgba(60,30,120,0.3)';
          ctx.fillRect(tx + 2, ty + 2, tileSize / 2 - 3, tileSize / 2 - 3);
          ctx.fillRect(tx + tileSize / 2 + 1, ty + tileSize / 2 + 1, tileSize / 2 - 3, tileSize / 2 - 3);
        }
      } else {
        ctx.fillStyle = isExit ? '#0a1a1a' : '#080520';
        ctx.fillRect(tx, ty, tileSize, tileSize);
        if (isVis) {
          ctx.strokeStyle = isExit ? 'rgba(0,255,204,0.15)' : 'rgba(60,40,120,0.2)';
          ctx.lineWidth = 0.5;
          ctx.strokeRect(tx + 0.5, ty + 0.5, tileSize - 1, tileSize - 1);
        }
        if (isExit && isVis) {
          const pulse = 0.3 + 0.2 * Math.sin(now * 0.003);
          const gradient = ctx.createRadialGradient(tx + tileSize / 2, ty + tileSize / 2, 0, tx + tileSize / 2, ty + tileSize / 2, tileSize * 0.8);
          gradient.addColorStop(0, `rgba(0,255,204,${pulse})`);
          gradient.addColorStop(1, 'transparent');
          ctx.fillStyle = gradient;
          ctx.fillRect(tx - 2, ty - 2, tileSize + 4, tileSize + 4);
        }
      }
      ctx.restore();
    }
  }

  const exitTX = offX + (W - 2) * tileSize;
  const exitTY = offY + (H - 2) * tileSize;
  if (exitTX > -tileSize && exitTX < cW) {
    ctx.save();
    ctx.font = `${tileSize * 0.7}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.globalAlpha = 0.5 + 0.5 * Math.sin(now * 0.003);
    ctx.fillText('🚪', exitTX + tileSize, exitTY + tileSize);
    ctx.restore();
  }

  const playerX = offX + px * tileSize + tileSize / 2;
  const playerY = offY + py * tileSize + tileSize / 2;
  ctx.save();
  const glowR = tileSize * 1.2;
  const glow = ctx.createRadialGradient(playerX, playerY, 0, playerX, playerY, glowR);
  glow.addColorStop(0, 'rgba(0,255,204,0.18)');
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(playerX, playerY, glowR, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = `${tileSize * 0.65}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,255,204,0.9)';
  ctx.shadowBlur = 16;
  ctx.fillText('🧙', playerX, playerY);
  ctx.restore();

  drawMazeMinimap({ mmCtx, minimap, map, W, H, px, py });
  requestAnimationFrame?.(() => {
    if (fovActive) redraw?.();
  });
}
