'use strict';

(function initWorldRenderLoopUI(globalObj) {
  let _lastTimestamp = 0;

  function _getGS(deps) {
    return deps?.gs || globalObj.GS;
  }

  function _getRefs(deps) {
    return deps?.refs || {};
  }

  function _getRegionDataFn(deps) {
    return deps?.getRegionData || globalObj.getRegionData;
  }

  function _requestNextFrame(deps) {
    const raf = deps?.requestAnimationFrame || globalObj.requestAnimationFrame?.bind(globalObj);
    const loopFn = deps?.gameLoop;
    if (typeof raf === 'function' && typeof loopFn === 'function') {
      raf(loopFn);
    }
  }

  const WorldRenderLoopUI = {
    gameLoop(timestamp, deps = {}) {
      const gs = _getGS(deps);
      const refs = _getRefs(deps);
      const gameCanvas = refs.gameCanvas;
      const gameCtx = refs.gameCtx;
      if (!gs || !gameCtx || !gameCanvas || gs.currentScreen !== 'game') {
        _requestNextFrame(deps);
        return;
      }

      const hitStop = deps.hitStop || globalObj.HitStop;
      if (hitStop?.active?.()) {
        hitStop.update?.();
        _requestNextFrame(deps);
        return;
      }

      const dt = Math.min((timestamp - _lastTimestamp) / 1000, 0.05);
      _lastTimestamp = timestamp;

      const screenShake = deps.screenShake || globalObj.ScreenShake;
      const particleSystem = deps.particleSystem || globalObj.ParticleSystem;

      screenShake?.update?.();
      gameCtx.save();
      gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
      screenShake?.apply?.(gameCtx);
      WorldRenderLoopUI.renderGameWorld(dt, gameCtx, gameCanvas.width, gameCanvas.height, deps);
      particleSystem?.update?.();
      gameCtx.restore();

      if (typeof deps.renderMinimap === 'function') deps.renderMinimap();
      _requestNextFrame(deps);
    },

    renderGameWorld(dt, ctx, w, h, deps = {}) {
      const gs = _getGS(deps);
      if (!ctx || !gs) return;

      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, '#03030a');
      bg.addColorStop(1, '#07071a');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      WorldRenderLoopUI.renderRegionBackground(ctx, w, h, deps);

      if (gs.combat?.active) {
        WorldRenderLoopUI.renderDynamicLights(ctx, w, h, deps);
      }

      if (gs.currentNode && typeof deps.renderNodeInfo === 'function') {
        deps.renderNodeInfo(ctx, w, h);
      }
    },

    renderRegionBackground(ctx, w, h, deps = {}) {
      const gs = _getGS(deps);
      const getRegionData = _getRegionDataFn(deps);
      if (!ctx || !gs || typeof getRegionData !== 'function') return;

      const region = getRegionData(gs.currentRegion, gs) || {};
      const accent = region.accent || '#7b2fff';

      ctx.save();
      ctx.strokeStyle = 'rgba(123,47,255,0.04)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      const glow = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.6);
      glow.addColorStop(0, `${accent}08`);
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    },

    renderDynamicLights(ctx, w, h, deps = {}) {
      const gs = _getGS(deps);
      const getRegionData = _getRegionDataFn(deps);
      if (!ctx || !gs || typeof getRegionData !== 'function') return;

      const t = Date.now() * 0.001;
      const enemies = gs.combat?.enemies || [];
      const region = getRegionData(gs.currentRegion, gs) || {};
      const accent = region.accent || '#7b2fff';
      enemies.forEach((enemy, index) => {
        if (enemy.hp <= 0) return;
        const ex = w / 2 + (index - (enemies.length / 2 - 0.5)) * 200;
        const ey = h * 0.35;
        const pulse = 0.5 + 0.5 * Math.sin(t + index * Math.PI);
        const glow = ctx.createRadialGradient(ex, ey, 0, ex, ey, 80 + pulse * 20);
        glow.addColorStop(0, `${accent}22`);
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(ex, ey, 80 + pulse * 20, 0, Math.PI * 2);
        ctx.fill();
      });

      const echoChain = gs.player?.echoChain || 0;
      if (echoChain > 0) {
        const pct = echoChain / 5;
        ctx.save();
        ctx.strokeStyle = `rgba(0,255,204,${pct * 0.3})`;
        ctx.lineWidth = 2 + pct * 4;
        ctx.strokeRect(2, 2, w - 4, h - 4);
        ctx.restore();
      }
    },
  };

  globalObj.WorldRenderLoopUI = WorldRenderLoopUI;
})(window);
