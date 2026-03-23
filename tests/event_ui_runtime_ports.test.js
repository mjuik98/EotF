import { describe, expect, it, vi } from 'vitest';

import {
  getRaf,
  resolveAudioEngine,
} from '../game/features/event/platform/event_ui_runtime_ports.js';

describe('event_ui_runtime_ports', () => {
  it('resolves audio engine from explicit deps before window scope', () => {
    const injectedAudio = { playClick: vi.fn() };
    const winAudio = { playClick: vi.fn() };

    expect(resolveAudioEngine({
      audioEngine: injectedAudio,
      win: { AudioEngine: winAudio },
    })).toBe(injectedAudio);
    expect(resolveAudioEngine({ win: { AudioEngine: winAudio } })).toBe(winAudio);
    expect(resolveAudioEngine({})).toBe(null);
  });

  it('returns an injected requestAnimationFrame or a window-bound fallback', () => {
    const injectedRaf = vi.fn();
    expect(getRaf({ requestAnimationFrame: injectedRaf })).toBe(injectedRaf);

    const win = { requestAnimationFrame: vi.fn() };
    const boundRaf = getRaf({ win });
    expect(typeof boundRaf).toBe('function');
    boundRaf(() => {});
    expect(win.requestAnimationFrame).toHaveBeenCalledTimes(1);
    expect(getRaf({})).toBe(null);
  });
});
