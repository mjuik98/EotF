import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GameAPI } from '../game/core/game_api.js';

vi.mock('../game/platform/legacy/game_api/runtime_context.js', () => ({
  getAudioEngine: vi.fn(() => null),
  getCombatRuntimeDeps: vi.fn(() => ({ updateUI: vi.fn(), renderCombatCards: vi.fn() })),
  getCurrentCard: vi.fn(() => ({ id: 'strike', cost: 1, effect: vi.fn() })),
  getDefaultState: vi.fn(() => ({
    dispatch: vi.fn(),
    combat: { active: true },
    endCombat: vi.fn(),
  })),
  getModule: vi.fn((name) => {
    if (name === 'CardCostUtils') return {};
    if (name === 'ClassMechanics') return {};
    if (name === 'HudUpdateUI') return {};
    if (name === 'ScreenUI') return {};
    return null;
  }),
  getRunRuntimeDeps: vi.fn(() => ({ updateUI: vi.fn(), switchScreen: vi.fn() })),
  getRuntimeDeps: vi.fn(() => ({ updateUI: vi.fn(), switchScreen: vi.fn() })),
  getUiRuntimeDeps: vi.fn(() => ({ updateUI: vi.fn() })),
}));

vi.mock('../game/app/combat/card_draw_service.js', () => ({
  drawCardsService: vi.fn(),
  executePlayerDrawService: vi.fn(() => true),
}));

vi.mock('../game/app/combat/play_card_service.js', () => ({
  playCardService: vi.fn(() => true),
}));

describe('GameAPI compat facade', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('routes executePlayerDraw through the facade reference', () => {
    const modifyEnergySpy = vi.spyOn(GameAPI, 'modifyEnergy').mockImplementation(() => {});
    const drawCardsSpy = vi.spyOn(GameAPI, 'drawCards').mockImplementation(() => {});

    GameAPI.executePlayerDraw({ dispatch: vi.fn(), combat: { active: true } });

    expect(modifyEnergySpy).not.toHaveBeenCalled();
    expect(drawCardsSpy).not.toHaveBeenCalled();
    modifyEnergySpy.mockRestore();
    drawCardsSpy.mockRestore();
  });

  it('routes playCard discard through the facade reference so spies remain valid', async () => {
    const discardSpy = vi.spyOn(GameAPI, 'discardCard').mockImplementation(() => {});
    const { playCardService } = await import('../game/app/combat/play_card_service.js');

    GameAPI.playCard('strike', 0, {
      dispatch: vi.fn(),
      combat: { active: true },
      player: { hand: ['strike'] },
    });

    expect(playCardService).toHaveBeenCalled();
    const call = playCardService.mock.calls[0][0];
    call.discardCard('strike', false, { dispatch: vi.fn() }, true);
    expect(discardSpy).toHaveBeenCalledWith('strike', false, expect.any(Object), true);
  });
});
