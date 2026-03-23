import { EventBus } from '../../../core/event_bus.js';
import { Actions } from '../../../core/store/state_actions.js';
import {
  CombatGameData,
  playReactionEnemyDeath,
  playReactionPlayerDeath,
  playStatusHeal,
} from '../../../domain/combat/public_combat_runtime_capabilities.js';
import { getRegionData } from '../../run/ports/public_rule_capabilities.js';
import {
  registerEnemyKill,
  recordEnemyWorldKill,
  replaceCombatEnemies,
  scheduleCombatEnd,
  setCombatActive,
  syncSelectedTarget,
} from '../../../shared/combat/public_combat_runtime_effects.js';
import { applyEnemyDeathState } from './enemy_death_state.js';
import { handleEnemyDeathFlow } from './enemy_death_flow.js';
import { endCombatRuntime } from '../ports/public_application_capabilities.js';
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
    endCombat: (endCombatDeps) => endCombatRuntime(gs, endCombatDeps),
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
    deathQuotes: CombatGameData.deathQuotes,
    showDeathScreen: deps.showDeathScreen || (() => showCombatDeathScreen(gs, deps)),
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
