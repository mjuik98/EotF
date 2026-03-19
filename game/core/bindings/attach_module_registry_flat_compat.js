export function attachModuleRegistryFlatCompat(target, legacyModules) {
  if (!target || !legacyModules || target === legacyModules) return target;

  for (const key of Object.keys(legacyModules)) {
    if (Object.prototype.hasOwnProperty.call(target, key)) continue;

    Object.defineProperty(target, key, {
      configurable: true,
      enumerable: false,
      get() {
        return legacyModules[key];
      },
      set(value) {
        legacyModules[key] = value;
      },
    });
  }

  return target;
}
