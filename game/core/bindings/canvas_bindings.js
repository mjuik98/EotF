/**
 * canvas_bindings.js — Canvas + Game Loop + Map 래퍼 함수
 *
 * 책임: 캔버스 초기화, 게임 루프 렌더링, 맵 네비게이션 래퍼
 */
import * as Deps from '../deps_factory.js';

export function createCanvasBindings(M, fns) {
    const requestAnimationFrameFn = window.requestAnimationFrame.bind(window);

    // ═══ Canvas ═══
    fns.initTitleCanvas = () => M.TitleCanvasUI?.init?.({ doc: document });
    fns.resizeTitleCanvas = () => M.TitleCanvasUI?.resize?.({ doc: document });
    fns.animateTitle = () => M.TitleCanvasUI?.animate?.({ doc: document });

    fns.initGameCanvas = () => {
        const refs = M.GameCanvasSetupUI?.init?.(M.GAME.getDeps());
        if (refs) {
            M._canvasRefs = refs;
        }
    };
    fns.resizeGameCanvas = () => {
        M.GameCanvasSetupUI?.resize?.();
        M._canvasRefs = M.GameCanvasSetupUI?.getRefs?.() || M._canvasRefs;
    };

    // ═══ Game Loop ═══
    fns.gameLoop = (timestamp) => {
        const deps = M.GAME.getDeps();
        deps.refs = { gameCanvas: M._canvasRefs?.gameCanvas, gameCtx: M._canvasRefs?.gameCtx };
        deps.requestAnimationFrame = requestAnimationFrameFn;
        deps.gameLoop = fns.gameLoop;
        deps.renderMinimap = fns.renderMinimap;
        deps.renderNodeInfo = fns.renderNodeInfo;
        deps.particleSystem = M.ParticleSystem;
        M.WorldRenderLoopUI?.gameLoop?.(timestamp, deps);
    };
    fns.renderGameWorld = (dt, ctx, w, h) => {
        const deps = M.GAME.getDeps();
        deps.refs = { gameCanvas: M._canvasRefs?.gameCanvas, gameCtx: M._canvasRefs?.gameCtx };
        deps.renderMinimap = fns.renderMinimap;
        deps.renderNodeInfo = fns.renderNodeInfo;
        M.WorldRenderLoopUI?.renderGameWorld?.(dt, ctx, w, h, deps);
    };
    fns.renderRegionBackground = (ctx, w, h) => M.WorldRenderLoopUI?.renderRegionBackground?.(ctx, w, h, M.GAME.getDeps());
    fns.renderDynamicLights = (ctx, w, h) => M.WorldRenderLoopUI?.renderDynamicLights?.(ctx, w, h, M.GAME.getDeps());
    fns.renderNodeInfo = (ctx, w, h) => M.WorldCanvasUI?.renderNodeInfo?.(ctx, w, h, Deps.getWorldCanvasDeps());
    fns.getFloorStatusText = (regionId, floor) => M.WorldCanvasUI?.getFloorStatusText?.(regionId, floor, Deps.getWorldCanvasDeps()) || '';
    fns.wrapCanvasText = (ctx, text, x, y, maxW, lineH) => M.WorldCanvasUI?.wrapCanvasText?.(ctx, text, x, y, maxW, lineH);
    fns.roundRect = (ctx, x, y, w, h, r) => M.WorldCanvasUI?.roundRect?.(ctx, x, y, w, h, r);
    fns.roundRectTop = (ctx, x, y, w, h, r) => M.WorldCanvasUI?.roundRectTop?.(ctx, x, y, w, h, r);

    // ═══ Map ═══
    fns.generateMap = (regionIdx) => {
        const deps = M.GAME.getDeps();
        deps.updateNextNodes = fns.updateNextNodes;
        deps.updateUI = fns.updateUI;
        deps.showWorldMemoryNotice = fns.showWorldMemoryNotice;
        M.MapGenerationUI?.generateMap?.(regionIdx, deps);
    };
    fns.renderMinimap = () => {
        const deps = M.GAME.getDeps();
        deps.minimapCanvas = M._canvasRefs?.minimapCanvas;
        deps.minimapCtx = M._canvasRefs?.minimapCtx;
        deps.nodeMeta = M.NODE_META;
        deps.getFloorStatusText = fns.getFloorStatusText;
        deps.moveToNodeHandlerName = 'moveToNode';
        M.MapUI?.renderMinimap?.(deps);
    };
    fns.updateNextNodes = () => {
        const deps = M.GAME.getDeps();
        deps.minimapCanvas = M._canvasRefs?.minimapCanvas;
        deps.minimapCtx = M._canvasRefs?.minimapCtx;
        deps.nodeMeta = M.NODE_META;
        deps.getFloorStatusText = fns.getFloorStatusText;
        deps.moveToNodeHandlerName = 'moveToNode';
        deps.showFullMap = fns.showFullMap;
        deps.showDeckView = fns.showDeckView;
        deps.closeDeckView = fns.closeDeckView;
        M.MapUI?.updateNextNodes?.(deps);
    };
    fns.showFullMap = () => {
        const deps = M.GAME.getDeps();
        deps.minimapCanvas = M._canvasRefs?.minimapCanvas;
        deps.minimapCtx = M._canvasRefs?.minimapCtx;
        deps.nodeMeta = M.NODE_META;
        deps.getFloorStatusText = fns.getFloorStatusText;
        deps.moveToNodeHandlerName = 'moveToNode';
        M.MapUI?.showFullMap?.(deps);
    };
    fns.moveToNode = (node) => {
        const deps = M.GAME.getDeps();
        deps.updateNextNodes = fns.updateNextNodes;
        deps.renderMinimap = fns.renderMinimap;
        deps.updateUI = fns.updateUI;
        deps.startCombat = fns.startCombat;
        deps.triggerRandomEvent = fns.triggerRandomEvent;
        deps.showShop = fns.showShop;
        deps.showRestSite = fns.showRestSite;
        M.MapNavigationUI?.moveToNode?.(node, deps);
    };
}
