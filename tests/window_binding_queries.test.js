import { describe, expect, it, vi } from 'vitest';

import { attachLegacyWindowQueries } from '../game/platform/legacy/window_binding_queries.js';

describe('attachLegacyWindowQueries', () => {
  it('assigns merged ui and utility query bindings onto the root object', () => {
    const root = {};
    const modules = {
      AudioEngine: { id: 'audio' },
      DescriptionUtils: { id: 'desc' },
      CardCostUtils: { id: 'cost' },
      HudUpdateUI: { updateUI: vi.fn() },
      GameInit: { syncVolumeUI: vi.fn() },
      CombatUI: {
        showEnemyStatusTooltip: vi.fn(),
        hideEnemyStatusTooltip: vi.fn(),
      },
      GAME: {
        getCombatDeps: vi.fn(() => ({ token: 'combat-deps' })),
      },
    };
    const fns = {
      _resetCombatInfoPanel: vi.fn(),
    };
    const deps = {
      getHudUpdateDeps: vi.fn(() => ({ token: 'hud-deps' })),
    };

    attachLegacyWindowQueries(root, modules, fns, deps);

    expect(root.DescriptionUtils).toBe(modules.DescriptionUtils);
    expect(root.CardCostUtils).toBe(modules.CardCostUtils);

    root.updateUI();
    root._syncVolumeUI();
    root.showEnemyStatusTooltip('evt', 'burn');
    root.hideEnemyStatusTooltip();
    root._resetCombatInfoPanel();

    expect(modules.HudUpdateUI.updateUI).toHaveBeenCalledWith({ token: 'hud-deps' });
    expect(modules.GameInit.syncVolumeUI).toHaveBeenCalledWith(modules.AudioEngine);
    expect(modules.CombatUI.showEnemyStatusTooltip).toHaveBeenCalledWith(
      'evt',
      'burn',
      { token: 'combat-deps' },
    );
    expect(modules.CombatUI.hideEnemyStatusTooltip).toHaveBeenCalledWith({
      token: 'combat-deps',
    });
    expect(fns._resetCombatInfoPanel).toHaveBeenCalledTimes(1);
  });
});
