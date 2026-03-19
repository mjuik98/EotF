import { describe, expect, it, vi } from 'vitest';

import { buildBindingDepsPayload } from '../game/core/bootstrap/build_binding_deps_payload.js';

describe('buildBindingDepsPayload', () => {
  it('builds deps factory refs with runtime accessors and mutators', () => {
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
      CombatUI: { id: 'combat' },
    };
    modules.featureScopes = {
      title: {
        ClassSelectUI: modules.ClassSelectUI,
        CharacterSelectUI: modules.CharacterSelectUI,
      },
      combat: {
        DeckModalUI: modules.DeckModalUI,
      },
    };
    const fns = {
      startGame: vi.fn(),
    };

    const payload = buildBindingDepsPayload({ modules, fns, deps });

    expect(payload.CombatUI).toBe(modules.CombatUI);
    expect(payload.startGame).toBe(fns.startGame);
    expect(payload._gameStarted()).toBe(false);

    payload.markGameStarted();
    expect(modules._gameStarted).toBe(true);

    expect(payload.getSelectedClass()).toBe('mage');
    payload.clearSelectedClass();
    expect(clearSelection).toHaveBeenCalledWith({ token: 'class-select-deps' });

    payload.showPendingClassProgressSummary();
    expect(showPendingSummaries).toHaveBeenCalledTimes(1);

    payload.resetDeckModalFilter();
    expect(resetFilter).toHaveBeenCalledTimes(1);
    expect(payload.featureRefs.title.getSelectedClass).toBe(payload.getSelectedClass);
    expect(payload.featureRefs.combat.CombatUI).toBe(modules.CombatUI);
    expect(payload.featureRefs.title.showPendingClassProgressSummary).toBe(payload.showPendingClassProgressSummary);
    expect(payload.featureRefs.reward).toEqual({});
  });

  it('reads binding refs from the explicit legacy module bag when top-level compat aliases are non-enumerable', () => {
    const combatUi = { id: 'combat-ui' };
    const game = { id: 'game-root' };
    const modules = {
      legacyModules: {
        GAME: game,
        CombatUI: combatUi,
      },
      featureScopes: {
        core: { GAME: game },
        combat: { CombatUI: combatUi },
      },
    };
    Object.defineProperty(modules, 'GAME', {
      configurable: true,
      enumerable: false,
      get() {
        return modules.legacyModules.GAME;
      },
    });
    Object.defineProperty(modules, 'CombatUI', {
      configurable: true,
      enumerable: false,
      get() {
        return modules.legacyModules.CombatUI;
      },
    });

    const payload = buildBindingDepsPayload({ modules, fns: {}, deps: {} });

    expect(payload.GAME).toBe(game);
    expect(payload.CombatUI).toBe(combatUi);
    expect(payload.featureRefs.core.GAME).toBe(game);
    expect(payload.featureRefs.combat.CombatUI).toBe(combatUi);
  });
});
