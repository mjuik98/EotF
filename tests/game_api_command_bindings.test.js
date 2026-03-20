import { describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  applyPlayerDamage: vi.fn(),
  drawCards: vi.fn(),
  executePlayerDraw: vi.fn(),
  getRunSetupDeps: vi.fn(() => null),
  modifyEnergy: vi.fn(),
}));

vi.mock('../game/platform/legacy/game_api/player_commands.js', () => ({
  applyPlayerDamage: hoisted.applyPlayerDamage,
  drawCards: hoisted.drawCards,
  executePlayerDraw: hoisted.executePlayerDraw,
  modifyEnergy: hoisted.modifyEnergy,
}));

vi.mock('../game/core/deps_factory.js', () => ({
  getRunSetupDeps: hoisted.getRunSetupDeps,
  buildFeatureContractAccessors: vi.fn((contractMap, depsFactory) => Object.freeze(
    Object.fromEntries(
      Object.keys(contractMap).map((name) => [
        name,
        (overrides = {}) => ({
          ...(depsFactory?.[name]?.() || {}),
          ...overrides,
        }),
      ]),
    ),
  )),
}));

import { buildLegacyGameAPICommandBindings } from '../game/platform/legacy/game_api_command_bindings.js';

function createFns() {
  return {
    updateCombatLog: vi.fn(),
    refreshRunModePanel: vi.fn(),
    startGame: vi.fn(),
    useEchoSkill: vi.fn(),
    drawCard: vi.fn(),
    endPlayerTurn: vi.fn(),
    renderCombatCards: vi.fn(),
    setCodexTab: vi.fn(),
    closeCodex: vi.fn(),
    openCodex: vi.fn(),
    setDeckFilter: vi.fn(),
    closeDeckView: vi.fn(),
    toggleHudPin: vi.fn(),
    toggleBattleChronicle: vi.fn(),
    openBattleChronicle: vi.fn(),
    closeBattleChronicle: vi.fn(),
    showEchoSkillTooltip: vi.fn(),
    hideEchoSkillTooltip: vi.fn(),
    showSkipConfirm: vi.fn(),
    skipReward: vi.fn(),
    hideSkipConfirm: vi.fn(),
    showWorldMemoryNotice: vi.fn(),
    selectFragment: vi.fn(),
    shiftAscension: vi.fn(),
    openSettings: vi.fn(),
    closeSettings: vi.fn(),
    setSettingsTab: vi.fn(),
    resetSettings: vi.fn(),
    applySettingVolume: vi.fn(),
    applySettingVisual: vi.fn(),
    applySettingAccessibility: vi.fn(),
    startSettingsRebind: vi.fn(),
    toggleSettingMute: vi.fn(),
  };
}

describe('buildLegacyGameAPICommandBindings', () => {
  it('composes combat, codex, reward, run, and settings commands', () => {
    const fns = createFns();
    const modules = {
      GS: { token: 'gs' },
      GAME: { getHudDeps: vi.fn(() => ({ token: 'hud-deps' })) },
      CombatHudUI: { updateEchoSkillBtn: vi.fn() },
    };

    const bindings = buildLegacyGameAPICommandBindings(modules, fns);

    bindings.updateEchoSkillBtn();
    bindings.takeDamage(7);
    bindings.drawCards(2, modules.GS);
    bindings.executePlayerDraw(modules.GS);
    bindings.setCodexTab('relics');
    bindings.skipReward();
    bindings.startGame();
    bindings.openSettings();

    expect(modules.CombatHudUI.updateEchoSkillBtn).toHaveBeenCalledWith({ token: 'hud-deps' });
    expect(hoisted.applyPlayerDamage).toHaveBeenCalledWith(7, modules.GS);
    expect(hoisted.drawCards).toHaveBeenCalledWith(2, modules.GS, {});
    expect(hoisted.executePlayerDraw).toHaveBeenCalledWith(modules.GS, {
      modifyEnergy: hoisted.modifyEnergy,
      drawCards: hoisted.drawCards,
    });
    expect(fns.setCodexTab).toHaveBeenCalledWith('relics');
    expect(fns.skipReward).toHaveBeenCalledTimes(1);
    expect(fns.startGame).toHaveBeenCalledTimes(1);
    expect(fns.openSettings).toHaveBeenCalledTimes(1);
  });
});
