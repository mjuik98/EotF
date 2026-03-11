export function buildRuntimeSubscriberRefs({ modules, doc, win }) {
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
  };
}
