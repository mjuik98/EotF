import { Particle, getParticleCount } from './character_particle_model.js';
import { createCharacterParticleRuntimeFactory } from './character_particle_runtime.js';

export function createCharacterParticleRuntime(options = {}) {
  return createCharacterParticleRuntimeFactory({ Particle, getParticleCount }, options);
}
