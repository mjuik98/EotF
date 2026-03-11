import { Logger } from '../../../utils/logger.js';
import { setScreenService } from '../../../app/system/screen_service.js';
import { getDefaultState, getModule, getRunRuntimeDeps } from './runtime_context.js';

export function setScreen(screenName, gs = getDefaultState()) {
  setScreenService({
    screenName,
    gs,
    logger: Logger,
    screenUI: getModule('ScreenUI'),
    switchScreen: (screen) => getRunRuntimeDeps().switchScreen?.(screen),
  });
}
