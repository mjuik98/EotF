import {
  getStatusTooltipSemanticMeta,
  normalizeStatusKey,
} from './status_effects_data.js';

export const STATUS_TOOLTIP_META = {
  // ── 플레이어 디버프 ──────────────────────────────────────────────
  burning: {
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
    accent: '#f97316', nameColor: '#fb923c',
    typeBg: 'rgba(249,115,22,.12)', typeColor: '#f97316',
    nextTurnText: (_buff) => '공격 피해 50% 감소',
    nextTurnDmg: () => null,
    statLabel: '공격 감소', statValue: () => '50',
    statUnit: '%', statColor: '#fb923c',
  },
  stunned: {
    accent: '#f59e0b', nameColor: '#fbbf24',
    typeBg: 'rgba(245,158,11,.12)', typeColor: '#f59e0b',
    nextTurnText: (_buff) => '행동 불가',
    nextTurnDmg: () => null,
    statLabel: '에너지', statValue: () => '0',
    statUnit: '강제', statColor: '#fbbf24',
  },
  cursed: {
    accent: '#7c3aed', nameColor: '#a78bfa',
    typeBg: 'rgba(124,58,237,.12)', typeColor: '#7c3aed',
    nextTurnText: (_buff) => '카드 효과 및 회복 감소',
    nextTurnDmg: () => null,
    statLabel: '지속', statValue: (buff, val) => String(val ?? buff?.stacks ?? buff ?? '?'),
    statUnit: '턴', statColor: '#a78bfa',
  },
  vulnerable: {
    accent: '#ef4444', nameColor: '#fca5a5',
    typeBg: 'rgba(239,68,68,.12)', typeColor: '#ef4444',
    nextTurnText: (_buff) => '받는 피해 50% 증가',
    nextTurnDmg: () => null,
    statLabel: '피해 증폭', statValue: () => '50',
    statUnit: '%', statColor: '#fca5a5',
  },
  confusion: {
    accent: '#8b5cf6', nameColor: '#c4b5fd',
    typeBg: 'rgba(139,92,246,.12)', typeColor: '#8b5cf6',
    nextTurnText: (_buff) => '손패 무작위 셔플',
    nextTurnDmg: () => null,
    statLabel: '지속', statValue: (buff, val) => String(val ?? buff?.stacks ?? buff ?? '?'),
    statUnit: '턴', statColor: '#c4b5fd',
  },
  slowed: {
    accent: '#0891b2', nameColor: '#67e8f9',
    typeBg: 'rgba(8,145,178,.12)', typeColor: '#0891b2',
    nextTurnText: (_buff) => '다음 턴 에너지 -1',
    nextTurnDmg: () => null,
    statLabel: '에너지 감소', statValue: () => '-1',
    statUnit: '/턴', statColor: '#67e8f9',
  },
  // ── 플레이어 버프 ──────────────────────────────────────────────
  immune: {
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
    accent: '#475569', nameColor: '#94a3b8',
    typeBg: 'rgba(71,85,105,.2)', typeColor: '#64748b',
    tags: [
      { label: '다음 공격 치명타', color: '#94a3b8', border: 'rgba(148,163,184,.15)', bg: 'rgba(148,163,184,.07)' },
      { label: '공격 즉시 해제', color: '#94a3b8', border: 'rgba(148,163,184,.15)', bg: 'rgba(148,163,184,.07)' },
    ],
    gauge: { infinite: true, color: '#475569' },
    nextTurnText: null, nextTurnDmg: () => null,
  },
  focus: {
    accent: '#0f766e', nameColor: '#5eead4',
    typeBg: 'rgba(15,118,110,.18)', typeColor: '#2dd4bf',
    tags: [
      { label: '다음 공격 치명타', color: '#5eead4', border: 'rgba(94,234,212,.22)', bg: 'rgba(45,212,191,.08)' },
      { label: '공격 즉시 해제', color: '#5eead4', border: 'rgba(94,234,212,.22)', bg: 'rgba(45,212,191,.08)' },
    ],
    gauge: { infinite: true, color: '#0f766e' },
    nextTurnText: null, nextTurnDmg: () => null,
  },
  critical_turn: {
    accent: '#dc2626', nameColor: '#fca5a5',
    typeBg: 'rgba(220,38,38,.16)', typeColor: '#f87171',
    tags: [
      { label: '이번 턴 전체 치명타', color: '#fca5a5', border: 'rgba(252,165,165,.22)', bg: 'rgba(248,113,113,.08)' },
      { label: '턴 종료 시 해제', color: '#fca5a5', border: 'rgba(252,165,165,.22)', bg: 'rgba(248,113,113,.08)' },
    ],
    nextTurnText: null, nextTurnDmg: () => null,
    statLabel: '지속',
    statValue: (buff, val) => String(val ?? buff?.stacks ?? buff ?? 1),
    statUnit: '턴',
    statColor: '#fca5a5',
  },
  dodge: {
    accent: '#00ffcc', nameColor: '#67e8cc',
    typeBg: 'rgba(0,255,204,.08)', typeColor: '#00ffcc',
    tags: [
      { label: '다음 공격 무효', color: '#00ffcc', border: 'rgba(0,255,204,.2)', bg: 'rgba(0,255,204,.07)' },
      { label: '1회 소모', color: '#00ffcc', border: 'rgba(0,255,204,.2)', bg: 'rgba(0,255,204,.07)' },
    ],
    nextTurnText: null, nextTurnDmg: () => null,
  },
  mirror: {
    accent: '#818cf8', nameColor: '#a5b4fc',
    typeBg: 'rgba(129,140,248,.1)', typeColor: '#818cf8',
    statLabel: '반사율', statValue: () => '100',
    statUnit: '%', statColor: '#a5b4fc',
    nextTurnText: null, nextTurnDmg: () => null,
  },
  resonance: {
    accent: '#7b2fff', nameColor: '#a855f7',
    typeBg: 'rgba(123,47,255,.12)', typeColor: '#7b2fff',
    gauge: { infinite: true, color: '#7b2fff' },
    nextTurnText: null, nextTurnDmg: () => null,
    statLabel: '피해 보너스', statValue: (buff) => String(buff?.dmgBonus ?? 0),
    statUnit: '+dmg', statColor: '#a855f7',
  },
  acceleration: {
    accent: '#f59e0b', nameColor: '#fde68a',
    typeBg: 'rgba(245,158,11,.1)', typeColor: '#f59e0b',
    nextTurnText: null, nextTurnDmg: () => null,
    statLabel: '피해 보너스', statValue: (buff) => String(buff?.dmgBonus ?? 0),
    statUnit: '+dmg', statColor: '#fde68a',
  },
  blessing_of_light: {
    accent: '#fcd34d', nameColor: '#fef08a',
    typeBg: 'rgba(252,211,77,.1)', typeColor: '#fcd34d',
    gauge: { infinite: true, color: '#fcd34d' },
    nextTurnText: (buff) => `다음 턴 체력 +${buff?.healPerTurn ?? '?'}`,
    nextTurnDmg: () => null,
    statLabel: '회복량', statValue: (buff) => String(buff?.healPerTurn ?? '?'),
    statUnit: '/턴', statColor: '#fef08a',
  },
  stunImmune: {
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
    accent: '#f0b429', nameColor: '#f0b429',
    typeBg: 'rgba(240,180,41,.1)', typeColor: '#f0b429',
    countdown: true,
    nextTurnText: (buff, val) => `${val ?? '?'}턴 후 피해 폭발`,
    nextTurnDmg: () => null,
  },
  unbreakable_wall: {
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

function _makeInfiniteBuffMeta(extra = {}) {
  return {
    ...BUFF_INFINITE_PALETTE,
    gauge: { infinite: true, color: '#8b5cf6' },
    ...extra,
  };
}

const STATUS_TOOLTIP_META_OVERRIDES = {
  resonance: _makeInfiniteBuffMeta({
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
    nextTurnText: (buff) => `매 턴 시작 시 에너지 +${buff?.energyPerTurn ?? 1}`,
    nextTurnDmg: () => null,
    statLabel: '에너지/턴',
    statValue: (buff) => String(buff?.energyPerTurn ?? 1),
    statUnit: '',
    statColor: '#c4b5fd',
  }),
  time_warp_plus: _makeInfiniteBuffMeta({
    nextTurnText: (buff) => `매 턴 시작 시 에너지 +${buff?.energyPerTurn ?? 2}`,
    nextTurnDmg: () => null,
    statLabel: '에너지/턴',
    statValue: (buff) => String(buff?.energyPerTurn ?? 2),
    statUnit: '',
    statColor: '#c4b5fd',
  }),
  blessing_of_light: _makeInfiniteBuffMeta({
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
    nextTurnText: () => '피격 시 공격자에게 반사 피해를 줍니다.',
    nextTurnDmg: () => null,
    statLabel: '반사 피해',
    statValue: (buff) => String(buff?.dmg ?? buff?.stacks ?? '?'),
    statUnit: '',
    statColor: '#c4b5fd',
  }),
  immune: _makeInfiniteBuffMeta({
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
    nextTurnText: (buff) => `기절 무효 ${buff?.stacks ?? 1}회`,
    nextTurnDmg: () => null,
    statLabel: '무효 횟수',
    statValue: (buff) => String(buff?.stacks ?? 1),
    statUnit: '회',
    statColor: '#c4b5fd',
  }),
  mirror: _makeInfiniteBuffMeta({
    nextTurnText: () => '받은 피해를 그대로 반사합니다.',
    nextTurnDmg: () => null,
    statLabel: '반사율',
    statValue: () => '100',
    statUnit: '%',
    statColor: '#c4b5fd',
  }),
  divine_aura: _makeInfiniteBuffMeta({
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
    nextTurnText: () => '이번 턴 적 공격을 반사하고 무효화합니다.',
    nextTurnDmg: () => null,
    statLabel: null,
    statValue: () => '',
    statUnit: '',
    statColor: '#c4b5fd',
  }),
  echo_on_hit: _makeInfiniteBuffMeta({
    nextTurnText: () => '공격 적중 시 추가 잔향을 획득합니다.',
    nextTurnDmg: () => null,
    statLabel: null,
    statValue: () => '',
    statUnit: '',
    statColor: '#c4b5fd',
  }),
  echo_berserk: _makeInfiniteBuffMeta({
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

export function getStatusTooltipMeta(statusKey) {
  const semanticMeta = getStatusTooltipSemanticMeta(statusKey);
  const visualMeta = _getMeta(statusKey);
  if (!semanticMeta) return visualMeta;
  if (!visualMeta) return semanticMeta;
  return { ...visualMeta, ...semanticMeta };
}

export function resolveStatusTooltipPalette(statusKey, isBuff, options = {}) {
  const { isInfinite = false } = options;
  const meta = _getMeta(statusKey);
  if (meta) return meta;
  if (isBuff && isInfinite) return BUFF_INFINITE_PALETTE;
  return isBuff ? BUFF_FALLBACK : DEBUFF_FALLBACK;
}
