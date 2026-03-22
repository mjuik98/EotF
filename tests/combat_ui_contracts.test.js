import { describe, expect, it, vi } from 'vitest';

import { buildCombatUiContractBuilders } from '../game/features/combat/ports/contracts/build_combat_ui_contracts.js';

describe('buildCombatUiContractBuilders', () => {
  it('falls back to TooltipUI handlers for base card deps when UI actions are absent', () => {
    const tooltipDeps = { token: 'combat-tooltip-deps' };
    const tooltipUI = {
      hideTooltip: vi.fn(),
      showTooltip: vi.fn(),
    };
    const refs = {
      TooltipUI: tooltipUI,
      featureRefs: {
        combat: {},
      },
    };
    const builders = buildCombatUiContractBuilders({
      getRefs: () => refs,
      buildBaseDeps: vi.fn(() => ({ source: 'base' })),
      getCombatDeps: vi.fn(() => tooltipDeps),
      getHudDeps: vi.fn(() => ({ token: 'hud' })),
      getRaf: vi.fn(() => vi.fn()),
    });

    const deps = builders.baseCard();
    deps.showTooltipHandler({ type: 'mouseenter' }, 'strike');
    deps.hideTooltipHandler();

    expect(tooltipUI.showTooltip).toHaveBeenCalledWith(
      { type: 'mouseenter' },
      'strike',
      tooltipDeps,
    );
    expect(tooltipUI.hideTooltip).toHaveBeenCalledWith(tooltipDeps);
  });
});
