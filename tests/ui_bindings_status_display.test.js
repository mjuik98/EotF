import { describe, expect, it, vi } from 'vitest';

vi.mock('../game/core/deps_factory.js', () => ({
  getHudUpdateDeps: vi.fn(() => ({})),
  getCombatInfoDeps: vi.fn(() => ({})),
  getCombatHudDeps: vi.fn(() => ({})),
  getDeckModalDeps: vi.fn(() => ({})),
  getCodexDeps: vi.fn(() => ({})),
  getTooltipDeps: vi.fn(() => ({})),
  getScreenDeps: vi.fn(() => ({})),
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

import { createUIBindings } from '../game/core/bindings/ui_bindings.js';

describe('createUIBindings.updateStatusDisplay', () => {
  it('refreshes the floating hp panel status badges when they are mounted', () => {
    const updateStatusDisplay = vi.fn();
    const modules = {
      GS: { player: { buffs: { unbreakable_wall: { stacks: 99 } } } },
      TooltipUI: {},
      StatusEffectsUI: { updateStatusDisplay },
    };
    const fns = {};
    const originalDocument = globalThis.document;
    const mockWindow = { innerWidth: 1280, innerHeight: 720 };
    const mockDocument = {
      defaultView: mockWindow,
      getElementById: vi.fn((id) => {
        if (id === 'ncFloatingHpStatusBadges') return { id };
        return null;
      }),
    };

    globalThis.document = mockDocument;

    try {
      createUIBindings(modules, fns);
      fns.updateStatusDisplay();
    } finally {
      globalThis.document = originalDocument;
    }

    expect(updateStatusDisplay).toHaveBeenCalledTimes(1);
    expect(updateStatusDisplay).toHaveBeenCalledWith({
      gs: modules.GS,
      doc: mockDocument,
      statusContainerId: 'ncFloatingHpStatusBadges',
      tooltipUI: modules.TooltipUI,
      win: mockWindow,
      refreshCombatInfoPanel: expect.any(Function),
    });
  });

  it('continues to target the legacy status container when present', () => {
    const updateStatusDisplay = vi.fn();
    const modules = {
      GS: { player: { buffs: {} } },
      TooltipUI: {},
      StatusEffectsUI: { updateStatusDisplay },
    };
    const fns = {};
    const originalDocument = globalThis.document;
    const mockWindow = { innerWidth: 1280, innerHeight: 720 };
    const mockDocument = {
      defaultView: mockWindow,
      getElementById: vi.fn((id) => {
        if (id === 'statusEffects' || id === 'ncFloatingHpStatusBadges') return { id };
        return null;
      }),
    };

    globalThis.document = mockDocument;

    try {
      createUIBindings(modules, fns);
      fns.updateStatusDisplay();
    } finally {
      globalThis.document = originalDocument;
    }

    expect(updateStatusDisplay).toHaveBeenCalledTimes(2);
    expect(updateStatusDisplay.mock.calls[0][0].statusContainerId).toBe('statusEffects');
    expect(updateStatusDisplay.mock.calls[0][0].win).toBe(mockWindow);
    expect(updateStatusDisplay.mock.calls[1][0].statusContainerId).toBe('ncFloatingHpStatusBadges');
    expect(updateStatusDisplay.mock.calls[1][0].win).toBe(mockWindow);
  });
});
