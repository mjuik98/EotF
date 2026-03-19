import {
  playCombatDamageFeedbackAudio,
} from '../../presentation/browser/feedback_ui_effects.js';

function createEnemyDamageHandler(ctx) {
  return ({ payload, result, gs }) => {
    if (result?.targetIdx === undefined) return;

    const enemy = gs?.combat?.enemies?.[result.targetIdx];
    if (!enemy) return;

    ctx.ui.CombatUI?.updateEnemyHpUI?.(result.targetIdx, enemy);

    const dmg = Number(result.actualDamage || 0);
    if (!(dmg > 0 || (payload && payload.amount > 0))) return;

    ctx.ui.HitStop?.trigger?.(8);
    const width = Number(ctx.win?.innerWidth) || 1280;
    const enemyCount = Number(gs?.combat?.enemies?.length || 0);
    const ex = width / 2 + (result.targetIdx - (enemyCount / 2 - 0.5)) * 180;
    const isCrit = !!payload?.isCrit || dmg > (enemy.hp + dmg) * 0.3;

    ctx.ui.ParticleSystem?.hitEffect?.(ex, 250, dmg > 20 || isCrit);

    const overlay = ctx.doc?.getElementById?.('hudOverlay');
    if (isCrit || dmg > 25) {
      playCombatDamageFeedbackAudio(ctx.ui.AudioEngine, { damage: dmg, isCrit });
      const critFlash = ctx.doc?.createElement?.('div');
      if (critFlash) {
        critFlash.className = 'crit-flash-overlay';
        overlay?.appendChild(critFlash);
        setTimeout(() => critFlash.remove(), 450);
      }
    } else if (dmg > 12) {
      playCombatDamageFeedbackAudio(ctx.ui.AudioEngine, { damage: dmg, isCrit });
      const heavyFlash = ctx.doc?.createElement?.('div');
      if (heavyFlash) {
        heavyFlash.className = 'heavy-hit-overlay';
        overlay?.appendChild(heavyFlash);
        setTimeout(() => heavyFlash.remove(), 500);
      }
    } else {
      playCombatDamageFeedbackAudio(ctx.ui.AudioEngine, { damage: dmg, isCrit });
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
  };
}

function createEnemyStatusHandler(ctx) {
  return () => {
    setTimeout(() => {
      ctx.callAction('renderCombatEnemies', true);
      ctx.callAction('updateUI');
    }, 300);
  };
}

function createCombatEndHandler(ctx) {
  return () => {
    ctx.callAction('updateUI');
    ctx.callAction('updateStatusDisplay');
  };
}

function createTurnStartHandler(ctx) {
  return ({ payload }) => {
    ctx.callAction('showTurnBanner', payload?.isPlayerTurn ? 'player' : 'enemy');
  };
}

export function createCombatEventSubscriberHandlers(ctx) {
  return {
    onEnemyDamage: createEnemyDamageHandler(ctx),
    onEnemyDeath: () => {
      // Enemy death visual flow is handled in combat methods.
    },
    onEnemyStatus: createEnemyStatusHandler(ctx),
    onCombatEnd: createCombatEndHandler(ctx),
    onTurnStart: createTurnStartHandler(ctx),
  };
}
