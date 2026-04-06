import {
  showCombatDeathOutcome,
} from './death_runtime_ports.js';
import { createCombatDeathRuntimeHost } from './browser/death_runtime_host.js';

export function createCombatDeathRuntimePorts(gs, deps = {}) {
  const runtimeHost = createCombatDeathRuntimeHost(deps);

  return {
    audioEngine: runtimeHost.audioEngine,
    doc: runtimeHost.doc,
    selectFragment: runtimeHost.selectFragment,
    showDeathScreen: deps.showDeathScreen || (() => showCombatDeathOutcome(gs, deps)),
    updateUI: runtimeHost.updateUI,
    win: runtimeHost.win,
  };
}
