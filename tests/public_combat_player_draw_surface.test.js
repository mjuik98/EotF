import { describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  createCombatApplicationCapabilities: vi.fn(),
  drawStateCards: vi.fn(),
  executePlayerDrawService: vi.fn(),
}));

vi.mock('../game/features/combat/ports/public_application_capabilities.js', () => ({
  createCombatApplicationCapabilities: hoisted.createCombatApplicationCapabilities,
}));

import {
  drawCombatPlayerCards,
  executeCombatPlayerDraw,
} from '../game/features/combat/platform/public_combat_player_draw_surface.js';

describe('public_combat_player_draw_surface', () => {
  it('routes draw requests through combat application capabilities', () => {
    hoisted.drawStateCards.mockReturnValueOnce({ drawn: 2 });
    hoisted.createCombatApplicationCapabilities.mockReturnValueOnce({
      drawStateCards: hoisted.drawStateCards,
      executePlayerDrawService: hoisted.executePlayerDrawService,
    });

    const gs = { id: 'gs' };
    const runRuntimeDeps = { updateUI: vi.fn() };
    const result = drawCombatPlayerCards({
      count: 2,
      gs,
      options: { preview: true },
      runRuntimeDeps,
    });

    expect(result).toEqual({ drawn: 2 });
    expect(hoisted.drawStateCards).toHaveBeenCalledWith({
      count: 2,
      gs,
      options: { preview: true },
      runRuntimeDeps,
    });
  });

  it('routes execute requests through combat application capabilities', () => {
    hoisted.executePlayerDrawService.mockReturnValueOnce(true);
    hoisted.createCombatApplicationCapabilities.mockReturnValueOnce({
      drawStateCards: hoisted.drawStateCards,
      executePlayerDrawService: hoisted.executePlayerDrawService,
    });

    const payload = {
      gs: { id: 'gs' },
      modifyEnergy: vi.fn(),
      drawCards: vi.fn(),
      playHit: vi.fn(),
      updateUI: vi.fn(),
    };

    const result = executeCombatPlayerDraw(payload);

    expect(result).toBe(true);
    expect(hoisted.executePlayerDrawService).toHaveBeenCalledWith(payload);
  });
});
