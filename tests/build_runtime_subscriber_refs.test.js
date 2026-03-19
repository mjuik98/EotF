import { describe, expect, it } from 'vitest';

import { buildRuntimeSubscriberRefs } from '../game/core/bootstrap/build_runtime_subscriber_refs.js';

describe('buildRuntimeSubscriberRefs', () => {
  it('collects runtime subscriber UI and browser refs from modules', () => {
    const modules = {
      featureScopes: {
        core: {
          AudioEngine: { id: 'audio' },
          ParticleSystem: { id: 'particles' },
          ScreenShake: { id: 'shake' },
          HitStop: { id: 'hit-stop' },
        },
        combat: {
          HudUpdateUI: { id: 'hud' },
          CombatHudUI: { id: 'combat-hud' },
          FeedbackUI: { id: 'feedback' },
          CombatUI: { id: 'combat' },
          StatusEffectsUI: { id: 'status' },
        },
      },
    };
    const doc = { body: {} };
    const win = { innerWidth: 1280 };

    expect(buildRuntimeSubscriberRefs({ modules, doc, win })).toEqual({
      HudUpdateUI: modules.featureScopes.combat.HudUpdateUI,
      CombatHudUI: modules.featureScopes.combat.CombatHudUI,
      FeedbackUI: modules.featureScopes.combat.FeedbackUI,
      CombatUI: modules.featureScopes.combat.CombatUI,
      StatusEffectsUI: modules.featureScopes.combat.StatusEffectsUI,
      AudioEngine: modules.featureScopes.core.AudioEngine,
      ParticleSystem: modules.featureScopes.core.ParticleSystem,
      ScreenShake: modules.featureScopes.core.ScreenShake,
      HitStop: modules.featureScopes.core.HitStop,
      doc,
      win,
    });
  });

  it('prefers scoped registry modules for runtime subscriber refs', () => {
    const modules = {
      HudUpdateUI: { id: 'flat-hud' },
      CombatHudUI: { id: 'flat-combat-hud' },
      FeedbackUI: { id: 'flat-feedback' },
      CombatUI: { id: 'flat-combat' },
      StatusEffectsUI: { id: 'flat-status' },
      AudioEngine: { id: 'flat-audio' },
      ParticleSystem: { id: 'flat-particles' },
      ScreenShake: { id: 'flat-shake' },
      HitStop: { id: 'flat-hit-stop' },
      featureScopes: {
        core: {
          AudioEngine: { id: 'scoped-audio' },
          ParticleSystem: { id: 'scoped-particles' },
          ScreenShake: { id: 'scoped-shake' },
          HitStop: { id: 'scoped-hit-stop' },
        },
        combat: {
          HudUpdateUI: { id: 'scoped-hud' },
          CombatHudUI: { id: 'scoped-combat-hud' },
          FeedbackUI: { id: 'scoped-feedback' },
          CombatUI: { id: 'scoped-combat' },
          StatusEffectsUI: { id: 'scoped-status' },
        },
      },
    };
    const doc = { body: {} };
    const win = { innerWidth: 1280 };

    expect(buildRuntimeSubscriberRefs({ modules, doc, win })).toEqual({
      HudUpdateUI: modules.featureScopes.combat.HudUpdateUI,
      CombatHudUI: modules.featureScopes.combat.CombatHudUI,
      FeedbackUI: modules.featureScopes.combat.FeedbackUI,
      CombatUI: modules.featureScopes.combat.CombatUI,
      StatusEffectsUI: modules.featureScopes.combat.StatusEffectsUI,
      AudioEngine: modules.featureScopes.core.AudioEngine,
      ParticleSystem: modules.featureScopes.core.ParticleSystem,
      ScreenShake: modules.featureScopes.core.ScreenShake,
      HitStop: modules.featureScopes.core.HitStop,
      doc,
      win,
    });
  });
});
