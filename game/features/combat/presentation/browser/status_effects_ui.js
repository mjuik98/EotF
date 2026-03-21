import { PLAYER_STATUS_FALLBACK_BUFF_KEYS } from '../../../../../data/status_key_data.js';
import { STATUS_KR } from '../../../../../data/status_effects_data.js';
import {
  getRawStatusStacks,
  getStatusDisplayValue,
  isInfiniteStatusDuration,
  resolveStatusEffectValue,
} from '../../../../utils/status_value_utils.js';
import { StatusTooltipUI } from './status_tooltip_builder.js';

function _getDoc(deps) { return deps?.doc || document; }
function _getGS(deps) { return deps?.gs; }
function _getWin(deps, doc = null) { return deps?.win || doc?.defaultView || null; }

function _isInfinitePlayerStatus(statusKey, buff, isBuff = true) {
  if (!isBuff) return false;
  return isInfiniteStatusDuration(statusKey, buff);
}

export function resolvePlayerStatusTooltipMetrics(statusKey, buff) {
  const stacks = getRawStatusStacks(buff);
  if (!Number.isFinite(stacks) || stacks <= 0) {
    return { duration: '-', stacks: '-' };
  }

  const isInfinite = isInfiniteStatusDuration(statusKey, buff, { allowDegradedSentinel: true });
  const effectStack = resolveStatusEffectValue(statusKey, buff);

  return {
    duration: isInfinite ? '무한' : `${Math.floor(stacks)}턴`,
    stacks: Number.isFinite(effectStack) && effectStack > 0
      ? String(effectStack)
      : String(Math.floor(stacks)),
  };
}

function _defaultSource(isBuff) {
  if (isBuff) {
    return { type: 'self', label: '자가 부여', name: '카드 / 유물', color: '#67e8cc' };
  }
  return { type: 'enemy', label: '적 부여', name: '전투 중 부여됨', color: '#e879a0' };
}

export const StatusEffectsUI = {
  getStatusMap() { return STATUS_KR; },

  updateStatusDisplay(deps = {}) {
    const gs = _getGS(deps);
    if (!gs?.player) return;

    const doc = _getDoc(deps);
    const win = _getWin(deps, doc);
    StatusTooltipUI.hide({ doc });

    const el = doc.getElementById(deps.statusContainerId || 'statusEffects');
    if (!el) return;

    const buffs = gs.player.buffs || {};
    const keys = Object.keys(buffs);

    const existingBadges = el.querySelectorAll('.hud-status-badge[data-buff-key]');
    const nextKeySet = new Set(keys);
    const removals = [];

    existingBadges.forEach((badge) => {
      if (nextKeySet.has(badge.dataset.buffKey)) return;
      badge.classList.add('badge-removing');
      removals.push(new Promise((resolve) => {
        let done = false;
        const finish = () => {
          if (done) return;
          done = true;
          badge.removeEventListener('animationend', finish);
          resolve();
        };
        badge.addEventListener('animationend', finish, { once: true });
        setTimeout(finish, 350);
      }));
    });

    const doRender = () => {
      el.textContent = '';

      if (!keys.length) {
        const none = doc.createElement('span');
        none.style.cssText = 'font-size:11px;color:var(--text-dim);font-style:italic;';
        none.textContent = '없음';
        el.appendChild(none);
        return;
      }

      const fragment = doc.createDocumentFragment();
      keys.forEach((statusKey, idx) => {
        const buff = buffs[statusKey];
        const info = STATUS_KR[statusKey];
        const isBuff = info
          ? info.buff
          : PLAYER_STATUS_FALLBACK_BUFF_KEYS.includes(statusKey);
        const isInfinite = _isInfinitePlayerStatus(statusKey, buff, isBuff);
        const label = info ? `${info.icon} ${info.name}` : statusKey;
        const rawStacks = getRawStatusStacks(buff);
        const displayVal = getStatusDisplayValue(statusKey, buff);

        const badge = doc.createElement('span');
        const typeClass = !isBuff
          ? 'status-debuff'
          : isInfinite
            ? 'status-buff-infinite'
            : 'status-buff';
        badge.className = `hud-status-badge ${typeClass}`;
        badge.dataset.buffKey = statusKey;
        badge.style.animationDelay = `${idx * 40}ms`;
        badge.appendChild(doc.createTextNode(label));

        const dmgBonus = (statusKey === 'resonance' || statusKey === 'acceleration') && buff?.dmgBonus
          ? ` +${buff.dmgBonus}`
          : '';
        if (dmgBonus) {
          badge.appendChild(doc.createTextNode(` ${dmgBonus}`));
        }

        if (isInfinite) {
          const infMark = doc.createElement('span');
          infMark.className = 'badge-inf-mark';
          infMark.textContent = '∞';
          badge.appendChild(infMark);
        } else if (Number.isFinite(rawStacks) && rawStacks > 0 && rawStacks < 99) {
          const chip = doc.createElement('span');
          chip.className = `badge-dur-chip${rawStacks <= 1 ? ' urgent' : ''}`;
          chip.textContent = displayVal || `${Math.floor(rawStacks)}턴`;
          badge.appendChild(chip);
        }

        const source = _defaultSource(isBuff);

        badge.addEventListener('mouseenter', (event) => {
          if (!info) return;
          StatusTooltipUI.show(event, statusKey, info, buff, {
            source,
            doc,
            win,
            statusContainerId: deps.statusContainerId || 'statusEffects',
          });
        });
        badge.addEventListener('mousemove', (event) => {
          const tipEl = doc.getElementById('statusTooltip');
          if (tipEl?.classList.contains('visible')) {
            StatusTooltipUI._position(event, tipEl, win);
          }
        });
        badge.addEventListener('mouseleave', () => {
          StatusTooltipUI.hide({ doc });
        });

        fragment.appendChild(badge);
      });

      el.appendChild(fragment);
    };

    if (removals.length) {
      Promise.all(removals).then(doRender);
    } else {
      doRender();
    }

    if (gs.combat?.active && typeof deps.refreshCombatInfoPanel === 'function') {
      deps.refreshCombatInfoPanel();
    }
  },
};
