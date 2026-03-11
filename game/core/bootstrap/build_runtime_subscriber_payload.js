import { buildRuntimeSubscriberActions } from './build_runtime_subscriber_actions.js';

export function buildRuntimeSubscriberPayload({ modules, fns, doc, win }) {
  return {
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
    actions: buildRuntimeSubscriberActions(fns),
  };
}
