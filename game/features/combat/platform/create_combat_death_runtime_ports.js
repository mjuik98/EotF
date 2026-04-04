import {
  resolveDeathRuntimeContext,
  showCombatDeathOutcome,
} from './death_runtime_ports.js';

export function createCombatDeathRuntimePorts(gs, deps = {}) {
  const runtime = resolveDeathRuntimeContext(deps);

  return {
    audioEngine: deps.audioEngine || runtime.win?.AudioEngine,
    doc: runtime.doc,
    selectFragment: deps.selectFragment || runtime.win?.selectFragment,
    showDeathScreen: deps.showDeathScreen || (() => showCombatDeathOutcome(gs, deps)),
    updateUI: deps.updateUI || runtime.win?.updateUI,
    win: runtime.win,
  };
}
