import { createUiActions } from '../../platform/browser/ui_actions.js';
import { resolveUiActionModules } from '../../platform/browser/resolve_ui_action_modules.js';
import { buildUiRuntimeSubscriberActions } from '../../application/build_runtime_subscriber_actions.js';
import {
  buildLegacyGameApiRuntimeHudQueryGroups,
  buildLegacyWindowUiQueryGroups,
  createLegacyHudRuntimeQueryBindings,
} from '../../platform/browser/ui_legacy_query_groups.js';
import {
  setScreenService,
  showGameplayScreenService,
  showScreenService,
} from '../../application/screen_navigation_use_case.js';
import { createUiPorts } from '../create_ui_ports.js';

export function createUiRuntimeCapabilities() {
  return {
    buildSubscriberActions: buildUiRuntimeSubscriberPublicActions,
    buildLegacyGameApiQueryGroups: buildLegacyGameApiRuntimeHudQueryGroups,
    buildLegacyWindowQueryGroups: buildLegacyWindowUiQueryGroups,
    createLegacyHudQueries: createLegacyHudRuntimeQueryBindings,
    createLegacyUiCommands: createLegacyUiCommandFacade,
    createBindings: createUiBindingContext,
  };
}

export function createUiBindingContext(modules, fns, options = {}) {
  const ports = createUiPorts(options);
  const resolvedModules = resolveUiActionModules(modules);
  return {
    actions: createUiActions(resolvedModules, fns, ports),
    ports,
  };
}

export function createUiBindingsActions(modules, fns, options = {}) {
  return createUiBindingContext(modules, fns, options).actions;
}

export function buildUiRuntimeSubscriberPublicActions(fns) {
  return buildUiRuntimeSubscriberActions(fns);
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
  createLegacyHudRuntimeQueryBindings,
  createUiActions,
  createUiPorts,
  setScreenService,
  showGameplayScreenService,
  showScreenService,
};
