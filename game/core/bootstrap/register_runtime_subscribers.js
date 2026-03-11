import { registerSubscribers } from '../event_subscribers.js';

export function registerRuntimeSubscribers({ modules, fns, doc, win }) {
  registerSubscribers({
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
    actions: {
      renderHand: fns.renderHand,
      renderCombatCards: fns.renderCombatCards,
      updateEchoSkillBtn: fns.updateEchoSkillBtn,
      updateNoiseWidget: fns.updateNoiseWidget,
      updateStatusDisplay: fns.updateStatusDisplay,
      showCardPlayEffect: fns.showCardPlayEffect,
      showDmgPopup: fns.showDmgPopup,
      renderCombatEnemies: fns.renderCombatEnemies,
      updateUI: fns.updateUI,
      showTurnBanner: fns.showTurnBanner,
      updateCombatLog: fns.updateCombatLog,
    },
  });
}
