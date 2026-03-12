import { describe, expect, it, vi } from 'vitest';

import {
  lockCombatEndInputs,
  runPlayerDeathSequence,
  scheduleCombatEndFlow,
} from '../game/combat/death_handler_runtime.js';

describe('death_handler_runtime', () => {
  it('locks combat action inputs while combat end is queued', () => {
    const inputs = [
      { disabled: false, style: {} },
      { disabled: false, style: {} },
    ];
    const doc = {
      querySelectorAll: vi.fn(() => inputs),
    };

    lockCombatEndInputs(doc);

    expect(inputs[0].disabled).toBe(true);
    expect(inputs[0].style.pointerEvents).toBe('none');
    expect(inputs[1].disabled).toBe(true);
    expect(inputs[1].style.pointerEvents).toBe('none');
  });

  it('builds endCombat deps through runtime fallbacks before invoking endCombat', () => {
    const schedule = vi.fn((callback) => callback());
    const cleanupAllTooltips = vi.fn();
    const renderCombatCards = vi.fn();
    const endCombat = vi.fn();
    const win = {
      HudUpdateUI: { name: 'hud' },
      TooltipUI: { name: 'tooltip' },
      returnFromReward: vi.fn(),
      returnToGame: vi.fn(),
      showCombatSummary: vi.fn(),
      showRewardScreen: vi.fn(),
      switchScreen: vi.fn(),
      updateUI: vi.fn(),
    };

    scheduleCombatEndFlow({
      deps: {
        cleanupAllTooltips,
        renderCombatCards,
      },
      endCombat,
      schedule,
      win,
    });

    expect(cleanupAllTooltips).toHaveBeenCalledTimes(1);
    expect(renderCombatCards).toHaveBeenCalledTimes(1);
    expect(endCombat).toHaveBeenCalledWith(expect.objectContaining({
      hudUpdateUI: win.HudUpdateUI,
      returnFromReward: expect.any(Function),
      showRewardScreen: win.showRewardScreen,
      tooltipUI: win.TooltipUI,
    }));

    endCombat.mock.calls[0][0].returnFromReward();
    expect(win.returnFromReward).toHaveBeenCalledTimes(1);
  });

  it('runs the death quote sequence and calls the completion callback', () => {
    const monoInner = {
      style: {},
      textContent: '',
    };
    const mono = {
      appendChild: vi.fn(),
      remove: vi.fn(),
      style: {},
    };
    const doc = {
      body: {
        appendChild: vi.fn(),
        style: {},
      },
      createElement: vi.fn((tag) => (tag === 'div' && doc.createElement.mock.calls.length === 1 ? mono : monoInner)),
    };
    const schedule = vi.fn((callback) => callback());
    const showDeathScreen = vi.fn();

    runPlayerDeathSequence({
      combatOverlay: { classList: { remove: vi.fn() } },
      deathQuotes: ['Remain as echo.'],
      doc,
      particleSystem: { deathEffect: vi.fn() },
      schedule,
      screenShake: { shake: vi.fn() },
      showDeathScreen,
      win: { innerHeight: 720, innerWidth: 1280 },
    });

    expect(doc.body.appendChild).toHaveBeenCalledWith(mono);
    expect(monoInner.textContent).toBe('Remain as echo.');
    expect(mono.remove).toHaveBeenCalledTimes(1);
    expect(showDeathScreen).toHaveBeenCalledTimes(1);
  });
});
