import {
  createRecentFeedMeta,
  formatRecentFeedStatusOutcome,
  formatRecentFeedText,
  getCurrentCardLogSource,
  LogUtils,
} from '../ports/combat_logging.js';

const DEFAULT_HELPERS = {
  createRecentFeedMeta,
  formatRecentFeedStatusOutcome,
  formatRecentFeedText,
  getCurrentCardLogSource,
  formatAttack: LogUtils.formatAttack,
  formatCardAttack: LogUtils.formatCardAttack,
  formatCardCritical: LogUtils.formatCardCritical,
  formatCardShield: LogUtils.formatCardShield,
  formatShield: LogUtils.formatShield,
  formatStatus: LogUtils.formatStatus,
};

export function logDealDamageResult(host, {
  enemyName,
  totalDamage,
  source = null,
  base = {},
  result = null,
  helpers = DEFAULT_HELPERS,
} = {}) {
  if (typeof host?.addLog !== 'function') return;

  if (source?.name) {
    const icon = source.type === 'trait' ? '[특성]' : (source.type === 'item' ? '[아이템]' : '[효과]');
    host.addLog(`${icon} [${source.name}] -> ${enemyName}: ${totalDamage} dmg`, 'damage', helpers.createRecentFeedMeta({
      source,
      text: helpers.formatRecentFeedText({
        sourceName: source.name,
        sourceType: source.type,
        targetName: enemyName,
        outcome: `${totalDamage} 피해`,
      }),
    }));
    return;
  }

  if (host._currentCard) {
    const recentFeedMeta = helpers.createRecentFeedMeta({
      source: helpers.getCurrentCardLogSource(host),
      text: helpers.formatRecentFeedText({
        sourceName: host._currentCard.name,
        sourceType: 'card',
        targetName: enemyName,
        outcome: `${totalDamage} 피해`,
      }),
    });
    const cardWasCrit = base.hasCritBuff || result?.isCrit;
    host.addLog(
      cardWasCrit
        ? helpers.formatCardCritical(host._currentCard.name, enemyName, totalDamage)
        : helpers.formatCardAttack(host._currentCard.name, enemyName, totalDamage),
      'card-log',
      recentFeedMeta,
    );
    return;
  }

  host.addLog(helpers.formatAttack('플레이어', enemyName, totalDamage), 'damage');
}

export function logShieldGainResult(host, {
  actual,
  source = null,
  helpers = DEFAULT_HELPERS,
} = {}) {
  if (typeof host?.addLog !== 'function') return;

  if (source?.name) {
    const icon = source.type === 'item' ? '🛡' : '✨';
    host.addLog(`${icon} ${source.name}: 방어막 +${actual}`, 'shield', helpers.createRecentFeedMeta({
      source,
      text: helpers.formatRecentFeedText({
        sourceName: source.name,
        sourceType: source.type,
        outcome: `방어막 +${actual}`,
      }),
    }));
    return;
  }

  if (host._currentCard) {
    host.addLog(helpers.formatCardShield(host._currentCard.name, actual), 'buff', helpers.createRecentFeedMeta({
      source: helpers.getCurrentCardLogSource(host),
      text: helpers.formatRecentFeedText({
        sourceName: host._currentCard.name,
        sourceType: 'card',
        outcome: `방어막 +${actual}`,
      }),
    }));
    return;
  }

  host.addLog(helpers.formatShield('플레이어', actual), 'shield');
}

export function logEnemyStatusResult(host, {
  enemyName,
  status,
  duration,
  helpers = DEFAULT_HELPERS,
} = {}) {
  host?.addLog?.(
    helpers.formatStatus(enemyName, status, duration),
    'echo',
    host?._currentCard
      ? helpers.createRecentFeedMeta({
        source: helpers.getCurrentCardLogSource(host),
        text: helpers.formatRecentFeedText({
          sourceName: host._currentCard.name,
          sourceType: 'card',
          targetName: enemyName,
          outcome: helpers.formatRecentFeedStatusOutcome(status, duration),
        }),
      })
      : null,
  );
}
