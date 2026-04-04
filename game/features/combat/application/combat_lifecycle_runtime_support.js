import {
  createRecentFeedMeta,
  formatRecentFeedText,
} from '../ports/combat_logging.js';

export function resolveRuntimeHost(deps = {}) {
  return deps.win || deps.doc?.defaultView || null;
}

export function resolvePlayItemGet(deps = {}) {
  if (typeof deps.playItemGet === 'function') return deps.playItemGet;
  return () => deps.audioEngine?.playItemGet?.();
}

export function resolveErrorReporter(Logger, deps = {}) {
  if (typeof deps.reportError === 'function') return deps.reportError;
  return (error) => Logger.error('[endCombat] Error:', error);
}

export function playResonanceBurstAudio(audioEngine, deps = {}) {
  if (typeof deps.playEventResonanceBurst === 'function') {
    deps.playEventResonanceBurst(audioEngine);
    return;
  }
  audioEngine?.playResonanceBurst?.();
}

export function renderPassiveResonanceBurstHits(hitResults, enemyCount, deps = {}, runtimeHost = null) {
  const viewportWidth = Number(deps.viewportWidth || runtimeHost?.innerWidth || 0);
  const showDmgPopup = deps.showDmgPopup || runtimeHost?.showDmgPopup;
  const particleSystem = deps.particleSystem || runtimeHost?.ParticleSystem;

  hitResults.forEach(({ index, dealt }) => {
    if (dealt <= 0) return;
    const x = viewportWidth / 2 + (index - (enemyCount - 1) / 2) * 200;
    if (typeof showDmgPopup === 'function') {
      showDmgPopup(dealt, x, 200, '#00ffcc');
    }

    if (typeof particleSystem?.hitEffect === 'function') {
      particleSystem.hitEffect(x, 200, false);
    }
  });
}

export function createPassiveResonanceBurstLogMeta(totalDealt) {
  return createRecentFeedMeta({
    source: { name: '공명 폭발', type: 'skill' },
    text: formatRecentFeedText({
      sourceName: '공명 폭발',
      sourceType: 'skill',
      outcome: `${totalDealt} 피해`,
    }),
  });
}
