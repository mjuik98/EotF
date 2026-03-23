import { describe, expect, it, vi } from 'vitest';

import {
  buildCombatEndFlowPayload,
  createEnemyDeathRuntimePort,
  buildDeathEndingActions,
  lockCombatEndInputs,
  runCombatPlayerDeathSequence,
  runPlayerDeathSequence,
  scheduleCombatEndFlow,
} from '../game/features/combat/public.js';

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

  it('exposes reward return and ending action payload builders as pure helpers', () => {
    const win = {
      openCodex: vi.fn(),
      restartFromEnding: vi.fn(),
      returnFromReward: vi.fn(),
      returnToGame: vi.fn(),
      selectFragment: vi.fn(),
    };
    const payload = buildCombatEndFlowPayload({}, win);
    const endingActions = buildDeathEndingActions({}, win);

    payload.rewardActions.returnToGame(true);
    endingActions.restart();
    endingActions.selectFragment('echo_boost');
    endingActions.openCodex();

    expect(win.returnFromReward).toHaveBeenCalledTimes(1);
    expect(win.restartFromEnding).toHaveBeenCalledTimes(1);
    expect(win.selectFragment).toHaveBeenCalledWith('echo_boost');
    expect(win.openCodex).toHaveBeenCalledTimes(1);
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

  it('queues combat end through injected endCombat actions only', () => {
    const endCombat = vi.fn();
    const gs = {
      endCombat: vi.fn(),
      combat: { enemies: [] },
    };

    vi.useFakeTimers();
    try {
      const { runtimePort } = createEnemyDeathRuntimePort(gs, {
        doc: {
          getElementById: vi.fn(() => null),
        },
        endCombat,
        replaceCombatEnemies: vi.fn(),
        syncSelectedTarget: vi.fn(),
        win: {},
      });

      runtimePort.queueCombatEnd();
      vi.runAllTimers();

      expect(endCombat).toHaveBeenCalledTimes(1);
      expect(gs.endCombat).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });

  it('runs combat player death through injected showDeathScreen actions only', () => {
    const showDeathScreen = vi.fn();
    const gs = {
      showDeathScreen: vi.fn(),
    };

    vi.useFakeTimers();
    try {
      runCombatPlayerDeathSequence(gs, {
        deathQuotes: ['Remain as echo.'],
        doc: {
          body: {
            appendChild: vi.fn(),
            style: {},
          },
          createElement: vi.fn(() => ({
            style: {},
            appendChild: vi.fn(),
            remove: vi.fn(),
            textContent: '',
          })),
          getElementById: vi.fn(() => ({ classList: { remove: vi.fn() } })),
        },
        particleSystem: { deathEffect: vi.fn() },
        screenShake: { shake: vi.fn() },
        showDeathScreen,
        win: { innerHeight: 720, innerWidth: 1280 },
      });

      vi.runAllTimers();

      expect(showDeathScreen).toHaveBeenCalledTimes(1);
      expect(gs.showDeathScreen).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });
});
