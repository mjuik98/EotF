import { describe, expect, it, vi } from 'vitest';

import { GS } from '../game/core/game_state.js';
import {
  attachCardGameStateRuntimeMethods,
  attachCombatGameStateRuntimeMethods,
} from '../game/shared/state/game_state_runtime_methods.js';
import { startPlayerTurnPolicy } from '../game/features/combat/domain/turn/start_player_turn_policy.js';
import { applyEchoSkillEffect } from '../game/features/combat/presentation/browser/echo_skill_runtime_ui.js';

function createTurnState() {
  return {
    _activeRegionId: 0,
    player: {
      buffs: {},
      deck: [],
      hand: [],
      graveyard: [],
      exhausted: [],
      maxEnergy: 3,
      energy: 0,
    },
    combat: {
      active: true,
      turn: 0,
      playerTurn: false,
    },
    triggerItems: vi.fn(),
    addLog: vi.fn(),
    markDirty: vi.fn(),
  };
}

describe('combat card runtime attachment guardrails', () => {
  it('does not expose combat or card runtime helpers on the canonical GS by default', () => {
    expect(GS.dealDamage).toBeUndefined();
    expect(GS.drawCards).toBeUndefined();
    expect(GS.playCard).toBeUndefined();
  });

  it('supports explicit card helper attachment for compat-only callers', () => {
    const target = {};

    attachCombatGameStateRuntimeMethods(target);
    expect(target.dealDamage).toBeTypeOf('function');
    expect(target.drawCards).toBeUndefined();

    attachCardGameStateRuntimeMethods(target);
    expect(target.drawCards).toBeTypeOf('function');
    expect(target.playCard).toBeTypeOf('function');
  });

  it('routes start-of-turn draw through an explicit command seam', () => {
    const gs = createTurnState();
    const drawCardsState = vi.fn();

    startPlayerTurnPolicy(gs, {
      drawCardsState,
    });

    expect(drawCardsState).toHaveBeenCalledWith(gs, 5, { skipRift: true });
  });

  it('uses an injected randomFn for region-2 forced exhaust selection', () => {
    const gs = createTurnState();
    const randomFn = vi.fn(() => 0.99);
    const exhaustRandomPlayerCardState = vi.fn(() => ({ cardId: 'grave_card' }));

    gs._activeRegionId = 2;
    gs.player.deck = ['deck_card'];
    gs.player.hand = ['hand_card'];
    gs.player.graveyard = ['grave_card'];

    startPlayerTurnPolicy(gs, {
      drawCardsState: vi.fn(),
      exhaustRandomPlayerCardState,
      randomFn,
      resolveActiveRegionId: () => 2,
    });

    expect(randomFn).toHaveBeenCalledTimes(1);
    expect(exhaustRandomPlayerCardState).toHaveBeenCalledWith(gs, expect.any(Array), 0);
  });

  it('routes echo-skill draw effects through explicit deps instead of GS card helpers', () => {
    const gs = {
      addLog: vi.fn(),
    };
    const drawCardsState = vi.fn();

    applyEchoSkillEffect(gs, { draw: 2, log: 'echo pulse' }, { drawCardsState });

    expect(drawCardsState).toHaveBeenCalledWith(gs, 2);
    expect(gs.addLog).toHaveBeenCalledWith('echo pulse', 'echo', expect.objectContaining({
      recentFeed: {
        eligible: true,
        text: '잔향 스킬: 카드 2장 드로우',
      },
    }));
  });
});
