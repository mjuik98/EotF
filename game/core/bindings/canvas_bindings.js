/**
 * canvas_bindings.js — Canvas + Game Loop + Map 래퍼 함수
 *
 * 책임: 캔버스 초기화, 게임 루프 렌더링, 맵 네비게이션 래퍼
 */
import * as Deps from '../deps_factory.js';

function getCanvasDeps(game, extra = {}) {
    const deps = game.getCanvasDeps?.() || {};
    return { ...deps, ...extra };
}

export function createCanvasBindings(M, fns) {
    const requestAnimationFrameFn = window.requestAnimationFrame.bind(window);

    // ═══ Canvas ═══
    fns.initTitleCanvas = () => M.TitleCanvasUI?.init?.({ doc: document });
    fns.resizeTitleCanvas = () => M.TitleCanvasUI?.resize?.({ doc: document });
    fns.animateTitle = () => M.TitleCanvasUI?.animate?.({ doc: document });

    fns.initGameCanvas = () => {
        const refs = M.GameCanvasSetupUI?.init?.(getCanvasDeps(M.GAME));
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
        const deps = getCanvasDeps(M.GAME, {
            refs: { gameCanvas: M._canvasRefs?.gameCanvas, gameCtx: M._canvasRefs?.gameCtx },
            requestAnimationFrame: requestAnimationFrameFn,
            gameLoop: fns.gameLoop,
            renderMinimap: fns.renderMinimap,
            renderNodeInfo: fns.renderNodeInfo,
            particleSystem: M.ParticleSystem,
        });
        M.WorldRenderLoopUI?.gameLoop?.(timestamp, deps);
    };
    fns.renderGameWorld = (dt, ctx, w, h) => {
        const deps = getCanvasDeps(M.GAME, {
            refs: { gameCanvas: M._canvasRefs?.gameCanvas, gameCtx: M._canvasRefs?.gameCtx },
            renderMinimap: fns.renderMinimap,
            renderNodeInfo: fns.renderNodeInfo,
        });
        M.WorldRenderLoopUI?.renderGameWorld?.(dt, ctx, w, h, deps);
    };
    fns.renderRegionBackground = (ctx, w, h) => M.WorldRenderLoopUI?.renderRegionBackground?.(ctx, w, h, getCanvasDeps(M.GAME));
    fns.renderDynamicLights = (ctx, w, h) => M.WorldRenderLoopUI?.renderDynamicLights?.(ctx, w, h, getCanvasDeps(M.GAME));
    fns.renderNodeInfo = (ctx, w, h) => M.WorldCanvasUI?.renderNodeInfo?.(ctx, w, h, Deps.getWorldCanvasDeps());
    fns.getFloorStatusText = (regionId, floor) => M.WorldCanvasUI?.getFloorStatusText?.(regionId, floor, Deps.getWorldCanvasDeps()) || '';
    fns.wrapCanvasText = (ctx, text, x, y, maxW, lineH) => M.WorldCanvasUI?.wrapCanvasText?.(ctx, text, x, y, maxW, lineH);
    fns.roundRect = (ctx, x, y, w, h, r) => M.WorldCanvasUI?.roundRect?.(ctx, x, y, w, h, r);
    fns.roundRectTop = (ctx, x, y, w, h, r) => M.WorldCanvasUI?.roundRectTop?.(ctx, x, y, w, h, r);

    // ═══ Map ═══
    fns.generateMap = (regionIdx) => {
        const deps = getCanvasDeps(M.GAME, {
            updateNextNodes: fns.updateNextNodes,
            updateUI: fns.updateUI,
            showWorldMemoryNotice: fns.showWorldMemoryNotice,
        });
        M.MapGenerationUI?.generateMap?.(regionIdx, deps);
    };
    fns.renderMinimap = () => {
        const deps = getCanvasDeps(M.GAME, {
            minimapCanvas: M._canvasRefs?.minimapCanvas,
            minimapCtx: M._canvasRefs?.minimapCtx,
            nodeMeta: M.NODE_META,
            getFloorStatusText: fns.getFloorStatusText,
            moveToNodeHandlerName: 'moveToNode',
            moveToNode: fns.moveToNode,
        });
        M.MapUI?.renderMinimap?.(deps);
    };
    fns.updateNextNodes = () => {
        const deps = getCanvasDeps(M.GAME, {
            minimapCanvas: M._canvasRefs?.minimapCanvas,
            minimapCtx: M._canvasRefs?.minimapCtx,
            nodeMeta: M.NODE_META,
            getFloorStatusText: fns.getFloorStatusText,
            moveToNodeHandlerName: 'moveToNode',
            moveToNode: fns.moveToNode,
            showFullMap: fns.showFullMap,
            showDeckView: fns.showDeckView,
            closeDeckView: fns.closeDeckView,
        });
        M.MapUI?.updateNextNodes?.(deps);
    };
    fns.showFullMap = () => {
        const deps = getCanvasDeps(M.GAME, {
            minimapCanvas: M._canvasRefs?.minimapCanvas,
            minimapCtx: M._canvasRefs?.minimapCtx,
            nodeMeta: M.NODE_META,
            getFloorStatusText: fns.getFloorStatusText,
            moveToNodeHandlerName: 'moveToNode',
            moveToNode: fns.moveToNode,
        });
        M.MapUI?.showFullMap?.(deps);
    };
    fns.moveToNode = (node) => {
        const deps = getCanvasDeps(M.GAME, {
            updateNextNodes: fns.updateNextNodes,
            renderMinimap: fns.renderMinimap,
            updateUI: fns.updateUI,
            startCombat: fns.startCombat,
            triggerRandomEvent: fns.triggerRandomEvent,
            showShop: fns.showShop,
            showRestSite: fns.showRestSite,
        });
        M.MapNavigationUI?.moveToNode?.(node, deps);
    };
}
