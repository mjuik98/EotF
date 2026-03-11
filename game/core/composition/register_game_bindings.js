import { buildGameBindingRegistrars } from './build_game_binding_registrars.js';
import { executeGameBindingRegistrars } from './execute_game_binding_registrars.js';

export function registerGameBindings(modules, fns) {
  executeGameBindingRegistrars(modules, fns, buildGameBindingRegistrars());
  return fns;
}
