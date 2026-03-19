export function createWorldRenderActions(context) {
  const { fns, modules, ports } = context;

  return {
    gameLoop(timestamp) {
      const deps = ports.getCanvasDeps({
        gameLoop: fns.gameLoop,
        getRegionData: modules.getRegionData,
        hitStop: modules.HitStop,
        particleSystem: modules.ParticleSystem,
        refs: {
          gameCanvas: modules._canvasRefs?.gameCanvas,
          gameCtx: modules._canvasRefs?.gameCtx,
        },
        renderMinimap: fns.renderMinimap,
        renderNodeInfo: fns.renderNodeInfo,
        requestAnimationFrame: ports.requestAnimationFrame,
        screenShake: modules.ScreenShake,
      });
      modules.WorldRenderLoopUI?.gameLoop?.(timestamp, deps);
    },

    renderGameWorld(dt, ctx, w, h) {
      const deps = ports.getCanvasDeps({
        refs: {
          gameCanvas: modules._canvasRefs?.gameCanvas,
          gameCtx: modules._canvasRefs?.gameCtx,
        },
        renderMinimap: fns.renderMinimap,
        renderNodeInfo: fns.renderNodeInfo,
      });
      modules.WorldRenderLoopUI?.renderGameWorld?.(dt, ctx, w, h, deps);
    },

    renderRegionBackground(ctx, w, h) {
      modules.WorldRenderLoopUI?.renderRegionBackground?.(ctx, w, h, ports.getCanvasDeps({
        getRegionData: modules.getRegionData,
      }));
    },

    renderDynamicLights(ctx, w, h) {
      modules.WorldRenderLoopUI?.renderDynamicLights?.(ctx, w, h, ports.getCanvasDeps({
        getRegionData: modules.getRegionData,
      }));
    },

    renderNodeInfo(ctx, w, h) {
      modules.WorldCanvasUI?.renderNodeInfo?.(ctx, w, h, ports.getWorldCanvasDeps());
    },

    getFloorStatusText(regionId, floor) {
      return modules.WorldCanvasUI?.getFloorStatusText?.(regionId, floor, ports.getWorldCanvasDeps()) || '';
    },

    wrapCanvasText(ctx, text, x, y, maxW, lineH) {
      return modules.WorldCanvasUI?.wrapCanvasText?.(ctx, text, x, y, maxW, lineH);
    },

    roundRect(ctx, x, y, w, h, r) {
      return modules.WorldCanvasUI?.roundRect?.(ctx, x, y, w, h, r);
    },

    roundRectTop(ctx, x, y, w, h, r) {
      return modules.WorldCanvasUI?.roundRectTop?.(ctx, x, y, w, h, r);
    },
  };
}
