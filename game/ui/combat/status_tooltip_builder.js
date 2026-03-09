import { INFINITE_DURATION_STATUS_KEYS } from '../../../data/status_key_data.js';

/**
 * status_tooltip_builder.js — 통합 상태이상 툴팁 빌더
 *
 * 책임: 플레이어/적 상태이상에 공통으로 사용되는 새 툴팁 UI
 * - buildStatusTooltipHTML : 툴팁 내부 HTML 생성 (순수 함수)
 * - showStatusTooltip      : #statusTooltip 엘리먼트에 내용 채우고 표시
 * - hideStatusTooltip      : 툴팁 숨기기
 *
 * 적용된 개선사항
 * [1] 긴박감 게이지  — 1턴 이하 시 빨간색 + 펄스 애니메이션
 * [2] 배지 애니메이션 — badgeEnter / badgeExit (CSS 클래스)
 * [3] 다음 턴 예고   — 상태이상별 피해/효과를 한 줄로 표시
 * [5] 출처 표시      — options.source 제공 시 헤더 하단에 렌더링
 * [7] 색각 접근성    — 배지 border-style 분기 (CSS 클래스로 처리)
 */

// ── 상태이상별 메타 (툴팁 전용 추가 정보) ─────────────────────────
// 기존 STATUS_KR / ENEMY_STATUS_DESC 를 보완하는 확장 테이블
export const STATUS_TOOLTIP_META = {
  // ── 플레이어 디버프 ──────────────────────────────────────────────
  burning: {
    nameEn: 'Burning', typeLabel: '디버프',
    accent: '#ff3366', nameColor: '#e879a0',
    typeBg: 'rgba(255,51,102,.12)', typeColor: '#ff3366',
    /** @param {object} buff @returns {string|null} 다음 턴 예고 텍스트 */
    nextTurnText: (_buff) => '다음 턴 화염 피해 5',
    /** @param {object} buff @returns {number|null} 피해 수치 (null = 수치 표시 안 함) */
    nextTurnDmg: (_buff) => 5,
    statLabel: '피해량', statValue: (buff) => '5',
    statUnit: '/턴', statColor: '#ff3366',
  },
  poisoned: {
    nameEn: 'Poisoned', typeLabel: '디버프 · 스택',
    accent: '#c026d3', nameColor: '#e879a0',
    typeBg: 'rgba(192,38,211,.12)', typeColor: '#c026d3',
    nextTurnText: (buff, val) => {
      const s = Number(buff?.stacks ?? buff);
      const d = Number(val ?? buff?.poisonDuration ?? 1);
      return `다음 턴 독 피해 (${s}×5 = ${s * 5}), 지속 ${d}턴`;
    },
    nextTurnDmg: (buff, _val) => {
      const s = Number(buff?.stacks ?? buff);
      return Number.isFinite(s) && s > 0 ? s * 5 : null;
    },
    statLabel: '스택', statValue: (buff, _val) => String(buff?.stacks ?? buff ?? '?'),
    statUnit: '중첩', statColor: '#c026d3',
  },
  weakened: {
    nameEn: 'Weakened', typeLabel: '디버프',
    accent: '#f97316', nameColor: '#fb923c',
    typeBg: 'rgba(249,115,22,.12)', typeColor: '#f97316',
    nextTurnText: (_buff) => '공격 피해 50% 감소',
    nextTurnDmg: () => null,
    statLabel: '공격 감소', statValue: () => '50',
    statUnit: '%', statColor: '#fb923c',
  },
  stunned: {
    nameEn: 'Stunned', typeLabel: '디버프',
    accent: '#f59e0b', nameColor: '#fbbf24',
    typeBg: 'rgba(245,158,11,.12)', typeColor: '#f59e0b',
    nextTurnText: (_buff) => '행동 불가',
    nextTurnDmg: () => null,
    statLabel: '에너지', statValue: () => '0',
    statUnit: '강제', statColor: '#fbbf24',
  },
  cursed: {
    nameEn: 'Cursed', typeLabel: '디버프',
    accent: '#7c3aed', nameColor: '#a78bfa',
    typeBg: 'rgba(124,58,237,.12)', typeColor: '#7c3aed',
    nextTurnText: (_buff) => '카드 효과 및 회복 감소',
    nextTurnDmg: () => null,
    statLabel: '지속', statValue: (buff, val) => String(val ?? buff?.stacks ?? buff ?? '?'),
    statUnit: '턴', statColor: '#a78bfa',
  },
  vulnerable: {
    nameEn: 'Vulnerable', typeLabel: '디버프',
    accent: '#ef4444', nameColor: '#fca5a5',
    typeBg: 'rgba(239,68,68,.12)', typeColor: '#ef4444',
    nextTurnText: (_buff) => '받는 피해 50% 증가',
    nextTurnDmg: () => null,
    statLabel: '피해 증폭', statValue: () => '50',
    statUnit: '%', statColor: '#fca5a5',
  },
  confusion: {
    nameEn: 'Confusion', typeLabel: '디버프',
    accent: '#8b5cf6', nameColor: '#c4b5fd',
    typeBg: 'rgba(139,92,246,.12)', typeColor: '#8b5cf6',
    nextTurnText: (_buff) => '손패 무작위 셔플',
    nextTurnDmg: () => null,
    statLabel: '지속', statValue: (buff, val) => String(val ?? buff?.stacks ?? buff ?? '?'),
    statUnit: '턴', statColor: '#c4b5fd',
  },
  slowed: {
    nameEn: 'Slowed', typeLabel: '디버프',
    accent: '#0891b2', nameColor: '#67e8f9',
    typeBg: 'rgba(8,145,178,.12)', typeColor: '#0891b2',
    nextTurnText: (_buff) => '다음 턴 에너지 -1',
    nextTurnDmg: () => null,
    statLabel: '에너지 감소', statValue: () => '-1',
    statUnit: '/턴', statColor: '#67e8f9',
  },
  // ── 플레이어 버프 ──────────────────────────────────────────────
  immune: {
    nameEn: 'Immune', typeLabel: '버프',
    accent: '#00ffcc', nameColor: '#67e8cc',
    typeBg: 'rgba(0,255,204,.08)', typeColor: '#00ffcc',
    tags: [
      { label: '피해 무효', color: '#00ffcc', border: 'rgba(0,255,204,.2)', bg: 'rgba(0,255,204,.07)' },
      { label: '상태이상 무효', color: '#00ffcc', border: 'rgba(0,255,204,.2)', bg: 'rgba(0,255,204,.07)' },
      { label: '무적', color: '#00ffcc', border: 'rgba(0,255,204,.2)', bg: 'rgba(0,255,204,.07)' },
    ],
    nextTurnText: null, nextTurnDmg: () => null,
  },
  vanish: {
    nameEn: 'Stealth', typeLabel: '버프 · 소모형',
    accent: '#475569', nameColor: '#94a3b8',
    typeBg: 'rgba(71,85,105,.2)', typeColor: '#64748b',
    tags: [
      { label: '다음 공격 치명타', color: '#94a3b8', border: 'rgba(148,163,184,.15)', bg: 'rgba(148,163,184,.07)' },
      { label: '공격 즉시 해제', color: '#94a3b8', border: 'rgba(148,163,184,.15)', bg: 'rgba(148,163,184,.07)' },
    ],
    gauge: { infinite: true, color: '#475569' },
    nextTurnText: null, nextTurnDmg: () => null,
  },
  dodge: {
    nameEn: 'Dodge', typeLabel: '버프 · 소모형',
    accent: '#00ffcc', nameColor: '#67e8cc',
    typeBg: 'rgba(0,255,204,.08)', typeColor: '#00ffcc',
    tags: [
      { label: '다음 공격 무효', color: '#00ffcc', border: 'rgba(0,255,204,.2)', bg: 'rgba(0,255,204,.07)' },
      { label: '1회 소모', color: '#00ffcc', border: 'rgba(0,255,204,.2)', bg: 'rgba(0,255,204,.07)' },
    ],
    nextTurnText: null, nextTurnDmg: () => null,
  },
  mirror: {
    nameEn: 'Reflect', typeLabel: '버프',
    accent: '#818cf8', nameColor: '#a5b4fc',
    typeBg: 'rgba(129,140,248,.1)', typeColor: '#818cf8',
    statLabel: '반사율', statValue: () => '100',
    statUnit: '%', statColor: '#a5b4fc',
    nextTurnText: null, nextTurnDmg: () => null,
  },
  resonance: {
    nameEn: 'Resonance', typeLabel: '버프 · 무한',
    accent: '#7b2fff', nameColor: '#a855f7',
    typeBg: 'rgba(123,47,255,.12)', typeColor: '#7b2fff',
    gauge: { infinite: true, color: '#7b2fff' },
    nextTurnText: null, nextTurnDmg: () => null,
    statLabel: '피해 보너스', statValue: (buff) => String(buff?.dmgBonus ?? 0),
    statUnit: '+dmg', statColor: '#a855f7',
  },
  acceleration: {
    nameEn: 'Acceleration', typeLabel: '버프',
    accent: '#f59e0b', nameColor: '#fde68a',
    typeBg: 'rgba(245,158,11,.1)', typeColor: '#f59e0b',
    nextTurnText: null, nextTurnDmg: () => null,
    statLabel: '피해 보너스', statValue: (buff) => String(buff?.dmgBonus ?? 0),
    statUnit: '+dmg', statColor: '#fde68a',
  },
  blessing_of_light: {
    nameEn: 'Light Blessing', typeLabel: '버프 · 무한',
    accent: '#fcd34d', nameColor: '#fef08a',
    typeBg: 'rgba(252,211,77,.1)', typeColor: '#fcd34d',
    gauge: { infinite: true, color: '#fcd34d' },
    nextTurnText: (buff) => `다음 턴 체력 +${buff?.healPerTurn ?? '?'}`,
    nextTurnDmg: () => null,
    statLabel: '회복량', statValue: (buff) => String(buff?.healPerTurn ?? '?'),
    statUnit: '/턴', statColor: '#fef08a',
  },
  stunImmune: {
    nameEn: 'Stun Immunity', typeLabel: '버프 · 소모형',
    accent: '#38bdf8', nameColor: '#7dd3fc',
    typeBg: 'rgba(56,189,248,.12)', typeColor: '#38bdf8',
    tags: [
      { label: '기절 무효', color: '#7dd3fc', border: 'rgba(125,211,252,.2)', bg: 'rgba(125,211,252,.07)' },
      { label: '횟수 차감', color: '#7dd3fc', border: 'rgba(125,211,252,.2)', bg: 'rgba(125,211,252,.07)' },
    ],
    nextTurnText: null, nextTurnDmg: () => null,
    statLabel: '면역 횟수', statValue: (buff, val) => String(val ?? buff?.stacks ?? buff ?? '?'),
    statUnit: '회', statColor: '#7dd3fc',
  },
  // ── 적 전용 ──────────────────────────────────────────────────────
  doom: {
    nameEn: 'Doom', typeLabel: '특수 · 카운트다운',
    accent: '#f0b429', nameColor: '#f0b429',
    typeBg: 'rgba(240,180,41,.1)', typeColor: '#f0b429',
    countdown: true,
    nextTurnText: (buff, val) => `${val ?? '?'}턴 후 피해 폭발`,
    nextTurnDmg: () => null,
  },
  unbreakable_wall: {
    nameEn: 'Indomitable Wall', typeLabel: '파워 · 중첩',
    accent: '#94a3b8', nameColor: '#cbd5e1',
    typeBg: 'rgba(148,163,184,.12)', typeColor: '#94a3b8',
    gauge: { infinite: true, color: '#94a3b8' },
    nextTurnText: (buff, val) => {
      const hits = Math.max(1, Math.floor((Number(buff?.stacks ?? val) || 0) / 99));
      return `턴 시작 시 방어막의 50% 피해 (${hits}회)`;
    },
    nextTurnDmg: () => null,
    statLabel: '발동 횟수', statValue: (buff, val) => String(Math.max(1, Math.floor((Number(buff?.stacks ?? val) || 0) / 99))),
    statUnit: '회', statColor: '#cbd5e1',
  },
  unbreakable_wall_plus: {
    nameEn: 'Indomitable Wall+', typeLabel: '파워 · 중첩',
    accent: '#fcd34d', nameColor: '#fbbf24',
    typeBg: 'rgba(252,211,77,.12)', typeColor: '#fcd34d',
    gauge: { infinite: true, color: '#fcd34d' },
    nextTurnText: (buff, val) => {
      const hits = Math.max(1, Math.floor((Number(buff?.stacks ?? val) || 0) / 99));
      return `턴 시작 시 방어막의 70% 피해 (${hits}회)`;
    },
    nextTurnDmg: () => null,
    statLabel: '발동 횟수', statValue: (buff, val) => String(Math.max(1, Math.floor((Number(buff?.stacks ?? val) || 0) / 99))),
    statUnit: '회', statColor: '#fbbf24',
  },
};

// ── 기본 폴백 팔레트 ─────────────────────────────────────────────
const DEBUFF_FALLBACK = {
  accent: '#ff3366', nameColor: '#e879a0',
  typeBg: 'rgba(255,51,102,.12)', typeColor: '#ff3366',
};
const BUFF_FALLBACK = {
  accent: '#00ffcc', nameColor: '#67e8cc',
  typeBg: 'rgba(0,255,204,.08)', typeColor: '#00ffcc',
};

const BUFF_INFINITE_PALETTE = {
  accent: '#8b5cf6', nameColor: '#c4b5fd',
  typeBg: 'rgba(139,92,246,.12)', typeColor: '#8b5cf6',
};

const INFINITE_DURATION_STATUS_KEY_SET = new Set(INFINITE_DURATION_STATUS_KEYS);

function _normalizeStatusKey(statusKey) {
  return String(statusKey || '').replace(/_plus$/i, '');
}

function _isInfiniteDurationStatus(statusKey, buff) {
  const normalizedKey = _normalizeStatusKey(statusKey);
  return buff?.permanent === true
    || INFINITE_DURATION_STATUS_KEY_SET.has(statusKey)
    || INFINITE_DURATION_STATUS_KEY_SET.has(normalizedKey)
    || (Number.isFinite(Number(buff?.stacks)) && Number(buff?.stacks) >= 99);
}

function _makeInfiniteBuffMeta(extra = {}) {
  return {
    ...BUFF_INFINITE_PALETTE,
    typeLabel: '버프 · 무한',
    gauge: { infinite: true, color: '#8b5cf6' },
    ...extra,
  };
}

const STATUS_TOOLTIP_META_OVERRIDES = {
  resonance: _makeInfiniteBuffMeta({
    nameEn: 'Resonance',
    nextTurnText: (buff) => {
      const bonus = buff?.dmgBonus ?? 0;
      return bonus > 0 ? `카드 사용 피해 +${bonus}` : '카드 사용 피해가 증가합니다.';
    },
    nextTurnDmg: () => null,
    statLabel: '피해 보너스',
    statValue: (buff) => String(buff?.dmgBonus ?? 0),
    statUnit: '',
    statColor: '#c4b5fd',
  }),
  acceleration: _makeInfiniteBuffMeta({
    nameEn: 'Acceleration',
    nextTurnText: (buff) => {
      const bonus = buff?.dmgBonus ?? 0;
      return bonus > 0 ? `이번 공격 피해 +${bonus}` : '이번 공격 피해가 증가합니다.';
    },
    nextTurnDmg: () => null,
    statLabel: '피해 보너스',
    statValue: (buff) => String(buff?.dmgBonus ?? 0),
    statUnit: '',
    statColor: '#c4b5fd',
  }),
  berserk_mode: _makeInfiniteBuffMeta({
    nameEn: 'Berserk',
    nextTurnText: (buff) => {
      const growth = buff?.atkGrowth ?? 0;
      return growth > 0 ? `공격 시 피해 +${growth} 영구 누적` : '공격 시 피해가 영구 누적됩니다.';
    },
    nextTurnDmg: () => null,
    statLabel: '누적 증가',
    statValue: (buff) => String(buff?.atkGrowth ?? 0),
    statUnit: '/회',
    statColor: '#c4b5fd',
  }),
  berserk_mode_plus: _makeInfiniteBuffMeta({
    nameEn: 'Berserk+',
    nextTurnText: (buff) => {
      const growth = buff?.atkGrowth ?? 0;
      return growth > 0 ? `공격 시 피해 +${growth} 영구 누적 (강화)` : '공격 시 피해가 더 크게 영구 누적됩니다.';
    },
    nextTurnDmg: () => null,
    statLabel: '누적 증가',
    statValue: (buff) => String(buff?.atkGrowth ?? 0),
    statUnit: '/회',
    statColor: '#c4b5fd',
  }),
  time_warp: _makeInfiniteBuffMeta({
    nameEn: 'Time Warp',
    nextTurnText: (buff) => `매 턴 시작 시 에너지 +${buff?.energyPerTurn ?? 1}`,
    nextTurnDmg: () => null,
    statLabel: '에너지/턴',
    statValue: (buff) => String(buff?.energyPerTurn ?? 1),
    statUnit: '',
    statColor: '#c4b5fd',
  }),
  time_warp_plus: _makeInfiniteBuffMeta({
    nameEn: 'Time Warp+',
    nextTurnText: (buff) => `매 턴 시작 시 에너지 +${buff?.energyPerTurn ?? 2}`,
    nextTurnDmg: () => null,
    statLabel: '에너지/턴',
    statValue: (buff) => String(buff?.energyPerTurn ?? 2),
    statUnit: '',
    statColor: '#c4b5fd',
  }),
  blessing_of_light: _makeInfiniteBuffMeta({
    nameEn: 'Blessing of Light',
    nextTurnText: (buff) => {
      const heal = buff?.healPerTurn ?? 0;
      return heal > 0 ? `매 턴 종료 시 HP +${heal} 회복` : '매 턴 체력을 회복합니다.';
    },
    nextTurnDmg: () => null,
    statLabel: '회복량',
    statValue: (buff) => String(buff?.healPerTurn ?? 0),
    statUnit: 'HP',
    statColor: '#4ade80',
  }),
  blessing_of_light_plus: _makeInfiniteBuffMeta({
    nameEn: 'Blessing of Light+',
    nextTurnText: (buff) => {
      const heal = buff?.healPerTurn ?? 0;
      return heal > 0 ? `매 턴 종료 시 HP +${heal} 회복 (강화)` : '매 턴 더 많은 체력을 회복합니다.';
    },
    nextTurnDmg: () => null,
    statLabel: '회복량',
    statValue: (buff) => String(buff?.healPerTurn ?? 0),
    statUnit: 'HP',
    statColor: '#4ade80',
  }),
  unbreakable_wall: _makeInfiniteBuffMeta({
    nameEn: 'Unbreakable Wall',
    nextTurnText: (buff) => {
      const hits = Math.max(1, Math.floor((Number(buff?.stacks) || 99) / 99));
      return `턴 시작 시 방어막의 50% 피해 (${hits}회)`;
    },
    nextTurnDmg: () => null,
    statLabel: '발동 횟수',
    statValue: (buff) => String(Math.max(1, Math.floor((Number(buff?.stacks) || 99) / 99))),
    statUnit: '회',
    statColor: '#c4b5fd',
  }),
  unbreakable_wall_plus: _makeInfiniteBuffMeta({
    nameEn: 'Unbreakable Wall+',
    nextTurnText: (buff) => {
      const hits = Math.max(1, Math.floor((Number(buff?.stacks) || 99) / 99));
      return `턴 시작 시 방어막의 70% 피해 (${hits}회)`;
    },
    nextTurnDmg: () => null,
    statLabel: '발동 횟수',
    statValue: (buff) => String(Math.max(1, Math.floor((Number(buff?.stacks) || 99) / 99))),
    statUnit: '회',
    statColor: '#c4b5fd',
  }),
  thorns: _makeInfiniteBuffMeta({
    nameEn: 'Thorns',
    nextTurnText: () => '피격 시 공격자에게 반사 피해를 줍니다.',
    nextTurnDmg: () => null,
    statLabel: '반사 피해',
    statValue: (buff) => String(buff?.dmg ?? buff?.stacks ?? '?'),
    statUnit: '',
    statColor: '#c4b5fd',
  }),
  immune: _makeInfiniteBuffMeta({
    nameEn: 'Immune',
    tags: [
      { label: '모든 피해 무시', bg: 'rgba(139,92,246,.12)', color: '#c4b5fd', border: 'rgba(139,92,246,.3)' },
      { label: '상태 이상 면역', bg: 'rgba(139,92,246,.08)', color: '#a78bfa', border: 'rgba(139,92,246,.2)' },
    ],
    nextTurnText: () => null,
    nextTurnDmg: () => null,
    statLabel: null,
    statValue: () => '',
    statUnit: '',
    statColor: '#c4b5fd',
  }),
  soul_armor: _makeInfiniteBuffMeta({
    nameEn: 'Soul Armor',
    nextTurnText: (buff) => {
      const regen = buff?.echoRegen ?? 0;
      return regen > 0 ? `받는 피해 감소 + 잔향 ${regen} 회복` : '받는 피해가 감소합니다.';
    },
    nextTurnDmg: () => null,
    statLabel: '잔향 회복',
    statValue: (buff) => String(buff?.echoRegen ?? 0),
    statUnit: '/턴',
    statColor: '#c4b5fd',
  }),
  stunImmune: _makeInfiniteBuffMeta({
    nameEn: 'Stun Immune',
    nextTurnText: (buff) => `기절 무효 ${buff?.stacks ?? 1}회`,
    nextTurnDmg: () => null,
    statLabel: '무효 횟수',
    statValue: (buff) => String(buff?.stacks ?? 1),
    statUnit: '회',
    statColor: '#c4b5fd',
  }),
  mirror: _makeInfiniteBuffMeta({
    nameEn: 'Mirror Shield',
    nextTurnText: () => '받은 피해를 그대로 반사합니다.',
    nextTurnDmg: () => null,
    statLabel: '반사율',
    statValue: () => '100',
    statUnit: '%',
    statColor: '#c4b5fd',
  }),
  divine_aura: _makeInfiniteBuffMeta({
    nameEn: 'Divine Aura',
    nextTurnText: (buff) => {
      const shield = buff?.shieldBonus ?? 0;
      return shield > 0 ? `턴 종료 시 방어막 +${shield}` : '턴 종료 시 방어막을 획득합니다.';
    },
    nextTurnDmg: () => null,
    statLabel: '방어막',
    statValue: (buff) => String(buff?.shieldBonus ?? 0),
    statUnit: '',
    statColor: '#c4b5fd',
  }),
  spike_shield: _makeInfiniteBuffMeta({
    nameEn: 'Spike Shield',
    nextTurnText: () => '이번 턴 적 공격을 반사하고 무효화합니다.',
    nextTurnDmg: () => null,
    statLabel: null,
    statValue: () => '',
    statUnit: '',
    statColor: '#c4b5fd',
  }),
  echo_on_hit: _makeInfiniteBuffMeta({
    nameEn: 'Echo on Hit',
    nextTurnText: () => '공격 적중 시 추가 잔향을 획득합니다.',
    nextTurnDmg: () => null,
    statLabel: null,
    statValue: () => '',
    statUnit: '',
    statColor: '#c4b5fd',
  }),
  echo_berserk: _makeInfiniteBuffMeta({
    nameEn: 'Echo Berserk',
    nextTurnText: () => '잔향 스킬 발동 시 영구 공격 보너스를 얻습니다.',
    nextTurnDmg: () => null,
    statLabel: null,
    statValue: () => '',
    statUnit: '',
    statColor: '#c4b5fd',
  }),
};

function _getMeta(statusKey) {
  const baseMeta = STATUS_TOOLTIP_META[statusKey] ?? null;
  const overrideMeta = STATUS_TOOLTIP_META_OVERRIDES[statusKey] ?? null;
  if (!baseMeta) return overrideMeta;
  if (!overrideMeta) return baseMeta;
  return { ...baseMeta, ...overrideMeta };
}

function _palette(statusKey, isBuff) {
  const m = _getMeta(statusKey);
  if (m) return m;
  if (isBuff && _isInfiniteDurationStatus(statusKey)) return BUFF_INFINITE_PALETTE;
  return isBuff ? BUFF_FALLBACK : DEBUFF_FALLBACK;
}

// ── 다음 턴 예고 HTML ────────────────────────────────────────────
function _buildNextTurn(meta, buff, rawValue) {
  if (!meta?.nextTurnText) return '';
  const text = meta.nextTurnText(buff, rawValue);
  const dmg = meta.nextTurnDmg?.(buff, rawValue) ?? null;

  if (dmg !== null) {
    return `<div class="stt-next-turn">
      <span class="stt-next-turn-arrow">▶ 다음 턴</span>
      <span class="stt-next-turn-value">-${dmg}</span>
      <span class="stt-next-turn-label">${text}</span>
    </div>`;
  }
  // 수치 없는 예고
  return `<div class="stt-next-turn stt-next-turn--info">
    <span class="stt-next-turn-arrow">▶ 다음 턴</span>
    <span class="stt-next-turn-label" style="margin-left:4px">${text}</span>
  </div>`;
}

// ── 게이지 HTML ──────────────────────────────────────────────────
function _buildGauge(stacks, isInfinite, color) {
  if (isInfinite) {
    return `<div class="stt-gauge-area">
      <div class="stt-gauge-label"><span>지속시간</span><span style="color:${color}">∞ 무한</span></div>
      <div class="stt-gauge-track">
        <div class="stt-gauge-fill" style="width:100%;background:linear-gradient(90deg,#334155,#475569,#334155);background-size:300%;animation:sttShimmer 2s linear infinite;opacity:.8"></div>
      </div>
    </div>`;
  }

  const cur = Math.floor(Number(stacks));
  // 긴박감: 1턴 이하
  const urgent = cur <= 1;
  const fillColor = urgent ? 'var(--danger)' : color;
  // 게이지 너비는 최소 10%, 최대 100%
  const pct = Math.min(100, Math.max(10, cur * 20)); // 5턴을 100%로 간주
  const urgentClass = urgent ? ' urgent' : '';
  const urgentLabel = urgent
    ? `<span class="urgent-text">⚠ ${cur}턴 남음</span>`
    : `<span style="color:${color}">${cur}턴</span>`;

  return `<div class="stt-gauge-area">
    <div class="stt-gauge-label"><span>지속시간</span>${urgentLabel}</div>
    <div class="stt-gauge-track">
      <div class="stt-gauge-fill${urgentClass}" style="width:${pct}%;background:${fillColor};opacity:.8"></div>
    </div>
  </div>`;
}

// ── 카운트다운 HTML ───────────────────────────────────────────────
function _buildCountdown(value) {
  return `<div class="stt-countdown">
    <div class="stt-countdown-num">${value}</div>
    <div class="stt-countdown-label">턴 후<br>폭발</div>
  </div>`;
}

// ── 태그 HTML ────────────────────────────────────────────────────
function _buildTags(tags) {
  if (!tags?.length) return '';
  const items = tags.map(t =>
    `<span class="stt-tag" style="background:${t.bg};color:${t.color};border:1px solid ${t.border}">${t.label}</span>`
  ).join('');
  return `<div class="stt-tag-row">${items}</div>`;
}

// ── 수치 2분할 HTML ──────────────────────────────────────────────
function _buildStats(meta, buff, rawValue) {
  if (!meta?.statLabel) return '';
  const val = meta.statValue?.(buff, rawValue) ?? '?';
  const unit = meta.statUnit ?? '';
  const col = meta.statColor ?? 'var(--white)';

  // 오른쪽: 지속 턴
  const stacks = Number(rawValue ?? buff?.stacks ?? buff);
  const rightVal = (Number.isFinite(stacks) && stacks < 99) ? stacks : '∞';

  return `<div class="stt-stats">
    <div class="stt-stat">
      <div class="stt-stat-label">${meta.statLabel}</div>
      <div class="stt-stat-value" style="color:${col}">${val}<span class="stt-stat-unit">${unit}</span></div>
    </div>
    <div class="stt-stat">
      <div class="stt-stat-label">지속</div>
      <div class="stt-stat-value">${rightVal}<span class="stt-stat-unit">턴</span></div>
    </div>
  </div>`;
}

// ── 출처 HTML ────────────────────────────────────────────────────
function _buildSource(source) {
  if (!source) return '';
  const typeIcon = source.type === 'enemy' ? '⚔' : '✦';
  return `<div class="stt-source">
    <div class="stt-source-dot" style="background:${source.color ?? '#aaa'}"></div>
    <span class="stt-source-label">${typeIcon} ${source.label}</span>
    <span class="stt-source-name" style="color:${source.color ?? '#aaa'}">${source.name}</span>
  </div>`;
}

// ════════════════════════════════════════════════════════════════
//  buildStatusTooltipHTML — 메인 빌더 (순수 함수)
//  @param {string}  statusKey  — 상태이상 키 (e.g. 'burning', 'dodge')
//  @param {object}  infoKR     — STATUS_KR 또는 ENEMY_STATUS_DESC 엔트리 { name, nameEn?, icon, buff, desc }
//  @param {object}  buff       — gs.player.buffs[key] 또는 enemy.statusEffects[key] 값
//  @param {object}  [options]
//    @param {object}  [options.source]   — { type:'enemy'|'self', label, name, color }
//    @param {number}  [options.rawValue] — 적 상태이상의 경우 단순 숫자 값
// ════════════════════════════════════════════════════════════════
export function buildStatusTooltipHTML(statusKey, infoKR, buff, options = {}) {
  const { source = null, rawValue = null } = options;
  const isBuff = !!infoKR?.buff;
  const meta = _getMeta(statusKey);
  const pal = _palette(statusKey, isBuff);
  const isInfinite = meta?.gauge?.infinite || _isInfiniteDurationStatus(statusKey, buff);

  // 타입 레이블 결정
  const typeLabel = meta?.typeLabel ?? (isBuff
    ? (isInfinite ? '버프 · 무한' : '버프')
    : '디버프');

  // 헤더
  const header = `
    <div class="stt-accent-bar" style="background:${pal.accent}"></div>
    <div class="stt-header">
      <div class="stt-icon">${infoKR.icon ?? ''}</div>
      <div class="stt-title-block">
        <div class="stt-name" style="color:${pal.nameColor}">${infoKR.name ?? statusKey}</div>
        <div class="stt-name-en">${meta?.nameEn ?? ''}</div>
        <div class="stt-type-badge" style="background:${pal.typeBg};color:${pal.typeColor}">${typeLabel}</div>
      </div>
    </div>`;

  // 출처 (개선 5)
  const sourceHtml = _buildSource(source);

  // 지속시간 수치 계산 (독의 경우 별도 필드 확인)
  const isPoison = statusKey === 'poisoned';
  const durationValue = isPoison
    ? (options.poisonDuration ?? buff?.poisonDuration ?? 1)
    : (rawValue ?? (Number.isFinite(buff) ? buff : buff?.stacks));

  // 카운트다운 (파멸 등 특수)
  const countdownHtml = meta?.countdown
    ? _buildCountdown(durationValue)
    : '';

  // 태그형 버프 (면역, 은신 등)
  const tagsHtml = _buildTags(meta?.tags);

  // 수치 2분할 (디버프 또는 수치 있는 버프)
  const statsHtml = !meta?.tags && !meta?.countdown
    ? _buildStats(meta, buff, (isPoison ? durationValue : rawValue))
    : '';

  // 게이지 (개선 1)
  let gaugeHtml = '';
  if (isInfinite && !meta?.countdown) {
    gaugeHtml = _buildGauge(99, true, pal.accent);
  } else if (!meta?.countdown) {
    const stacks = Number(durationValue);
    if (Number.isFinite(stacks) && stacks > 0) {
      gaugeHtml = _buildGauge(stacks, false, pal.accent);
    }
  }

  // 다음 턴 예고 (개선 3)
  const nextTurnHtml = meta ? _buildNextTurn(meta, buff, rawValue) : '';

  // 설명
  const descHtml = `<div class="stt-desc">${infoKR.desc ?? ''}</div>`;

  return header + sourceHtml + countdownHtml + tagsHtml + statsHtml + gaugeHtml + nextTurnHtml + descHtml;
}

// ════════════════════════════════════════════════════════════════
//  showStatusTooltip / hideStatusTooltip
//  — #statusTooltip 엘리먼트를 직접 제어
// ════════════════════════════════════════════════════════════════
let _hideTipTimer = null;

export const StatusTooltipUI = {
  /**
   * @param {MouseEvent} event
   * @param {string}     statusKey
   * @param {object}     infoKR      — { icon, name, buff (bool), desc }
   * @param {object}     buff        — player buff object 또는 raw numeric value
   * @param {object}     [options]   — { source, rawValue, doc, win }
   */
  show(event, statusKey, infoKR, buff, options = {}) {
    clearTimeout(_hideTipTimer);

    const doc = options.doc ?? globalThis.document;
    const win = options.win ?? globalThis.window ?? globalThis;

    let el = doc.getElementById('statusTooltip');
    if (!el) {
      el = doc.createElement('div');
      el.id = 'statusTooltip';
      el.className = 'stt';
      doc.body.appendChild(el);
    }

    el.innerHTML = buildStatusTooltipHTML(statusKey, infoKR, buff, options);

    // 글로우 색상
    const isBuff = !!infoKR?.buff;
    const meta = _getMeta(statusKey);
    const pal = _palette(statusKey, isBuff);
    const glowAlpha = isBuff ? ',.1)' : ',.18)';
    const rgb = pal.accent.startsWith('#')
      ? _hexToRgb(pal.accent)
      : '255,51,102';
    el.style.boxShadow = `0 16px 48px rgba(0,0,0,.88),0 0 22px rgba(${rgb}${glowAlpha}`;

    this._position(event, el, win);
    el.classList.add('visible');
  },

  hide(options = {}) {
    const doc = options.doc ?? globalThis.document;
    _hideTipTimer = setTimeout(() => {
      doc.getElementById('statusTooltip')?.classList.remove('visible');
    }, 80);
  },

  cancelHide() {
    clearTimeout(_hideTipTimer);
  },

  _position(event, el, win) {
    const TW = 280, margin = 10;
    const rect = event.currentTarget.getBoundingClientRect();
    let x = rect.right + margin;
    let y = rect.top;
    if (x + TW > win.innerWidth - 8) x = rect.left - TW - margin;
    const th = el.offsetHeight || 320;
    if (y + th > win.innerHeight - 8) y = win.innerHeight - th - 8;
    el.style.left = `${Math.max(8, x)}px`;
    el.style.top = `${Math.max(8, y)}px`;
  },
};

// ── 유틸 ──────────────────────────────────────────────────────
function _hexToRgb(hex) {
  const clean = hex.replace('#', '');
  const n = parseInt(clean.length === 3
    ? clean.split('').map(c => c + c).join('')
    : clean, 16);
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
}
