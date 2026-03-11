export function createEventPorts(depsFactory) {
  return {
    getEventDeps: () => depsFactory.getEventDeps(),
  };
}
