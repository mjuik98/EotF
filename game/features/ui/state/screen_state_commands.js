import { Actions } from '../../../shared/state/public.js';

export function changeScreenState(gs, screenName) {
  if (!gs?.dispatch) return null;
  return gs.dispatch(Actions.SCREEN_CHANGE, { screen: screenName });
}
