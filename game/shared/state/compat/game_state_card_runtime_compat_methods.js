import { CardMethods } from '../../../features/combat/ports/public_game_state_runtime_capabilities.js';

export const CardGameStateRuntimeCompatMethods = new Proxy({}, {
  get(_target, prop) {
    return Reflect.get(CardMethods, prop);
  },
  ownKeys() {
    return Reflect.ownKeys(CardMethods);
  },
  getOwnPropertyDescriptor(_target, prop) {
    const descriptor = Object.getOwnPropertyDescriptor(CardMethods, prop);
    if (!descriptor) return undefined;
    return {
      ...descriptor,
      configurable: true,
    };
  },
});
