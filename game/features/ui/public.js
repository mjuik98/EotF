import { createUiActions } from './app/ui_actions.js';
import { buildUiRuntimeSubscriberActions } from './app/build_runtime_subscriber_actions.js';
import {
  buildLegacyGameApiRuntimeHudQueryGroups,
  buildLegacyWindowUiQueryGroups,
  createLegacyHudRuntimeQueryBindings,
} from './app/legacy_query_groups.js';
import { buildUiShellContractBuilders } from './ports/contracts/build_ui_shell_contracts.js';
import { createUiPorts } from './ports/create_ui_ports.js';

export function createUiBindingContext(modules, fns, options = {}) {
  const ports = createUiPorts(options);
  return {
    actions: createUiActions(modules, fns, ports),
    ports,
  };
}

export function createUiBindingsActions(modules, fns, options = {}) {
  return createUiBindingContext(modules, fns, options).actions;
}

export function buildUiRuntimeSubscriberPublicActions(fns) {
  return buildUiRuntimeSubscriberActions(fns);
}

export function buildUiShellContractPublicBuilders(ctx) {
  return buildUiShellContractBuilders(ctx);
}

export function createLegacyUiCommandFacade({
  getModule,
  getUiRuntimeDeps,
  getCombatRuntimeDeps,
  warn = console.warn,
}) {
  function callUiCommand(moduleName, methodName, warningLabel, depsFactory = getUiRuntimeDeps) {
    const module = getModule(moduleName);
    if (module?.[methodName]) {
      module[methodName](depsFactory());
      return;
    }
    warn(`[API] ${warningLabel} not available`);
  }

  return {
    toggleHudPin() {
      callUiCommand('CombatHudUI', 'toggleHudPin', 'CombatHudUI.toggleHudPin', getCombatRuntimeDeps);
    },

    closeDeckView() {
      callUiCommand('DeckModalUI', 'closeDeckView', 'DeckModalUI.closeDeckView');
    },

    closeCodex() {
      callUiCommand('CodexUI', 'closeCodex', 'CodexUI.closeCodex');
    },
  };
}

export {
  buildLegacyGameApiRuntimeHudQueryGroups,
  buildLegacyWindowUiQueryGroups,
  buildUiRuntimeSubscriberActions,
  buildUiShellContractBuilders,
  createUiActions,
  createLegacyHudRuntimeQueryBindings,
  createUiPorts,
};
