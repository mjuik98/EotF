import { describe, expect, it } from 'vitest';
import {
  createDefaultGameStateShape,
  createDefaultPlayerState,
  createDefaultRuntimeState,
} from '../game/core/game_state_defaults.js';

describe('game_state_defaults', () => {
  it('creates fresh nested collections for each game-state shape', () => {
    const first = createDefaultGameStateShape();
    const second = createDefaultGameStateShape();

    first.meta.codex.enemies.add('wolf');
    first.player._cascadeCards.set('strike', 1);
    first._handScopedRuntime.cascadeCards.set(0, 'strike');
    first.player.upgradedCards.add('strike_plus');
    first.visitedNodes.add('1-0');
    first.combat.log.push({ msg: 'x' });

    expect(second.meta.codex.enemies.size).toBe(0);
    expect(second.player._cascadeCards.size).toBe(0);
    expect(second._handScopedRuntime.cascadeCards.size).toBe(0);
    expect(second.player.upgradedCards.size).toBe(0);
    expect(second.visitedNodes.size).toBe(0);
    expect(second.combat.log).toHaveLength(0);
  });

  it('clones override collections instead of reusing references', () => {
    const deck = ['strike'];
    const visitedNodes = new Set(['2-1']);
    const worldMemory = { savedMerchant: 1 };

    const player = createDefaultPlayerState({ deck });
    const runtime = createDefaultRuntimeState({ visitedNodes, worldMemory });

    deck.push('defend');
    visitedNodes.add('2-2');
    worldMemory.savedMerchant = 2;

    expect(player.deck).toEqual(['strike']);
    expect(runtime.visitedNodes.has('2-2')).toBe(false);
    expect(runtime.worldMemory.savedMerchant).toBe(1);
  });
});
