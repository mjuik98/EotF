import { pickDefinedRefs } from '../../ui/ports/public_shared_support_capabilities.js';

const TITLE_BINDING_REF_KEYS = Object.freeze([
  'ClassSelectUI',
  'CharacterSelectUI',
  'HelpPauseUI',
  'GameBootUI',
  'SettingsUI',
  'startGame',
  'getSelectedClass',
  'clearSelectedClass',
  'resetCharacterSelectState',
  'showPendingClassProgressSummary',
]);

export function pickTitleBindingRefs(refs = {}) {
  return pickDefinedRefs(refs, TITLE_BINDING_REF_KEYS);
}
