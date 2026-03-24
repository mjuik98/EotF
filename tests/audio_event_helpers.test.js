import { describe, expect, it, vi } from 'vitest';

import {
  playAttackSlash,
  playAudioEvent,
  playClassSelect,
  playEventBossPhase,
  playEventResonanceBurst,
  playReactionEnemyDeath,
  playReactionPlayerDeath,
  playStatusHeal,
  playUiItemGet,
  playUiItemGetFeedback,
  playUiClick,
} from '../game/shared/audio/audio_event_helpers.js';

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

  it('maps item, boss phase, resonance burst, enemy death, and player death to their event keys', () => {
    const audioEngine = {
      playEvent: vi.fn(),
      playItemGet: vi.fn(),
      playBossPhase: vi.fn(),
      playResonanceBurst: vi.fn(),
      playEnemyDeath: vi.fn(),
      playDeath: vi.fn(),
    };

    playUiItemGet(audioEngine);
    playEventBossPhase(audioEngine);
    playEventResonanceBurst(audioEngine);
    playReactionEnemyDeath(audioEngine);
    playReactionPlayerDeath(audioEngine);

    expect(audioEngine.playEvent).toHaveBeenNthCalledWith(1, 'ui', 'itemGet');
    expect(audioEngine.playEvent).toHaveBeenNthCalledWith(2, 'event', 'bossPhase');
    expect(audioEngine.playEvent).toHaveBeenNthCalledWith(3, 'event', 'resonanceBurst');
    expect(audioEngine.playEvent).toHaveBeenNthCalledWith(4, 'reaction', 'enemyDeath');
    expect(audioEngine.playEvent).toHaveBeenNthCalledWith(5, 'reaction', 'playerDeath');
    expect(audioEngine.playItemGet).not.toHaveBeenCalled();
    expect(audioEngine.playBossPhase).not.toHaveBeenCalled();
    expect(audioEngine.playResonanceBurst).not.toHaveBeenCalled();
    expect(audioEngine.playEnemyDeath).not.toHaveBeenCalled();
    expect(audioEngine.playDeath).not.toHaveBeenCalled();
  });

  it('prefers an injected item-get hook over the audio engine fallback', () => {
    const playItemGetHook = vi.fn();
    const audioEngine = {
      playEvent: vi.fn(),
      playItemGet: vi.fn(),
    };

    expect(playUiItemGetFeedback(playItemGetHook, audioEngine)).toBe(true);
    expect(playItemGetHook).toHaveBeenCalledTimes(1);
    expect(audioEngine.playEvent).not.toHaveBeenCalled();
    expect(audioEngine.playItemGet).not.toHaveBeenCalled();
  });

  it('falls back to dedicated enemy/player death legacy methods when playEvent is unavailable', () => {
    const audioEngine = {
      playEnemyDeath: vi.fn(),
      playDeath: vi.fn(),
    };

    expect(playReactionEnemyDeath(audioEngine)).toBe(true);
    expect(playReactionPlayerDeath(audioEngine)).toBe(true);
    expect(audioEngine.playEnemyDeath).toHaveBeenCalledTimes(1);
    expect(audioEngine.playDeath).toHaveBeenCalledTimes(1);
  });

  it('maps class selection to the classSelect registry and falls back to the legacy method', () => {
    const eventAudioEngine = {
      playEvent: vi.fn(),
      playClassSelect: vi.fn(),
    };
    const legacyAudioEngine = {
      playClassSelect: vi.fn(),
    };

    expect(playClassSelect(eventAudioEngine, 'mage')).toBe(true);
    expect(eventAudioEngine.playEvent).toHaveBeenCalledWith('classSelect', 'mage');
    expect(eventAudioEngine.playClassSelect).not.toHaveBeenCalled();

    expect(playClassSelect(legacyAudioEngine, 'guardian')).toBe(true);
    expect(legacyAudioEngine.playClassSelect).toHaveBeenCalledWith('guardian');
  });

  it('returns false when neither event nor legacy handlers exist', () => {
    expect(playAttackSlash({})).toBe(false);
    expect(playAudioEvent(null, 'ui', 'click', 'playClick')).toBe(false);
    expect(playClassSelect({}, 'mage')).toBe(false);
    expect(playReactionPlayerDeath({})).toBe(false);
  });
});
