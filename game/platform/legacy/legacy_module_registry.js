export function createLegacyModuleRegistry(target) {
  return {
    Modules: {},
    API: {},
    register(moduleName, moduleObj) {
      target.Modules[moduleName] = moduleObj;
      target._depsBase = null;
      if (moduleObj && moduleObj.api) {
        Object.assign(target.API, moduleObj.api);
      }
    },
  };
}
