/**
 * audioHelpers.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Web Audio API 합성 프리미티브 모음.
 * AudioEngine / preset 코드가 직접 AudioContext를 다루지 않아도 되도록
 * 저수준 오퍼레이션을 캡슐화한다.
 *
 * 모든 함수는 ctx(AudioContext)와 dest(AudioNode)를 첫 인자로 받아
 * 외부 상태에 의존하지 않는다.
 *
 * ■ 수정 이력
 *   [FIX-1] playTone / playNoise  : 고정 50ms 오버런 → 동적 stopBuffer (dur 비례)
 *   [FIX-2] playLFOTone           : reverb send(rvNode) 반환값에 포함 누락 → 반환
 *   [FIX-3] playLFOTone (dur > 0) : osc ended 시 모든 노드 disconnect 누락 → 추가
 *   [FIX-4] buildReverb           : send 명칭 주석 보강 (convolver 입력임을 명시)
 *   [FIX-5] playLFOTone           : lfoGain 노드 반환값에 포함 누락 → 추가
 *                                   (stopAmbient에서 메모리 누수 방지)
 *   [FIX-6] applyEnvelope         : safeAtk+safeDcy+safeRel 합산이 dur을 초과할 때
 *                                   release 구간이 설계보다 짧아지는 문제 → 비율 스케일 보정
 *   [FIX-7] playNoise             : 모노 버퍼 → 스테레오 버퍼 (채널별 독립 난수로 공간감 개선)
 *   [FIX-8] buildReverb           : 단순 지수 감쇠 IR → pre-delay(20ms) 추가로 공간감 개선
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─────────────────────────── 내부 유틸 ──────────────────────────────────────

/** min~max 사이 랜덤 (기본: 0~1) */
export function rand(min = 0, max = 1) { return min + Math.random() * (max - min); }

/** 값을 min~max 사이로 클램프 */
export function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

/** n 반음 위의 주파수 배율 (예: semitone(12) === 2) */
export function semitone(n) { return Math.pow(2, n / 12); }

const MIN_FREQ_HZ = 10;
const MAX_FREQ_HZ = 24000;
const MIN_DURATION_SEC = 0.005;
const MIN_Q = 0.0001;
const MAX_GAIN = 1;
const OSC_TYPES = new Set(['sine', 'square', 'sawtooth', 'triangle']);
const FILTER_TYPES = new Set(['lowpass', 'highpass', 'bandpass', 'lowshelf', 'highshelf', 'peaking', 'notch', 'allpass']);
const NOISE_CACHE_QUANTUM_SEC = 0.005;
const MAX_NOISE_BUFFER_CACHE = 48;
const _noiseBufferCache = new Map();

function sanitizeFreq(freq, fallback = 220) {
  const n = Number.isFinite(freq) ? freq : fallback;
  return clamp(n, MIN_FREQ_HZ, MAX_FREQ_HZ);
}

function sanitizeDuration(dur, fallback = 0.3) {
  const n = Number.isFinite(dur) ? dur : fallback;
  return Math.max(MIN_DURATION_SEC, n);
}

function sanitizeUnit(value, fallback = 0) {
  const n = Number.isFinite(value) ? value : fallback;
  return clamp(n, 0, 1);
}

function sanitizeGain(value, fallback = 0.15, max = MAX_GAIN) {
  const n = Number.isFinite(value) ? value : fallback;
  return clamp(n, 0, max);
}

function sanitizeQ(value, fallback = 1) {
  const n = Number.isFinite(value) ? value : fallback;
  return Math.max(MIN_Q, n);
}

function sanitizeOscType(type, fallback = 'sine') {
  return OSC_TYPES.has(type) ? type : fallback;
}

function sanitizeFilterType(type, fallback = 'lowpass') {
  return FILTER_TYPES.has(type) ? type : fallback;
}

function quantizeNoiseDuration(dur) {
  return Math.ceil(sanitizeDuration(dur) / NOISE_CACHE_QUANTUM_SEC) * NOISE_CACHE_QUANTUM_SEC;
}

function getNoiseBuffer(ctx, dur) {
  const quantizedDur = quantizeNoiseDuration(dur);
  const cacheKey = `${ctx.sampleRate}:${quantizedDur.toFixed(3)}`;
  const cached = _noiseBufferCache.get(cacheKey);
  if (cached) return cached;

  const frames = Math.ceil(ctx.sampleRate * quantizedDur);
  const buf = ctx.createBuffer(2, frames, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const data = buf.getChannelData(c);
    for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1;
  }

  if (_noiseBufferCache.size >= MAX_NOISE_BUFFER_CACHE) {
    const oldestKey = _noiseBufferCache.keys().next().value;
    if (oldestKey) _noiseBufferCache.delete(oldestKey);
  }
  _noiseBufferCache.set(cacheKey, buf);
  return buf;
}

export function clearNoiseBufferCache() {
  _noiseBufferCache.clear();
}

// ─────────────────────────── Envelope ───────────────────────────────────────

/**
 * GainNode에 ADSR-like 엔벨로프를 적용한다.
 * attack + decay + release가 dur을 초과해도 타임라인이 단조증가하도록 내부에서 보정한다.
 *
 * @param {GainNode}     gainNode
 * @param {AudioContext} ctx
 * @param {object}       env   { attack, decay, sustain, release, peak }
 * @param {number}       startTime  ctx.currentTime 기준 절대 시간
 * @param {number}       dur        총 사운드 길이(초)
 *
 * [FIX-6] 기존 코드는 safeAtk, safeDcy, safeRel을 각각 개별 클램프하므로
 *         합산이 최대 dur*1.1에 도달해 release 구간이 설계값보다 짧아질 수 있었음.
 *         → 합산이 dur을 초과하면 세 구간을 비율에 맞게 동시 축소한다.
 */
export function applyEnvelope(gainNode, ctx, env, startTime, dur) {
  const {
    attack  = 0.01,
    decay   = 0.05,
    sustain = 0.6,
    release = 0.1,
    peak    = 0.2,
  } = env;

  const safeSustain = sanitizeUnit(sustain, 0.6);
  const safePeak = sanitizeGain(peak, 0.2);

  // dur 내에서 attack+decay+release가 겹치지 않도록 먼저 개별 클램프
  let safeAtk = Math.min(attack,  dur * 0.35);
  let safeDcy = Math.min(decay,   dur * 0.35);
  let safeRel = Math.min(release, dur * 0.40);

  // [FIX-6] 합산이 dur을 초과하면 세 값을 비율 스케일로 동시 축소
  const total = safeAtk + safeDcy + safeRel;
  if (total > dur) {
    const scale = dur / total;
    safeAtk *= scale;
    safeDcy *= scale;
    safeRel *= scale;
  }

  const atkEnd   = startTime + safeAtk;
  const dcyEnd   = startTime + safeAtk + safeDcy;
  const relStart = Math.max(dcyEnd, startTime + dur - safeRel);
  const end      = startTime + dur;

  const g = gainNode.gain;
  g.cancelScheduledValues(startTime);
  g.setValueAtTime(0,                 startTime);
  g.linearRampToValueAtTime(safePeak,         atkEnd);
  g.linearRampToValueAtTime(safePeak * safeSustain, dcyEnd);
  g.setValueAtTime(safePeak * safeSustain,          relStart);
  g.linearRampToValueAtTime(0,                   end);
}

// ─────────────────────────── 기본 Tone ──────────────────────────────────────

/**
 * 단일 oscillator 톤.
 * @param {AudioContext}    ctx
 * @param {AudioNode}       dest    출력 노드
 * @param {object}          opts
 *   freq      기본 주파수 (Hz)
 *   dur       길이 (초)
 *   type      파형 ('sine'|'square'|'sawtooth'|'triangle')
 *   gain      피크 게인
 *   detune    detune (cents)
 *   attack    어택 (초)
 *   decay     디케이 (초)
 *   sustain   서스테인 비율 (0~1)
 *   release   릴리즈 (초)
 *   timeOffset  ctx.currentTime 기준 오프셋 (초)
 *   freqGlide   { to, time } — 주파수 글라이드
 *   reverbSend  reverb 노드 (있으면 연결)
 *   reverbGain  reverb send 레벨 (기본 0.25)
 *   filter      { type, freq, Q } — 선택적 biquad 필터 (주파수 필드명: freq)
 * @returns OscillatorNode | null
 */
export function playTone(ctx, dest, opts = {}) {
  const {
    freq       = 220,
    dur        = 0.3,
    type       = 'sine',
    gain       = 0.15,
    detune     = 0,
    attack     = 0.01,
    decay      = 0.05,
    sustain    = 0.5,
    release    = 0.08,
    timeOffset = 0,
    freqGlide  = null,
    reverbSend = null,
    reverbGain = 0.25,
    filter     = null, // { type, freq, Q }
  } = opts;

  if (!ctx) return null;
  const safeDur = sanitizeDuration(dur);
  const safeFreq = sanitizeFreq(freq);
  const safeGain = sanitizeGain(gain, 0.15, 0.8);
  const safeDetune = Number.isFinite(detune) ? detune : 0;
  const safeType = sanitizeOscType(type);
  const safeTimeOffset = Math.max(0, timeOffset);
  const safeReverbGain = sanitizeGain(reverbGain, 0.25);
  const safeFilterFreq = sanitizeFreq(filter?.freq ?? 800, 800);
  const safeFilterQ = sanitizeQ(filter?.Q ?? 1, 1);
  const safeFilterType = sanitizeFilterType(filter?.type ?? 'lowpass');
  const safeGlideTo = freqGlide ? sanitizeFreq(freqGlide.to, safeFreq) : null;
  const safeGlideTime = freqGlide ? Math.max(0.001, Number.isFinite(freqGlide.time) ? freqGlide.time : safeDur * 0.7) : null;
  const t = ctx.currentTime + safeTimeOffset;

  const osc = ctx.createOscillator();
  const g   = ctx.createGain();

  let bqNode = null;
  let rvNode = null;

  osc.type         = safeType;
  osc.frequency.setValueAtTime(safeFreq, t);
  osc.detune.value  = safeDetune;

  if (safeGlideTo) {
    osc.frequency.linearRampToValueAtTime(safeGlideTo, t + safeGlideTime);
  }

  applyEnvelope(g, ctx, { attack, decay, sustain, release, peak: safeGain }, t, safeDur);

  // 선택적 필터 삽입
  if (filter) {
    bqNode = ctx.createBiquadFilter();
    bqNode.type            = safeFilterType;
    bqNode.frequency.value = safeFilterFreq;
    bqNode.Q.value         = safeFilterQ;
    osc.connect(bqNode);
    bqNode.connect(g);
  } else {
    osc.connect(g);
  }

  g.connect(dest);

  if (reverbSend) {
    rvNode = ctx.createGain();
    rvNode.gain.value = safeReverbGain;
    g.connect(rvNode);
    rvNode.connect(reverbSend);
  }

  osc.start(t);

  // [FIX-1] 고정 50ms 오버런 → dur 비례 동적 버퍼 (짧은 사운드 낭비 방지)
  const stopBuffer = Math.max(0.02, safeDur * 0.08);
  osc.stop(t + safeDur + stopBuffer);

  osc.addEventListener('ended', () => {
    try { osc.disconnect(); }   catch (_) {}
    try { g.disconnect(); }     catch (_) {}
    if (bqNode) { try { bqNode.disconnect(); } catch (_) {} }
    if (rvNode) { try { rvNode.disconnect(); } catch (_) {} }
  }, { once: true });

  return osc;
}

// ─────────────────────────── Chord ──────────────────────────────────────────

/**
 * 여러 주파수를 동시에 울리는 화음.
 * @param {AudioContext} ctx
 * @param {AudioNode}    dest
 * @param {number[]}     freqs
 * @param {object}       opts  playTone 옵션과 동일 (freq는 freqs 배열로 대체)
 */
export function playChord(ctx, dest, freqs, opts = {}) {
  freqs.forEach((freq, i) =>
    playTone(ctx, dest, { ...opts, freq, detune: (opts.detune ?? 0) + i * 3 })
  );
}

// ─────────────────────────── Arpeggio ───────────────────────────────────────

/**
 * 시간차를 두고 음을 순서대로 재생하는 아르페지오.
 * @param {AudioContext} ctx
 * @param {AudioNode}    dest
 * @param {number[]}     freqs
 * @param {number}       step   음 간격 (초)
 * @param {object}       opts   playTone 옵션
 */
export function playArpeggio(ctx, dest, freqs, step = 0.08, opts = {}) {
  freqs.forEach((freq, i) =>
    playTone(ctx, dest, { ...opts, freq, timeOffset: (opts.timeOffset ?? 0) + i * step })
  );
}

// ─────────────────────────── Noise Burst ────────────────────────────────────

/**
 * 필터링된 화이트 노이즈 버스트 (타격음 질감용).
 * @param {AudioContext} ctx
 * @param {AudioNode}    dest
 * @param {object}       opts
 *   dur        길이 (초)
 *   gain       피크 게인
 *   attack     어택
 *   decay      디케이 (기본 0.02)
 *   sustain    서스테인 비율 (기본 0.4)
 *   release    릴리즈
 *   filterFreq 로우패스 주파수 (Hz) — 낮을수록 둔탁
 *   filterQ    Q값
 *   timeOffset 시작 오프셋 (초)
 *   reverbSend reverb 노드
 *   reverbGain reverb send 레벨
 *
 * [FIX-7] 기존 모노(1채널) 버퍼 → 스테레오(2채널) 버퍼로 변경.
 *         두 채널에 독립적인 난수를 써서 공간감이 더 자연스러워진다.
 */
export function playNoise(ctx, dest, opts = {}) {
  const {
    dur        = 0.12,
    gain       = 0.15,
    attack     = 0.002,
    decay      = 0.02,
    sustain    = 0.4,
    release    = 0.08,
    filterFreq = 1200,
    filterQ    = 1,
    timeOffset = 0,
    reverbSend = null,
    reverbGain = 0.2,
  } = opts;

  if (!ctx) return null;
  const safeDur = sanitizeDuration(dur);
  const safeGain = sanitizeGain(gain, 0.15, 0.8);
  const safeTimeOffset = Math.max(0, timeOffset);
  const safeFilterFreq = sanitizeFreq(filterFreq, 1200);
  const safeFilterQ = sanitizeQ(filterQ, 1);
  const safeReverbGain = sanitizeGain(reverbGain, 0.2);
  const t = ctx.currentTime + safeTimeOffset;

  const src = ctx.createBufferSource();
  src.buffer = getNoiseBuffer(ctx, safeDur);

  const filt = ctx.createBiquadFilter();
  filt.type            = 'lowpass';
  filt.frequency.value = safeFilterFreq;
  filt.Q.value         = safeFilterQ;

  const g = ctx.createGain();
  applyEnvelope(g, ctx, { attack, decay, sustain, release, peak: safeGain }, t, safeDur);

  src.connect(filt);
  filt.connect(g);
  g.connect(dest);

  let rvNode = null;
  if (reverbSend) {
    rvNode = ctx.createGain();
    rvNode.gain.value = safeReverbGain;
    g.connect(rvNode);
    rvNode.connect(reverbSend);
  }

  src.start(t);

  // [FIX-1] 동적 stopBuffer 적용
  const stopBuffer = Math.max(0.02, safeDur * 0.08);
  src.stop(t + safeDur + stopBuffer);

  src.addEventListener('ended', () => {
    try { src.disconnect(); }  catch (_) {}
    try { filt.disconnect(); } catch (_) {}
    try { g.disconnect(); }    catch (_) {}
    if (rvNode) { try { rvNode.disconnect(); } catch (_) {} }
  }, { once: true });

  return src;
}

// ─────────────────────────── Pitch Glide ─────────────────────────────────────

/**
 * 주파수를 freqTo까지 글라이드하는 톤 (보스 페이즈, 스킬 등에 쓰임).
 * playTone의 freqGlide 옵션과 동일하지만 더 명시적인 래퍼.
 */
export function playPitchGlide(ctx, dest, opts = {}) {
  const {
    freqFrom = 100,
    freqTo   = 400,
    dur      = 0.5,
    type     = 'sine',
    gain     = 0.15,
    attack   = 0.01,
    release  = 0.1,
    timeOffset = 0,
    reverbSend = null,
    reverbGain = 0.3,
  } = opts;

  return playTone(ctx, dest, {
    freq: freqFrom,
    dur, type, gain, attack, release, timeOffset, reverbSend, reverbGain,
    freqGlide: { to: freqTo, time: dur * 0.8 },
  });
}

// ─────────────────────────── LFO Modulated Tone ──────────────────────────────

/**
 * LFO로 주파수를 변조하는 톤 (ambient drone 전용 — startAmbient()에서 사용).
 * @param {AudioContext} ctx
 * @param {AudioNode}    dest
 * @param {object}       opts
 *   freq       캐리어 주파수
 *   dur        길이 (0이면 무한 — 반드시 반환값의 stop()을 호출해야 함)
 *   type       캐리어 파형
 *   gain       피크 게인
 *   lfoFreq    LFO 주파수 (Hz)
 *   lfoDepth   LFO depth (cents)
 *   timeOffset 시작 오프셋
 * @returns { osc, lfo, lfoGain, gainNode, rvNode }
 *   — stopAmbient()에서 stop() 및 disconnect() 호출용.
 *   — [FIX-2] rvNode를 반환값에 포함시켜 stopAmbient에서 정리 가능하도록 수정.
 *   — [FIX-5] lfoGain을 반환값에 포함시켜 메모리 누수 방지.
 */
export function playLFOTone(ctx, dest, opts = {}) {
  const {
    freq       = 110,
    dur        = 0,       // 0 = 무한
    type       = 'sine',
    gain       = 0.05,
    lfoFreq    = 0.1,
    lfoDepth   = 5,       // cents
    timeOffset = 0,
    attack     = 0.5,
    reverbSend = null,
    reverbGain = 0.35,
  } = opts;

  if (!ctx) return null;
  const safeDur = dur > 0 ? sanitizeDuration(dur) : 0;
  const safeFreq = sanitizeFreq(freq);
  const safeGain = sanitizeGain(gain, 0.05, 0.6);
  const safeType = sanitizeOscType(type);
  const safeLfoFreq = Math.max(0.001, Number.isFinite(lfoFreq) ? lfoFreq : 0.1);
  const safeLfoDepth = Math.max(0, Number.isFinite(lfoDepth) ? lfoDepth : 5);
  const safeTimeOffset = Math.max(0, timeOffset);
  const safeAttack = Math.max(0.001, Number.isFinite(attack) ? attack : 0.5);
  const safeReverbGain = sanitizeGain(reverbGain, 0.35);
  const t = ctx.currentTime + safeTimeOffset;

  const osc     = ctx.createOscillator();
  const lfo     = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  const g       = ctx.createGain();

  osc.type          = safeType;
  osc.frequency.setValueAtTime(safeFreq, t);
  lfo.type          = 'sine';
  lfo.frequency.setValueAtTime(safeLfoFreq, t);
  lfoGain.gain.setValueAtTime(safeLfoDepth, t);

  lfo.connect(lfoGain);
  lfoGain.connect(osc.detune);   // cents 단위 진동
  osc.connect(g);
  g.connect(dest);

  // [FIX-2] rvNode를 클로저 외부에 선언해 반환값에 포함
  let rvNode = null;
  if (reverbSend) {
    rvNode = ctx.createGain();
    rvNode.gain.value = safeReverbGain;
    g.connect(rvNode);
    rvNode.connect(reverbSend);
  }

  // 부드러운 fade in
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(safeGain, t + safeAttack);

  osc.start(t);
  lfo.start(t);

  if (safeDur > 0) {
    osc.stop(t + safeDur);
    lfo.stop(t + safeDur);

    // [FIX-3] dur > 0 종료 후 모든 노드 disconnect (무한 루프 경로는 stopAmbient가 담당)
    osc.addEventListener('ended', () => {
      try { osc.disconnect(); }     catch (_) {}
      try { lfo.disconnect(); }     catch (_) {}
      try { lfoGain.disconnect(); } catch (_) {}
      try { g.disconnect(); }       catch (_) {}
      if (rvNode) { try { rvNode.disconnect(); } catch (_) {} }
    }, { once: true });
  }

  // [FIX-2] rvNode 반환 — stopAmbient()에서 정리할 수 있도록
  // [FIX-5] lfoGain 반환 — stopAmbient()에서 disconnect로 메모리 누수 방지
  return { osc, lfo, lfoGain, gainNode: g, rvNode };
}

// ─────────────────────────── Reverb Builder ──────────────────────────────────

/**
 * 임펄스 응답 기반 컨볼루션 리버브를 생성한다.
 * @param {AudioContext} ctx
 * @param {object}       opts
 *   roomSize   잔향 길이 (초)  기본 1.5
 *   decay      감쇠 지수      기본 2
 *   wet        wet gain       기본 0.18
 *   preDelay   초기 반사 지연 (초) 기본 0.02
 * @returns { convolver, wetGain, send }
 *   — send === convolver 입력 노드.
 *     각 레이어의 rvNode를 send에 connect하면 wet 신호가 추가된다.
 *
 * [FIX-4] send가 convolver 자체임을 주석으로 명확히 표기.
 *   "send"라는 이름이 pre-fader send 버스를 연상시킬 수 있으나,
 *   여기서는 단순히 convolver 입력 노드를 의미한다.
 *
 * [FIX-8] 단순 지수 감쇠 화이트 노이즈 IR에 pre-delay(기본 20ms)를 추가.
 *         pre-delay 구간(샘플 0 ~ preDelayFrames-1)은 0으로 유지하여
 *         직접음과 잔향음 사이에 자연스러운 갭을 만들어 공간감을 개선한다.
 */
export function buildReverb(ctx, opts = {}) {
  const { roomSize = 1.5, decay = 2, wet = 0.18, preDelay = 0.02 } = opts;

  const safePreDelay = Math.max(0, Number.isFinite(preDelay) ? preDelay : 0.02);
  const safeRoomSize = Math.max(Number.isFinite(roomSize) ? roomSize : 1.5, safePreDelay + 0.02);
  const safeDecay = Math.max(0.1, Number.isFinite(decay) ? decay : 2);
  const safeWet = sanitizeUnit(wet, 0.18);

  const convolver = ctx.createConvolver();
  const len       = Math.ceil(ctx.sampleRate * safeRoomSize);
  const buf       = ctx.createBuffer(2, len, ctx.sampleRate);

  // [FIX-8] pre-delay 프레임 수 계산
  const preDelayFrames = Math.min(len - 1, Math.ceil(ctx.sampleRate * safePreDelay));
  const irLen          = Math.max(1, len - preDelayFrames);

  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c);
    // pre-delay 구간: 0으로 유지 (직접음과 잔향 사이 갭)
    for (let i = 0; i < preDelayFrames; i++) d[i] = 0;
    // 잔향 구간: 지수 감쇠 화이트 노이즈
    for (let i = 0; i < irLen; i++)
      d[preDelayFrames + i] = (Math.random() * 2 - 1) * Math.pow(1 - i / irLen, safeDecay);
  }
  convolver.buffer = buf;

  const wetGain = ctx.createGain();
  wetGain.gain.value = safeWet;
  convolver.connect(wetGain);

  // send = convolver 입력 노드. 레이어 rvNode.connect(send) 시 wet 신호로 라우팅됨.
  return { convolver, wetGain, send: convolver };
}

// ─────────────────────────── Layer Runner ────────────────────────────────────

/**
 * SoundDef.layers 배열을 순회하며 각 레이어를 재생한다.
 *
 * @param {AudioContext}   ctx
 * @param {AudioNode}      dest
 * @param {AudioNode|null} reverbSend
 * @param {object[]}       layers
 * @param {number}         variationSeed  0~1 랜덤값 (콜 시점에 고정)
 */
export function runLayers(ctx, dest, reverbSend, layers, variationSeed = 0.5) {
  if (!ctx || !layers) return;

  layers.forEach(layer => {
    if (!layer || typeof layer !== 'object') return;

    // freq가 없는 kind(noise, chord, arpeggio)는 NaN 방지를 위해 안전한 기본값 사용
    const baseFreq = sanitizeFreq(layer.freq ?? 220);
    const vAmt = (layer.freqVar ?? 0) * (variationSeed - 0.5);
    const freqRatio = clamp(1 + vAmt, 0.1, 4);
    const vFreq = sanitizeFreq(baseFreq * freqRatio, baseFreq);
    const rawGain = (layer.gain ?? 0.1) * (1 + (layer.gainVar ?? 0) * (variationSeed - 0.5));
    if (rawGain <= 0) return;

    const vDetune = (layer.detune ?? 0) + (layer.detuneVar ?? 0) * (variationSeed - 0.5) * 2;
    const vFreqs = (layer.freqs ?? [vFreq]).map(freq => sanitizeFreq(freq * freqRatio, vFreq));
    const kind = layer.kind ?? 'tone';

    const shared = {
      freq:       vFreq,
      gain:       clamp(rawGain, 0, 0.6),
      dur:        sanitizeDuration(layer.dur ?? 0.3),
      type:       layer.type      ?? 'sine',
      detune:     vDetune,
      attack:     layer.attack    ?? 0.01,
      decay:      layer.decay     ?? 0.05,
      sustain:    layer.sustain   ?? 0.5,
      release:    layer.release   ?? 0.08,
      timeOffset: Math.max(0, layer.timeOffset ?? 0),
      filter:     layer.filter    ?? null,
      reverbSend: layer.reverb ? reverbSend : null,
      reverbGain: layer.reverbGain ?? 0.25,
    };

    switch (kind) {
      case 'noise':
        playNoise(ctx, dest, {
          dur:        shared.dur,
          gain:       shared.gain,
          attack:     shared.attack,
          decay:      shared.decay,
          sustain:    shared.sustain,
          release:    shared.release,
          filterFreq: layer.filterFreq ?? 1200,
          filterQ:    layer.filterQ    ?? 1,
          timeOffset: shared.timeOffset,
          reverbSend: shared.reverbSend,
          reverbGain: shared.reverbGain,
        });
        break;

      case 'glide': {
        const glideRatio = clamp(1 + vAmt * 0.5, 0.1, 4);
        playPitchGlide(ctx, dest, {
          freqFrom:   sanitizeFreq((layer.freqFrom ?? vFreq) * glideRatio, vFreq),
          freqTo:     sanitizeFreq((layer.freqTo   ?? vFreq * 2) * glideRatio, vFreq * 2),
          dur:        shared.dur,
          type:       shared.type,
          gain:       shared.gain,
          attack:     shared.attack,
          release:    shared.release,
          timeOffset: shared.timeOffset,
          reverbSend: shared.reverbSend,
          reverbGain: shared.reverbGain,
        });
        break;
      }

      case 'chord':
        playChord(ctx, dest, vFreqs, {
          ...shared,
          gain: shared.gain / (vFreqs.length || 1) * 1.4,
        });
        break;

      case 'arpeggio':
        playArpeggio(ctx, dest, vFreqs, layer.step ?? 0.08, shared);
        break;

      case 'lfo':
        // lfo 레이어는 startAmbient()의 전용 경로로만 재생해야 함.
        // runLayers에서 직접 호출하면 stop handle이 없는 무한 oscillator가 생성된다.
        console.warn('[runLayers] lfo 레이어는 startAmbient()를 통해서만 재생하세요.');
        break;

      case 'tone':
        playTone(ctx, dest, shared);
        break;

      default:
        console.warn(`[runLayers] unknown layer kind: ${kind}`);
        break;
    }
  });
}
