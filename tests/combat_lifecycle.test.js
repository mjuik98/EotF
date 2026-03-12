import { afterEach, describe, expect, it, vi } from 'vitest';
import { CombatLifecycle } from '../game/combat/combat_lifecycle.js';
import * as RunRuleSystem from '../game/systems/run_rules.js';

describe('CombatLifecycle', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('uses injected runRules on combat end', async () => {
    vi.useFakeTimers();

    const runRules = { onCombatEnd: vi.fn() };
    const showRewardScreen = vi.fn();
    const host = {
      combat: {
        active: true,
        enemies: [],
      },
      stats: {
        damageDealt: 0,
        damageTaken: 0,
      },
      player: {
        kills: 0,
        echoChain: 0,
      },
      currentRegion: 0,
      currentNode: null,
      dispatch: vi.fn(),
      triggerItems: vi.fn(),
    };

    const endCombatPromise = CombatLifecycle.endCombat.call(host, {
      runRules,
      doc: { getElementById: vi.fn(() => null) },
      win: {},
      tooltipUI: { hideTooltip: vi.fn() },
      cleanupAllTooltips: vi.fn(),
      hudUpdateUI: { resetCombatUI: vi.fn(), hideNodeOverlay: vi.fn() },
      updateChainUI: vi.fn(),
      renderHand: vi.fn(),
      renderCombatCards: vi.fn(),
      updateUI: vi.fn(),
      audioEngine: { playItemGet: vi.fn() },
      showCombatSummary: vi.fn(),
      showRewardScreen,
    });

    await vi.runAllTimersAsync();
    await endCombatPromise;

    expect(runRules.onCombatEnd).toHaveBeenCalledWith(host);
    expect(showRewardScreen).toHaveBeenCalledWith(false);
  });

  it('uses returnFromReward for endless last-region boss clears', async () => {
    vi.useFakeTimers();
    vi.spyOn(RunRuleSystem, 'getBaseRegionIndex').mockReturnValue(0);
    vi.spyOn(RunRuleSystem, 'getRegionCount').mockReturnValue(1);

    const runRules = { onCombatEnd: vi.fn() };
    const returnFromReward = vi.fn();
    const returnToGame = vi.fn();
    const host = {
      combat: {
        active: true,
        enemies: [{ isBoss: true }],
      },
      stats: {
        damageDealt: 0,
        damageTaken: 0,
      },
      player: {
        kills: 0,
        echoChain: 0,
      },
      currentRegion: 0,
      currentNode: { type: 'boss' },
      dispatch: vi.fn(),
      triggerItems: vi.fn(),
    };

    const endlessSpy = vi.spyOn(RunRuleSystem.RunRules, 'isEndless').mockReturnValue(true);

    const endCombatPromise = CombatLifecycle.endCombat.call(host, {
      runRules,
      doc: { getElementById: vi.fn(() => null) },
      win: {},
      tooltipUI: { hideTooltip: vi.fn() },
      cleanupAllTooltips: vi.fn(),
      hudUpdateUI: { resetCombatUI: vi.fn(), hideNodeOverlay: vi.fn() },
      updateChainUI: vi.fn(),
      renderHand: vi.fn(),
      renderCombatCards: vi.fn(),
      updateUI: vi.fn(),
      audioEngine: { playItemGet: vi.fn() },
      showCombatSummary: vi.fn(),
      showRewardScreen: vi.fn(),
      returnFromReward,
      returnToGame,
    });

    await vi.advanceTimersByTimeAsync(300);
    await endCombatPromise;

    expect(endlessSpy).toHaveBeenCalledWith(host);
    expect(returnFromReward).toHaveBeenCalledTimes(1);
    expect(returnToGame).not.toHaveBeenCalled();
  });
});
