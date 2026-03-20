import { describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  createLegacyCombatCompat: vi.fn(() => ({
    takeDamage: vi.fn(),
    drawCards: vi.fn(),
    executePlayerDraw: vi.fn(),
    updateEchoSkillBtn: vi.fn(),
  })),
}));

vi.mock('../game/platform/legacy/adapters/create_legacy_combat_compat.js', () => ({
  createLegacyCombatCompat: hoisted.createLegacyCombatCompat,
}));

import { buildLegacyGameAPICombatGroups } from '../game/platform/legacy/build_legacy_game_api_combat_groups.js';

describe('buildLegacyGameAPICombatGroups', () => {
  it('lets compat resolve the canonical gs instead of forcing stale top-level gs aliases', () => {
    const modules = {
      GS: { id: 'stale-gs' },
    };
    const fns = {
      updateCombatLog: vi.fn(),
      toggleHudPin: vi.fn(),
      toggleBattleChronicle: vi.fn(),
      openBattleChronicle: vi.fn(),
      closeBattleChronicle: vi.fn(),
      showEchoSkillTooltip: vi.fn(),
      hideEchoSkillTooltip: vi.fn(),
      drawCard: vi.fn(),
      endPlayerTurn: vi.fn(),
      renderCombatCards: vi.fn(),
      useEchoSkill: vi.fn(),
    };

    const groups = buildLegacyGameAPICombatGroups(modules, fns);
    groups.player.takeDamage(5);

    expect(hoisted.createLegacyCombatCompat).toHaveBeenCalledWith(modules);
    expect(hoisted.createLegacyCombatCompat.mock.results[0].value.takeDamage).toHaveBeenCalledWith(5);
  });
});
