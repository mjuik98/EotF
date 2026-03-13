import { describe, expect, it, vi } from 'vitest';

const {
  initSpy,
  resizeSpy,
  animateSpy,
  stopSpy,
  createTitleCanvasRuntimeSpy,
} = vi.hoisted(() => ({
  initSpy: vi.fn(),
  resizeSpy: vi.fn(),
  animateSpy: vi.fn(),
  stopSpy: vi.fn(),
  createTitleCanvasRuntimeSpy: vi.fn(() => ({
    init: initSpy,
    resize: resizeSpy,
    animate: animateSpy,
    stop: stopSpy,
  })),
}));

vi.mock('../game/features/title/presentation/browser/title_canvas_runtime.js', () => ({
  createTitleCanvasRuntime: createTitleCanvasRuntimeSpy,
}));

import { TitleCanvasUI } from '../game/ui/title/title_canvas_ui.js';

describe('title canvas ui facade', () => {
  it('delegates init/resize/animate/stop to the runtime helper', () => {
    const canvas = { id: 'titleCanvas' };
    const doc = {
      getElementById: vi.fn(() => canvas),
    };
    const deps = { doc };

    TitleCanvasUI.init(deps);
    TitleCanvasUI.resize();
    TitleCanvasUI.animate();
    TitleCanvasUI.stop();

    expect(createTitleCanvasRuntimeSpy).toHaveBeenCalledWith({ doc });
    expect(initSpy).toHaveBeenCalledWith(canvas);
    expect(resizeSpy).toHaveBeenCalledTimes(1);
    expect(animateSpy).toHaveBeenCalledTimes(1);
    expect(stopSpy).toHaveBeenCalledTimes(1);
  });
});
