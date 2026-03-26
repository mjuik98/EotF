import { pickDefinedRefs } from '../../ui/ports/public_binding_ref_support_capabilities.js';

const RUN_BINDING_REF_KEYS = Object.freeze([
  'RunRules',
  'MazeSystem',
  'RunModeUI',
  'RunSetupUI',
  'RunStartUI',
  'startGame',
  'continueRun',
  'continueLoadedRun',
  'returnToGame',
  'getRegionData',
  'getBaseRegionIndex',
  'getRegionCount',
]);

export function pickRunBindingRefs(refs = {}) {
  return pickDefinedRefs(refs, RUN_BINDING_REF_KEYS);
}
