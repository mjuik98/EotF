import { collectCombatRuntimeDebugSnapshot } from '../../combat/ports/runtime_debug_snapshot.js';
import { collectRunRuntimeDebugSnapshot } from '../../run/ports/runtime_debug_snapshot.js';
import { collectTitleRuntimeDebugSnapshot } from '../../title/ports/runtime_debug_snapshot.js';
import { collectUiRuntimeDebugSnapshot } from './runtime_debug_snapshot.js';

export function collectFeatureRuntimeDebugSnapshots(options) {
  return {
    combat: collectCombatRuntimeDebugSnapshot(options),
    run: collectRunRuntimeDebugSnapshot(options),
    title: collectTitleRuntimeDebugSnapshot(options),
    ui: collectUiRuntimeDebugSnapshot(options),
  };
}
