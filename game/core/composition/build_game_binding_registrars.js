import { buildGameBindingRegistrarGroups } from './build_game_binding_registrar_groups.js';

export function buildGameBindingRegistrars() {
  const groups = buildGameBindingRegistrarGroups();

  return [
    ...groups.gameplay,
    ...groups.shell,
  ];
}
