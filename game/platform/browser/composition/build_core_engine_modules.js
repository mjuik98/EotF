import { AudioEngine } from '../../../../engine/audio.js';
import { ParticleSystem } from '../../../../engine/particles.js';
import { ScreenShake } from '../../../../engine/screenshake.js';
import { HitStop } from '../../../../engine/hitstop.js';
import { FovEngine } from '../../../../engine/fov.js';
import { DATA } from '../../../../data/game_data.js';
import { NODE_META } from '../../../data/node_meta.js';
import { GS } from '../../../core/store/public.js';

export function buildCoreEngineModules() {
  return {
    AudioEngine,
    ParticleSystem,
    ScreenShake,
    HitStop,
    FovEngine,
    DATA,
    NODE_META,
    GS,
  };
}
