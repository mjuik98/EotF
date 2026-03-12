import { ButtonFeedback } from '../../ports/hud_shared_view_ports.js';
import {
  showCombatSummaryToast,
  showItemToastQueued,
} from './feedback_ui_toasts.js';
import {
  enqueueWorldMemoryNotice,
  flushWorldMemoryNoticeQueue,
  showLegendaryAcquireOverlay,
} from './feedback_ui_notices.js';
import {
  showCardPlayEffectOverlay,
  showChainAnnounceEffect,
  showDmgPopupEffect,
  showNamedOverlay,
  showShieldBlockEffectOverlay,
} from './feedback_ui_effects.js';

function getDoc(deps) {
  return deps?.doc || document;
}

export const FeedbackUI = {
  showCombatSummary(dealt, taken, kills, deps = {}) {
    showCombatSummaryToast(dealt, taken, kills, deps);
  },

  showDmgPopup(dmg, x, y, color = '#ff3366', deps = {}) {
    showDmgPopupEffect(dmg, x, y, color, deps);
  },

  showEdgeDamage(deps = {}) {
    showNamedOverlay('screen-edge-damage', 500, deps);
  },

  showPlayerHitVignette(deps = {}) {
    showNamedOverlay('player-hit-vignette', 620, deps);
  },

  showShieldBlockEffect(deps = {}) {
    showShieldBlockEffectOverlay(deps);
  },

  showEchoBurstOverlay(deps = {}) {
    showNamedOverlay('echo-burst-overlay', 800, deps);
  },

  showCardPlayEffect(card, deps = {}) {
    showCardPlayEffectOverlay(card, deps);
  },

  showItemToast(item, deps = {}, options = {}) {
    if (!item) return;
    const forceQueue = options?.forceQueue === true;
    if (item.rarity === 'legendary' && !forceQueue) {
      this.showLegendaryAcquire(item, deps);
      return;
    }
    showItemToastQueued(item, deps, options);
  },

  showLegendaryAcquire(item, deps = {}) {
    showLegendaryAcquireOverlay(item, deps);
  },

  showChainAnnounce(text, deps = {}) {
    showChainAnnounceEffect(text, deps);
  },

  showWorldMemoryNotice(text, deps = {}) {
    enqueueWorldMemoryNotice(text, deps, (nextDeps) => this._flushNoticeQueue(nextDeps));
  },

  _flushNoticeQueue(deps = {}) {
    flushWorldMemoryNoticeQueue(deps, (nextDeps) => this._flushNoticeQueue(nextDeps));
  },

  triggerDrawButtonEffect(btnId = 'combatDrawCardBtn', deps = {}) {
    ButtonFeedback.triggerEffect(btnId, { doc: getDoc(deps) });
  },

  triggerEchoButtonEffect(btnId = 'useEchoSkillBtn', deps = {}) {
    ButtonFeedback.triggerEchoButton(getDoc(deps), btnId);
  },
};
