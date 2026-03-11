import { Actions } from '../../core/state_actions.js';

export function setScreenService({
  screenName,
  gs,
  logger,
  screenUI,
  switchScreen,
}) {
  logger?.info?.(`[API] Screen change: ${gs.currentScreen} -> ${screenName}`);
  gs.dispatch(Actions.SCREEN_CHANGE, { screen: screenName });

  if (screenUI?.switchScreen) {
    screenUI.switchScreen(screenName, { gs });
    return;
  }

  switchScreen?.(screenName);
}
