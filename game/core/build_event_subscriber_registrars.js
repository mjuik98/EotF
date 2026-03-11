import { buildEventSubscriberRegistrarGroups } from './build_event_subscriber_registrar_groups.js';

export function buildEventSubscriberRegistrars() {
  const groups = buildEventSubscriberRegistrarGroups();

  return [
    ...groups.gameplay,
    ...groups.runtime,
  ];
}
