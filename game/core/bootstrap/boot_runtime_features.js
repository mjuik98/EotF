import { registerSubscribers } from '../event_subscribers.js';
import {
  buildGameBootPayload,
  configureMazeSystem,
  mountCharacterSelect,
  registerInitSequenceBindings,
  setupStorySystemBridge,
} from '../init_sequence_steps.js';
import { registerRuntimeDebugHooks } from './register_runtime_debug_hooks.js';

export function bootRuntimeFeatures({ modules, fns, deps, doc, win }) {
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

  const StorySystem = setupStorySystemBridge({ modules, deps });
  registerInitSequenceBindings({ game: modules.GAME, modules, fns });

  configureMazeSystem({
    mazeSystem: modules.MazeSystem,
    gs: modules.GS,
    fovEngine: modules.FovEngine,
    fns,
    doc,
    win,
  });

  setTimeout(() => {
    mountCharacterSelect({
      modules,
      deps,
      fns,
      doc,
    });
  }, 50);

  modules.exposeGlobals({
    _syncVolumeUI: () => modules.GameInit.syncVolumeUI(modules.AudioEngine),
  });

  registerRuntimeDebugHooks({
    modules,
    fns,
    doc,
    win,
  });

  try {
    modules.GameInit.boot(buildGameBootPayload({ modules, deps, fns }));
  } catch (e) {
    console.error('Critical Boot Error:', e);
  }

  return { StorySystem };
}
