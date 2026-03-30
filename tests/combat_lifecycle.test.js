import { afterEach, describe, expect, it, vi } from 'vitest';
import { CombatLifecycle } from '../game/features/combat/public.js';
import * as RunRuleSystem from '../game/features/run/ports/public_rule_capabilities.js';
import { ItemSystem } from '../game/shared/progression/item_system.js';
import { Reducers } from '../game/core/state_actions.js';

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

  it('attaches recent-feed metadata for passive resonance burst damage', () => {
    const host = {
      combat: {
        enemies: [{ hp: 30 }],
      },
      player: {
        echoChain: 5,
      },
      stats: {
        damageDealt: 0,
      },
      triggerItems: vi.fn((trigger, amount) => {
        if (trigger === 'resonance_burst') return amount;
        return null;
      }),
      addLog: vi.fn(),
      onEnemyDeath: vi.fn(),
    };

    CombatLifecycle.triggerResonanceBurst.call(host, {
      win: {
        innerWidth: 1440,
        AudioEngine: { playResonanceBurst: vi.fn() },
        ScreenShake: { shake: vi.fn() },
        ParticleSystem: { hitEffect: vi.fn() },
        showDmgPopup: vi.fn(),
        renderCombatEnemies: vi.fn(),
      },
    }, { isPassive: true });

    expect(host.addLog).toHaveBeenCalledWith(
      '✨ ✨ 공명 폭발: 5 피해!',
      'echo',
      expect.objectContaining({
        recentFeed: {
          eligible: true,
          text: '공명 폭발: 5 피해',
        },
      }),
    );
  });

  it('routes passive resonance burst hits through deal_damage item hooks', () => {
    const showDmgPopup = vi.fn();
    const host = {
      combat: {
        enemies: [{ hp: 30, isBoss: true }],
      },
      player: {
        echoChain: 5,
        items: ['god_slayer_blade'],
      },
      stats: {
        damageDealt: 0,
      },
      addLog: vi.fn(),
      onEnemyDeath: vi.fn(),
      triggerItems(trigger, data) {
        return ItemSystem.triggerItems(this, trigger, data);
      },
    };

    CombatLifecycle.triggerResonanceBurst.call(host, {
      win: {
        innerWidth: 1440,
        AudioEngine: { playResonanceBurst: vi.fn() },
        ScreenShake: { shake: vi.fn() },
        ParticleSystem: { hitEffect: vi.fn() },
        showDmgPopup,
        renderCombatEnemies: vi.fn(),
      },
    }, { isPassive: true });

    expect(host.combat.enemies[0].hp).toBe(23);
    expect(host.stats.damageDealt).toBe(7);
    expect(showDmgPopup).toHaveBeenCalledWith(7, expect.any(Number), 200, '#00ffcc');
    expect(host.addLog).toHaveBeenCalledWith(
      '✨ ✨ 공명 폭발: 7 피해!',
      'echo',
      expect.objectContaining({
        recentFeed: expect.objectContaining({
          text: '공명 폭발: 7 피해',
        }),
      }),
    );
  });

  it('runs combat_end relic cleanup before combat state teardown on victory', async () => {
    vi.useFakeTimers();

    const host = {
      combat: {
        active: true,
        enemies: [],
        playerTurn: true,
        turn: 1,
        log: [],
      },
      stats: {
        damageDealt: 0,
        damageTaken: 0,
      },
      player: {
        items: ['paradox_contract', 'titans_belt'],
        buffs: {},
        hand: [],
        graveyard: [],
        exhausted: [],
        drawPile: [],
        discardPile: [],
        drawCount: 0,
        silenceGauge: 0,
        timeRiftGauge: 0,
        energy: 3,
        maxEnergy: 3,
        hp: 40,
        maxHp: 40,
        echoChain: 0,
      },
      currentRegion: 0,
      currentNode: null,
      markDirty: vi.fn(),
      dispatch(action, payload = {}) {
        return Reducers[action]?.(this, payload);
      },
      triggerItems(trigger, data) {
        return ItemSystem.triggerItems(this, trigger, data);
      },
    };

    host.triggerItems('combat_start');
    expect(host.player.maxEnergy).toBe(4);
    expect(host.player.maxHp).toBe(55);

    const endCombatPromise = CombatLifecycle.endCombat.call(host, {
      runRules: { onCombatEnd: vi.fn() },
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
    });

    await vi.runAllTimersAsync();
    await endCombatPromise;

    expect(host.player.maxEnergy).toBe(3);
    expect(host.player.maxHp).toBe(40);
    expect(host.player.hp).toBe(40);
  });
});
