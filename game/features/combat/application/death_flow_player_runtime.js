import {
  CombatDeathQuotes,
  playReactionPlayerDeath,
  playStatusHeal,
  setCombatActive,
} from './death_flow_runtime_support.js';
import {
  resolveDeathRuntimeContext,
  runCombatPlayerDeathSequence,
  showCombatDeathOutcome,
} from '../platform/death_runtime_ports.js';
import {
  buildDeathFragmentChoices,
  renderDeathFragmentChoices,
} from '../presentation/browser/death_fragment_choice_presenter.js';
import { buildCombatEndItemTriggerPayload } from './combat_end_item_trigger_payload.js';

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
  gs.triggerItems?.('combat_end', buildCombatEndItemTriggerPayload({
    isBoss: false,
    defeated: true,
  }));
  gs.triggerItems('death');

  runCombatPlayerDeathSequence(gs, {
    ...deps,
    deathQuotes: CombatDeathQuotes,
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
