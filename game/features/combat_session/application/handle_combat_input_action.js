import {
  INPUT_ACTION_DRAW_CARD,
  INPUT_ACTION_ECHO_SKILL,
  INPUT_ACTION_END_TURN,
  INPUT_ACTION_TARGET_CYCLE,
} from '../ports/public_input_capabilities.js';
import { setSelectedTarget } from '../ports/public_state_capabilities.js';

export function cycleNextCombatTarget(gs, deps = {}) {
  const enemies = gs?.combat?.enemies || [];
  const aliveIndices = enemies
    .map((enemy, idx) => (enemy.hp > 0 ? idx : -1))
    .filter((idx) => idx >= 0);

  if (aliveIndices.length <= 1) return false;

  const current = aliveIndices.indexOf(gs._selectedTarget ?? -1);
  const nextTarget = aliveIndices[(current + 1) % aliveIndices.length];
  setSelectedTarget(gs, nextTarget);
  if (typeof gs?.addLog === 'function') {
    gs.addLog(`🎯 대상: ${enemies[gs._selectedTarget].name}`, 'system');
  }
  if (typeof deps.renderCombatEnemies === 'function') {
    deps.renderCombatEnemies();
  }
  return true;
}

export function handleCombatInputAction(actionId, context = {}) {
  const {
    deps = {},
    event,
    gs,
    onTargetCycle,
    runHotkeyState = { allowsCombatHotkeys: false },
  } = context;

  if (!runHotkeyState.allowsCombatHotkeys) return false;

  if (actionId === INPUT_ACTION_ECHO_SKILL) {
    deps.useEchoSkill?.();
    return true;
  }

  if (actionId === INPUT_ACTION_DRAW_CARD) {
    event?.preventDefault?.();
    deps.drawCard?.();
    deps.buttonFeedback?.triggerDrawButton?.();
    return true;
  }

  if (actionId === INPUT_ACTION_END_TURN) {
    event?.preventDefault?.();
    deps.endPlayerTurn?.();
    return true;
  }

  if (actionId === INPUT_ACTION_TARGET_CYCLE) {
    event?.preventDefault?.();
    if (typeof onTargetCycle === 'function') {
      onTargetCycle(actionId, { ...context, deps, event, gs });
      return true;
    }

    return cycleNextCombatTarget(gs, deps);
  }

  return false;
}
