import { Actions } from '../../../core/store/state_actions.js';

export function changeScreenState(gs, screenName) {
  if (!gs?.dispatch) return null;
  return gs.dispatch(Actions.SCREEN_CHANGE, { screen: screenName });
}
