import { createUIBindings } from '../bindings/ui_bindings.js';

export function registerScreenBindingGroup(modules, fns) {
  createUIBindings(modules, fns);
}
