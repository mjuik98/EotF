import {
  buildCombatLegacyWindowQueryGroups,
} from '../../features/combat/platform/public_combat_legacy_surface.js';
import { buildLegacyWindowUiQueryGroups } from '../../features/ui/ports/runtime/public_ui_runtime_surface.js';

export function buildLegacyWindowUIQueryGroups(modules, fns, deps) {
  return {
    ...buildLegacyWindowUiQueryGroups({ modules, deps, fns }),
    ...buildCombatLegacyWindowQueryGroups(modules),
  };
}
