import { LEGACY_WINDOW_COMMAND_NAMES } from './window_binding_names.js';

export function attachLegacyWindowCommands(root, fns) {
  if (!root) return;
  LEGACY_WINDOW_COMMAND_NAMES.forEach((name) => {
    if (fns[name]) root[name] = fns[name];
  });
}
