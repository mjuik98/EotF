export function createBootstrapContext(
  options = {},
  { depsFactory, createModuleRegistry },
) {
  return {
    doc: options.doc || document,
    win: options.win || window,
    deps: options.deps || depsFactory,
    modules: createModuleRegistry(),
  };
}
