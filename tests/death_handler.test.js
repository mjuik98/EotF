import { describe, expect, it, vi } from 'vitest';

import { DeathHandler } from '../game/combat/death_handler.js';
import { EndingScreenUI } from '../game/ui/screens/ending_screen_ui.js';

describe('DeathHandler.showDeathScreen', () => {
  it('routes defeat results through the cinematic ending screen', () => {
    const finalizeRunOutcome = vi.fn();
    const selectFragment = vi.fn();
    const showOutcomeSpy = vi.spyOn(EndingScreenUI, 'showOutcome').mockReturnValue(true);

    globalThis.GAME = { API: { selectFragment }, Modules: { EndingScreenUI } };

    const gs = {
      meta: {
        echoFragments: 3,
        inscriptions: {},
      },
      player: { kills: 5 },
      stats: { maxChain: 9 },
    };

    DeathHandler.showDeathScreen.call(gs, {
      finalizeRunOutcome,
      win: {},
    });

    expect(finalizeRunOutcome).toHaveBeenCalledWith('defeat', { echoFragments: 3 });
    expect(showOutcomeSpy).toHaveBeenCalledWith('defeat', expect.objectContaining({
      gs,
      selectFragment,
    }));
  });
});
