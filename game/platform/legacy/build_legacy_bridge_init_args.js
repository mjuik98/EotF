export function buildLegacyBridgeInitArgs({ modules }) {
  const legacyModules = modules?.legacyModules || modules || {};

  return [
    legacyModules.GS,
    legacyModules.DATA,
    legacyModules.AudioEngine,
    legacyModules.ParticleSystem,
  ];
}
