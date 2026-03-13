import { createTitleActions } from '../../app/create_title_actions.js';
import { createTitleBindingPorts } from './create_title_binding_ports.js';

export function createTitleBindings(modules, fns, options = {}) {
  return createTitleActions(createTitleBindingPorts(modules, fns, options));
}
