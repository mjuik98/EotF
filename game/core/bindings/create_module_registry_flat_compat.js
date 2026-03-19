export function createModuleRegistryFlatCompat(groups) {
  return {
    ...groups.core,
    ...groups.title,
    ...groups.combat,
    ...groups.run,
    ...groups.screen,
  };
}
