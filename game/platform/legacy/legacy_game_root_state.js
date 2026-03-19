import { getLegacyRoot } from './global_bridge_helpers.js';

export function createLegacyGameRootState(target) {
  return {
    State: null,
    Data: null,
    Audio: null,
    Particle: null,
    init(gs, data, audio, particle) {
      target.State = gs;
      target.Data = data;
      target.Audio = audio;
      target.Particle = particle;
      target._depsBase = null;

      const root = getLegacyRoot();
      if (!root) return;

      root.GS = gs;
      root.GameState = gs;
      root.DATA = data;
      root.GAME = target;
      root.AudioEngine = audio;
      root.ParticleSystem = particle;
    },
  };
}
