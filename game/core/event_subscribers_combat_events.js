import { EventBus } from './event_bus.js';
import { Actions } from './state_actions.js';
import {
  playAttackCritical,
  playAttackHeavy,
  playAttackSlash,
} from '../domain/audio/audio_event_helpers.js';

export function registerCombatEventSubscribers(ctx) {
  EventBus.on(Actions.ENEMY_DAMAGE, ({ payload, result, gs }) => {
    if (result?.targetIdx === undefined) return;

    const enemy = gs?.combat?.enemies?.[result.targetIdx];
    if (!enemy) return;

    ctx.ui.CombatUI?.updateEnemyHpUI?.(result.targetIdx, enemy);

    const dmg = Number(result.actualDamage || 0);
    if (!(dmg > 0 || (payload && payload.amount > 0))) return;

    ctx.ui.HitStop?.trigger?.(8);
    const width = Number(ctx.win?.innerWidth) || 1280;
    const ex = width / 2 + (result.targetIdx - (gs.combat.enemies.length / 2 - 0.5)) * 180;
    const isCrit = !!payload?.isCrit || dmg > (enemy.hp + dmg) * 0.3;

    ctx.ui.ParticleSystem?.hitEffect?.(ex, 250, dmg > 20 || isCrit);

    const overlay = ctx.doc?.getElementById?.('hudOverlay');
    if (isCrit || dmg > 25) {
      playAttackCritical(ctx.ui.AudioEngine);
      const critFlash = ctx.doc?.createElement?.('div');
      if (critFlash) {
        critFlash.className = 'crit-flash-overlay';
        overlay?.appendChild(critFlash);
        setTimeout(() => critFlash.remove(), 450);
      }
    } else if (dmg > 12) {
      playAttackHeavy(ctx.ui.AudioEngine);
      const heavyFlash = ctx.doc?.createElement?.('div');
      if (heavyFlash) {
        heavyFlash.className = 'heavy-hit-overlay';
        overlay?.appendChild(heavyFlash);
        setTimeout(() => heavyFlash.remove(), 500);
      }
    } else {
      playAttackSlash(ctx.ui.AudioEngine);
    }

    const enemyCard = ctx.doc?.getElementById?.(`enemy_${result.targetIdx}`);
    if (enemyCard) {
      enemyCard.classList.remove('enemy-hit-anim');
      void enemyCard.offsetWidth;
      enemyCard.classList.add('enemy-hit-anim');
      setTimeout(() => enemyCard.classList.remove('enemy-hit-anim'), 280);

      const flashEl = ctx.doc?.createElement?.('div');
      if (flashEl) {
        flashEl.className = 'enemy-dmg-flash';
        enemyCard.style.position = 'relative';
        enemyCard.appendChild(flashEl);
        setTimeout(() => flashEl.remove(), 350);
      }
    }

    ctx.ui.ScreenShake?.shake?.(dmg > 20 ? 6 : 3, 0.2);
    ctx.callAction('showDmgPopup', dmg, ex, 250);
  });

  EventBus.on(Actions.ENEMY_DEATH, () => {
    // Enemy death visual flow is handled in combat methods.
  });

  EventBus.on(Actions.ENEMY_STATUS, () => {
    setTimeout(() => {
      ctx.callAction('renderCombatEnemies', true);
      ctx.callAction('updateUI');
    }, 300);
  });

  EventBus.on(Actions.COMBAT_END, () => {
    ctx.callAction('updateUI');
    ctx.callAction('updateStatusDisplay');
  });

  EventBus.on(Actions.TURN_START, ({ payload }) => {
    ctx.callAction('showTurnBanner', payload?.isPlayerTurn ? 'player' : 'enemy');
  });
}
