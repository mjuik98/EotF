import { attachLegacyWindowCommands } from './window_binding_commands.js';
import { attachLegacyWindowQueries } from './window_binding_queries.js';

export function buildLegacyWindowBindingSteps() {
  return [
    ({ root, fns }) => {
      attachLegacyWindowCommands(root, fns);
    },
    ({ root, modules, fns, deps }) => {
      attachLegacyWindowQueries(root, modules, fns, deps);
    },
  ];
}
