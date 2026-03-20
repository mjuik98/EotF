import {
  resolveLegacyCompatValue,
} from './resolve_legacy_module_bag.js';

export function buildLegacyBridgeInitArgs({ modules }) {
  const legacyModules = modules?.legacyModules || modules || {};

  return [
    resolveLegacyCompatValue({ ...modules, legacyModules }, 'GS'),
    resolveLegacyCompatValue({ ...modules, legacyModules }, 'DATA'),
    resolveLegacyCompatValue({ ...modules, legacyModules }, 'AudioEngine'),
    resolveLegacyCompatValue({ ...modules, legacyModules }, 'ParticleSystem'),
  ];
}
