import { buildCombatEndOutcome } from '../presentation/build_combat_end_outcome.js';
import {
  createCombatEndRuntimePorts,
} from '../platform/create_combat_end_runtime_ports.js';
import { endCombatUseCase } from './end_combat_use_case.js';

export function runEndCombatFlow({
  combatStateCommands,
  beforeCombatEndCleanup,
  deps = {},
  dispatchCombatEnd,
  doc,
  getBaseRegionIndex,
  getRegionCount,
  gs,
  isEndlessRun,
  reportError,
  win,
} = {}) {
  const buildOutcome = (state) => buildCombatEndOutcome(state, {
    getBaseRegionIndex,
    getRegionCount,
    isEndlessRun,
  });
  const runtimePorts = {
    ...createCombatEndRuntimePorts({ deps, doc, win }),
    ...(deps.combatEndRuntimePorts || {}),
  };

  return endCombatUseCase({
    audioPort: runtimePorts.audioPort,
    beforeCombatEndCleanup: beforeCombatEndCleanup || deps.beforeCombatEndCleanup,
    buildOutcome,
    clock: runtimePorts.clock,
    combatStateCommands,
    combatUiPort: runtimePorts.combatUiPort,
    dispatchCombatEnd,
    gs,
    onError: reportError,
    rewardFlowPort: runtimePorts.rewardFlowPort,
    runRules: deps.runRules,
  });
}
