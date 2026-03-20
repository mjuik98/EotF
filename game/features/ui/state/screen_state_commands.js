import { Actions } from '../../../core/store/state_actions.js';

function applyScreenChangeStateFallback(gs, screenName) {
  const prev = gs.currentScreen;
  gs.currentScreen = screenName;
  return { prev, current: screenName };
}

export function changeScreenState(gs, screenName) {
  if (gs?.dispatch) {
    return gs.dispatch(Actions.SCREEN_CHANGE, { screen: screenName });
  }
  if (!gs) return null;
  return applyScreenChangeStateFallback(gs, screenName);
}
