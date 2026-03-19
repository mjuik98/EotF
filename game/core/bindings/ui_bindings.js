import { createUiBindingCapabilities } from '../../features/ui/ports/public_binding_capabilities.js';
import { getModuleRegistryScope } from './module_registry_scopes.js';

export function createUIBindings(modules, fns) {
  const coreModules = getModuleRegistryScope(modules, 'core');
  const screenModules = getModuleRegistryScope(modules, 'screen');
  const bindings = createUiBindingCapabilities();
  const { actions, ports } = bindings.createUiBindingContext(modules, fns);
  const legacySwitchScreen = actions.switchScreen;

  actions.switchScreen = (screen) => {
    if (!coreModules.GS?.dispatch) {
      legacySwitchScreen?.(screen);
      return;
    }

    bindings.setScreenService({
      screenName: screen,
      gs: coreModules.GS,
      logger: null,
      screenUI: screenModules.ScreenUI,
      screenDeps: ports.getScreenDeps(),
      switchScreen: () => legacySwitchScreen?.(screen),
    });
  };

  Object.assign(fns, actions);
}
