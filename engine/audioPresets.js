/**
 * audioPresets.js
 * ─────────────────────────────────────────────────────────────────────────────
 * 모든 게임 사운드를 "SoundDef 객체" 형태로 정의하는 데이터 레지스트리.
 * AudioEngine 코드를 건드리지 않고 이 파일에 프리셋만 추가하면 된다.
 *
 * ■ SoundDef 구조
 * {
 *   layers:    Layer[],   // 동시 재생 레이어 목록
 *   variation: number     // 0~1 — 재생마다 랜덤 변화량 (0 = 고정음, 기본 0)
 * }
 *
 * ■ Layer 구조 (kind 기준)
 * kind: 'tone'    — 단일 oscillator (기본값)
 * kind: 'chord'   — freqs[] 화음
 * kind: 'arpeggio'— freqs[] + step(초) 아르페지오
 * kind: 'noise'   — 필터 노이즈
 * kind: 'glide'   — 주파수 글라이드
 * kind: 'lfo'     — LFO 변조 드론 (ambient용)
 *
 * 공통 Layer 필드:
 *   freq, gain, dur, type, detune, attack, decay, sustain, release
 *   timeOffset, freqVar, gainVar, detuneVar, reverb, reverbGain, filter
 *
 * ■ 수정 이력
 *   [FIX-1] click 프리셋     : decay 미명시로 발생하던 엔벨로프 왜곡 수정
 *                              sustain: 0.0 명시로 Attack→Decay→Release 형태 확정
 *   [FIX-2] footstep 프리셋  : noise 레이어의 불필요한 freqVar: 0 제거
 *                              (noise는 freq 필드를 사용하지 않으므로 무의미)
 *   [FIX-3] boss_lair        : 독립 랜덤 interval로 빠르게 어긋나던 심장박동 패턴
 *                              → 고정 interval로 위상 안정화
 *   [FIX-4] buildChainPreset : 캐시 객체 직접 반환으로 외부 오염 가능성 존재
 *                              → layers 배열 내부 각 레이어까지 얕은 복사 후 반환
 *   [FIX-5] getPreset        : subKey 파라미터가 enemy 외 카테고리에서 무시됨
 *                              → JSDoc에 "enemy 전용 파라미터" 명시
 *   [FIX-6] PRESET_REGISTRY   : 엔진 외부 노출용 프리셋 레지스트리를 모듈 내부에서 deepFreeze
 *                              → 엔진 레벨 deepClone/deepFreeze 비용 제거, enemy/regionAmbient 누락 보완
 *   [FIX-7] validatePreset... : 개발 모드에서 범위/형식 오류를 조기 탐지할 수 있는 검증기 추가
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ═══════════════════════════════════════════════════════════════════════════
// 1. 클래스 선택 사운드
// ═══════════════════════════════════════════════════════════════════════════

export const CLASS_SELECT_PRESETS = {

  swordsman: {
    variation: 0.05,
    layers: [
      // 금속성 타격
      { kind: 'tone', freq: 220, dur: 0.1,  type: 'square',   gain: 0.18, attack: 0.005, release: 0.05 },
      { kind: 'noise', dur: 0.06, gain: 0.12, filterFreq: 3500, filterQ: 2, timeOffset: 0 },
      // 반향 상승음
      { kind: 'tone', freq: 440, dur: 0.18, type: 'square',   gain: 0.12, attack: 0.01,  release: 0.1,  timeOffset: 0.06 },
      { kind: 'tone', freq: 330, dur: 0.3,  type: 'sine',     gain: 0.08, attack: 0.02,  release: 0.15, timeOffset: 0.14, reverb: true },
    ],
  },

  mage: {
    variation: 0.06,
    layers: [
      { kind: 'chord', freqs: [523, 659, 784], dur: 0.55, type: 'sine', gain: 0.07, attack: 0.04, sustain: 0.7, release: 0.2, reverb: true, reverbGain: 0.4 },
      { kind: 'tone',  freq: 1047, dur: 0.6,  type: 'sine',  gain: 0.07, attack: 0.06, sustain: 0.6, release: 0.25, timeOffset: 0.1, detune: 7,  reverb: true },
      { kind: 'tone',  freq: 1568, dur: 0.3,  type: 'sine',  gain: 0.04, attack: 0.02, release: 0.15, timeOffset: 0.3, reverb: true },
    ],
  },

  hunter: {
    variation: 0.07,
    layers: [
      { kind: 'tone',  freq: 880, dur: 0.06, type: 'sawtooth', gain: 0.15, attack: 0.004, release: 0.04 },
      { kind: 'noise', dur: 0.05, gain: 0.10, filterFreq: 5000, filterQ: 1.5, timeOffset: 0.01 },
      { kind: 'glide', freqFrom: 660, freqTo: 330, dur: 0.2, type: 'sawtooth', gain: 0.10, attack: 0.01, release: 0.1, timeOffset: 0.05 },
      { kind: 'tone',  freq: 440, dur: 0.25, type: 'sine',     gain: 0.07, attack: 0.02, release: 0.12, timeOffset: 0.1 },
    ],
  },

  paladin: {
    variation: 0.04,
    layers: [
      // 신성한 종소리 느낌: 저음 타격 + 높은 하모닉
      { kind: 'tone',  freq: 174, dur: 1.0,  type: 'sine',   gain: 0.14, attack: 0.01, decay: 0.1,  sustain: 0.4, release: 0.5, reverb: true, reverbGain: 0.5 },
      { kind: 'chord', freqs: [348, 523, 698], dur: 0.9, type: 'sine', gain: 0.06, attack: 0.02, sustain: 0.5, release: 0.4, timeOffset: 0.05, reverb: true, reverbGain: 0.4 },
      { kind: 'tone',  freq: 1046, dur: 0.5, type: 'sine',   gain: 0.04, attack: 0.03, release: 0.3, timeOffset: 0.12, reverb: true },
      { kind: 'noise', dur: 0.04, gain: 0.08, filterFreq: 2500, filterQ: 3, timeOffset: 0 },
    ],
  },

  berserker: {
    variation: 0.1,
    layers: [
      // 거칠고 왜곡된 저음
      { kind: 'tone',  freq: 80,  dur: 0.08, type: 'sawtooth', gain: 0.3,  attack: 0.003, release: 0.05 },
      { kind: 'noise', dur: 0.12, gain: 0.2,  filterFreq: 800,  filterQ: 0.8, timeOffset: 0.01 },
      { kind: 'tone',  freq: 55,  dur: 0.5,  type: 'square',  gain: 0.22, attack: 0.01,  sustain: 0.3, release: 0.25, timeOffset: 0.04 },
      { kind: 'glide', freqFrom: 200, freqTo: 80, dur: 0.3, type: 'sawtooth', gain: 0.15, attack: 0.01, release: 0.1, timeOffset: 0.08 },
    ],
  },

  guardian: {
    variation: 0.04,
    layers: [
      // 방패 부딪히는 무거운 금속음
      { kind: 'noise', dur: 0.08, gain: 0.22, filterFreq: 600,  filterQ: 0.5, timeOffset: 0 },
      { kind: 'tone',  freq: 110, dur: 0.6,  type: 'square',  gain: 0.20, attack: 0.005, decay: 0.08, sustain: 0.3, release: 0.35, reverb: true, reverbGain: 0.3 },
      { kind: 'tone',  freq: 220, dur: 0.35, type: 'sine',    gain: 0.10, attack: 0.01,  decay: 0.06, sustain: 0.4, release: 0.2,  timeOffset: 0.02, reverb: true },
      { kind: 'tone',  freq: 55,  dur: 0.8,  type: 'sine',   gain: 0.12, attack: 0.02,  sustain: 0.2, release: 0.5, timeOffset: 0.1, reverb: true, reverbGain: 0.35 },
    ],
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// 2. 공격 사운드 — ATTACK_PRESETS[attackType]
// ═══════════════════════════════════════════════════════════════════════════

export const ATTACK_PRESETS = {

  /** 기본 베기 (slash) */
  slash: {
    variation: 0.08,
    layers: [
      { kind: 'tone',  freq: 220, dur: 0.08, type: 'square',   gain: 0.17, attack: 0.003, release: 0.045 },
      { kind: 'glide', freqFrom: 260, freqTo: 170, dur: 0.13, type: 'sawtooth', gain: 0.12, attack: 0.004, release: 0.07, timeOffset: 0.008 },
      { kind: 'tone',  freq: 110, dur: 0.16, type: 'sine',     gain: 0.07, attack: 0.006, release: 0.09, timeOffset: 0.014 },
      { kind: 'noise', dur: 0.05, gain: 0.12, filterFreq: 2600, filterQ: 1.4, timeOffset: 0.004 },
    ],
  },

  /** 찌르기 (stab) */
  stab: {
    variation: 0.07,
    layers: [
      { kind: 'tone',  freq: 320, dur: 0.08, type: 'sawtooth', gain: 0.18, attack: 0.003, release: 0.05 },
      { kind: 'noise', dur: 0.05, gain: 0.13, filterFreq: 4000, filterQ: 2, timeOffset: 0 },
      { kind: 'glide', freqFrom: 320, freqTo: 200, dur: 0.12, type: 'sine', gain: 0.08, attack: 0.005, release: 0.07, timeOffset: 0.04 },
    ],
  },

  /** 둔기 타격 (blunt) */
  blunt: {
    variation: 0.06,
    layers: [
      { kind: 'noise', dur: 0.10, gain: 0.22, filterFreq: 500,  filterQ: 0.6, timeOffset: 0 },
      { kind: 'tone',  freq: 90,  dur: 0.25, type: 'square',   gain: 0.20, attack: 0.005, decay: 0.08, sustain: 0.2, release: 0.12 },
      { kind: 'tone',  freq: 60,  dur: 0.35, type: 'sine',     gain: 0.14, attack: 0.01,  release: 0.2, timeOffset: 0.03 },
    ],
  },

  /** 강타 (heavy) */
  heavy: {
    variation: 0.07,
    layers: [
      { kind: 'tone',  freq: 90,  dur: 0.07, type: 'square',   gain: 0.28, attack: 0.003, release: 0.04 },
      { kind: 'noise', dur: 0.08, gain: 0.18, filterFreq: 600,  filterQ: 0.8 },
      { kind: 'tone',  freq: 60,  dur: 0.4,  type: 'sawtooth', gain: 0.22, attack: 0.01,  decay: 0.07, sustain: 0.25, release: 0.2, timeOffset: 0.03 },
      { kind: 'tone',  freq: 40,  dur: 0.55, type: 'sine',     gain: 0.14, attack: 0.02,  release: 0.3,  timeOffset: 0.06, reverb: true },
    ],
  },

  /** 원거리 (projectile) */
  projectile: {
    variation: 0.09,
    layers: [
      { kind: 'glide', freqFrom: 600, freqTo: 200, dur: 0.15, type: 'sawtooth', gain: 0.14, attack: 0.003, release: 0.06 },
      { kind: 'noise', dur: 0.05, gain: 0.10, filterFreq: 3000, filterQ: 1.5, timeOffset: 0.01 },
      { kind: 'tone',  freq: 150, dur: 0.1,  type: 'square',  gain: 0.09, attack: 0.005, release: 0.07, timeOffset: 0.06 },
    ],
  },

  /** 마법 (magic) */
  magic: {
    variation: 0.08,
    layers: [
      { kind: 'chord',    freqs: [392, 523, 659], dur: 0.4,  type: 'sine', gain: 0.09, attack: 0.02, sustain: 0.6, release: 0.2,  reverb: true, reverbGain: 0.4 },
      { kind: 'tone',     freq: 784, dur: 0.3,   type: 'sine', gain: 0.08, attack: 0.01, release: 0.15, timeOffset: 0.06, detune: 7, reverb: true },
      { kind: 'glide',    freqFrom: 1046, freqTo: 523, dur: 0.25, type: 'sine', gain: 0.06, attack: 0.01, release: 0.12, timeOffset: 0.1, reverb: true },
    ],
  },

  /** 독 (poison) */
  poison: {
    variation: 0.1,
    layers: [
      { kind: 'tone',  freq: 220, dur: 0.2,  type: 'sine',     gain: 0.10, attack: 0.01, release: 0.12 },
      { kind: 'glide', freqFrom: 180, freqTo: 120, dur: 0.3, type: 'sine', gain: 0.08, attack: 0.02, release: 0.15, timeOffset: 0.05, reverb: true, reverbGain: 0.3 },
      { kind: 'noise', dur: 0.15, gain: 0.07, filterFreq: 400,  filterQ: 2, timeOffset: 0.02 },
    ],
  },

  /** 암흑/그림자 (shadow) */
  shadow: {
    variation: 0.08,
    layers: [
      { kind: 'tone',  freq: 110, dur: 0.4,  type: 'sawtooth', gain: 0.15, attack: 0.02, sustain: 0.3, release: 0.25, reverb: true, reverbGain: 0.5 },
      { kind: 'tone',  freq: 55,  dur: 0.5,  type: 'square',   gain: 0.12, attack: 0.03, sustain: 0.2, release: 0.3,  reverb: true, reverbGain: 0.45, timeOffset: 0.04 },
      { kind: 'noise', dur: 0.2,  gain: 0.07, filterFreq: 300,  filterQ: 1, timeOffset: 0.01, reverb: true, reverbGain: 0.5 },
    ],
  },

  /** 크리티컬 (모든 공격 타입 공통 레이어로 overlay) */
  critical: {
    variation: 0.06,
    layers: [
      { kind: 'tone',  freq: 300, dur: 0.04, type: 'square',   gain: 0.24, attack: 0.003, release: 0.03 },
      { kind: 'noise', dur: 0.06, gain: 0.14, filterFreq: 4500, filterQ: 2 },
      { kind: 'tone',  freq: 150, dur: 0.12, type: 'square',   gain: 0.20, attack: 0.005, release: 0.07, timeOffset: 0.02 },
      { kind: 'tone',  freq: 75,  dur: 0.45, type: 'sawtooth', gain: 0.14, attack: 0.01,  release: 0.25, timeOffset: 0.05 },
      { kind: 'chord', freqs: [523, 659], dur: 0.35, type: 'sine', gain: 0.07, attack: 0.02, sustain: 0.5, release: 0.2, timeOffset: 0.1, reverb: true, reverbGain: 0.35 },
    ],
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// 3. 방어 사운드 — DEFENSE_PRESETS[defenseType]
// ═══════════════════════════════════════════════════════════════════════════

export const DEFENSE_PRESETS = {

  /** 일반 가드 */
  guard: {
    variation: 0.05,
    layers: [
      { kind: 'noise', dur: 0.07, gain: 0.16, filterFreq: 1800, filterQ: 1.2 },
      { kind: 'tone',  freq: 250, dur: 0.18, type: 'square', gain: 0.13, attack: 0.005, release: 0.1 },
      { kind: 'tone',  freq: 180, dur: 0.25, type: 'sine',   gain: 0.09, attack: 0.01,  release: 0.15, timeOffset: 0.04 },
    ],
  },

  /** 방패 막기 (shieldBlock) */
  shieldBlock: {
    variation: 0.05,
    layers: [
      { kind: 'noise', dur: 0.10, gain: 0.22, filterFreq: 800,  filterQ: 0.7 },
      { kind: 'tone',  freq: 130, dur: 0.4,  type: 'square', gain: 0.20, attack: 0.005, decay: 0.07, sustain: 0.25, release: 0.2, reverb: true },
      { kind: 'tone',  freq: 260, dur: 0.2,  type: 'sine',   gain: 0.10, attack: 0.008, release: 0.12, timeOffset: 0.02 },
    ],
  },

  /** 패링 */
  parry: {
    variation: 0.07,
    layers: [
      { kind: 'noise', dur: 0.04, gain: 0.18, filterFreq: 6000, filterQ: 3 },
      { kind: 'tone',  freq: 880, dur: 0.06, type: 'square',   gain: 0.16, attack: 0.003, release: 0.04 },
      { kind: 'glide', freqFrom: 880, freqTo: 440, dur: 0.15, type: 'square', gain: 0.12, attack: 0.005, release: 0.08, timeOffset: 0.03 },
      { kind: 'tone',  freq: 330, dur: 0.3,  type: 'sine',     gain: 0.08, attack: 0.01,  release: 0.18, timeOffset: 0.06, reverb: true, reverbGain: 0.3 },
    ],
  },

  /** 마법 배리어 (barrier) */
  barrier: {
    variation: 0.07,
    layers: [
      { kind: 'chord',  freqs: [440, 554, 659], dur: 0.5, type: 'sine', gain: 0.08, attack: 0.03, sustain: 0.6, release: 0.25, reverb: true, reverbGain: 0.5 },
      { kind: 'glide',  freqFrom: 220, freqTo: 880, dur: 0.35, type: 'sine', gain: 0.10, attack: 0.01, release: 0.2, timeOffset: 0.05, reverb: true },
      { kind: 'tone',   freq: 1320, dur: 0.2, type: 'sine', gain: 0.05, attack: 0.02, release: 0.12, timeOffset: 0.15, reverb: true },
    ],
  },

  /** 회피 (dodge) */
  dodge: {
    variation: 0.09,
    layers: [
      { kind: 'glide', freqFrom: 500, freqTo: 300, dur: 0.12, type: 'sine', gain: 0.10, attack: 0.005, release: 0.07 },
      { kind: 'noise', dur: 0.05, gain: 0.07, filterFreq: 3500, filterQ: 1.5, timeOffset: 0.01 },
    ],
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// 4. 피격 / 사망
// ═══════════════════════════════════════════════════════════════════════════

export const REACTION_PRESETS = {

  /** 플레이어 피격 */
  playerHit: {
    variation: 0.08,
    layers: [
      { kind: 'tone',  freq: 220, dur: 0.05, type: 'sawtooth', gain: 0.26, attack: 0.003, release: 0.04 },
      { kind: 'noise', dur: 0.06, gain: 0.15, filterFreq: 3000, filterQ: 1.5 },
      { kind: 'tone',  freq: 110, dur: 0.22, type: 'square',   gain: 0.16, attack: 0.008, release: 0.12, timeOffset: 0.02 },
      { kind: 'tone',  freq: 80,  dur: 0.35, type: 'sine',     gain: 0.09, attack: 0.01,  release: 0.2,  timeOffset: 0.05 },
    ],
  },

  /** 적 사망 */
  enemyDeath: {
    variation: 0.07,
    layers: [
      { kind: 'chord', freqs: [110, 138, 165], dur: 1.5, type: 'sawtooth', gain: 0.14, attack: 0.01, sustain: 0.3, release: 0.8, reverb: true, reverbGain: 0.4 },
      { kind: 'glide', freqFrom: 165, freqTo: 55, dur: 1.0, type: 'sine', gain: 0.10, attack: 0.02, release: 0.6, timeOffset: 0.1, reverb: true },
    ],
  },

  /** 회피 성공 (miss) */
  miss: {
    variation: 0.1,
    layers: [
      { kind: 'tone', freq: 400, dur: 0.06, type: 'sine', gain: 0.07, attack: 0.005, release: 0.04 },
    ],
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// 5. 버프 / 디버프 / 힐 / 상태이상
// ═══════════════════════════════════════════════════════════════════════════

export const STATUS_PRESETS = {

  /** 버프 적용 */
  buff: {
    variation: 0.05,
    layers: [
      { kind: 'arpeggio', freqs: [330, 440, 550], step: 0.06, dur: 0.2, type: 'sine', gain: 0.12, attack: 0.01, release: 0.1, reverb: true, reverbGain: 0.3 },
    ],
  },

  /** 디버프 적용 */
  debuff: {
    variation: 0.06,
    layers: [
      { kind: 'arpeggio', freqs: [330, 262, 220], step: 0.07, dur: 0.2, type: 'sawtooth', gain: 0.11, attack: 0.01, release: 0.1 },
      { kind: 'noise', dur: 0.08, gain: 0.07, filterFreq: 500, filterQ: 1, timeOffset: 0.04 },
    ],
  },

  /** 힐 */
  heal: {
    variation: 0.05,
    layers: [
      { kind: 'chord', freqs: [523, 659, 784], dur: 0.42, type: 'sine', gain: 0.085, attack: 0.015, sustain: 0.62, release: 0.18, reverb: true, reverbGain: 0.34 },
      { kind: 'glide', freqFrom: 880, freqTo: 1175, dur: 0.16, type: 'sine', gain: 0.05, attack: 0.01, release: 0.09, timeOffset: 0.03, reverb: true, reverbGain: 0.28 },
      { kind: 'tone',  freq: 1319, dur: 0.22, type: 'sine', gain: 0.04, attack: 0.02, release: 0.11, timeOffset: 0.09, reverb: true, reverbGain: 0.3 },
    ],
  },

  /** 상태이상 부여 (독/화상 등) */
  statusInflict: {
    variation: 0.09,
    layers: [
      { kind: 'glide', freqFrom: 300, freqTo: 180, dur: 0.3, type: 'sine', gain: 0.09, attack: 0.01, release: 0.15 },
      { kind: 'noise', dur: 0.1,  gain: 0.07, filterFreq: 600, filterQ: 2, timeOffset: 0.05 },
    ],
  },

  /** 스킬/버프 카드 사운드 (기존 playSkill 대체)
   *  buff보다 높은 음역 + 짧은 글라이드 레이어로 청각적 구분 */
  skill: {
    variation: 0.05,
    layers: [
      { kind: 'arpeggio', freqs: [440, 587, 740], step: 0.05, dur: 0.18, type: 'sine',     gain: 0.11, attack: 0.008, release: 0.09, reverb: true, reverbGain: 0.25 },
      { kind: 'glide',    freqFrom: 660, freqTo: 880, dur: 0.14, type: 'sine',              gain: 0.07, attack: 0.005, release: 0.08, timeOffset: 0.06 },
    ],
  },

  /** Echo 카드 (기존 playEcho 대체) */
  echo: {
    variation: 0.06,
    layers: [
      { kind: 'chord', freqs: [392, 523, 659], dur: 0.4, type: 'sine', gain: 0.10, attack: 0.02, sustain: 0.6, release: 0.2, reverb: true, reverbGain: 0.35 },
      { kind: 'tone',  freq: 784, dur: 0.3, type: 'sine', gain: 0.08, attack: 0.01, release: 0.15, timeOffset: 0.08, detune: 10, reverb: true },
    ],
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// 6. 아이템 / UI / 발소리
// ═══════════════════════════════════════════════════════════════════════════

export const UI_PRESETS = {

  /** 일반 아이템 획득 */
  itemGet: {
    variation: 0.04,
    layers: [
      { kind: 'chord', freqs: [523, 659, 784, 1047], dur: 0.85, type: 'sine', gain: 0.08, attack: 0.02, sustain: 0.5, release: 0.4, reverb: true, reverbGain: 0.3 },
    ],
  },

  /** 레어 아이템 획득 */
  rareGet: {
    variation: 0.04,
    layers: [
      { kind: 'arpeggio', freqs: [523, 659, 784, 1047, 1319], step: 0.07, dur: 0.4, type: 'sine', gain: 0.10, attack: 0.01, release: 0.2, reverb: true, reverbGain: 0.4 },
      { kind: 'chord',    freqs: [659, 784, 1047], dur: 0.8, type: 'sine', gain: 0.07, attack: 0.04, sustain: 0.6, release: 0.35, timeOffset: 0.38, reverb: true },
    ],
  },

  /** 전설 아이템 획득 */
  legendary: {
    variation: 0.04,
    layers: [
      { kind: 'tone',     freq: 55,  dur: 1.8, type: 'sawtooth', gain: 0.16, attack: 0.02, sustain: 0.3, release: 0.8, reverb: true, reverbGain: 0.4 },
      { kind: 'tone',     freq: 110, dur: 1.4, type: 'sine',     gain: 0.11, attack: 0.03, sustain: 0.4, release: 0.6, reverb: true, reverbGain: 0.3 },
      { kind: 'arpeggio', freqs: [261, 329, 392, 523, 659, 784, 1047, 1319], step: 0.08, dur: 0.5, type: 'sine', gain: 0.11, attack: 0.01, release: 0.25, reverb: true, reverbGain: 0.35 },
      { kind: 'chord',    freqs: [523, 659, 784, 1047, 1319], dur: 1.2, type: 'sine', gain: 0.08, attack: 0.04, sustain: 0.7, release: 0.5, timeOffset: 0.68, reverb: true, reverbGain: 0.45 },
    ],
  },

  /** 카드 사용 */
  card: {
    variation: 0.05,
    layers: [
      { kind: 'tone', freq: 440, dur: 0.12, type: 'sine', gain: 0.09, attack: 0.01, release: 0.07 },
      { kind: 'tone', freq: 550, dur: 0.08, type: 'sine', gain: 0.06, attack: 0.01, release: 0.05, timeOffset: 0.02 },
    ],
  },

  /**
   * [추가] UI 버튼 클릭음 — title_settings_bindings.js 등에서 playClick() 호출 대응.
   * 짧고 맑은 클릭 피드백. card 사운드보다 가볍고 높은 음역대.
   *
   * [FIX-1] decay 미명시 시 기본값 50ms가 적용되어 dur(35ms)를 초과하면서
   *         applyEnvelope 내부에서 safeDcy가 dur*0.35=12ms로 강제 클램핑되고
   *         sustain 구간이 잠식되는 문제 수정.
   *         → attack/decay/sustain/release를 모두 명시하여 엔벨로프 형태 확정.
   */
  click: {
    variation: 0.02,
    layers: [
      { kind: 'tone', freq: 960, dur: 0.05, type: 'triangle', gain: 0.075,
        attack: 0.002, decay: 0.010, sustain: 0.0, release: 0.028 },
      { kind: 'tone', freq: 1440, dur: 0.028, type: 'sine', gain: 0.035,
        attack: 0.001, decay: 0.005, sustain: 0.0, release: 0.016, timeOffset: 0.004 },
      { kind: 'tone', freq: 720, dur: 0.018, type: 'square', gain: 0.02,
        attack: 0.001, decay: 0.003, sustain: 0.0, release: 0.010 },
    ],
  },

  /**
   * 발소리
   * [FIX-2] noise 레이어에 freqVar: 0 가 있었으나 noise는 freq 필드를 사용하지 않으므로
   *         무의미한 필드였음 → 제거하여 혼란 방지.
   */
  footstep: {
    variation: 0.2,
    layers: [
      { kind: 'noise', dur: 0.08, gain: 0.05, filterFreq: 300, filterQ: 0.5 },
      { kind: 'tone',  freq: 80,  dur: 0.1,  type: 'square', gain: 0.04, attack: 0.005, release: 0.06, freqVar: 0.25 },
    ],
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// 7. 보스 / 체인 / 공명 버스트
// ═══════════════════════════════════════════════════════════════════════════

export const EVENT_PRESETS = {

  /** 보스 페이즈 전환 */
  bossPhase: {
    variation: 0.04,
    layers: [
      { kind: 'chord',  freqs: [110, 146, 220, 293], dur: 1.3, type: 'sawtooth', gain: 0.16, attack: 0.02, sustain: 0.5, release: 0.6, reverb: true, reverbGain: 0.5 },
      { kind: 'tone',   freq: 55,  dur: 1.6, type: 'sine', gain: 0.22, attack: 0.03, sustain: 0.4, release: 0.7, reverb: true },
      { kind: 'noise',  dur: 0.15, gain: 0.15, filterFreq: 400, filterQ: 0.6, timeOffset: 0.02, reverb: true, reverbGain: 0.4 },
    ],
  },

  /** 공명 버스트 (게임 클리어 / 특수 이벤트) */
  resonanceBurst: {
    variation: 0.03,
    layers: [
      { kind: 'tone',     freq: 55,  dur: 2.0, type: 'sawtooth', gain: 0.20, attack: 0.02, sustain: 0.3, release: 0.8, reverb: true, reverbGain: 0.5 },
      { kind: 'arpeggio', freqs: [261, 329, 392, 523, 659, 784, 1047], step: 0.07, dur: 0.65, type: 'sine', gain: 0.13, attack: 0.01, release: 0.3, reverb: true, reverbGain: 0.4 },
    ],
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// 8. 적 타입별 피격 리액션 — ENEMY_PRESETS[enemyType]
// ═══════════════════════════════════════════════════════════════════════════

export const ENEMY_PRESETS = {

  /** 야수 (beast) — 으르렁, 살점 */
  beast: {
    hit: {
      variation: 0.12,
      layers: [
        { kind: 'noise', dur: 0.10, gain: 0.18, filterFreq: 700,  filterQ: 0.8 },
        { kind: 'tone',  freq: 120, dur: 0.25, type: 'sawtooth', gain: 0.14, attack: 0.007, release: 0.14, freqVar: 0.08 },
      ],
    },
  },

  /** 언데드 (undead) — 골격 금속음 + 으스스한 잔향 */
  undead: {
    hit: {
      variation: 0.08,
      layers: [
        { kind: 'noise', dur: 0.07, gain: 0.14, filterFreq: 2500, filterQ: 2,   timeOffset: 0 },
        { kind: 'tone',  freq: 180, dur: 0.35, type: 'square',   gain: 0.12, attack: 0.005, release: 0.2,  reverb: true, reverbGain: 0.6 },
        { kind: 'tone',  freq: 90,  dur: 0.5,  type: 'sine',     gain: 0.08, attack: 0.02,  release: 0.35, reverb: true, reverbGain: 0.5, timeOffset: 0.04 },
      ],
    },
  },

  /** 갑주 (armored) — 금속 쨍 */
  armored: {
    hit: {
      variation: 0.06,
      layers: [
        { kind: 'noise', dur: 0.06, gain: 0.20, filterFreq: 4000, filterQ: 2.5 },
        { kind: 'tone',  freq: 400, dur: 0.12, type: 'square',   gain: 0.15, attack: 0.003, release: 0.08 },
        { kind: 'tone',  freq: 200, dur: 0.3,  type: 'sine',     gain: 0.10, attack: 0.008, release: 0.18, timeOffset: 0.03, reverb: true, reverbGain: 0.25 },
      ],
    },
  },

  /** 캐스터 (caster) — 마법적 충격 */
  caster: {
    hit: {
      variation: 0.09,
      layers: [
        { kind: 'chord', freqs: [523, 659], dur: 0.3, type: 'sine', gain: 0.10, attack: 0.01, sustain: 0.4, release: 0.18, reverb: true, reverbGain: 0.4 },
        { kind: 'noise', dur: 0.06, gain: 0.08, filterFreq: 5000, filterQ: 1.5, timeOffset: 0.01 },
      ],
    },
  },

  /** 보스 (boss) — 크고 울림 */
  boss: {
    hit: {
      variation: 0.05,
      layers: [
        { kind: 'noise', dur: 0.12, gain: 0.24, filterFreq: 600,  filterQ: 0.6 },
        { kind: 'tone',  freq: 80,  dur: 0.6,  type: 'sawtooth', gain: 0.22, attack: 0.01,  decay: 0.08, sustain: 0.3, release: 0.35, reverb: true, reverbGain: 0.4 },
        { kind: 'tone',  freq: 40,  dur: 0.8,  type: 'sine',     gain: 0.16, attack: 0.02,  sustain: 0.25, release: 0.5, timeOffset: 0.05, reverb: true, reverbGain: 0.5 },
      ],
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// 9. 지역 Ambient — REGION_AMBIENT_PRESETS[regionKey]
//    각 프리셋은 layers 배열로 정의된다.
//    kind: 'lfo' 레이어는 무한 재생 (dur=0), AudioEngine이 stop handle을 관리.
// ═══════════════════════════════════════════════════════════════════════════

export const REGION_AMBIENT_PRESETS = {

  /** 숲 (forest) — 바람 + 새소리 느낌 */
  forest: {
    layers: [
      // 베이스 드론
      { kind: 'lfo', freq: 82,  gain: 0.032, lfoFreq: 0.06, lfoDepth: 3,  type: 'sine',     attack: 0.8, reverb: true, reverbGain: 0.5 },
      // 모션 레이어
      { kind: 'lfo', freq: 110, gain: 0.018, lfoFreq: 0.13, lfoDepth: 6,  type: 'triangle', attack: 1.1, reverb: true, reverbGain: 0.4 },
      // 랜덤 반짝임 (sparkle): audioEngine에서 주기적으로 트리거
      { kind: 'sparkle', interval: [3000, 7000], note: { kind: 'tone', freq: 1047, dur: 0.4, type: 'sine', gain: 0.03, attack: 0.05, release: 0.3, reverb: true, reverbGain: 0.6 } },
    ],
  },

  /** 폐허 (ruins) — 을씨년스러운 울림 */
  ruins: {
    layers: [
      { kind: 'lfo', freq: 65,  gain: 0.030, lfoFreq: 0.04, lfoDepth: 2,  type: 'sawtooth', attack: 1.1, reverb: true, reverbGain: 0.6 },
      { kind: 'lfo', freq: 87,  gain: 0.016, lfoFreq: 0.09, lfoDepth: 4,  type: 'square',   attack: 1.5, reverb: true, reverbGain: 0.5 },
      { kind: 'lfo', freq: 130, gain: 0.010, lfoFreq: 0.20, lfoDepth: 8,  type: 'sine',     attack: 1.9, reverb: true, reverbGain: 0.4 },
      { kind: 'sparkle', interval: [5000, 12000], note: { kind: 'tone', freq: 523, dur: 0.6, type: 'sine', gain: 0.025, attack: 0.1, release: 0.45, reverb: true, reverbGain: 0.7 } },
    ],
  },

  /** 동굴 (cave) — 낮고 울리는 공간감 */
  cave: {
    layers: [
      { kind: 'lfo', freq: 55,  gain: 0.028, lfoFreq: 0.03, lfoDepth: 2,  type: 'sine',    attack: 1.4, reverb: true, reverbGain: 0.7 },
      { kind: 'lfo', freq: 73,  gain: 0.014, lfoFreq: 0.07, lfoDepth: 3,  type: 'sine',    attack: 1.8, reverb: true, reverbGain: 0.65 },
      // 낙수 느낌 스파클
      { kind: 'sparkle', interval: [1500, 4000], note: { kind: 'tone', freq: 880, dur: 0.2, type: 'sine', gain: 0.022, attack: 0.01, release: 0.18, reverb: true, reverbGain: 0.8 } },
      // 텐션 펄스 (긴 주기)
      { kind: 'tension', interval: [8000, 16000], note: { kind: 'tone', freq: 55, dur: 1.0, type: 'sine', gain: 0.05, attack: 0.1, release: 0.8, reverb: true, reverbGain: 0.6 } },
    ],
  },

  /** 저주받은 도시 (cursed_city) — 불안하고 어두운 분위기 */
  cursed_city: {
    layers: [
      { kind: 'lfo', freq: 51,  gain: 0.030, lfoFreq: 0.05, lfoDepth: 4,  type: 'sawtooth', attack: 1.3, reverb: true, reverbGain: 0.55 },
      { kind: 'lfo', freq: 68,  gain: 0.018, lfoFreq: 0.11, lfoDepth: 7,  type: 'square',   attack: 1.6, reverb: true, reverbGain: 0.45 },
      { kind: 'lfo', freq: 102, gain: 0.012, lfoFreq: 0.17, lfoDepth: 10, type: 'sawtooth', attack: 2.0, reverb: true, reverbGain: 0.4 },
      { kind: 'tension', interval: [4000, 9000],  note: { kind: 'chord', freqs: [110, 138], dur: 1.5, type: 'sawtooth', gain: 0.04, attack: 0.15, sustain: 0.3, release: 0.9, reverb: true, reverbGain: 0.6 } },
      { kind: 'sparkle', interval: [6000, 14000], note: { kind: 'glide', freqFrom: 220, freqTo: 110, dur: 0.5, type: 'sine', gain: 0.028, attack: 0.1, release: 0.35, reverb: true, reverbGain: 0.7 } },
    ],
  },

  /**
   * 보스 굴 (boss_lair) — 긴장감, 낮고 헤비한 맥동
   *
   * [FIX-3] 기존 interval: [1200, 2200] (랜덤) 으로 두 레이어를 독립 구동하면
   *         phaseOffset: 600 으로 맞춘 "쿵-쿵" 심장박동 위상이 수 사이클 안에 무너짐.
   *         → 두 레이어 모두 고정 interval: [1600, 1600] 으로 변경하여 위상 안정화.
   *         위상 어긋남 자체가 필요하다면 두 번째 레이어의 phaseOffset만 조정할 것.
   */
  boss_lair: {
    layers: [
      { kind: 'lfo', freq: 40,  gain: 0.035, lfoFreq: 0.08, lfoDepth: 5,  type: 'sawtooth', attack: 1.1, reverb: true, reverbGain: 0.6 },
      { kind: 'lfo', freq: 60,  gain: 0.020, lfoFreq: 0.04, lfoDepth: 3,  type: 'square',   attack: 1.5, reverb: true, reverbGain: 0.5 },
      { kind: 'lfo', freq: 80,  gain: 0.012, lfoFreq: 0.15, lfoDepth: 6,  type: 'sine',     attack: 1.9, reverb: true, reverbGain: 0.45 },
      // 심장박동: 고정 interval로 위상 유지
      { kind: 'tension', interval: [1600, 1600], note: { kind: 'noise', dur: 0.08, gain: 0.06, filterFreq: 300, filterQ: 0.5, reverb: true, reverbGain: 0.5 } },
      { kind: 'tension', interval: [1600, 1600], note: { kind: 'tone', freq: 40, dur: 0.3, type: 'sine', gain: 0.10, attack: 0.01, release: 0.2, reverb: true, reverbGain: 0.55 },
        phaseOffset: 600 },
    ],
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// 10. 체인 사운드 — 동적으로 생성 (체인 수에 따라 주파수 상승)
// ═══════════════════════════════════════════════════════════════════════════

const CHAIN_FREQS = [261, 329, 392, 523, 659];

/**
 * 체인 수(1~N)를 받아 SoundDef를 반환한다. 결과는 내부적으로 캐시된다.
 *
 * [FIX-4] 기존 코드는 layers 배열만 얕은 복사하여 반환했으나,
 *         각 layer 객체 자체는 캐시와 공유되었음.
 *         호출자가 layer.gain 등을 수정하면 캐시가 오염되는 문제 존재.
 *         → layers 배열의 각 레이어 객체까지 얕은 복사 (spread) 후 반환.
 */
const _chainCache = {};

function cloneLayer(layer) {
  const cloned = { ...layer };
  if (Array.isArray(layer.freqs)) cloned.freqs = [...layer.freqs];
  if (Array.isArray(layer.interval)) cloned.interval = [...layer.interval];
  if (layer.filter && typeof layer.filter === 'object') cloned.filter = { ...layer.filter };
  if (layer.note && typeof layer.note === 'object') cloned.note = cloneLayer(layer.note);
  return cloned;
}

export function buildChainPreset(chainCount) {
  const normalized = Number.isFinite(chainCount) ? Math.floor(chainCount) : 1;
  const key = Math.max(1, Math.min(normalized, CHAIN_FREQS.length));

  if (!_chainCache[key]) {
    const idx = key - 1;
    const f   = CHAIN_FREQS[idx];
    const g   = Math.min(0.09 + key * 0.018, 0.22);
    _chainCache[key] = {
      variation: 0.04,
      layers: [
        { kind: 'chord', freqs: [f, f * 1.25, f * 1.5], dur: 0.35, type: 'sine',
          gain: g, attack: 0.01, sustain: 0.5, release: 0.18,
          reverb: key >= 4, reverbGain: 0.35 },
      ],
    };
  }
  // [FIX-4] 캐시 보호: 중첩 배열/객체(freqs, note, filter 등)까지 복사 후 반환
  const cached = _chainCache[key];
  return { ...cached, layers: cached.layers.map(cloneLayer) };
}

// ═══════════════════════════════════════════════════════════════════════════
// 11. 레지스트리 — 편의 조회 함수
// ═══════════════════════════════════════════════════════════════════════════

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const key of Object.keys(value)) deepFreeze(value[key]);
  return value;
}

const VALID_LAYER_KINDS = new Set(['tone', 'chord', 'arpeggio', 'noise', 'glide', 'lfo', 'sparkle', 'tension']);

function pushValidationIssue(issues, path, message) {
  issues.push(`[audioPresets] ${path}: ${message}`);
}

function isFiniteNumber(value) {
  return Number.isFinite(value);
}

function validateRangeNumber(value, path, label, issues, { min = -Infinity, max = Infinity } = {}) {
  if (value == null) return;
  if (!isFiniteNumber(value)) {
    pushValidationIssue(issues, path, `${label}는 유한한 숫자여야 합니다.`);
    return;
  }
  if (value < min || value > max) {
    pushValidationIssue(issues, path, `${label}는 ${min}~${max} 범위여야 합니다. (현재: ${value})`);
  }
}

function validateLayer(layer, path, issues, { allowAmbientMeta = false } = {}) {
  if (!layer || typeof layer !== 'object') {
    pushValidationIssue(issues, path, 'layer는 객체여야 합니다.');
    return;
  }

  const kind = layer.kind ?? 'tone';
  if (!VALID_LAYER_KINDS.has(kind)) {
    pushValidationIssue(issues, path, `알 수 없는 kind입니다. (${String(kind)})`);
    return;
  }

  validateRangeNumber(layer.gain, path, 'gain', issues, { min: 0, max: 1 });
  validateRangeNumber(layer.dur, path, 'dur', issues, { min: 0 });
  validateRangeNumber(layer.attack, path, 'attack', issues, { min: 0 });
  validateRangeNumber(layer.decay, path, 'decay', issues, { min: 0 });
  validateRangeNumber(layer.release, path, 'release', issues, { min: 0 });
  validateRangeNumber(layer.sustain, path, 'sustain', issues, { min: 0, max: 1 });
  validateRangeNumber(layer.timeOffset, path, 'timeOffset', issues, { min: 0 });
  validateRangeNumber(layer.freqVar, path, 'freqVar', issues);
  validateRangeNumber(layer.gainVar, path, 'gainVar', issues);
  validateRangeNumber(layer.detuneVar, path, 'detuneVar', issues);
  validateRangeNumber(layer.reverbGain, path, 'reverbGain', issues, { min: 0, max: 1 });
  validateRangeNumber(layer.filterQ, path, 'filterQ', issues, { min: 0 });
  validateRangeNumber(layer.filterFreq, path, 'filterFreq', issues, { min: 0 });
  validateRangeNumber(layer.step, path, 'step', issues, { min: 0 });
  validateRangeNumber(layer.phaseOffset, path, 'phaseOffset', issues, { min: 0 });
  validateRangeNumber(layer.lfoFreq, path, 'lfoFreq', issues, { min: 0 });
  validateRangeNumber(layer.lfoDepth, path, 'lfoDepth', issues, { min: 0 });

  if (kind === 'tone' || kind === 'lfo') {
    if ('freq' in layer) validateRangeNumber(layer.freq, path, 'freq', issues, { min: 0 });
    if (kind === 'lfo' && !isFiniteNumber(layer.freq)) {
      pushValidationIssue(issues, path, 'lfo 레이어는 freq를 명시하는 편이 안전합니다.');
    }
  }

  if (kind === 'glide') {
    if (!isFiniteNumber(layer.freqFrom) || !isFiniteNumber(layer.freqTo)) {
      pushValidationIssue(issues, path, 'glide 레이어는 freqFrom / freqTo를 모두 가져야 합니다.');
    }
  }

  if (kind === 'chord' || kind === 'arpeggio') {
    if (!Array.isArray(layer.freqs) || layer.freqs.length === 0) {
      pushValidationIssue(issues, path, `${kind} 레이어는 비어 있지 않은 freqs 배열이 필요합니다.`);
    } else if (layer.freqs.some(freq => !isFiniteNumber(freq) || freq <= 0)) {
      pushValidationIssue(issues, path, 'freqs 배열에는 0보다 큰 숫자만 들어가야 합니다.');
    }
  }

  if (kind === 'sparkle' || kind === 'tension') {
    if (!allowAmbientMeta) {
      pushValidationIssue(issues, path, `${kind} 레이어는 region ambient에서만 사용해야 합니다.`);
    }
    if (!layer.note || typeof layer.note !== 'object') {
      pushValidationIssue(issues, path, `${kind} 레이어는 note 객체가 필요합니다.`);
    } else {
      validateLayer(layer.note, `${path}.note`, issues);
    }
    if (!Array.isArray(layer.interval) || layer.interval.length !== 2) {
      pushValidationIssue(issues, path, `${kind} 레이어는 [minMs, maxMs] interval이 필요합니다.`);
    } else {
      const [minMs, maxMs] = layer.interval;
      if (!isFiniteNumber(minMs) || !isFiniteNumber(maxMs) || minMs < 0 || maxMs < minMs) {
        pushValidationIssue(issues, path, 'interval은 0 이상의 오름차순 숫자 2개여야 합니다.');
      }
    }
  }
}

function validateSoundDef(soundDef, path, issues, { allowAmbientMeta = false } = {}) {
  if (!soundDef || typeof soundDef !== 'object') {
    pushValidationIssue(issues, path, 'SoundDef는 객체여야 합니다.');
    return;
  }

  validateRangeNumber(soundDef.variation, path, 'variation', issues, { min: 0, max: 1 });

  if (!Array.isArray(soundDef.layers) || soundDef.layers.length === 0) {
    pushValidationIssue(issues, path, 'layers는 비어 있지 않은 배열이어야 합니다.');
    return;
  }

  soundDef.layers.forEach((layer, index) => {
    validateLayer(layer, `${path}.layers[${index}]`, issues, { allowAmbientMeta });
  });
}

function validateRegistryGroup(group, path, issues, { nestedSubKeys = false, allowAmbientMeta = false } = {}) {
  Object.entries(group).forEach(([key, value]) => {
    if (nestedSubKeys) {
      Object.entries(value ?? {}).forEach(([subKey, soundDef]) => {
        validateSoundDef(soundDef, `${path}.${key}.${subKey}`, issues, { allowAmbientMeta });
      });
      return;
    }
    validateSoundDef(value, `${path}.${key}`, issues, { allowAmbientMeta });
  });
}

export const PRESET_REGISTRY = deepFreeze({
  classSelect: CLASS_SELECT_PRESETS,
  attack: ATTACK_PRESETS,
  defense: DEFENSE_PRESETS,
  reaction: REACTION_PRESETS,
  status: STATUS_PRESETS,
  ui: UI_PRESETS,
  event: EVENT_PRESETS,
  enemy: ENEMY_PRESETS,
  regionAmbient: REGION_AMBIENT_PRESETS,
});

let _validatedPresetIssues = null;
let _hasLoggedPresetIssues = false;

export function validatePresetRegistry({ logger = console.warn } = {}) {
  if (!_validatedPresetIssues) {
    const issues = [];
    validateRegistryGroup(PRESET_REGISTRY.classSelect, 'classSelect', issues);
    validateRegistryGroup(PRESET_REGISTRY.attack, 'attack', issues);
    validateRegistryGroup(PRESET_REGISTRY.defense, 'defense', issues);
    validateRegistryGroup(PRESET_REGISTRY.reaction, 'reaction', issues);
    validateRegistryGroup(PRESET_REGISTRY.status, 'status', issues);
    validateRegistryGroup(PRESET_REGISTRY.ui, 'ui', issues);
    validateRegistryGroup(PRESET_REGISTRY.event, 'event', issues);
    validateRegistryGroup(PRESET_REGISTRY.enemy, 'enemy', issues, { nestedSubKeys: true });
    validateRegistryGroup(PRESET_REGISTRY.regionAmbient, 'regionAmbient', issues, { allowAmbientMeta: true });
    _validatedPresetIssues = issues;
  }

  if (logger && !_hasLoggedPresetIssues && _validatedPresetIssues.length > 0) {
    _validatedPresetIssues.forEach(issue => logger(issue));
    _hasLoggedPresetIssues = true;
  }

  return [..._validatedPresetIssues];
}

/**
 * 카테고리 키와 서브키로 SoundDef를 조회한다.
 * 없으면 null 반환.
 *
 * @param {'classSelect'|'attack'|'defense'|'reaction'|'status'|'ui'|'event'|'enemy'} category
 * @param {string} key
 * @param {string} [subKey='hit']
 *   ※ enemy 카테고리 전용 파라미터.
 *   enemy 이외의 카테고리에서는 이 값이 무시되며, key가 직접 SoundDef에 대응한다.
 *   향후 다른 카테고리에도 서브키 구조가 필요하다면 이 함수를 확장할 것.
 * @returns {object|null}
 *
 * [FIX-5] subKey 파라미터가 enemy 외 카테고리에서 무시됨을 JSDoc에 명확히 표기.
 *         실수로 다른 카테고리에 subKey를 전달해도 무시되므로 주의할 것.
 */
export function getPreset(category, key, subKey = 'hit') {
  const registry = PRESET_REGISTRY[category];
  if (!registry) return null;

  // 적 타입은 { hit: SoundDef, death: SoundDef, ... } 서브키 구조
  if (category === 'enemy') {
    return registry[key]?.[subKey] ?? null;
  }
  return registry[key] ?? null;
}
