import { getLegacyRoot } from './global_bridge_helpers.js';

export function createLegacyApiCaller(target) {
  return {
    call(methodName, ...args) {
      const root = getLegacyRoot();
      if (typeof target.API[methodName] === 'function') {
        return target.API[methodName](...args);
      }
      if (typeof root?.[methodName] === 'function') {
        return root[methodName](...args);
      }
      console.warn(`[GAME] Method not found: ${methodName}`);
      return undefined;
    },
  };
}
