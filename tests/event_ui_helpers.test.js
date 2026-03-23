import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  dismissEventModal,
  dismissTransientOverlay,
  getAudioEngine,
} from '../game/features/event/public.js';

describe('event_ui_helpers', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('prefers injected audio engine when resolving event audio deps', () => {
    const audioEngine = { playHit: vi.fn() };
    expect(getAudioEngine({ audioEngine })).toBe(audioEngine);
  });

  it('dismisses transient overlays using injected requestAnimationFrame', () => {
    const remove = vi.fn();
    const raf = vi.fn((cb) => cb());
    const overlay = {
      style: {},
      remove,
    };
    const onDone = vi.fn();

    dismissTransientOverlay(overlay, onDone, { requestAnimationFrame: raf });

    expect(raf).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(320);
    expect(remove).toHaveBeenCalledTimes(1);
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('dismisses event modal using injected requestAnimationFrame', () => {
    const raf = vi.fn((cb) => cb());
    const modal = {
      classList: { remove: vi.fn() },
      style: {},
    };
    const onDone = vi.fn();

    dismissEventModal(modal, onDone, { requestAnimationFrame: raf });

    expect(raf).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(320);
    expect(modal.classList.remove).toHaveBeenCalledWith('active');
    expect(onDone).toHaveBeenCalledTimes(1);
  });
});
