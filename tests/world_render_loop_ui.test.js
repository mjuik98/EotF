import { describe, expect, it, vi } from 'vitest';
import { WorldRenderLoopUI } from '../game/features/run/ports/public_presentation_capabilities.js';

function createCtx() {
  return {
    fillStyle: '',
    lineWidth: 0,
    strokeStyle: '',
    save: vi.fn(),
    restore: vi.fn(),
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    strokeRect: vi.fn(),
  };
}

describe('world_render_loop_ui', () => {
  it('uses injected region/hit-stop/screen-shake deps without global fallbacks', () => {
    const prevWindow = globalThis.window;
    globalThis.window = {
      HitStop: { active: vi.fn(() => true) },
      ScreenShake: { update: vi.fn(), apply: vi.fn() },
      getRegionData: vi.fn(() => ({ accent: '#000000' })),
    };

    const requestAnimationFrame = vi.fn();
    const hitStop = { active: vi.fn(() => false), update: vi.fn() };
    const screenShake = { update: vi.fn(), apply: vi.fn() };
    const getRegionData = vi.fn(() => ({ accent: '#ff0000' }));
    const renderMinimap = vi.fn();
    const processDirtyFlags = vi.fn();
    const particleSystem = { update: vi.fn() };
    const ctx = createCtx();
    const canvas = { width: 640, height: 360 };

    WorldRenderLoopUI.gameLoop(16, {
      gameLoop: vi.fn(),
      getRegionData,
      gs: {
        combat: { active: true, enemies: [{ hp: 10 }] },
        currentRegion: 2,
        currentScreen: 'game',
        player: { echoChain: 2 },
      },
      hitStop,
      particleSystem,
      processDirtyFlags,
      refs: { gameCanvas: canvas, gameCtx: ctx },
      renderMinimap,
      requestAnimationFrame,
      screenShake,
    });

    expect(hitStop.active).toHaveBeenCalled();
    expect(screenShake.update).toHaveBeenCalled();
    expect(screenShake.apply).toHaveBeenCalledWith(ctx);
    expect(getRegionData).toHaveBeenCalledWith(2, expect.any(Object));
    expect(renderMinimap).toHaveBeenCalledTimes(1);
    expect(processDirtyFlags).toHaveBeenCalledTimes(1);
    expect(requestAnimationFrame).toHaveBeenCalledTimes(1);
    expect(globalThis.window.HitStop.active).not.toHaveBeenCalled();
    expect(globalThis.window.getRegionData).not.toHaveBeenCalled();

    globalThis.window = prevWindow;
  });
});
