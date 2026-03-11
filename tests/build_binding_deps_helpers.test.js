import { describe, expect, it, vi } from 'vitest';

import { buildBindingDepsHelpers } from '../game/core/bootstrap/build_binding_deps_helpers.js';

describe('buildBindingDepsHelpers', () => {
  it('builds runtime accessors and ui helper wrappers for deps factory init', () => {
    const clearSelection = vi.fn();
    const showPendingSummaries = vi.fn();
    const resetFilter = vi.fn();
    const getSelectedClass = vi.fn(() => 'mage');
    const deps = {
      getClassSelectDeps: vi.fn(() => ({ token: 'class-select-deps' })),
    };
    const modules = {
      _gameStarted: false,
      ClassSelectUI: { getSelectedClass, clearSelection },
      CharacterSelectUI: { showPendingSummaries },
      DeckModalUI: { resetFilter },
    };

    const helpers = buildBindingDepsHelpers({ modules, deps });

    expect(helpers._gameStarted()).toBe(false);
    helpers.markGameStarted();
    expect(modules._gameStarted).toBe(true);
    expect(helpers.getSelectedClass()).toBe('mage');
    helpers.clearSelectedClass();
    helpers.showPendingClassProgressSummary();
    helpers.resetDeckModalFilter();

    expect(clearSelection).toHaveBeenCalledWith({ token: 'class-select-deps' });
    expect(showPendingSummaries).toHaveBeenCalledTimes(1);
    expect(resetFilter).toHaveBeenCalledTimes(1);
  });
});
