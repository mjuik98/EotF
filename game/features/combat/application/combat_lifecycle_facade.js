import { RunRules, getBaseRegionIndex, getRegionCount } from '../../run/ports/public_rule_capabilities.js';
import { Actions } from '../ports/public_state_action_capabilities.js';
import {
  beginCombatResolution,
  completeCombatResolution,
  resetPlayerEchoChain,
  setBossRewardState,
  setCombatActive,
} from '../../../shared/state/runtime_session_commands.js';
import {
  createRecentFeedMeta,
  formatRecentFeedText,
  Logger,
  LogUtils,
} from '../ports/combat_logging.js';
import {
  runCombatRewardTransition,
} from '../../combat_session/ports/runtime/public_combat_session_runtime_surface.js';
import {
  applyPassiveResonanceBurstState,
  syncCombatMaxChainState,
} from '../state/combat_chain_state_commands.js';

function resolveRuntimeHost(deps = {}) {
  return deps.win || deps.doc?.defaultView || null;
}

function resolvePlayItemGet(deps = {}) {
  if (typeof deps.playItemGet === 'function') return deps.playItemGet;
  return () => deps.audioEngine?.playItemGet?.();
}

function resolveErrorReporter(deps = {}) {
  if (typeof deps.reportError === 'function') return deps.reportError;
  return (error) => Logger.error('[endCombat] Error:', error);
}

function playResonanceBurstAudio(audioEngine, deps = {}) {
  if (typeof deps.playEventResonanceBurst === 'function') {
    deps.playEventResonanceBurst(audioEngine);
    return;
  }
  audioEngine?.playResonanceBurst?.();
}

export const CombatLifecycle = {
  async endCombat(deps = {}) {
    const outcome = await runCombatRewardTransition({
      beforeCombatEndCleanup: (state, nextOutcome) => state.triggerItems?.('combat_end', {
        isBoss: nextOutcome?.isBoss,
      }),
      combatStateCommands: {
        beginResolution: beginCombatResolution,
        completeResolution: completeCombatResolution,
        setBossRewardState,
        setCombatActive,
      },
      deps: {
        ...deps,
        playItemGet: resolvePlayItemGet(deps),
      },
      dispatchCombatEnd: (state) => state.dispatch?.(Actions.COMBAT_END, { victory: true }),
      doc: deps.doc || deps.win?.document || null,
      getBaseRegionIndex,
      getRegionCount,
      gs: this,
      isEndlessRun: (state) => RunRules.isEndless(state),
      reportError: resolveErrorReporter(deps),
      win: resolveRuntimeHost(deps),
    });

    if (outcome?.skipped || outcome?.error) return outcome;
    return outcome;
  },

  updateChainDisplay(deps = {}) {
    const chain = this.player.echoChain;
    syncCombatMaxChainState(this, chain);
    const runtimeHost = resolveRuntimeHost(deps);
    const updateChainUI = deps.updateChainUI || runtimeHost?.updateChainUI;
    if (typeof updateChainUI === 'function') updateChainUI(chain);
    const audioEngine = deps.audioEngine || runtimeHost?.AudioEngine;
    if (chain > 0) audioEngine?.playChain?.(chain);

    if (chain >= 5 && chain % 5 === 0) {
      const showChainAnnounce = deps.showChainAnnounce || runtimeHost?.showChainAnnounce;
      if (chain === 5 && typeof showChainAnnounce === 'function') {
        showChainAnnounce('RESONANCE BURST!!');
      }
      this.triggerResonanceBurst(deps, { isPassive: true });
    }
  },

  triggerResonanceBurst(deps = {}, options = {}) {
    const isPassive = !!options.isPassive;
    const runtimeHost = resolveRuntimeHost(deps);

    if (!isPassive) {
      resetPlayerEchoChain(this);
      this.drainEcho(50);
    }

    const audioEngine = deps.audioEngine || runtimeHost?.AudioEngine;
    const screenShake = deps.screenShake || runtimeHost?.ScreenShake;
    const particleSystem = deps.particleSystem || runtimeHost?.ParticleSystem;

    playResonanceBurstAudio(audioEngine, deps);

    if (isPassive) {
      screenShake?.shake?.(5, 0.3);
    } else {
      screenShake?.shake?.(15, 0.8);
    }

    let burstDmg = isPassive ? (this.player.echoChain || 0) : 0;
    if (!isPassive) return;

    const burstMod = this.triggerItems('resonance_burst', burstDmg);
    if (typeof burstMod === 'number' && Number.isFinite(burstMod)) {
      burstDmg = Math.max(0, Math.floor(burstMod));
    }

    const hitResults = applyPassiveResonanceBurstState(this, burstDmg, {
      onEnemyDeath: (enemy, index) => this.onEnemyDeath(enemy, index, deps),
      resolveDamage: ({ amount, index }) => this.triggerItems('deal_damage', {
        amount,
        source: 'resonance_burst',
        targetIdx: index,
      }),
    });
    const viewportWidth = Number(deps.viewportWidth || runtimeHost?.innerWidth || 0);
    const showDmgPopup = deps.showDmgPopup || runtimeHost?.showDmgPopup;
    hitResults.forEach(({ index, dealt }) => {
      if (dealt <= 0) return;
      const x = viewportWidth / 2 + (index - (this.combat.enemies.length - 1) / 2) * 200;
      if (typeof showDmgPopup === 'function') {
        showDmgPopup(dealt, x, 200, '#00ffcc');
      }

      if (isPassive && typeof particleSystem?.hitEffect === 'function') {
        particleSystem.hitEffect(x, 200, false);
      }
    });
    const totalDealt = hitResults.reduce((sum, { dealt }) => sum + Math.max(0, Number(dealt || 0)), 0);

    this.addLog(LogUtils.formatEcho(`✨ 공명 폭발: ${totalDealt} 피해!`), 'echo', createRecentFeedMeta({
      source: { name: '공명 폭발', type: 'skill' },
      text: formatRecentFeedText({
        sourceName: '공명 폭발',
        sourceType: 'skill',
        outcome: `${totalDealt} 피해`,
      }),
    }));

    const renderCombatEnemies = deps.renderCombatEnemies || runtimeHost?.renderCombatEnemies;
    if (typeof renderCombatEnemies === 'function') renderCombatEnemies();
  },
};
