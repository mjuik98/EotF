import {
  buildCombatLegacyWindowQueryGroups,
} from '../../features/combat/public.js';
import { buildLegacyWindowUiQueryGroups } from '../../features/ui/public.js';

export function buildLegacyWindowUIQueryGroups(modules, fns, deps) {
  return {
    ...buildLegacyWindowUiQueryGroups({ modules, deps, fns }),
    ...buildCombatLegacyWindowQueryGroups(modules),
  };
}
