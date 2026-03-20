function getHostObject() {
  try {
    return Function('return this')();
  } catch {
    return globalThis;
  }
}

export function syncGlobalDepsFactoryHooks(hooks) {
  const host = getHostObject();
  if (!host) return;
  host.__ECHO_DEPS_FACTORY__ = hooks;
}
