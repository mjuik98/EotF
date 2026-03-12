import { Actions } from '../state_actions.js';

export function setScreenService({
  screenName,
  gs,
  logger,
  screenUI,
  screenDeps,
  switchScreen,
}) {
  logger?.info?.(`[API] Screen change: ${gs.currentScreen} -> ${screenName}`);
  gs.dispatch(Actions.SCREEN_CHANGE, { screen: screenName });

  if (screenUI?.switchScreen) {
    screenUI.switchScreen(screenName, { ...screenDeps, gs });
    return;
  }

  switchScreen?.(screenName);
}

function resolveLogger(deps = {}) {
  return deps.logger || deps.Logger || null;
}

function resolveScreenUI(deps = {}) {
  return deps.screenUI || deps.ScreenUI || null;
}

export function showScreenService(screenName, deps = {}) {
  const gs = deps.gs || deps.state || deps.State;
  const switchScreen = deps.switchScreen;

  if (!gs?.dispatch) {
    switchScreen?.(screenName);
    return;
  }

  return setScreenService({
    screenName,
    gs,
    logger: resolveLogger(deps),
    screenUI: resolveScreenUI(deps),
    screenDeps: deps.screenDeps,
    switchScreen,
  });
}

export function showGameplayScreenService(deps = {}) {
  return showScreenService('game', deps);
}
