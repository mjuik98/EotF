export function createRunCanvasActions(modules, fns, ports) {
  return {
    initTitleCanvas() {
      modules.TitleCanvasUI?.init?.({ doc: ports.doc });
    },

    resizeTitleCanvas() {
      modules.TitleCanvasUI?.resize?.({ doc: ports.doc });
    },

    animateTitle() {
      modules.TitleCanvasUI?.animate?.({ doc: ports.doc });
    },

    initGameCanvas() {
      const refs = modules.GameCanvasSetupUI?.init?.(ports.getCanvasDeps());
      if (refs) modules._canvasRefs = refs;
    },

    resizeGameCanvas() {
      modules.GameCanvasSetupUI?.resize?.();
      modules._canvasRefs = modules.GameCanvasSetupUI?.getRefs?.() || modules._canvasRefs;
    },

    gameLoop(timestamp) {
      const deps = ports.getCanvasDeps({
        gameLoop: fns.gameLoop,
        particleSystem: modules.ParticleSystem,
        refs: {
          gameCanvas: modules._canvasRefs?.gameCanvas,
          gameCtx: modules._canvasRefs?.gameCtx,
        },
        renderMinimap: fns.renderMinimap,
        renderNodeInfo: fns.renderNodeInfo,
        requestAnimationFrame: ports.requestAnimationFrame,
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
      modules.WorldRenderLoopUI?.renderRegionBackground?.(ctx, w, h, ports.getCanvasDeps());
    },

    renderDynamicLights(ctx, w, h) {
      modules.WorldRenderLoopUI?.renderDynamicLights?.(ctx, w, h, ports.getCanvasDeps());
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

    generateMap(regionIdx) {
      const deps = ports.getCanvasDeps({
        showWorldMemoryNotice: fns.showWorldMemoryNotice,
        updateNextNodes: fns.updateNextNodes,
        updateUI: fns.updateUI,
      });
      modules.MapGenerationUI?.generateMap?.(regionIdx, deps);
    },

    renderMinimap() {
      const deps = ports.getCanvasDeps({
        getFloorStatusText: fns.getFloorStatusText,
        minimapCanvas: modules._canvasRefs?.minimapCanvas,
        minimapCtx: modules._canvasRefs?.minimapCtx,
        moveToNode: fns.moveToNode,
        moveToNodeHandlerName: 'moveToNode',
        nodeMeta: modules.NODE_META,
      });
      modules.MapUI?.renderMinimap?.(deps);
    },

    updateNextNodes() {
      const deps = ports.getCanvasDeps({
        closeDeckView: fns.closeDeckView,
        getFloorStatusText: fns.getFloorStatusText,
        minimapCanvas: modules._canvasRefs?.minimapCanvas,
        minimapCtx: modules._canvasRefs?.minimapCtx,
        moveToNode: fns.moveToNode,
        moveToNodeHandlerName: 'moveToNode',
        nodeMeta: modules.NODE_META,
        showDeckView: fns.showDeckView,
        showFullMap: fns.showFullMap,
      });
      modules.MapUI?.updateNextNodes?.(deps);
    },

    showFullMap() {
      const deps = ports.getCanvasDeps({
        getFloorStatusText: fns.getFloorStatusText,
        minimapCanvas: modules._canvasRefs?.minimapCanvas,
        minimapCtx: modules._canvasRefs?.minimapCtx,
        moveToNode: fns.moveToNode,
        moveToNodeHandlerName: 'moveToNode',
        nodeMeta: modules.NODE_META,
      });
      modules.MapUI?.showFullMap?.(deps);
    },

    moveToNode(node) {
      const deps = ports.getCanvasDeps({
        renderMinimap: fns.renderMinimap,
        showRestSite: fns.showRestSite,
        showShop: fns.showShop,
        startCombat: fns.startCombat,
        triggerRandomEvent: fns.triggerRandomEvent,
        updateNextNodes: fns.updateNextNodes,
        updateUI: fns.updateUI,
      });
      modules.MapNavigationUI?.moveToNode?.(node, deps);
    },
  };
}
