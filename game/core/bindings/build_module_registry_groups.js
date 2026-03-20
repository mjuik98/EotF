import { buildModuleRegistryGroupRegistrars } from './build_module_registry_group_registrars.js';

export function buildModuleRegistryGroups() {
  const registrars = buildModuleRegistryGroupRegistrars();

  return {
    core: registrars.foundation.core(),
    title: registrars.foundation.title(),
    codex: registrars.foundation.codex(),
    event: registrars.foundation.event(),
    reward: registrars.foundation.reward(),
    combat: registrars.gameplay.combat(),
    run: registrars.gameplay.run(),
    screen: registrars.shell.screen(),
  };
}
