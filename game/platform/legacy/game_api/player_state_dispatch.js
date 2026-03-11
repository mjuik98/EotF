export function dispatchPlayerAction(gs, action, payload) {
  if (typeof gs?.dispatch !== 'function') return null;
  return gs.dispatch(action, payload);
}
