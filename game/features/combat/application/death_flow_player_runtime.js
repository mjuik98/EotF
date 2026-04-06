import {
  CombatDeathQuotes,
  playReactionPlayerDeath,
  playStatusHeal,
  setCombatActive,
} from './death_flow_runtime_support.js';
import {
  runCombatPlayerDeathSequence,
  showCombatDeathOutcome,
  createCombatDeathRuntimePorts,
} from '../integration/death_runtime_capabilities.js';
import {
  buildDeathFragmentChoices,
  renderDeathFragmentChoices,
} from '../presentation/browser/death_fragment_choice_presenter.js';
import { buildCombatEndItemTriggerPayload } from './combat_end_item_trigger_payload.js';

export function handleCombatPlayerDeath(gs, deps = {}) {
  const runtimePorts = {
    ...createCombatDeathRuntimePorts(gs, deps),
    ...(deps.deathRuntimePorts || {}),
  };
  const audioEngine = runtimePorts.audioEngine;
  const preDeathResult = gs.triggerItems?.('pre_death');

  if (preDeathResult === true) {
    playStatusHeal(audioEngine);
    runtimePorts.updateUI?.();
    return;
  }

  playReactionPlayerDeath(audioEngine);
  setCombatActive(gs, false);
  gs.triggerItems?.('combat_end', buildCombatEndItemTriggerPayload({
    isBoss: false,
    defeated: true,
  }));
  gs.triggerItems('death');

  runCombatPlayerDeathSequence(gs, {
    ...deps,
    deathQuotes: CombatDeathQuotes,
    showDeathScreen: runtimePorts.showDeathScreen || (() => showCombatDeathScreen(gs, deps)),
  });
}

export function showCombatDeathScreen(gs, deps = {}) {
  return showCombatDeathOutcome(gs, deps);
}

export function generateCombatDeathFragmentChoices(gs, deps = {}) {
  const runtimePorts = {
    ...createCombatDeathRuntimePorts(gs, deps),
    ...(deps.deathRuntimePorts || {}),
  };
  const choices = buildDeathFragmentChoices();

  renderDeathFragmentChoices({
    choices,
    doc: runtimePorts.doc,
    onSelect: (effect) => runtimePorts.selectFragment?.(effect),
  });

  return { gs, choices };
}
