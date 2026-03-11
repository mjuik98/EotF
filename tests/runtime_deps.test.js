import { describe, expect, it, vi } from 'vitest';
import { getAudioEngine, getRaf } from '../game/utils/runtime_deps.js';

describe('runtime_deps', () => {
  it('resolves audio engine from injected window only', () => {
    const prevAudioEngine = globalThis.AudioEngine;
    globalThis.AudioEngine = { playHit: vi.fn() };

    const audioEngine = { playHit: vi.fn() };
    expect(getAudioEngine({ win: { AudioEngine: audioEngine } })).toBe(audioEngine);
    expect(getAudioEngine({})).toBe(null);

    globalThis.AudioEngine = prevAudioEngine;
  });

  it('resolves requestAnimationFrame from injected deps and win only', () => {
    const prevRaf = globalThis.requestAnimationFrame;
    globalThis.requestAnimationFrame = vi.fn();

    const injectedRaf = vi.fn();
    expect(getRaf({ requestAnimationFrame: injectedRaf })).toBe(injectedRaf);

    const win = { requestAnimationFrame: vi.fn() };
    const boundRaf = getRaf({ win });
    expect(typeof boundRaf).toBe('function');
    boundRaf(() => {});
    expect(win.requestAnimationFrame).toHaveBeenCalledTimes(1);
    expect(getRaf({})).toBe(null);

    globalThis.requestAnimationFrame = prevRaf;
  });
});
