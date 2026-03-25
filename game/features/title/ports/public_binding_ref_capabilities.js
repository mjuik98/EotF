import { pickDefinedRefs } from '../../../shared/runtime/pick_defined_refs.js';

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
