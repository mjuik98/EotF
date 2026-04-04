import { describe, expect, it, vi } from 'vitest';

import { createWorldRenderActions } from '../game/features/run/application/world_render_actions.js';

describe('run_world_render_actions', () => {
  it('prefers injected run world render runtime ports over compat world UI modules', () => {
    const runtimePorts = {
      gameLoop: vi.fn(),
      renderGameWorld: vi.fn(),
      renderRegionBackground: vi.fn(),
      renderDynamicLights: vi.fn(),
      renderNodeInfo: vi.fn(),
      getFloorStatusText: vi.fn(() => '2F'),
      wrapCanvasText: vi.fn(() => 'wrapped'),
      roundRect: vi.fn(() => 'rounded'),
      roundRectTop: vi.fn(() => 'rounded-top'),
    };
    const modules = {
      WorldRenderLoopUI: {
        gameLoop: vi.fn(),
        renderDynamicLights: vi.fn(),
        renderGameWorld: vi.fn(),
        renderRegionBackground: vi.fn(),
      },
      WorldCanvasUI: {
        getFloorStatusText: vi.fn(),
        renderNodeInfo: vi.fn(),
        roundRect: vi.fn(),
        roundRectTop: vi.fn(),
        wrapCanvasText: vi.fn(),
      },
    };

    const actions = createWorldRenderActions({
      fns: {},
      modules,
      ports: {
        getRunWorldRenderRuntimePorts: vi.fn(() => runtimePorts),
      },
    });

    expect(actions.getFloorStatusText(0, 2)).toBe('2F');
    expect(actions.wrapCanvasText({}, 'text', 1, 2, 3, 4)).toBe('wrapped');
    expect(actions.roundRect({}, 1, 2, 3, 4, 5)).toBe('rounded');
    expect(actions.roundRectTop({}, 1, 2, 3, 4, 5)).toBe('rounded-top');

    actions.gameLoop(16);
    actions.renderGameWorld(16, {}, 1280, 720);
    actions.renderRegionBackground({}, 1280, 720);
    actions.renderDynamicLights({}, 1280, 720);
    actions.renderNodeInfo({}, 1280, 720);

    expect(runtimePorts.gameLoop).toHaveBeenCalledWith(16);
    expect(runtimePorts.renderGameWorld).toHaveBeenCalledWith(16, {}, 1280, 720);
    expect(runtimePorts.renderRegionBackground).toHaveBeenCalledWith({}, 1280, 720);
    expect(runtimePorts.renderDynamicLights).toHaveBeenCalledWith({}, 1280, 720);
    expect(runtimePorts.renderNodeInfo).toHaveBeenCalledWith({}, 1280, 720);
    expect(runtimePorts.getFloorStatusText).toHaveBeenCalledWith(0, 2);
    expect(runtimePorts.wrapCanvasText).toHaveBeenCalledWith({}, 'text', 1, 2, 3, 4);
    expect(runtimePorts.roundRect).toHaveBeenCalledWith({}, 1, 2, 3, 4, 5);
    expect(runtimePorts.roundRectTop).toHaveBeenCalledWith({}, 1, 2, 3, 4, 5);
    expect(modules.WorldRenderLoopUI.gameLoop).not.toHaveBeenCalled();
    expect(modules.WorldRenderLoopUI.renderGameWorld).not.toHaveBeenCalled();
    expect(modules.WorldRenderLoopUI.renderRegionBackground).not.toHaveBeenCalled();
    expect(modules.WorldRenderLoopUI.renderDynamicLights).not.toHaveBeenCalled();
    expect(modules.WorldCanvasUI.renderNodeInfo).not.toHaveBeenCalled();
    expect(modules.WorldCanvasUI.getFloorStatusText).not.toHaveBeenCalled();
    expect(modules.WorldCanvasUI.wrapCanvasText).not.toHaveBeenCalled();
    expect(modules.WorldCanvasUI.roundRect).not.toHaveBeenCalled();
    expect(modules.WorldCanvasUI.roundRectTop).not.toHaveBeenCalled();
  });
});
