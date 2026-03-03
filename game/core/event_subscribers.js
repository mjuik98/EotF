import { EventBus } from './event_bus.js';
import { GAME } from './global_bridge.js';
import { Actions } from './state_actions.js';
import { CoreEvents } from './event_contracts.js';

let _ui = {};
let _actions = {};
let _doc = typeof document !== 'undefined' ? document : null;
let _win = typeof window !== 'undefined' ? window : null;

function _resolveAction(name) {
  const injected = _actions?.[name];
  if (typeof injected === 'function') return injected;

  const api = GAME.API?.[name];
  if (typeof api === 'function') return api;

  const globalFn = _win?.[name];
  if (typeof globalFn === 'function') return globalFn;

  return null;
}

function _callAction(name, ...args) {
  const fn = _resolveAction(name);
  if (!fn) return undefined;
  return fn(...args);
}

function _createFloatingGold(delta) {
  if (!_doc?.body) return;
  const el = _doc.createElement('div');
  el.style.cssText = `position:fixed;left:50%;top:${40 + Math.random() * 20}%;transform:translate(-50%,-50%);font-family:'Share Tech Mono',monospace;font-size:24px;font-weight:900;color:var(--gold);text-shadow:0 0 20px rgba(240,180,41,0.9);pointer-events:none;z-index:9500;animation:goldPop 1.4s ease forwards;`;
  el.textContent = `+${delta} Gold`;
  _doc.body.appendChild(el);
  setTimeout(() => el.remove(), 1400);
}

export function registerSubscribers(uiRefs = {}) {
  _ui = uiRefs || {};
  _actions = uiRefs.actions || {};
  _doc = uiRefs.doc || (typeof document !== 'undefined' ? document : null);
  _win = uiRefs.win || (typeof window !== 'undefined' ? window : null);

  EventBus.on(Actions.PLAYER_DAMAGE, ({ result, gs }) => {
    _ui.HudUpdateUI?.updatePlayerStats?.(gs);

    const actualDamage = Number(result?.actualDamage || 0);
    const shieldAbsorbed = Number(result?.shieldAbsorbed || 0);

    if (actualDamage > 0) {
      _ui.ScreenShake?.shake?.(8, 0.4);
      _ui.AudioEngine?.playPlayerHit?.();
      _ui.FeedbackUI?.showPlayerHitVignette?.();
    } else if (shieldAbsorbed > 0) {
      _ui.ScreenShake?.shake?.(3, 0.15);
      _ui.AudioEngine?.playSkill?.();
      _ui.FeedbackUI?.showShieldBlockEffect?.();
    }

    if (gs.player.hp > 0 && gs.player.hp <= gs.player.maxHp * 0.25) {
      gs.showLowHpWarning?.();
    }
  });

  EventBus.on(Actions.PLAYER_HEAL, ({ result, gs }) => {
    _ui.HudUpdateUI?.updatePlayerStats?.(gs);
    if (result && result.healed > 0) {
      const width = Number(_win?.innerWidth) || 1280;
      const height = Number(_win?.innerHeight) || 720;
      _ui.ParticleSystem?.healEffect?.(width / 2, height / 2);
      _ui.AudioEngine?.playHeal?.();
    }
  });

  EventBus.on(Actions.PLAYER_SHIELD, ({ gs }) => {
    _ui.HudUpdateUI?.updatePlayerStats?.(gs);
  });

  EventBus.on(Actions.PLAYER_GOLD, ({ result, gs }) => {
    _ui.HudUpdateUI?.updatePlayerStats?.(gs);
    if (result && result.delta > 0) {
      _createFloatingGold(result.delta);
    }
  });

  EventBus.on(Actions.PLAYER_ENERGY, ({ gs }) => {
    _ui.HudUpdateUI?.updateCombatEnergy?.(gs);
  });

  EventBus.on(Actions.PLAYER_ECHO, () => {
    _callAction('updateEchoSkillBtn');
  });

  EventBus.on(Actions.PLAYER_SILENCE, () => {
    _ui.HudUpdateUI?.updateUI?.(GAME.getDeps?.() || {});
    const updateNoiseWidget = _ui.CombatHudUI?.updateNoiseWidget || _resolveAction('updateNoiseWidget');
    if (typeof updateNoiseWidget === 'function') updateNoiseWidget();
  });

  EventBus.on(Actions.PLAYER_BUFF, () => {
    const updateStatusDisplay = _ui.HudUpdateUI?.updateStatusDisplay || _resolveAction('updateStatusDisplay');
    if (typeof updateStatusDisplay === 'function') updateStatusDisplay();
  });

  EventBus.on(Actions.CARD_DRAW, () => {
    GAME.Audio?.playCard?.();
    _callAction('renderHand');
    _callAction('renderCombatCards');
    _ui.HudUpdateUI?.triggerDrawCardAnimation?.();
  });

  EventBus.on(Actions.CARD_PLAY, ({ payload }) => {
    const { card } = payload || {};
    if (card) {
      const showCardPlayEffect = _ui.CombatUI?.showCardPlayEffect || _resolveAction('showCardPlayEffect');
      showCardPlayEffect?.(card);
    }
    _callAction('renderCombatCards');
  });

  EventBus.on(Actions.CARD_DISCARD, () => {
    _callAction('renderCombatCards');
  });

  EventBus.on(Actions.ENEMY_DAMAGE, ({ payload, result, gs }) => {
    if (result?.targetIdx === undefined) return;

    const enemy = gs?.combat?.enemies?.[result.targetIdx];
    if (!enemy) return;

    _ui.CombatUI?.updateEnemyHpUI?.(result.targetIdx, enemy);

    const dmg = Number(result.actualDamage || 0);
    if (!(dmg > 0 || (payload && payload.amount > 0))) return;

    _ui.HitStop?.trigger?.(8);
    const width = Number(_win?.innerWidth) || 1280;
    const ex = width / 2 + (result.targetIdx - (gs.combat.enemies.length / 2 - 0.5)) * 180;
    const isCrit = !!payload?.isCrit || dmg > (enemy.hp + dmg) * 0.3;

    _ui.ParticleSystem?.hitEffect?.(ex, 250, dmg > 20 || isCrit);

    const overlay = _doc?.getElementById?.('hudOverlay');
    if (isCrit || dmg > 25) {
      _ui.AudioEngine?.playCritical?.();
      const critFlash = _doc?.createElement?.('div');
      if (critFlash) {
        critFlash.className = 'crit-flash-overlay';
        overlay?.appendChild(critFlash);
        setTimeout(() => critFlash.remove(), 450);
      }
    } else if (dmg > 12) {
      _ui.AudioEngine?.playHeavyHit?.();
      const heavyFlash = _doc?.createElement?.('div');
      if (heavyFlash) {
        heavyFlash.className = 'heavy-hit-overlay';
        overlay?.appendChild(heavyFlash);
        setTimeout(() => heavyFlash.remove(), 500);
      }
    } else {
      _ui.AudioEngine?.playHit?.();
    }

    const enemyCard = _doc?.getElementById?.(`enemy_${result.targetIdx}`);
    if (enemyCard) {
      enemyCard.classList.remove('enemy-hit-anim');
      void enemyCard.offsetWidth;
      enemyCard.classList.add('enemy-hit-anim');
      setTimeout(() => enemyCard.classList.remove('enemy-hit-anim'), 280);

      const flashEl = _doc?.createElement?.('div');
      if (flashEl) {
        flashEl.className = 'enemy-dmg-flash';
        enemyCard.style.position = 'relative';
        enemyCard.appendChild(flashEl);
        setTimeout(() => flashEl.remove(), 350);
      }
    }

    _ui.ScreenShake?.shake?.(dmg > 20 ? 6 : 3, 0.2);
    _callAction('showDmgPopup', dmg, ex, 250);
  });

  EventBus.on(Actions.ENEMY_DEATH, () => {
    // Enemy death visual flow is handled in combat methods.
  });

  EventBus.on(Actions.ENEMY_STATUS, () => {
    setTimeout(() => {
      _callAction('renderCombatEnemies', true);
      _callAction('updateUI');
    }, 300);
  });

  EventBus.on(Actions.COMBAT_END, () => {
    _callAction('updateUI');
    _callAction('updateStatusDisplay');
  });

  EventBus.on(Actions.TURN_START, ({ payload }) => {
    _callAction('showTurnBanner', payload?.isPlayerTurn ? 'player' : 'enemy');
  });

  EventBus.on(Actions.SCREEN_CHANGE, () => {
    _callAction('updateUI');
  });

  EventBus.on(CoreEvents.LOG_ADD, () => {
    if (typeof GAME.API?.updateCombatLog === 'function') {
      GAME.API.updateCombatLog();
      return;
    }
    _callAction('updateCombatLog');
  });
}

export function clearSubscribers() {
  EventBus.clear();
}
