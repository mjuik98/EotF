import { describe, expect, it, vi } from 'vitest';

import {
  logDealDamageResult,
  logEnemyStatusResult,
  logShieldGainResult,
} from '../game/features/combat/application/damage_system_logging.js';

describe('damage_system_logging', () => {
  it('logs card damage with recent-feed metadata', () => {
    const host = {
      _currentCard: { id: 'strike', name: '강타' },
      addLog: vi.fn(),
    };

    logDealDamageResult(host, {
      enemyName: 'Shade',
      totalDamage: 10,
      source: null,
      base: { hasCritBuff: false },
      result: { isCrit: false },
      helpers: {
        createRecentFeedMeta: ({ text }) => ({ recentFeed: { eligible: true, text } }),
        formatRecentFeedText: ({ sourceName, targetName, outcome }) => `[${sourceName}] -> ${targetName}: ${outcome}`,
        getCurrentCardLogSource: () => ({ type: 'card', id: 'strike' }),
        formatCardCritical: () => 'critical',
        formatCardAttack: (cardName, enemyName, damage) => `🃏 [${cardName}] → ${enemyName}: ${damage} 피해`,
        formatAttack: () => 'fallback',
      },
    });

    expect(host.addLog).toHaveBeenCalledWith(
      '🃏 [강타] → Shade: 10 피해',
      'card-log',
      { recentFeed: { eligible: true, text: '[강타] -> Shade: 10 피해' } },
    );
  });

  it('logs shield gain and enemy status results through the shared helpers', () => {
    const host = {
      _currentCard: { id: 'guard', name: '수호' },
      addLog: vi.fn(),
    };
    const helpers = {
      createRecentFeedMeta: ({ text }) => ({ recentFeed: { eligible: true, text } }),
      formatRecentFeedText: ({ sourceName, outcome, targetName }) => [sourceName, targetName, outcome].filter(Boolean).join('|'),
      formatRecentFeedStatusOutcome: (status, duration) => `${status}:${duration}`,
      getCurrentCardLogSource: () => ({ type: 'card', id: 'guard' }),
      formatCardShield: (cardName, amount) => `🃏 [${cardName}]: 방어막 +${amount}`,
      formatShield: () => 'shield-fallback',
      formatStatus: (enemyName, status, duration) => `${enemyName}:${status}:${duration}`,
    };

    logShieldGainResult(host, { actual: 6, source: null, helpers });
    logEnemyStatusResult(host, {
      enemyName: 'Shade',
      status: '중독',
      duration: 2,
      helpers,
    });

    expect(host.addLog).toHaveBeenNthCalledWith(
      1,
      '🃏 [수호]: 방어막 +6',
      'buff',
      { recentFeed: { eligible: true, text: '수호|방어막 +6' } },
    );
    expect(host.addLog).toHaveBeenNthCalledWith(
      2,
      'Shade:중독:2',
      'echo',
      { recentFeed: { eligible: true, text: '수호|Shade|중독:2' } },
    );
  });
});
