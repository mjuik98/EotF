import { buildGameBindingRegistrars } from './build_game_binding_registrars.js';

export function registerGameBindings(modules, fns) {
  for (const registerBindingGroup of buildGameBindingRegistrars()) {
    registerBindingGroup(modules, fns);
  }
  return fns;
}
