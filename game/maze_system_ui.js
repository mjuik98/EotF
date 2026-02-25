'use strict';

import { FovEngine } from '../engine/fov.js';
import { GS } from './game_state.js';



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
    return _deps.win || globalObj;
  }

  function _fov() {
    return _deps.fovEngine || FovEngine;
  }

  function _gs() {
    return _deps.gs || GS;
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
    if (!canvas) return;
    canvas.width = canvas.offsetWidth || canvas.clientWidth || 800;
    canvas.height = canvas.offsetHeight || canvas.clientHeight || 500;
    _draw();
  }

  function _updateHUD() {
    const doc = _doc();
    const sc = doc.getElementById('mazeStepCount');
    if (sc) sc.textContent = `이동: ${stepCount}`;
    const hp = doc.getElementById('mazeHp');
    const echo = doc.getElementById('mazeEcho');
    const gs = _gs();
    if (!gs?.player) return;
    if (hp) hp.textContent = `${gs.player.hp}/${gs.player.maxHp}`;
    if (echo) echo.textContent = Math.floor(gs.player.echo);
  }

  function _drawMinimap() {
    if (!mmCtx || !minimap || !W || !H) return;
    const mW = minimap.width;
    const mH = minimap.height;
    const tS = Math.min(mW / W, mH / H);
    mmCtx.fillStyle = '#020210';
    mmCtx.fillRect(0, 0, mW, mH);
    const offX = (mW - W * tS) / 2;
    const offY = (mH - H * tS) / 2;
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
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

  function _draw() {
    if (!ctx || !canvas || !map) return;
    const cW = canvas.width;
    const cH = canvas.height;
    const tW = TILE;
    const tH = TILE;
    const offX = Math.round(cW / 2 - (px + 0.5) * tW) + shakeX;
    const offY = Math.round(cH / 2 - (py + 0.5) * tH) + shakeY;

    ctx.fillStyle = '#020210';
    ctx.fillRect(0, 0, cW, cH);

    const fovEngine = _fov();
    fovEngine?.computeFov?.(px, py, 6);
    const revealed = fovEngine?.getRevealed ? fovEngine.getRevealed() : null;
    const visible = fovEngine?.getVisible ? fovEngine.getVisible() : null;

    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const tx = offX + x * tW;
        const ty = offY + y * tH;
        if (tx + tW < 0 || tx > cW || ty + tH < 0 || ty > cH) continue;

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
          ctx.fillRect(tx, ty, tW, tH);
          if (isVis) {
            ctx.strokeStyle = 'rgba(80,40,180,0.5)';
            ctx.lineWidth = 1;
            ctx.strokeRect(tx + 0.5, ty + 0.5, tW - 1, tH - 1);
            ctx.fillStyle = 'rgba(60,30,120,0.3)';
            ctx.fillRect(tx + 2, ty + 2, tW / 2 - 3, tH / 2 - 3);
            ctx.fillRect(tx + tW / 2 + 1, ty + tH / 2 + 1, tW / 2 - 3, tH / 2 - 3);
          }
        } else {
          ctx.fillStyle = isExit ? '#0a1a1a' : '#080520';
          ctx.fillRect(tx, ty, tW, tH);
          if (isVis) {
            ctx.strokeStyle = isExit ? 'rgba(0,255,204,0.15)' : 'rgba(60,40,120,0.2)';
            ctx.lineWidth = 0.5;
            ctx.strokeRect(tx + 0.5, ty + 0.5, tW - 1, tH - 1);
          }
          if (isExit && isVis) {
            const pulse = 0.3 + 0.2 * Math.sin(Date.now() * 0.003);
            const g = ctx.createRadialGradient(tx + tW / 2, ty + tH / 2, 0, tx + tW / 2, ty + tH / 2, tW * 0.8);
            g.addColorStop(0, `rgba(0,255,204,${pulse})`);
            g.addColorStop(1, 'transparent');
            ctx.fillStyle = g;
            ctx.fillRect(tx - 2, ty - 2, tW + 4, tH + 4);
          }
        }
        ctx.restore();
      }
    }

    const exitTX = offX + (W - 2) * tW;
    const exitTY = offY + (H - 2) * tH;
    if (exitTX > -tW && exitTX < cW) {
      ctx.save();
      ctx.font = `${tW * 0.7}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.globalAlpha = 0.5 + 0.5 * Math.sin(Date.now() * 0.003);
      ctx.fillText('🚪', exitTX + tW, exitTY + tH);
      ctx.restore();
    }

    const playerX = offX + px * tW + tW / 2;
    const playerY = offY + py * tH + tH / 2;
    ctx.save();
    const glowR = tW * 1.2;
    const glow = ctx.createRadialGradient(playerX, playerY, 0, playerX, playerY, glowR);
    glow.addColorStop(0, 'rgba(0,255,204,0.18)');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(playerX, playerY, glowR, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = `${tW * 0.65}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,255,204,0.9)';
    ctx.shadowBlur = 16;
    ctx.fillText('🧙', playerX, playerY);
    ctx.restore();

    _drawMinimap();
    _win().requestAnimationFrame(() => {
      if (fovActive) _draw();
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
    if (typeof _deps.showWorldMemoryNotice === 'function') {
      _deps.showWorldMemoryNotice('🚪 출구 발견! 전투가 시작된다...');
    }
    setTimeout(() => {
      if (typeof _deps.startCombat === 'function') {
        _deps.startCombat(pendingCombat === 'boss');
      }
    }, 800);
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
      pendingCombat = isBoss ? 'boss' : 'combat';
      stepCount = 0;

      const fovEngine = _fov();
      fovEngine?.generateMaze?.(21, 13);
      const size = fovEngine?.getSize?.();
      if (!size) return;
      W = size.W;
      H = size.H;
      map = fovEngine.getMap();
      px = 1;
      py = 1;
      fovActive = true;

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
      const nx = px + dx;
      const ny = py + dy;
      if (!map?.[ny] || map[ny][nx] !== 0) {
        _shakeAnim();
        return false;
      }

      px = nx;
      py = ny;
      stepCount++;
      _updateHUD();
      _draw();

      if (px >= W - 2 && py >= H - 2) {
        _onExit();
        return true;
      }
      return true;
    },
  };
