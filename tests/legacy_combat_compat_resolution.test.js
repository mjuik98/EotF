import { describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  createCombatLegacyUiCompat: vi.fn(() => ({
    hideEnemyStatusTooltip: vi.fn(),
    showEnemyStatusTooltip: vi.fn(),
    updateEchoSkillBtn: vi.fn(),
  })),
  applyPlayerDamage: vi.fn(),
  drawCards: vi.fn(),
  executePlayerDraw: vi.fn(),
  modifyEnergy: vi.fn(),
}));

vi.mock('../game/features/combat/platform/public_combat_legacy_surface.js', () => ({
  createCombatLegacyUiCompat: hoisted.createCombatLegacyUiCompat,
}));

vi.mock('../game/platform/legacy/game_api/player_commands.js', () => ({
  applyPlayerDamage: hoisted.applyPlayerDamage,
  drawCards: hoisted.drawCards,
  executePlayerDraw: hoisted.executePlayerDraw,
  modifyEnergy: hoisted.modifyEnergy,
}));

import { createLegacyCombatCompat } from '../game/platform/legacy/adapters/create_legacy_combat_compat.js';

describe('createLegacyCombatCompat', () => {
  it('uses canonical scoped gs when commands omit an explicit gs argument', () => {
    const scopedGs = { id: 'scoped-gs' };
    const modules = {
      GS: { id: 'stale-gs' },
      featureScopes: {
        core: {
          GS: scopedGs,
        },
      },
    };

    const compat = createLegacyCombatCompat(modules);
    compat.takeDamage(7);
    compat.drawCards(2);
    compat.executePlayerDraw();

    expect(hoisted.applyPlayerDamage).toHaveBeenCalledWith(7, scopedGs);
    expect(hoisted.drawCards).toHaveBeenCalledWith(2, scopedGs, {});
    expect(hoisted.executePlayerDraw).toHaveBeenCalledWith(scopedGs, {
      modifyEnergy: hoisted.modifyEnergy,
      drawCards: hoisted.drawCards,
    });
  });
});
