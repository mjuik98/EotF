import { CombatMethods } from '../../../features/combat/ports/public_game_state_runtime_capabilities.js';

export const CombatGameStateRuntimeCompatMethods = new Proxy({}, {
  get(_target, prop) {
    return Reflect.get(CombatMethods, prop);
  },
  ownKeys() {
    return Reflect.ownKeys(CombatMethods);
  },
  getOwnPropertyDescriptor(_target, prop) {
    const descriptor = Object.getOwnPropertyDescriptor(CombatMethods, prop);
    if (!descriptor) return undefined;
    return {
      ...descriptor,
      configurable: true,
    };
  },
});
