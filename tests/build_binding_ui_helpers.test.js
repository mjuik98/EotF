import { describe, expect, it, vi } from 'vitest';

import { buildBindingUiHelpers } from '../game/core/bootstrap/build_binding_ui_helpers.js';

describe('buildBindingUiHelpers', () => {
  it('exposes class-select and deck modal helpers', () => {
    const clearSelection = vi.fn();
    const showPendingSummaries = vi.fn();
    const resetFilter = vi.fn();
    const getSelectedClass = vi.fn(() => 'mage');
    const deps = {
      getClassSelectDeps: vi.fn(() => ({ token: 'class-select-deps' })),
    };
    const modules = {
      ClassSelectUI: { getSelectedClass, clearSelection },
      CharacterSelectUI: { showPendingSummaries },
      DeckModalUI: { resetFilter },
    };

    const helpers = buildBindingUiHelpers({ modules, deps });

    expect(helpers.getSelectedClass()).toBe('mage');
    helpers.clearSelectedClass();
    expect(clearSelection).toHaveBeenCalledWith({ token: 'class-select-deps' });

    helpers.showPendingClassProgressSummary();
    expect(showPendingSummaries).toHaveBeenCalledTimes(1);

    helpers.resetDeckModalFilter();
    expect(resetFilter).toHaveBeenCalledTimes(1);
  });
});
