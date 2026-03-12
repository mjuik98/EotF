import { createUiBindingContext, setScreenService } from '../../features/ui/public.js';

export function createUIBindings(modules, fns) {
    const { actions, ports } = createUiBindingContext(modules, fns);
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
