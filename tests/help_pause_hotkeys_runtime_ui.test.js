import { describe, expect, it, vi } from 'vitest';

import {
  cycleNextTarget,
  handleEscapeHotkey,
} from '../game/features/ui/public.js';

function createModalElement({ active = true } = {}) {
  return {
    hidden: false,
    style: {},
    classList: {
      contains: (name) => active && name === 'active',
    },
    remove: vi.fn(),
  };
}

function createDoc(elements = {}) {
  return {
    getElementById: (id) => elements[id] || null,
    defaultView: {
      getComputedStyle: (el) => ({
        display: el?.style?.display || 'block',
        visibility: 'visible',
        opacity: el?.classList?.contains?.('active') ? '1' : '0',
        pointerEvents: el?.classList?.contains?.('active') ? 'auto' : 'none',
      }),
    },
  };
}

describe('help_pause_hotkeys_runtime_ui', () => {
  it('cycles to the next living enemy target and triggers rerender', () => {
    const gs = {
      _selectedTarget: 0,
      combat: {
        enemies: [
          { name: 'A', hp: 5 },
          { name: 'B', hp: 0 },
          { name: 'C', hp: 7 },
        ],
      },
      addLog: vi.fn(),
    };
    const deps = { renderCombatEnemies: vi.fn() };

    cycleNextTarget(gs, deps);

    expect(gs._selectedTarget).toBe(2);
    expect(gs.addLog).toHaveBeenCalledWith('🎯 대상: C', 'system');
    expect(deps.renderCombatEnemies).toHaveBeenCalledTimes(1);
  });

  it('closes the visible pause menu before other escape handlers', () => {
    const swallowEscape = vi.fn();
    const ui = {
      togglePause: vi.fn(),
      toggleHelp: vi.fn(),
      isHelpOpen: vi.fn(() => false),
    };
    const event = { key: 'Escape' };
    const doc = createDoc({
      pauseMenu: createModalElement(),
    });

    const result = handleEscapeHotkey(event, {
      deps: { gs: { currentScreen: 'game', combat: { active: false } } },
      doc,
      gs: { currentScreen: 'game', combat: { active: false } },
      ui,
      swallowEscape,
    });

    expect(result).toBe(true);
    expect(swallowEscape).toHaveBeenCalledWith(event);
    expect(ui.togglePause).toHaveBeenCalledTimes(1);
  });
});
