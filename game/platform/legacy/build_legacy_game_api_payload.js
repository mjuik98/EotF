import { buildLegacyGameApiActionGroups } from '../../shared/runtime/public.js';

export function buildLegacyGameApiPayload({ commandBindings, queryBindings }) {
  return {
    ...buildLegacyGameApiActionGroups(commandBindings),
    queryBindings,
  };
}
