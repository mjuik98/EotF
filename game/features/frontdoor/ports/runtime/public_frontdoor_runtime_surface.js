import {
  buildCharacterSelectMountPayload,
  buildTitleBootPublicActions,
  ensureCharacterSelectShell,
  registerTitleBindings,
} from '../../../title/ports/runtime/public_title_runtime_surface.js';

export {
  buildCharacterSelectMountPayload,
  ensureCharacterSelectShell,
};
export const buildFrontdoorBootPublicActions = buildTitleBootPublicActions;
export const registerFrontdoorBindings = registerTitleBindings;

export function createFrontdoorRuntimeCapabilities() {
  return Object.freeze({
    buildBootActions: buildFrontdoorBootPublicActions,
    registerBindings: registerFrontdoorBindings,
    buildCharacterSelectMountPayload,
    ensureCharacterSelectShell,
  });
}
