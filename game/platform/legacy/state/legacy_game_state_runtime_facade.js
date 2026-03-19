import { CombatGameStateRuntimeMethods } from '../../../shared/state/game_state_runtime_methods.js';

const facadeCache = new WeakMap();

function bindMethod(target, receiver, prop) {
  const combatMethod = CombatGameStateRuntimeMethods[prop];
  if (typeof combatMethod === 'function') {
    return combatMethod.bind(receiver);
  }

  const value = Reflect.get(target, prop, receiver);
  return typeof value === 'function' ? value.bind(receiver) : value;
}

export function createLegacyGameStateRuntimeFacade(gs) {
  if (!gs || typeof gs !== 'object') return gs;
  if (facadeCache.has(gs)) return facadeCache.get(gs);

  const facade = new Proxy(gs, {
    get(target, prop, receiver) {
      if (Reflect.has(CombatGameStateRuntimeMethods, prop)) {
        return bindMethod(target, receiver, prop);
      }
      return bindMethod(target, receiver, prop);
    },
    set(target, prop, value, receiver) {
      return Reflect.set(target, prop, value, receiver);
    },
    has(target, prop) {
      return Reflect.has(CombatGameStateRuntimeMethods, prop) || Reflect.has(target, prop);
    },
    ownKeys(target) {
      return [...new Set([...Reflect.ownKeys(target), ...Reflect.ownKeys(CombatGameStateRuntimeMethods)])];
    },
    getOwnPropertyDescriptor(target, prop) {
      if (Reflect.has(target, prop)) return Object.getOwnPropertyDescriptor(target, prop);
      if (!Reflect.has(CombatGameStateRuntimeMethods, prop)) return undefined;
      return {
        configurable: true,
        enumerable: true,
        writable: false,
        value: CombatGameStateRuntimeMethods[prop],
      };
    },
  });

  facadeCache.set(gs, facade);
  return facade;
}
