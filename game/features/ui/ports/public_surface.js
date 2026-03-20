import { createUiBindingCapabilities } from './public_binding_capabilities.js';
import {
  createUiBrowserModuleCapabilities,
  ensureSettingsBrowserModules,
} from './public_browser_modules.js';
import { createUiContractCapabilities } from './public_contract_capabilities.js';
import { createUiModuleCapabilities } from './public_module_capabilities.js';
import { buildUiShellContractBuilders } from './contracts/build_ui_shell_contracts.js';
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
} from './runtime/public_ui_runtime_surface.js';

export function buildUiShellContractPublicBuilders(ctx) {
  return buildUiShellContractBuilders(ctx);
}

export const UiPublicSurface = Object.freeze({
  bindings: createUiBindingCapabilities(),
  browserModules: createUiBrowserModuleCapabilities(),
  contracts: createUiContractCapabilities(),
  moduleCapabilities: createUiModuleCapabilities(),
  runtime: createUiRuntimeCapabilities(),
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
