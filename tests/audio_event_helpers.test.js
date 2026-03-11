import { describe, expect, it, vi } from 'vitest';

import {
  playAttackSlash,
  playAudioEvent,
  playStatusHeal,
  playUiClick,
} from '../game/domain/audio/audio_event_helpers.js';

describe('audio_event_helpers', () => {
  it('prefers playEvent without invoking the legacy method', () => {
    const audioEngine = {
      playEvent: vi.fn(),
      playClick: vi.fn(),
    };

    const result = playUiClick(audioEngine);

    expect(result).toBe(true);
    expect(audioEngine.playEvent).toHaveBeenCalledWith('ui', 'click');
    expect(audioEngine.playClick).not.toHaveBeenCalled();
  });

  it('falls back to the legacy method when playEvent is unavailable', () => {
    const audioEngine = {
      playHeal: vi.fn(),
    };

    const result = playStatusHeal(audioEngine);

    expect(result).toBe(true);
    expect(audioEngine.playHeal).toHaveBeenCalledTimes(1);
  });

  it('returns false when neither event nor legacy handlers exist', () => {
    expect(playAttackSlash({})).toBe(false);
    expect(playAudioEvent(null, 'ui', 'click', 'playClick')).toBe(false);
  });
});
