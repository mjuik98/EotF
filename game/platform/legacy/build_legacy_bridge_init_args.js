export function buildLegacyBridgeInitArgs({ modules }) {
  return [
    modules.GS,
    modules.DATA,
    modules.AudioEngine,
    modules.ParticleSystem,
  ];
}
