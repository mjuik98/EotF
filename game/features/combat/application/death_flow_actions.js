import { DATA } from '../../../../data/game_data.js';
import { EventBus } from '../../../core/event_bus.js';
import { registerEnemyKill } from '../../../systems/codex_records_system.js';
import { getRegionData } from '../../../systems/run_rules.js';
import { Actions } from '../../../shared/state/public.js';
import {
  recordEnemyWorldKill,
  replaceCombatEnemies,
  scheduleCombatEnd,
  setCombatActive,
  syncSelectedTarget,
} from '../../../state/commands/combat_runtime_commands.js';
import {
  playReactionEnemyDeath,
  playReactionPlayerDeath,
  playStatusHeal,
} from '../../../domain/audio/audio_event_helpers.js';
import { applyEnemyDeathState } from '../../../combat/death_handler_enemy_state.js';
import { handleEnemyDeathFlow } from '../../../combat/death_handler_enemy_death_flow.js';
import {
  createEnemyDeathRuntimePort,
  resolveDeathRuntimeContext,
  runCombatPlayerDeathSequence,
  showCombatDeathOutcome,
  spawnCombatEnemy,
} from '../platform/death_runtime_ports.js';
import {
  buildDeathFragmentChoices,
  renderDeathFragmentChoices,
} from '../presentation/browser/death_fragment_choice_presenter.js';

export function spawnEnemyForCombat(gs, deps = {}) {
  return spawnCombatEnemy(gs, {
    ...deps,
    getRegionData,
  });
}

export function handleCombatEnemyDeath(gs, enemy, idx, deps = {}) {
  const { win } = resolveDeathRuntimeContext(deps);
  const audioEngine = deps.audioEngine || win.AudioEngine;
  const { runtimePort } = createEnemyDeathRuntimePort(gs, {
    ...deps,
    replaceCombatEnemies,
    syncSelectedTarget,
  });

  return handleEnemyDeathFlow({
    enemy,
    gs,
    idx,
    applyEnemyDeath: (state, defeatedEnemy, enemyIdx) => applyEnemyDeathState(state, defeatedEnemy, enemyIdx, {
      addGold: (amount) => gs.addGold(amount, deps),
      addLog: (message, type) => gs.addLog(message, type),
      emitEnemyDeath: (payload) => EventBus.emit(Actions.ENEMY_DEATH, payload),
      isCombatEndScheduled: () => !!gs._endCombatScheduled,
      playEnemyDeath: () => playReactionEnemyDeath(audioEngine),
      recordEnemyWorldKill: (enemyId) => recordEnemyWorldKill(gs, enemyId),
      registerEnemyKill: (enemyId) => registerEnemyKill(gs, enemyId),
      scheduleCombatEnd: () => scheduleCombatEnd(gs),
      triggerItems: (trigger, payload) => gs.triggerItems(trigger, payload),
    }),
    runtimePort,
  });
}

export function handleCombatPlayerDeath(gs, deps = {}) {
  const { win } = resolveDeathRuntimeContext(deps);
  const audioEngine = deps.audioEngine || win.AudioEngine;
  const preDeathResult = gs.triggerItems?.('pre_death');

  if (preDeathResult === true) {
    playStatusHeal(audioEngine);
    const updateUI = deps.updateUI || win.updateUI;
    if (typeof updateUI === 'function') updateUI();
    return;
  }

  playReactionPlayerDeath(audioEngine);
  setCombatActive(gs, false);
  gs.triggerItems('death');

  runCombatPlayerDeathSequence(gs, {
    ...deps,
    deathQuotes: DATA.deathQuotes,
  });
}

export function showCombatDeathScreen(gs, deps = {}) {
  return showCombatDeathOutcome(gs, deps);
}

export function generateCombatDeathFragmentChoices(gs, deps = {}) {
  const { doc, win } = resolveDeathRuntimeContext(deps);
  const selectFragment = deps.selectFragment || win.selectFragment;
  const choices = buildDeathFragmentChoices();

  renderDeathFragmentChoices({
    choices,
    doc,
    onSelect: (effect) => selectFragment?.(effect),
  });

  return { gs, choices };
}
