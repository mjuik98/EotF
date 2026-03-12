import {
  buildLegacyGameApiActionGroups,
  composeLegacyGameApiPayload,
} from '../../shared/runtime/public.js';

export function buildLegacyGameApiPayload({ commandBindings, queryBindings }) {
  return composeLegacyGameApiPayload({
    actionGroups: buildLegacyGameApiActionGroups(commandBindings),
    queryBindings,
  });
}
