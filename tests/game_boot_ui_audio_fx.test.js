import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  startAudioWave,
  stopAudioWave,
} from '../game/ui/title/game_boot_ui_audio_fx.js';

function createContext() {
  return {
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    strokeStyle: null,
    lineWidth: 0,
  };
}

describe('game_boot_ui_audio_fx', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('starts the title audio waveform loop and stops the scheduled frame', () => {
    const ctx = createContext();
    const canvas = {
      width: 320,
      height: 40,
      getContext: vi.fn(() => ctx),
    };
    const doc = {
      getElementById: vi.fn((id) => (id === 'titleAudioWave' ? canvas : null)),
    };
    const originalRaf = globalThis.requestAnimationFrame;
    const originalCancel = globalThis.cancelAnimationFrame;
    globalThis.requestAnimationFrame = vi.fn(() => 77);
    globalThis.cancelAnimationFrame = vi.fn();

    startAudioWave(doc);

    expect(ctx.clearRect).toHaveBeenCalledTimes(1);
    expect(ctx.beginPath).toHaveBeenCalledTimes(1);
    expect(ctx.stroke).toHaveBeenCalledTimes(1);
    expect(globalThis.requestAnimationFrame).toHaveBeenCalledWith(expect.any(Function));

    stopAudioWave();

    expect(globalThis.cancelAnimationFrame).toHaveBeenCalledWith(77);
    globalThis.requestAnimationFrame = originalRaf;
    globalThis.cancelAnimationFrame = originalCancel;
  });
});
