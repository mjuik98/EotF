import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../game/core/deps_factory.js', () => ({
  getWorldCanvasDeps: vi.fn(() => ({ token: 'world-canvas-deps' })),
}));

import * as Deps from '../game/core/deps_factory.js';
import { createCanvasBindings } from '../game/core/bindings/canvas_bindings.js';

describe('createCanvasBindings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('routes canvas, loop, and map actions through feature ports', () => {
    const requestAnimationFrame = vi.fn();
    const originalWindow = globalThis.window;
    const originalDocument = globalThis.document;
    globalThis.window = { requestAnimationFrame };
    globalThis.document = { marker: 'doc' };

    const modules = {
      GAME: { getCanvasDeps: vi.fn(() => ({ token: 'canvas-deps' })) },
      _canvasRefs: {
        gameCanvas: { id: 'gameCanvas' },
        gameCtx: { id: 'gameCtx' },
        minimapCanvas: { id: 'minimapCanvas' },
        minimapCtx: { id: 'minimapCtx' },
      },
      NODE_META: { marker: true },
      ParticleSystem: { marker: 'particles' },
      TitleCanvasUI: {
        init: vi.fn(),
        resize: vi.fn(),
        animate: vi.fn(),
      },
      GameCanvasSetupUI: {
        getRefs: vi.fn(() => ({ gameCanvas: { id: 'nextCanvas' } })),
        init: vi.fn(() => ({ gameCanvas: { id: 'freshCanvas' } })),
        resize: vi.fn(),
      },
      WorldRenderLoopUI: {
        gameLoop: vi.fn(),
        renderGameWorld: vi.fn(),
        renderRegionBackground: vi.fn(),
        renderDynamicLights: vi.fn(),
      },
      WorldCanvasUI: {
        renderNodeInfo: vi.fn(),
        getFloorStatusText: vi.fn(() => 'safe'),
        wrapCanvasText: vi.fn(),
        roundRect: vi.fn(),
        roundRectTop: vi.fn(),
      },
      MapGenerationUI: { generateMap: vi.fn() },
      MapUI: {
        renderMinimap: vi.fn(),
        updateNextNodes: vi.fn(),
        showFullMap: vi.fn(),
      },
      MapNavigationUI: { moveToNode: vi.fn() },
    };
    const fns = {
      closeDeckView: vi.fn(),
      showDeckView: vi.fn(),
      showRestSite: vi.fn(),
      showShop: vi.fn(),
      showWorldMemoryNotice: vi.fn(),
      startCombat: vi.fn(),
      triggerRandomEvent: vi.fn(),
      updateUI: vi.fn(),
    };

    createCanvasBindings(modules, fns);

    fns.initTitleCanvas();
    fns.initGameCanvas();
    fns.gameLoop(16);
    fns.renderNodeInfo('ctx', 100, 200);
    fns.generateMap(2);
    fns.renderMinimap();
    fns.updateNextNodes();
    fns.showFullMap();
    fns.moveToNode('1-0');

    expect(modules.TitleCanvasUI.init).toHaveBeenCalledWith({ doc: globalThis.document });
    expect(modules.GameCanvasSetupUI.init).toHaveBeenCalledWith({ token: 'canvas-deps' });
    expect(modules.WorldRenderLoopUI.gameLoop).toHaveBeenCalledWith(16, expect.objectContaining({
      token: 'canvas-deps',
      renderMinimap: fns.renderMinimap,
      particleSystem: modules.ParticleSystem,
    }));
    expect(modules.WorldRenderLoopUI.gameLoop.mock.calls[0][1].requestAnimationFrame).toEqual(expect.any(Function));
    expect(modules.WorldCanvasUI.renderNodeInfo).toHaveBeenCalledWith('ctx', 100, 200, { token: 'world-canvas-deps' });
    expect(modules.MapGenerationUI.generateMap).toHaveBeenCalledWith(2, expect.objectContaining({
      token: 'canvas-deps',
      updateNextNodes: fns.updateNextNodes,
      showWorldMemoryNotice: fns.showWorldMemoryNotice,
    }));
    expect(modules.MapUI.renderMinimap).toHaveBeenCalledWith(expect.objectContaining({
      token: 'canvas-deps',
      moveToNode: fns.moveToNode,
      nodeMeta: modules.NODE_META,
    }));
    expect(modules.MapUI.updateNextNodes).toHaveBeenCalledWith(expect.objectContaining({
      token: 'canvas-deps',
      showFullMap: fns.showFullMap,
      showDeckView: fns.showDeckView,
    }));
    expect(modules.MapUI.showFullMap).toHaveBeenCalledWith(expect.objectContaining({
      token: 'canvas-deps',
      moveToNode: fns.moveToNode,
    }));
    expect(modules.MapNavigationUI.moveToNode).toHaveBeenCalledWith('1-0', expect.objectContaining({
      token: 'canvas-deps',
      renderMinimap: fns.renderMinimap,
      startCombat: fns.startCombat,
    }));
    expect(Deps.getWorldCanvasDeps).toHaveBeenCalledTimes(1);

    globalThis.window = originalWindow;
    globalThis.document = originalDocument;
  });
});
