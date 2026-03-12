export { GAME, exposeGlobals } from './global_bridge_runtime.js';
export { registerLegacyBridge } from './register_legacy_bridge.js';
export { registerLegacyBridgeRuntime } from './register_legacy_bridge_runtime.js';
export { attachLegacyWindowBindings } from './window_bindings.js';
export {
  registerLegacyGameAPIBindings,
  registerLegacyGameModules,
} from './game_api_registry.js';
export {
  getLegacyFeatureDeps,
  getLegacyGameDeps,
  resolveLegacyAction,
} from './adapters/legacy_runtime_resolvers.js';
