import { describe, expect, it, vi } from 'vitest';

import { DeathHandler } from '../game/combat/death_handler.js';
import { EndingScreenUI } from '../game/ui/screens/ending_screen_ui.js';

describe('DeathHandler', () => {
  it('routes defeat results through the cinematic ending screen', () => {
    const finalizeRunOutcome = vi.fn();
    const selectFragment = vi.fn();
    const showOutcomeSpy = vi.spyOn(EndingScreenUI, 'showOutcome').mockReturnValue(true);

    const gs = {
      meta: {
        echoFragments: 3,
        inscriptions: {},
      },
      player: { kills: 5 },
      stats: { maxChain: 9 },
    };

    DeathHandler.showDeathScreen.call(gs, {
      endingScreenUI: EndingScreenUI,
      finalizeRunOutcome,
      selectFragment,
      win: {},
    });

    expect(finalizeRunOutcome).toHaveBeenCalledWith('defeat', { echoFragments: 3 });
    expect(showOutcomeSpy).toHaveBeenCalledWith('defeat', expect.objectContaining({
      gs,
      selectFragment,
    }));
  });

  it('plays the player death reaction event instead of the generic legacy death sound', () => {
    vi.useFakeTimers();
    const combatOverlay = { classList: { remove: vi.fn() } };
    const doc = {
      body: { style: {} },
      createElement: vi.fn(() => ({
        style: {},
        appendChild: vi.fn(),
        remove: vi.fn(),
        textContent: '',
      })),
      getElementById: vi.fn((id) => (id === 'combatOverlay' ? combatOverlay : null)),
    };
    doc.body.appendChild = vi.fn();

    const gs = {
      combat: { active: true },
      triggerItems: vi.fn(() => false),
      showDeathScreen: vi.fn(),
    };
    const audioEngine = {
      playEvent: vi.fn(),
      playDeath: vi.fn(),
    };
    const screenShake = { shake: vi.fn() };
    const particleSystem = { deathEffect: vi.fn() };

    try {
      DeathHandler.onPlayerDeath.call(gs, {
        audioEngine,
        doc,
        win: { innerWidth: 1280, innerHeight: 720 },
        screenShake,
        particleSystem,
      });

      expect(audioEngine.playEvent).toHaveBeenCalledWith('reaction', 'playerDeath');
      expect(audioEngine.playDeath).not.toHaveBeenCalled();
      expect(screenShake.shake).toHaveBeenCalledWith(20, 1.2);
      expect(particleSystem.deathEffect).toHaveBeenCalledWith(640, 360);
      expect(gs.combat.active).toBe(false);

      vi.runAllTimers();
      expect(gs.showDeathScreen).toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });
});
