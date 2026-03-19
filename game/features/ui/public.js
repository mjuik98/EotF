import { createUiContractCapabilities } from './ports/public_contract_capabilities.js';
import { createUiBindingCapabilities } from './ports/public_binding_capabilities.js';
import {
  createUiBrowserModuleCapabilities,
  ensureSettingsBrowserModules,
} from './ports/public_browser_modules.js';
import { createUiModuleCapabilities } from './ports/public_module_capabilities.js';
import { buildUiShellContractBuilders } from './ports/contracts/build_ui_shell_contracts.js';
import {
  buildLegacyGameApiRuntimeHudQueryGroups,
  buildLegacyWindowUiQueryGroups,
  buildUiRuntimeSubscriberPublicActions,
  createLegacyHudRuntimeQueryBindings,
  createLegacyUiCommandFacade,
  createUiActions,
  createUiBindingContext,
  createUiBindingsActions,
  createUiPorts,
  createUiRuntimeCapabilities,
  setScreenService,
  showGameplayScreenService,
  showScreenService,
} from './ports/runtime/public_ui_runtime_surface.js';

export function buildUiShellContractPublicBuilders(ctx) {
  return buildUiShellContractBuilders(ctx);
}

export function createUiFeatureFacade() {
  return {
    browserModules: createUiBrowserModuleCapabilities(),
    bindings: createUiBindingCapabilities(),
    moduleCapabilities: createUiModuleCapabilities(),
    contracts: createUiContractCapabilities(),
    runtime: createUiRuntimeCapabilities(),
  };
}

export const UiPublicSurface = Object.freeze({
  createUiBindingCapabilities,
  createUiBrowserModuleCapabilities,
  createUiContractCapabilities,
  createUiFeatureFacade,
  createUiModuleCapabilities,
  createUiPorts,
  createUiRuntimeCapabilities,
  buildLegacyGameApiRuntimeHudQueryGroups,
  buildLegacyWindowUiQueryGroups,
  buildUiRuntimeSubscriberPublicActions,
  buildUiShellContractPublicBuilders,
  createLegacyHudRuntimeQueryBindings,
  createLegacyUiCommandFacade,
  createUiActions,
  createUiBindingContext,
  createUiBindingsActions,
  setScreenService,
  showGameplayScreenService,
  showScreenService,
});

export {
  buildLegacyGameApiRuntimeHudQueryGroups,
  buildLegacyWindowUiQueryGroups,
  buildUiRuntimeSubscriberPublicActions,
  buildUiShellContractBuilders,
  createUiBindingCapabilities,
  createUiBrowserModuleCapabilities,
  ensureSettingsBrowserModules,
  createLegacyUiCommandFacade,
  createUiActions,
  createUiBindingContext,
  createUiBindingsActions,
  createUiContractCapabilities,
  createLegacyHudRuntimeQueryBindings,
  createUiModuleCapabilities,
  createUiPorts,
  createUiRuntimeCapabilities,
  setScreenService,
  showGameplayScreenService,
  showScreenService,
};
