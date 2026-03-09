import { Actions } from '../state_action_types.js';

export const SystemReducers = {
  [Actions.SCREEN_CHANGE](gs, { screen }) {
    const prev = gs.currentScreen;
    gs.currentScreen = screen;
    return { prev, current: screen };
  },
};
