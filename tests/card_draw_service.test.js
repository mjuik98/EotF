import { describe, expect, it, vi } from 'vitest';
import { drawCardsService, executePlayerDrawService } from '../game/features/combat/public.js';
import { Actions, Reducers } from '../game/core/state_actions.js';

function createState() {
  return {
    _activeRegionId: 5,
    currentRegion: 'stage_5',
    player: {
      energy: 3,
      hand: [],
      drawPile: ['c1', 'c2', 'c3'],
      graveyard: [],
      _handCapMinus: 0,
    },
    combat: {
      active: true,
      playerTurn: true,
    },
    dispatch(action, payload) {
      const reducer = Reducers[action];
      return reducer ? reducer(this, payload) : null;
    },
    addTimeRift: vi.fn(),
    addLog: vi.fn(),
    markDirty: vi.fn(),
  };
}

describe('card_draw_service', () => {
  it('adds time rift progress for attempted draws in region 5', () => {
    const gs = createState();
    gs.player.hand = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'h7', 'h8'];

    const result = drawCardsService({
      count: 2,
      gs,
      deps: { runtimeDeps: { token: 'deps' } },
    });

    expect(result.attempts).toBe(2);
    expect(gs.addTimeRift).toHaveBeenCalledWith(2, '시간의 균열', { token: 'deps' });
  });

  it('uses region data fallback when active region id is absent', () => {
    const gs = createState();
    gs._activeRegionId = undefined;
    gs.currentRegion = 'custom-region';

    drawCardsService({
      count: 1,
      gs,
      deps: {
        getRegionData: vi.fn(() => ({ id: 5 })),
        runtimeDeps: {},
      },
    });

    expect(gs.addTimeRift).toHaveBeenCalledTimes(1);
  });

  it('executes player draw via callbacks and blocks invalid cases with feedback', () => {
    const gs = createState();
    const modifyEnergy = vi.fn((amount, state) => {
      state.dispatch(Actions.PLAYER_ENERGY, { amount });
    });
    const drawCards = vi.fn();
    const playHit = vi.fn();
    const updateUI = vi.fn();

    expect(executePlayerDrawService({ gs, modifyEnergy, drawCards, playHit, updateUI })).toBe(true);
    expect(modifyEnergy).toHaveBeenCalledWith(-1, gs);
    expect(drawCards).toHaveBeenCalledWith(1, gs);

    gs.player.hand = new Array(8).fill('x');
    expect(executePlayerDrawService({ gs, modifyEnergy, drawCards, playHit, updateUI })).toBe(false);
    expect(playHit).toHaveBeenCalledTimes(1);
    expect(updateUI).toHaveBeenCalledTimes(1);
  });
});
