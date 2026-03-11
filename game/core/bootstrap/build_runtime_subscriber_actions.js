import { buildRuntimeSubscriberActionGroups } from './build_runtime_subscriber_action_groups.js';

export function buildRuntimeSubscriberActions(fns) {
  const groups = buildRuntimeSubscriberActionGroups(fns);

  return {
    ...groups.gameplay,
    ...groups.shell,
  };
}
