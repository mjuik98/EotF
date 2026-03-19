export function resolveLegacyModuleBag(modules) {
  return modules?.legacyModules || modules || {};
}

export function resolveLegacyGameRoot(modules) {
  return resolveLegacyModuleBag(modules)?.GAME || modules?.GAME || null;
}

export function resolveLegacyApiRoot(modules) {
  return resolveLegacyGameRoot(modules)?.API || null;
}
