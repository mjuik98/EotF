/**
 * status_effects_ui.js — 플레이어 상태이상 배지 UI
 *
 * 변경사항 (v2)
 * [1] 긴박감 게이지  — StatusTooltipUI 에서 처리
 * [2] 배지 등장/소멸 — badgeEnter / badgeExit CSS 애니메이션
 * [3] 다음 턴 예고   — StatusTooltipUI 에서 처리
 * [5] 출처 표시      — 디버프는 '적 부여', 버프는 '자가 부여' 기본값
 * [7] 색각 접근성    — status-buff / status-debuff 클래스 + CSS border-style 분기
 */

import { StatusTooltipUI } from './status_tooltip_builder.js';
import { INFINITE_DURATION_STATUS_KEYS, PLAYER_STATUS_FALLBACK_BUFF_KEYS } from '../../../data/status_key_data.js';

const STATUS_KR = {
  // ── 잔향검사 (Swordsman) ──
  resonance: { name: '공명', icon: '✨', buff: true, desc: '카드 사용 시 공격 피해 보너스 누적' },
  acceleration: { name: '가속', icon: '⚡', buff: true, desc: '이번 턴 공격 피해 증가 및 관련 카드 추가 효과' },

  // ── 메아리술사 (Mage) ──
  mirror: { name: '반사막', icon: '🪞', buff: true, desc: '받은 피해를 적에게 그대로 반사' },
  time_warp: { name: '시간 왜곡', icon: '⏳', buff: true, desc: '매 턴 추가 에너지 획득' },
  time_warp_plus: { name: '시간 왜곡+', icon: '⏳+', buff: true, desc: '매 턴 추가 에너지 획득' },

  // ── 침묵사냥꾼 (Hunter) ──
  vanish: { name: '은신', icon: '🌑', buff: true, desc: '다음 공격 치명타' },
  shadow_atk: { name: '그림자 강화', icon: '🌑', buff: true, desc: '다음 공격 피해 증가' },
  dodge: { name: '회피', icon: '💨', buff: true, desc: '다음 적 공격 완전 회피' },

  // ── 공통 전투 버프 ──
  focus: { name: '집중', icon: '🎯', buff: true, desc: '다음 공격 치명타' },
  critical_turn: { name: '치명 턴', icon: '💥', buff: true, desc: '이번 턴 모든 공격 치명타' },
  lifesteal: { name: '흡혈', icon: '🩸', buff: true, desc: '가한 피해의 일부만큼 체력 회복' },
  spike_shield: { name: '가시 방패', icon: '🌵', buff: true, desc: '이번 턴 적 공격 반사 및 피해 무효화' },
  immune: { name: '무적', icon: '🔰', buff: true, desc: '모든 피해 무시' },
  soul_armor: { name: '영혼 갑옷', icon: '🛡', buff: true, desc: '받는 피해 감소' },
  zeroCost: { name: '무소모', icon: '0', buff: true, desc: '카드 비용 0' },
  strength: { name: '힘', icon: '💪', buff: true, desc: '가하는 피해 증가' },
  dexterity: { name: '민첩', icon: '🤸', buff: true, desc: '얻는 방어막 수치 증가' },
  echo_on_hit: { name: '타격 잔향', icon: '🎶', buff: true, desc: '타격 시 추가 잔향 획득' },

  // ── 찬송기사 (Paladin) ──
  blessing_of_light: { name: '빛의 축복', icon: '☀️', buff: true, desc: '매 턴 체력 소량 회복' },
  blessing_of_light_plus: { name: '빛의 축복+', icon: '☀️+', buff: true, desc: '매 턴 체력 회복' },
  divine_grace: { name: '신의 은총', icon: '🙏', buff: true, desc: '방어막 및 잔향 동시 획득' },
  divine_aura: { name: '신성 오라', icon: '😇', buff: true, desc: '매 턴 종료 시 방어막 획득' },
  protection: { name: '보호', icon: '🧱', buff: true, desc: '다음 받는 피해 대폭 경감' },
  endure_buff: { name: '인내', icon: '🪨', buff: true, desc: '다음 턴 공격 피해 강화' },

  // ── 파음전사 (Berserker) ──
  berserk_mode: { name: '광전사의 격노', icon: '😡', buff: true, desc: '공격 시마다 피해 영구 누적 증가' },
  berserk_mode_plus: { name: '광전사의 격노+', icon: '😡+', buff: true, desc: '공격 시마다 피해 영구 누적 대폭 증가' },
  echo_berserk: { name: '에코 광폭', icon: '⚔️', buff: true, desc: '잔향 스킬 발동 시 부여. 공격 피해 영구 누적 증가' },

  // ── 무음수호자 (Guardian) ──
  unbreakable_wall: { name: '불굴의 벽', icon: '🧱', buff: true, desc: '턴 시작 시 방어막 비례 비례 피해' },
  unbreakable_wall_plus: { name: '불굴의 벽+', icon: '🧱+', buff: true, desc: '턴 시작 시 방어막 비례 큰 피해' },
  thorns: { name: '가시', icon: '⚙️', buff: true, desc: '피격 시 공격자에게 고정 피해 반사' },

  // ── 디버프 ──
  weakened: { name: '약화', icon: '🪶', buff: false, desc: '가하는 피해 크게 감소' },
  slowed: { name: '감속', icon: '🐢', buff: false, desc: '매 턴 시작 시 에너지 감소' },
  burning: { name: '화상', icon: '🔥', buff: false, desc: '매 턴 시작 시 화상 피해' },
  cursed: { name: '저주', icon: '🕸', buff: false, desc: '카드 효과 및 회복 효율 감소' },
  poisoned: { name: '중독', icon: '☠', buff: false, desc: '매 턴 시작 시 독 중첩 비례 피해' },
  stunned: { name: '기절', icon: '⏸', buff: false, desc: '에너지 충전 불가' },
  confusion: { name: '혼란', icon: '🌀', buff: false, desc: '턴 시작 시 손패 무작위 셔플' },
  vulnerable: { name: '취약', icon: '💢', buff: false, desc: '받는 피해 증가' },
  marked: { name: '표식', icon: '🎯', buff: false, desc: '일정 턴 후 큰 피해 발생' },
  doom: { name: '파멸', icon: '☠️', buff: false, desc: '카운트다운 종료 시 막대한 피해' },
};

function _getDoc(deps) { return deps?.doc || document; }
function _getGS(deps) { return deps?.gs; }
function _getTooltipUI(deps) {
  return deps?.tooltipUI
    || deps?.TooltipUI
    || globalThis.TooltipUI
    || globalThis.GAME?.Modules?.TooltipUI;
}

function _getStackDisplay(key, buff) {
  if (!buff || buff.stacks <= 0) return '';
  if (buff.stacks < 99) return String(buff.stacks);
  if (key === 'blessing_of_light') return String(buff.healPerTurn || '');
  if (key === 'soul_armor') return String(buff.echoRegen || 0);
  if (key === 'time_warp') return String(buff.energyPerTurn || 0);
  if (key === 'berserk_mode') return String(buff.atkGrowth || 0);
  if (key === 'divine_grace') return String(buff.shieldBonus || 0);
  if (key === 'unbreakable_wall' || key === 'unbreakable_wall_plus') {
    const hits = Math.max(1, Math.floor(buff.stacks / 99));
    return `×${hits}`;
  }
  return '';
}

const _INFINITE_STATUS_KEYS = new Set(INFINITE_DURATION_STATUS_KEYS);

function _resolveEffectStackValue(statusKey, buff) {
  if (!buff || typeof buff !== 'object') return null;
  const key = String(statusKey || '').replace(/_plus$/i, '');
  const candidates = [];
  if (key === 'blessing_of_light') candidates.push(buff.healPerTurn);
  if (key === 'time_warp') candidates.push(buff.energyPerTurn, buff.nextEnergy);
  if (key === 'berserk_mode' || key === 'echo_berserk') candidates.push(buff.atkGrowth);
  if (key === 'soul_armor') candidates.push(buff.echoRegen);
  if (key === 'divine_grace') candidates.push(buff.shieldBonus);
  if (key === 'resonance' || key === 'acceleration') candidates.push(buff.dmgBonus);
  if (key === 'lifesteal') candidates.push(buff.percent);
  if (key === 'unbreakable_wall' || key === 'unbreakable_wall_plus') {
    candidates.push(Math.max(1, Math.floor(buff.stacks / 99)));
  }
  candidates.push(buff.amount, buff.value);
  const found = candidates.find((v) => Number.isFinite(v) && Number(v) > 0);
  if (!Number.isFinite(found)) return null;
  return Math.floor(Number(found));
}

export function resolvePlayerStatusTooltipMetrics(statusKey, buff) {
  const stacks = Number(buff?.stacks);
  const key = String(statusKey || '').replace(/_plus$/i, '');
  if (!Number.isFinite(stacks) || stacks <= 0) return { duration: '-', stacks: '-' };

  const isInfinite = buff?.permanent === true
    || stacks >= 99
    || (_INFINITE_STATUS_KEYS.has(key) && stacks >= 90);
  const duration = isInfinite ? '무한' : `${Math.floor(stacks)}턴`;
  const effectStack = _resolveEffectStackValue(statusKey, buff);
  return {
    duration,
    stacks: Number.isFinite(effectStack) && effectStack > 0
      ? String(effectStack)
      : String(Math.floor(stacks)),
  };
}

// ── [개선 5] 기본 출처 추론 ───────────────────────────────────
// 버프는 자가 부여, 디버프는 적 부여로 기본값 설정
function _defaultSource(isBuff) {
  if (isBuff) return { type: 'self', label: '자가 부여', name: '카드 / 유물', color: '#67e8cc' };
  return { type: 'enemy', label: '적 부여', name: '전투 중 부여됨', color: '#e879a0' };
}

export const StatusEffectsUI = {
  getStatusMap() { return STATUS_KR; },

  updateStatusDisplay(deps = {}) {
    const gs = _getGS(deps);
    if (!gs?.player) return;

    // 배지가 갱신되기 전에 현재 툴팁을 명시적으로 숨겨 잔상이 남지 않도록 함
    StatusTooltipUI.hide({ doc: _getDoc(deps) });

    const doc = _getDoc(deps);
    const el = doc.getElementById(deps.statusContainerId || 'statusEffects');
    if (!el) return;

    const buffs = gs.player.buffs || {};
    const keys = Object.keys(buffs);

    // [개선 2] 소멸 애니메이션: 현재 배지 중 사라질 것에 클래스 추가 후 대기
    const existingBadges = el.querySelectorAll('.hud-status-badge[data-buff-key]');
    const newKeySet = new Set(keys);
    const removals = [];
    existingBadges.forEach(badge => {
      if (!newKeySet.has(badge.dataset.buffKey)) {
        badge.classList.add('badge-removing');
        removals.push(
          new Promise(resolve => {
            let done = false;
            const finish = () => {
              if (done) return;
              done = true;
              badge.removeEventListener('animationend', finish);
              resolve();
            };
            badge.addEventListener('animationend', finish, { once: true });
            // Fallback timeout in case the element is hidden (display: none)
            // and the animationend event never fires.
            setTimeout(finish, 350);
          })
        );
      }
    });

    // 소멸 애니가 없으면 즉시 재렌더, 있으면 완료 후 재렌더
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
      keys.forEach((k, idx) => {
        const buff = buffs[k];
        const info = STATUS_KR[k];
        const isBuff = info
          ? info.buff
          : PLAYER_STATUS_FALLBACK_BUFF_KEYS.includes(k);

        const label = info ? `${info.icon} ${info.name}` : k;

        const badge = doc.createElement('span');

        // [개선 7] 색각 접근성: CSS 클래스 분기 (border-style 은 CSS 에서 처리)
        badge.className = `hud-status-badge ${isBuff ? 'status-buff' : 'status-debuff'}`;
        badge.dataset.buffKey = k;

        // [개선 2] 등장 애니메이션 — stagger delay
        badge.style.animationDelay = `${idx * 40}ms`;

        badge.appendChild(doc.createTextNode(label));

        const dmgBonus = (k === 'resonance' || k === 'acceleration') && buff.dmgBonus
          ? ` +${buff.dmgBonus}` : '';
        if (dmgBonus) badge.appendChild(doc.createTextNode(` ${dmgBonus}`));

        if (k !== 'resonance' && k !== 'acceleration' && buff.stacks > 0) {
          const stackSpan = doc.createElement('span');
          stackSpan.style.opacity = '0.7';
          const displayVal = _getStackDisplay(k, buff);
          stackSpan.textContent = displayVal ? ` (${displayVal})` : '';
          badge.appendChild(stackSpan);
        }

        // ── 툴팁 이벤트 ──────────────────────────────────────────
        const docRef = doc;
        const winRef = globalThis.window ?? globalThis;
        // [개선 5] 기본 출처
        const source = _defaultSource(isBuff);

        badge.addEventListener('mouseenter', (event) => {
          if (!info) return;
          StatusTooltipUI.show(event, k, info, buff, { source, doc: docRef, win: winRef });
        });
        badge.addEventListener('mousemove', (event) => {
          const tipEl = docRef.getElementById('statusTooltip');
          if (tipEl?.classList.contains('visible')) {
            StatusTooltipUI._position(event, tipEl, winRef);
          }
        });
        badge.addEventListener('mouseleave', () => {
          StatusTooltipUI.hide({ doc: docRef });
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
