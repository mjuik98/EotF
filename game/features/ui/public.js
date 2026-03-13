import { createUiContractCapabilities } from './ports/contracts/public_ui_contract_capabilities.js';
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
import { buildScreenOverlayBrowserModules } from './platform/browser/screen_overlay_browser_modules.js';
import { buildScreenPrimaryBrowserModules } from './platform/browser/screen_primary_browser_modules.js';

export function buildUiShellContractPublicBuilders(ctx) {
  return buildUiShellContractBuilders(ctx);
}

export function createUiModuleCapabilities() {
  return {
    primary: buildScreenPrimaryBrowserModules(),
    overlays: buildScreenOverlayBrowserModules(),
  };
}

export function createUiFeatureFacade() {
  return {
    moduleCapabilities: createUiModuleCapabilities(),
    contracts: createUiContractCapabilities(),
    runtime: createUiRuntimeCapabilities(),
  };
}

export {
  buildLegacyGameApiRuntimeHudQueryGroups,
  buildLegacyWindowUiQueryGroups,
  buildUiRuntimeSubscriberPublicActions,
  buildUiShellContractBuilders,
  buildScreenOverlayBrowserModules,
  buildScreenPrimaryBrowserModules,
  createLegacyUiCommandFacade,
  createUiActions,
  createUiBindingContext,
  createUiBindingsActions,
  createUiContractCapabilities,
  createLegacyHudRuntimeQueryBindings,
  createUiPorts,
  createUiRuntimeCapabilities,
  setScreenService,
  showGameplayScreenService,
  showScreenService,
};
