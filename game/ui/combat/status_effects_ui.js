/**
 * status_effects_ui.js - player status badge UI
 */

import { StatusTooltipUI } from './status_tooltip_builder.js';
import { INFINITE_DURATION_STATUS_KEYS, PLAYER_STATUS_FALLBACK_BUFF_KEYS } from '../../../data/status_key_data.js';

const STATUS_KR = {
  resonance: { name: '공명', icon: '🎵', buff: true, desc: '카드 사용 시 공격 피해 보너스가 누적됩니다.' },
  acceleration: { name: '가속', icon: '⚡', buff: true, desc: '이번 공격 피해가 증가하고 연계 효과를 강화합니다.' },

  mirror: { name: '반사막', icon: '🪞', buff: true, desc: '받은 피해를 적에게 그대로 반사합니다.' },
  time_warp: { name: '시간 왜곡', icon: '⏳', buff: true, desc: '매 턴 추가 에너지를 획득합니다.' },
  time_warp_plus: { name: '시간 왜곡+', icon: '⌛', buff: true, desc: '매 턴 더 많은 추가 에너지를 획득합니다.' },

  vanish: { name: '은신', icon: '🌫', buff: true, desc: '다음 공격이 치명타가 됩니다.' },
  shadow_atk: { name: '그림자 강화', icon: '🌒', buff: true, desc: '다음 공격 피해가 증가합니다.' },
  dodge: { name: '회피', icon: '💨', buff: true, desc: '다음 공격을 완전히 회피합니다.' },

  focus: { name: '집중', icon: '🎯', buff: true, desc: '다음 공격이 치명타가 됩니다.' },
  critical_turn: { name: '치명 턴', icon: '💥', buff: true, desc: '이번 턴 모든 공격이 치명타가 됩니다.' },
  lifesteal: { name: '흡혈', icon: '🩸', buff: true, desc: '가한 피해 비율만큼 체력을 회복합니다.' },
  spike_shield: { name: '가시 방패', icon: '🌵', buff: true, desc: '이번 턴 적 공격을 반사하고 무효화합니다.' },
  immune: { name: '무적', icon: '🔰', buff: true, desc: '모든 피해와 상태 이상을 무시합니다.' },
  soul_armor: { name: '영혼 갑옷', icon: '🛡', buff: true, desc: '받는 피해를 줄이고 잔향을 회복합니다.' },
  zeroCost: { name: '무소모', icon: '0', buff: true, desc: '카드 비용이 0이 됩니다.' },
  strength: { name: '힘', icon: '💪', buff: true, desc: '가하는 피해가 증가합니다.' },
  dexterity: { name: '민첩', icon: '🤸', buff: true, desc: '얻는 방어막 수치가 증가합니다.' },
  echo_on_hit: { name: '타격 잔향', icon: '🎶', buff: true, desc: '공격 적중 시 추가 잔향을 획득합니다.' },

  blessing_of_light: { name: '빛의 축복', icon: '☀️', buff: true, desc: '매 턴 체력을 회복합니다.' },
  blessing_of_light_plus: { name: '빛의 축복+', icon: '🌞', buff: true, desc: '매 턴 더 많은 체력을 회복합니다.' },
  divine_grace: { name: '신의 은총', icon: '🙏', buff: true, desc: '방어막과 잔향을 동시에 획득합니다.' },
  divine_aura: { name: '신성 오라', icon: '😇', buff: true, desc: '턴 종료 시 방어막을 획득합니다.' },
  protection: { name: '보호', icon: '🧱', buff: true, desc: '다음에 받는 피해를 크게 줄입니다.' },
  endure_buff: { name: '인내', icon: '🪨', buff: true, desc: '다음 턴 공격 피해가 강화됩니다.' },

  berserk_mode: { name: '광전사의 격노', icon: '😡', buff: true, desc: '공격할수록 피해가 영구 누적됩니다.' },
  berserk_mode_plus: { name: '광전사의 격노+', icon: '🤬', buff: true, desc: '공격할수록 더 큰 피해가 영구 누적됩니다.' },
  echo_berserk: { name: '에코 광폭', icon: '⚔️', buff: true, desc: '잔향 스킬 발동 시 영구 공격 보너스를 얻습니다.' },

  unbreakable_wall: { name: '불굴의 벽', icon: '🧱', buff: true, desc: '턴 시작 시 방어막 비례 피해를 가합니다.' },
  unbreakable_wall_plus: { name: '불굴의 벽+', icon: '🏯', buff: true, desc: '턴 시작 시 더 큰 방어막 비례 피해를 가합니다.' },
  thorns: { name: '가시', icon: '🌹', buff: true, desc: '피격 시 공격자에게 고정 피해를 반사합니다.' },
  stunImmune: { name: '기절 면역', icon: '🛡️', buff: true, desc: '기절 효과를 지정된 횟수만큼 무효화합니다.' },

  weakened: { name: '약화', icon: '🪶', buff: false, desc: '가하는 피해가 감소합니다.' },
  slowed: { name: '감속', icon: '🐢', buff: false, desc: '다음 턴 시작 시 에너지가 감소합니다.' },
  burning: { name: '화상', icon: '🔥', buff: false, desc: '매 턴 화상 피해를 받습니다.' },
  cursed: { name: '저주', icon: '🕯', buff: false, desc: '카드 효과와 회복 효율이 감소합니다.' },
  poisoned: { name: '중독', icon: '☠', buff: false, desc: '턴 시작 시 중독 중첩에 비례한 피해를 받습니다.' },
  stunned: { name: '기절', icon: '⏸', buff: false, desc: '행동할 수 없습니다.' },
  confusion: { name: '혼란', icon: '🌀', buff: false, desc: '손패가 무작위로 재배열됩니다.' },
  vulnerable: { name: '취약', icon: '💔', buff: false, desc: '받는 피해가 증가합니다.' },
  marked: { name: '표식', icon: '🎯', buff: false, desc: '추가 피해를 유발하는 표식을 부여합니다.' },
  doom: { name: '파멸', icon: '💀', buff: false, desc: '카운트다운 종료 시 큰 피해가 발생합니다.' },
};

function _getDoc(deps) { return deps?.doc || document; }
function _getGS(deps) { return deps?.gs; }

function _normalizeStatusKey(statusKey) {
  return String(statusKey || '').replace(/_plus$/i, '');
}

const INFINITE_STATUS_KEY_SET = new Set(INFINITE_DURATION_STATUS_KEYS);

function _isInfinitePlayerStatus(statusKey, buff, isBuff = true) {
  if (!isBuff) return false;
  const normalizedKey = _normalizeStatusKey(statusKey);
  return buff?.permanent === true
    || INFINITE_STATUS_KEY_SET.has(statusKey)
    || INFINITE_STATUS_KEY_SET.has(normalizedKey);
}

function _getRawStackCount(buff) {
  if (Number.isFinite(buff?.stacks)) return Number(buff.stacks);
  if (Number.isFinite(buff)) return Number(buff);
  return null;
}

function _getStackDisplay(statusKey, buff) {
  const stacks = _getRawStackCount(buff);
  if (!Number.isFinite(stacks) || stacks <= 0) return '';

  const key = _normalizeStatusKey(statusKey);
  if (stacks < 99) return String(Math.floor(stacks));
  if (key === 'blessing_of_light') return String(buff?.healPerTurn || '');
  if (key === 'soul_armor') return String(buff?.echoRegen || 0);
  if (key === 'time_warp') return String(buff?.energyPerTurn || 0);
  if (key === 'berserk_mode' || key === 'echo_berserk') return String(buff?.atkGrowth || 0);
  if (key === 'divine_grace' || key === 'divine_aura') return String(buff?.shieldBonus || 0);
  if (key === 'resonance' || key === 'acceleration') return String(buff?.dmgBonus || 0);
  if (key === 'unbreakable_wall') {
    const hits = Math.max(1, Math.floor(stacks / 99));
    return `x${hits}`;
  }
  return '';
}

function _resolveEffectStackValue(statusKey, buff) {
  if (!buff || typeof buff !== 'object') return null;

  const key = _normalizeStatusKey(statusKey);
  const candidates = [];
  if (key === 'blessing_of_light') candidates.push(buff.healPerTurn);
  if (key === 'time_warp') candidates.push(buff.energyPerTurn, buff.nextEnergy);
  if (key === 'berserk_mode' || key === 'echo_berserk') candidates.push(buff.atkGrowth);
  if (key === 'soul_armor') candidates.push(buff.echoRegen);
  if (key === 'divine_grace' || key === 'divine_aura') candidates.push(buff.shieldBonus);
  if (key === 'resonance' || key === 'acceleration') candidates.push(buff.dmgBonus);
  if (key === 'lifesteal') candidates.push(buff.percent);
  if (key === 'unbreakable_wall') candidates.push(Math.max(1, Math.floor((Number(buff.stacks) || 0) / 99)));
  candidates.push(buff.amount, buff.value);

  const found = candidates.find((value) => Number.isFinite(value) && Number(value) > 0);
  if (!Number.isFinite(found)) return null;
  return Math.floor(Number(found));
}

export function resolvePlayerStatusTooltipMetrics(statusKey, buff) {
  const stacks = _getRawStackCount(buff);
  const normalizedKey = _normalizeStatusKey(statusKey);
  if (!Number.isFinite(stacks) || stacks <= 0) {
    return { duration: '-', stacks: '-' };
  }

  const isInfinite = _isInfinitePlayerStatus(statusKey, buff)
    || stacks >= 99
    || (INFINITE_STATUS_KEY_SET.has(normalizedKey) && stacks >= 90);
  const effectStack = _resolveEffectStackValue(statusKey, buff);

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
        const rawStacks = _getRawStackCount(buff);
        const displayVal = _getStackDisplay(statusKey, buff);

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
        const winRef = globalThis.window ?? globalThis;

        badge.addEventListener('mouseenter', (event) => {
          if (!info) return;
          StatusTooltipUI.show(event, statusKey, info, buff, { source, doc, win: winRef });
        });
        badge.addEventListener('mousemove', (event) => {
          const tipEl = doc.getElementById('statusTooltip');
          if (tipEl?.classList.contains('visible')) {
            StatusTooltipUI._position(event, tipEl, winRef);
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
