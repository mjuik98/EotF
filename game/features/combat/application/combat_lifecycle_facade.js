import { RunRules, getBaseRegionIndex, getRegionCount } from '../ports/public_run_rule_capabilities.js';
import { Actions } from '../ports/public_state_action_capabilities.js';
import {
  beginCombatResolution,
  completeCombatResolution,
  resetPlayerEchoChain,
  setBossRewardState,
  setCombatActive,
} from '../../../shared/state/runtime_session_commands.js';
import {
  Logger,
  LogUtils,
} from '../ports/combat_logging.js';
import {
  runCombatRewardTransition,
} from '../integration/combat_session_runtime_capabilities.js';
import {
  applyPassiveResonanceBurstState,
  syncCombatMaxChainState,
} from '../state/combat_chain_state_commands.js';
import { buildCombatEndItemTriggerPayload } from './combat_end_item_trigger_payload.js';
import {
  createPassiveResonanceBurstLogMeta,
  playResonanceBurstAudio,
  renderPassiveResonanceBurstHits,
  resolveErrorReporter,
  resolvePlayItemGet,
  resolveRuntimeHost,
} from './combat_lifecycle_runtime_support.js';

export const CombatLifecycle = {
  async endCombat(deps = {}) {
    const outcome = await runCombatRewardTransition({
      beforeCombatEndCleanup: (state, nextOutcome) => state.triggerItems?.(
        'combat_end',
        buildCombatEndItemTriggerPayload({
          isBoss: nextOutcome?.isBoss,
          victory: true,
        }),
      ),
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
      reportError: resolveErrorReporter(Logger, deps),
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
      this.drainEcho(50, deps);
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
    renderPassiveResonanceBurstHits(hitResults, this.combat.enemies.length, {
      ...deps,
      particleSystem,
    }, runtimeHost);
    const totalDealt = hitResults.reduce((sum, { dealt }) => sum + Math.max(0, Number(dealt || 0)), 0);

    this.addLog(
      LogUtils.formatEcho(`✨ 공명 폭발: ${totalDealt} 피해!`),
      'echo',
      createPassiveResonanceBurstLogMeta(totalDealt),
    );

    const renderCombatEnemies = deps.renderCombatEnemies || runtimeHost?.renderCombatEnemies;
    if (typeof renderCombatEnemies === 'function') renderCombatEnemies();
  },
};
