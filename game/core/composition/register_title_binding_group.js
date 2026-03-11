import { createTitleSettingsBindings } from '../bindings/title_settings_bindings.js';

export function registerTitleBindingGroup(modules, fns) {
  createTitleSettingsBindings(modules, fns);
}
