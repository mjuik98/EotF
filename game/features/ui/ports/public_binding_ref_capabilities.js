import { pickDefinedRefs } from './public_binding_ref_support_capabilities.js';

const UI_BINDING_REF_KEYS = Object.freeze([
  'ScreenUI',
  'switchScreen',
  'showDeckView',
  'closeDeckView',
  'openCodex',
  'closeCodex',
  'openSettings',
  'closeSettings',
  'closeRunSettings',
  'quitGame',
  'returnToGame',
  'finalizeRunOutcome',
]);

export function pickUiBindingRefs(refs = {}) {
  return pickDefinedRefs(refs, UI_BINDING_REF_KEYS);
}
