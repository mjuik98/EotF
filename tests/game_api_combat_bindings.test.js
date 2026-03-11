import { describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  applyPlayerDamage: vi.fn(),
  drawCards: vi.fn(),
  executePlayerDraw: vi.fn(),
  modifyEnergy: vi.fn(),
}));

vi.mock('../game/platform/legacy/game_api/player_commands.js', () => ({
  applyPlayerDamage: hoisted.applyPlayerDamage,
  drawCards: hoisted.drawCards,
  executePlayerDraw: hoisted.executePlayerDraw,
  modifyEnergy: hoisted.modifyEnergy,
}));

import { buildLegacyGameAPICombatBindings } from '../game/platform/legacy/game_api_combat_bindings.js';

describe('buildLegacyGameAPICombatBindings', () => {
  it('merges hud, player, and flow combat bindings', () => {
    const modules = {
      GS: { token: 'gs' },
      GAME: { getHudDeps: vi.fn(() => ({ token: 'hud-deps' })) },
      CombatHudUI: { updateEchoSkillBtn: vi.fn() },
    };
    const fns = {
      updateCombatLog: vi.fn(),
      drawCard: vi.fn(),
      endPlayerTurn: vi.fn(),
      renderCombatCards: vi.fn(),
      useEchoSkill: vi.fn(),
      toggleHudPin: vi.fn(),
      toggleBattleChronicle: vi.fn(),
      openBattleChronicle: vi.fn(),
      closeBattleChronicle: vi.fn(),
      showEchoSkillTooltip: vi.fn(),
      hideEchoSkillTooltip: vi.fn(),
    };

    const bindings = buildLegacyGameAPICombatBindings(modules, fns);

    bindings.updateEchoSkillBtn();
    bindings.takeDamage(9);
    bindings.drawCards(3, modules.GS);
    bindings.executePlayerDraw(modules.GS);
    bindings.endPlayerTurn();

    expect(modules.CombatHudUI.updateEchoSkillBtn).toHaveBeenCalledWith({ token: 'hud-deps' });
    expect(hoisted.applyPlayerDamage).toHaveBeenCalledWith(9, modules.GS);
    expect(hoisted.drawCards).toHaveBeenCalledWith(3, modules.GS, {});
    expect(hoisted.executePlayerDraw).toHaveBeenCalledWith(modules.GS, {
      modifyEnergy: hoisted.modifyEnergy,
      drawCards: hoisted.drawCards,
    });
    expect(fns.endPlayerTurn).toHaveBeenCalledTimes(1);
  });
});
