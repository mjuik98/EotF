import fs from 'node:fs';
import path from 'node:path';

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
      featureScopes: {
        title: {
          ClassSelectUI: { getSelectedClass, clearSelection },
          CharacterSelectUI: { showPendingSummaries },
        },
        combat: {
          DeckModalUI: { resetFilter },
        },
      },
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

  it('prefers feature-scoped registry views when available', () => {
    const clearSelection = vi.fn();
    const showPendingSummaries = vi.fn();
    const resetFilter = vi.fn();
    const deps = {
      getClassSelectDeps: vi.fn(() => ({ token: 'class-select-deps' })),
    };
    const modules = {
      ClassSelectUI: { getSelectedClass: vi.fn(() => 'flat') },
      CharacterSelectUI: { showPendingSummaries: vi.fn() },
      DeckModalUI: { resetFilter: vi.fn() },
      featureScopes: {
        title: {
          ClassSelectUI: { getSelectedClass: vi.fn(() => 'scoped'), clearSelection },
          CharacterSelectUI: { showPendingSummaries },
        },
        combat: {
          DeckModalUI: { resetFilter },
        },
      },
    };

    const helpers = buildBindingUiHelpers({ modules, deps });

    expect(helpers.getSelectedClass()).toBe('scoped');
    helpers.clearSelectedClass();
    helpers.showPendingClassProgressSummary();
    helpers.resetDeckModalFilter();

    expect(clearSelection).toHaveBeenCalledWith({ token: 'class-select-deps' });
    expect(showPendingSummaries).toHaveBeenCalledTimes(1);
    expect(resetFilter).toHaveBeenCalledTimes(1);
  });

  it('keeps scoped lookups encapsulated in the registry helper instead of flat module fallbacks', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'game/core/bootstrap/build_binding_ui_helpers.js'),
      'utf8',
    );

    expect(source).not.toContain('modules.ClassSelectUI');
    expect(source).not.toContain('modules.CharacterSelectUI');
    expect(source).not.toContain('modules.DeckModalUI');
  });
});
