import { collectCombatRuntimeDebugSnapshot } from '../../features/combat/ports/runtime_debug_snapshot.js';
import { collectRunRuntimeDebugSnapshot } from '../../features/run/ports/runtime_debug_snapshot.js';
import { collectTitleRuntimeDebugSnapshot } from '../../features/title/ports/runtime_debug_snapshot.js';
import { collectUiRuntimeDebugSnapshot } from '../../features/ui/ports/runtime_debug_snapshot.js';

export function collectFeatureRuntimeDebugSnapshots(options) {
  return {
    combat: collectCombatRuntimeDebugSnapshot(options),
    run: collectRunRuntimeDebugSnapshot(options),
    title: collectTitleRuntimeDebugSnapshot(options),
    ui: collectUiRuntimeDebugSnapshot(options),
  };
}
