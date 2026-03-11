export function createBindingSetupContext(modules, deps) {
  return {
    modules,
    deps,
    fns: {},
  };
}
