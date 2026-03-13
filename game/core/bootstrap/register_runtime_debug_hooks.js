import { createRuntimeDebugSnapshot } from './create_runtime_debug_snapshot.js';
import { buildRuntimeDebugHooks } from './build_runtime_debug_hooks.js';

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

  return hooks;
}
