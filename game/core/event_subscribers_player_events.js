import { EventBus } from './event_bus.js';
import { Actions } from './state_actions.js';
import {
  playReactionPlayerHit,
  playStatusHeal,
  playStatusSkill,
} from './audio_feedback_support_capabilities.js';

export function registerPlayerEventSubscribers(ctx) {
  EventBus.on(Actions.PLAYER_DAMAGE, ({ result, gs }) => {
    ctx.ui.HudUpdateUI?.updatePlayerStats?.(gs);

    const actualDamage = Number(result?.actualDamage || 0);
    const shieldAbsorbed = Number(result?.shieldAbsorbed || 0);

    if (actualDamage > 0) {
      ctx.ui.ScreenShake?.shake?.(8, 0.4);
      playReactionPlayerHit(ctx.ui.AudioEngine);
      ctx.ui.FeedbackUI?.showPlayerHitVignette?.();
    } else if (shieldAbsorbed > 0) {
      ctx.ui.ScreenShake?.shake?.(3, 0.15);
      playStatusSkill(ctx.ui.AudioEngine);
      ctx.ui.FeedbackUI?.showShieldBlockEffect?.();
    }

    if (gs.player.hp > 0 && gs.player.hp <= gs.player.maxHp * 0.25) {
      gs.showLowHpWarning?.({ doc: ctx.doc });
    }
  });

  EventBus.on(Actions.PLAYER_HEAL, ({ result, gs }) => {
    ctx.ui.HudUpdateUI?.updatePlayerStats?.(gs);
    if (result && result.healed > 0) {
      const width = Number(ctx.win?.innerWidth) || 1280;
      const height = Number(ctx.win?.innerHeight) || 720;
      ctx.ui.ParticleSystem?.healEffect?.(width / 2, height / 2);
      playStatusHeal(ctx.ui.AudioEngine);
    }
  });

  EventBus.on(Actions.PLAYER_SHIELD, ({ gs }) => {
    ctx.ui.HudUpdateUI?.updatePlayerStats?.(gs);
  });

  EventBus.on(Actions.PLAYER_GOLD, ({ result, gs }) => {
    ctx.ui.HudUpdateUI?.updatePlayerStats?.(gs);
    if (result && result.delta > 0) {
      ctx.createFloatingGold(result.delta);
    }
  });

  EventBus.on(Actions.PLAYER_ENERGY, ({ gs }) => {
    ctx.ui.HudUpdateUI?.updateCombatEnergy?.(gs);
  });

  EventBus.on(Actions.PLAYER_ECHO, () => {
    ctx.callAction('updateEchoSkillBtn');
  });

  EventBus.on(Actions.PLAYER_SILENCE, () => {
    ctx.callAction('updateUI');
    const updateNoiseWidget = ctx.ui.CombatHudUI?.updateNoiseWidget || ctx.resolveAction('updateNoiseWidget');
    if (typeof updateNoiseWidget === 'function') updateNoiseWidget();
  });

  EventBus.on(Actions.PLAYER_BUFF, () => {
    const updateStatusDisplay = ctx.ui.HudUpdateUI?.updateStatusDisplay || ctx.resolveAction('updateStatusDisplay');
    if (typeof updateStatusDisplay === 'function') updateStatusDisplay();
  });
}
