import { describe, expect, it } from 'vitest';

import { buildRuntimeSubscriberRefs } from '../game/core/bootstrap/build_runtime_subscriber_refs.js';

describe('buildRuntimeSubscriberRefs', () => {
  it('collects runtime subscriber UI and browser refs from modules', () => {
    const modules = {
      HudUpdateUI: { id: 'hud' },
      CombatHudUI: { id: 'combat-hud' },
      FeedbackUI: { id: 'feedback' },
      CombatUI: { id: 'combat' },
      StatusEffectsUI: { id: 'status' },
      AudioEngine: { id: 'audio' },
      ParticleSystem: { id: 'particles' },
      ScreenShake: { id: 'shake' },
      HitStop: { id: 'hit-stop' },
    };
    const doc = { body: {} };
    const win = { innerWidth: 1280 };

    expect(buildRuntimeSubscriberRefs({ modules, doc, win })).toEqual({
      HudUpdateUI: modules.HudUpdateUI,
      CombatHudUI: modules.CombatHudUI,
      FeedbackUI: modules.FeedbackUI,
      CombatUI: modules.CombatUI,
      StatusEffectsUI: modules.StatusEffectsUI,
      AudioEngine: modules.AudioEngine,
      ParticleSystem: modules.ParticleSystem,
      ScreenShake: modules.ScreenShake,
      HitStop: modules.HitStop,
      doc,
      win,
    });
  });
});
