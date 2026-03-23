import { RunRules, getBaseRegionIndex, getRegionCount } from '../../run/ports/public_rule_capabilities.js';
import { Actions } from '../../../core/store/state_actions.js';
import {
  beginCombatResolution,
  completeCombatResolution,
  resetPlayerEchoChain,
  setBossRewardState,
  setCombatActive,
} from '../../../shared/state/runtime_session_commands.js';
import {
  playEventResonanceBurst,
  playUiItemGet,
} from '../../../domain/audio/audio_event_helpers.js';
import {
  createRecentFeedMeta,
  formatRecentFeedText,
  LogUtils,
} from '../ports/combat_logging.js';
import {
  runEndCombatFlow,
} from './run_end_combat_flow_use_case.js';
import {
  applyPassiveResonanceBurstState,
  syncCombatMaxChainState,
} from '../state/combat_chain_state_commands.js';

const getDoc = (deps = {}) => deps.doc || document;
const getWin = (deps = {}) => deps.win || window;

export const CombatLifecycle = {
  async endCombat(deps = {}) {
    const win = getWin(deps);
    const doc = getDoc(deps);
    const outcome = await runEndCombatFlow({
      combatStateCommands: {
        beginResolution: beginCombatResolution,
        completeResolution: completeCombatResolution,
        setBossRewardState,
        setCombatActive,
      },
      deps: {
        ...deps,
        playItemGet: () => playUiItemGet(deps.audioEngine || win.AudioEngine),
      },
      dispatchCombatEnd: (state) => state.dispatch?.(Actions.COMBAT_END, { victory: true }),
      doc,
      getBaseRegionIndex,
      getRegionCount,
      gs: this,
      isEndlessRun: (state) => RunRules.isEndless(state),
      reportError: (error) => console.error('[endCombat] Error:', error),
      win,
    });

    if (outcome?.skipped || outcome?.error) return outcome;

    this.triggerItems('combat_end', { isBoss: outcome.isBoss });
    this.triggerItems('void_shard');
    return outcome;
  },

  updateChainDisplay(deps = {}) {
    const chain = this.player.echoChain;
    syncCombatMaxChainState(this, chain);
    const win = getWin(deps);
    const updateChainUI = deps.updateChainUI || win.updateChainUI;
    if (typeof updateChainUI === 'function') updateChainUI(chain);
    const audioEngine = deps.audioEngine || win.AudioEngine;
    if (chain > 0) audioEngine?.playChain?.(chain);

    if (chain >= 5 && chain % 5 === 0) {
      if (chain === 5 && typeof win.showChainAnnounce === 'function') {
        win.showChainAnnounce('RESONANCE BURST!!');
      }
      this.triggerResonanceBurst(deps, { isPassive: true });
    }
  },

  triggerResonanceBurst(deps = {}, options = {}) {
    const isPassive = !!options.isPassive;
    const win = getWin(deps);

    if (!isPassive) {
      resetPlayerEchoChain(this);
      this.drainEcho(50);
    }

    const audioEngine = deps.audioEngine || win.AudioEngine;
    const screenShake = deps.screenShake || win.ScreenShake;
    const particleSystem = deps.particleSystem || win.ParticleSystem;

    playEventResonanceBurst(audioEngine);

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
    });
    hitResults.forEach(({ index, dealt }) => {
      if (dealt <= 0) return;
      const x = win.innerWidth / 2 + (index - (this.combat.enemies.length - 1) / 2) * 200;
      const showDmgPopup = deps.showDmgPopup || win.showDmgPopup;
      if (typeof showDmgPopup === 'function') {
        showDmgPopup(burstDmg, x, 200, '#00ffcc');
      }

      if (isPassive && typeof particleSystem?.hitEffect === 'function') {
        particleSystem.hitEffect(x, 200, false);
      }
    });

    this.addLog(LogUtils.formatEcho(`✨ 공명 폭발: ${burstDmg} 피해!`), 'echo', createRecentFeedMeta({
      source: { name: '공명 폭발', type: 'skill' },
      text: formatRecentFeedText({
        sourceName: '공명 폭발',
        sourceType: 'skill',
        outcome: `${burstDmg} 피해`,
      }),
    }));

    const renderCombatEnemies = deps.renderCombatEnemies || win.renderCombatEnemies;
    if (typeof renderCombatEnemies === 'function') renderCombatEnemies();
  },
};
