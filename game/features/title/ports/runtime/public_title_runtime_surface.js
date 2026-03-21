import { buildTitleBootActions } from '../../application/build_title_boot_actions.js';
import { createTitlePauseMenuActions } from '../../application/help_pause_menu_actions.js';
import { buildTitleHelpPauseActions } from '../../application/help_pause_title_actions.js';
import { buildCharacterSelectMountPayload } from '../../platform/browser/build_character_select_mount_payload.js';
import { createTitleActions } from '../../platform/browser/create_title_actions.js';
import { createTitleBindings } from '../../platform/browser/create_title_bindings.js';
import { ensureCharacterSelectShell } from '../../platform/browser/ensure_character_select_shell.js';
import { registerTitleBindings as registerTitleBrowserBindings } from '../../platform/browser/register_title_bindings.js';

export function createTitleRuntimeCapabilities() {
  return {
    buildBootActions: buildTitleBootPublicActions,
    buildHelpPauseActions: buildTitleHelpPausePublicActions,
    buildPauseMenuActions: buildTitlePauseMenuPublicActions,
  };
}

export function buildTitleBootPublicActions(fns) {
  return buildTitleBootActions(fns);
}

export function buildTitleHelpPausePublicActions(deps = {}) {
  return buildTitleHelpPauseActions(deps);
}

export function buildTitlePauseMenuPublicActions(options = {}) {
  return createTitlePauseMenuActions(options);
}

export function registerTitleBindings(options = {}) {
  return registerTitleBrowserBindings(options);
}

export { buildCharacterSelectMountPayload };
export { createTitleActions };
export { createTitleBindings };
export { ensureCharacterSelectShell };
