import { setScreenService } from '../system/screen_service.js';
import { createUiActions } from '../../features/ui/app/ui_actions.js';
import { createUiPorts } from '../../features/ui/ports/create_ui_ports.js';

export function createUIBindings(modules, fns) {
    const ports = createUiPorts();
    const actions = createUiActions(modules, fns, ports);
    const legacySwitchScreen = actions.switchScreen;

    actions.switchScreen = (screen) => {
        if (!modules.GS?.dispatch) {
            legacySwitchScreen?.(screen);
            return;
        }

        setScreenService({
            screenName: screen,
            gs: modules.GS,
            logger: null,
            screenUI: modules.ScreenUI,
            screenDeps: ports.getScreenDeps(),
            switchScreen: () => legacySwitchScreen?.(screen),
        });
    };

    Object.assign(fns, actions);
}
