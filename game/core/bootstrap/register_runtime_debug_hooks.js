import { createRuntimeDebugSnapshot } from './create_runtime_debug_snapshot.js';
import { buildRuntimeDebugHooks } from './build_runtime_debug_hooks.js';
import { getRuntimeMetrics } from '../runtime_metrics.js';
import { mountRuntimeDebugPanel } from './runtime_debug_panel_ui.js';

export { createRuntimeDebugSnapshot };

export function registerRuntimeDebugHooks({ modules, fns, doc, win }) {
  const hooks = buildRuntimeDebugHooks({
    modules,
    fns,
    doc,
    win,
    createSnapshot: createRuntimeDebugSnapshot,
  });

  modules?.exposeGlobals?.({
    render_game_to_text: hooks.render_game_to_text,
    advanceTime: hooks.advanceTime,
  });

  mountRuntimeDebugPanel({
    doc,
    win,
    hooks,
    readSnapshot: () => createRuntimeDebugSnapshot({ modules, doc, win }),
    getMetrics: () => getRuntimeMetrics({ topN: 3 }),
  });

  return hooks;
}
