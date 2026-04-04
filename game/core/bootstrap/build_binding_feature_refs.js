import { buildFeatureBindingRefGroups } from '../composition/feature_binding_ref_catalog.js';

const CORE_BINDING_REF_KEYS = Object.freeze([
  'GAME',
  'GS',
  'AudioEngine',
  'ParticleSystem',
  'SaveSystem',
  'ScreenShake',
  'HitStop',
  'ButtonFeedback',
]);

export function buildBindingFeatureRefs(refs = {}) {
  const coreRefs = {};
  CORE_BINDING_REF_KEYS.forEach((key) => {
    if (refs[key] !== undefined) {
      coreRefs[key] = refs[key];
    }
  });

  return {
    core: coreRefs,
    ...buildFeatureBindingRefGroups(refs),
  };
}
