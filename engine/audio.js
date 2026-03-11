/**
 * audioEngine.js  (engine/audio.js 교체용 — 기존 import 경로 유지를 위해 audio.js로 배치 권장)
 * ─────────────────────────────────────────────────────────────────────────────
 * 리팩터링된 Web Audio 재생 엔진.
 *
 * ■ 설계 원칙
 *   - runLayers()/playTone() 같은 helpers로 모든 합성을 위임
 *   - audioPresets.js의 SoundDef 객체를 play(preset) 하나로 재생
 *   - 기존 public API (playHit, playClassSelect, startAmbient …) 100% 유지
 *   - 핵심 합성 스케줄은 AudioContext time scheduling 사용
 *   - ambient의 반복 트리거/정리에는 setTimeout을 보조적으로 사용
 *   - Ambient = 멀티레이어 (lfo drone + sparkle/tension 주기 이벤트)
 *
 * ■ Reverb 라우팅 설계
 *   reverb는 SFX / Ambient용으로 분리된 send를 사용한다.
 *   routing이 'master'이면 wet 신호는 masterGain으로 직결되고,
 *   routing이 'bus'이면 SFX tail은 sfxGain, Ambient tail은 ambientGainNode를 따른다.
 *
 * ■ Public API (기존 호환)
 *   init(), resume(), destroy()
 *   play(preset)                       ← 신규: SoundDef 직접 재생
 *   playEvent(category, key)           ← 신규: 레지스트리 키로 재생
 *   playHit(), playHeavyHit(), playPlayerHit(), playCritical()
 *   playCard(), playClick()            ← playClick: UI 버튼 클릭음 (신규 추가)
 *   playSkill(), playEcho(), playHeal(), playDeath()
 *   playItemGet(), playBossPhase(), playChain(n), playResonanceBurst()
 *   playFootstep(), playClassSelect(cls), playLegendary()
 *   startAmbient(regionKeyOrIndex), stopAmbient()
 *   setVolume(v), setSfxVolume(v), setAmbientVolume(v), getVolumes()
 *
 * ■ 수정 이력
 *   [FIX-1] stopAmbient  : ambientHandles 정리 시 rvNode disconnect 누락 → 추가
 *                          (playLFOTone 반환값에 rvNode가 추가된 것과 연동)
 *   [FIX-2] scheduleNext : ambientTimers.splice(indexOf(id), 1) 에서
 *                          stopAmbient 이후 indexOf === -1 → splice(-1,1)이
 *                          배열 마지막 원소를 지우는 버그 → guard 추가
 *   [FIX-3] play()       : variation이 1을 초과할 때 rand() 범위가 음수로 떨어져
 *                          음수 주파수가 발생할 수 있는 문제 → clampVal로 0~1 클램프
 *   [FIX-4] stopAmbient  : osc/lfo 노드 자체를 disconnect하지 않아 참조가 남는 문제
 *                          → fadeTimeMs 후 osc/lfo/lfoGain disconnect 추가
 *                          (playLFOTone이 lfoGain을 반환값에 포함한 것과 연동)
 *   [FIX-5] startAmbient : stopAmbient()의 페이드아웃(400ms)이 완료되기 전에 새
 *                          ambient가 즉시 시작되어 약 0.4초간 두 ambient가 중첩되는
 *                          문제 → stopAmbient 후 CROSSFADE_MS 딜레이 뒤에 시작
 *   [FIX-6] ambient      : setTimeout 콜백이 이미 실행 중일 때 stopAmbient()가 호출되면
 *                          콜백 내부 scheduleNext()가 이전 ambient를 되살릴 수 있음
 *                          → ambientGeneration 토큰으로 구 세대 재스케줄 차단
 *   [FIX-7] destroy/init : destroy 중 close()가 완료되기 전 상태를 추적하지 않던 문제
 *                          → closingPromise/즉시 disconnect로 생명주기 안정성 보강
 *   [FIX-8] presets      : 프리셋 deepClone/deepFreeze를 엔진에서 제거하고
 *                          audioPresets.js의 PRESET_REGISTRY/validator를 사용
 *   [FIX-9] reverb route : wet 신호를 master 직결 또는 각 버스 추종(bus)으로 선택 가능
 *   [FIX-10] class warn  : 알 수 없는 클래스 선택 시 warnOnce로 개발 중 오타 탐지 보강
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { runLayers, playLFOTone, buildReverb, rand, clamp as clampVal, clearNoiseBufferCache } from './audioHelpers.js';
import {
  CLASS_SELECT_PRESETS,
  ATTACK_PRESETS,
  DEFENSE_PRESETS,
  REACTION_PRESETS,
  STATUS_PRESETS,
  UI_PRESETS,
  EVENT_PRESETS,
  REGION_AMBIENT_PRESETS,
  PRESET_REGISTRY,
  buildChainPreset,
  getPreset,
  validatePresetRegistry,
} from './audioPresets.js';

export const AudioEngine = (() => {

  // ─────────────────────────── 내부 상태 ──────────────────────────────────

  let ctx             = null;
  let masterGain      = null;
  let sfxGain         = null;
  let ambientGainNode = null;
  let sfxReverbUnit   = null;
  let ambientReverbUnit = null;
  let sfxReverbSend   = null;
  let ambientReverbSend = null;
  let closingPromise  = null;
  let ambientGeneration = 0;
  let presetValidationDone = false;

  const warnedKeys = new Set();

  /** 현재 실행 중인 ambient 핸들 목록 */
  let ambientHandles = [];
  /** 현재 ambient 주기 이벤트 타이머 ID 목록 */
  let ambientTimers  = [];

  const _volumes = { master: 0.35, sfx: 0.7, ambient: 0.4 };
  const _config = { reverbRouting: 'master' };

  /** 인덱스 기반 호환 키 (startAmbient(number) 지원) */
  const LEGACY_AMBIENT_KEYS = ['forest', 'ruins', 'cave', 'cursed_city', 'boss_lair'];

  /**
   * stopAmbient의 fadeOut과 다음 ambient 시작 사이의 지연(ms).
   * 완전 무음 구간을 줄이기 위해 fadeOut(400ms)보다 짧게 잡아 짧은 겹침만 허용한다.
   */
  const CROSSFADE_MS = 250;
  const VOLUME_SMOOTH_TIME = 0.025;

  function warnOnce(key, message, ...args) {
    if (warnedKeys.has(key)) return;
    warnedKeys.add(key);
    console.warn(message, ...args);
  }

  function isProductionBuild() {
    return typeof process !== 'undefined' && process?.env?.NODE_ENV === 'production';
  }

  function ensurePresetRegistryValidated() {
    if (presetValidationDone || isProductionBuild()) return;
    presetValidationDone = true;
    validatePresetRegistry();
  }

  function normalizeReverbRouting(mode) {
    return mode === 'bus' ? 'bus' : 'master';
  }

  function applyReverbRouting() {
    if (!masterGain || !sfxGain || !ambientGainNode) return;

    const routing = normalizeReverbRouting(_config.reverbRouting);
    const mapping = routing === 'bus'
      ? [
          [sfxReverbUnit, sfxGain],
          [ambientReverbUnit, ambientGainNode],
        ]
      : [
          [sfxReverbUnit, masterGain],
          [ambientReverbUnit, masterGain],
        ];

    mapping.forEach(([unit, target]) => {
      if (!unit?.wetGain || !target) return;
      try { unit.wetGain.disconnect(); } catch (_) {}
      unit.wetGain.connect(target);
    });
  }

  function resolveReverbSend(dest, reverbBus = 'auto') {
    if (reverbBus === 'ambient') return ambientReverbSend;
    if (reverbBus === 'sfx') return sfxReverbSend;
    return dest === ambientGainNode ? ambientReverbSend : sfxReverbSend;
  }

  function registerAmbientTimer(id) {
    ambientTimers.push(id);
    return id;
  }

  function consumeAmbientTimer(id) {
    const idx = ambientTimers.indexOf(id);
    if (idx !== -1) ambientTimers.splice(idx, 1);
  }

  function rampGain(gainNode, value, timeConstant = VOLUME_SMOOTH_TIME) {
    if (!ctx || !gainNode) return;
    const t = ctx.currentTime;
    const param = gainNode.gain;

    if (typeof param.cancelAndHoldAtTime === 'function') {
      try {
        param.cancelAndHoldAtTime(t);
      } catch (_) {
        param.cancelScheduledValues(t);
        param.setValueAtTime(param.value, t);
      }
    } else {
      param.cancelScheduledValues(t);
      param.setValueAtTime(param.value, t);
    }

    param.setTargetAtTime(value, t, timeConstant);
  }

  // ─────────────────────────── Init / Resume ──────────────────────────────

  function init() {
    if (ctx) return true;
    try {
      ensurePresetRegistryValidated();

      const AudioContextCtor = globalThis.AudioContext || globalThis.webkitAudioContext;
      if (!AudioContextCtor) {
        warnOnce('no-audio-context', '[AudioEngine] Web Audio API를 지원하지 않는 환경입니다.');
        return false;
      }
      if (closingPromise) {
        warnOnce('context-close-pending', '[AudioEngine] 이전 AudioContext close()가 아직 완료되지 않았습니다. destroy()를 await하면 더 안전합니다.');
      }

      ctx = new AudioContextCtor();

      // Master gain
      masterGain = ctx.createGain();
      masterGain.gain.value = _volumes.master;
      masterGain.connect(ctx.destination);

      // SFX sub-gain
      sfxGain = ctx.createGain();
      sfxGain.gain.value = _volumes.sfx;
      sfxGain.connect(masterGain);

      // Ambient sub-gain
      ambientGainNode = ctx.createGain();
      ambientGainNode.gain.value = _volumes.ambient;
      ambientGainNode.connect(masterGain);

      // Reverb (buildReverb helper 사용)
      sfxReverbUnit = buildReverb(ctx, { roomSize: 1.8, decay: 2.2, wet: 0.18 });
      ambientReverbUnit = buildReverb(ctx, { roomSize: 1.8, decay: 2.2, wet: 0.18 });
      sfxReverbSend = sfxReverbUnit.send;
      ambientReverbSend = ambientReverbUnit.send;
      applyReverbRouting();
      return true;

    } catch (e) {
      console.warn('[AudioEngine] init failed:', e);
      return false;
    }
  }

  function resume() {
    if (ctx?.state === 'suspended') {
      Promise.resolve(ctx.resume()).catch(() => {});
    }
  }

  function ensureReady(caller = 'play') {
    if (!ctx && !init()) {
      warnOnce(`unavailable:${caller}`, `[AudioEngine] ${caller} 호출을 처리할 수 없습니다.`);
      return false;
    }
    resume();
    return !!ctx;
  }

  // ─────────────────────────── 핵심 재생 API ──────────────────────────────

  /**
   * SoundDef 객체를 직접 재생한다.
   * @param {object} preset   audioPresets.js 에서 정의된 SoundDef
   * @param {object} [opts]   { dest }  출력 노드 오버라이드 (기본: sfxGain)
   *
   * [FIX-3] preset.variation이 1을 초과하면 rand() 범위가 음수가 되어 음수 주파수가
   *         생성될 수 있었음 → clampVal로 0~1 범위로 강제 클램프.
   */
  function play(preset, opts = {}) {
    if (!preset?.layers) return;
    if (!ensureReady('play')) return;

    const dest = opts.dest ?? sfxGain ?? masterGain;
    const reverbSend = resolveReverbSend(dest, opts.reverbBus ?? 'auto');
    // [FIX-3] variation을 0~1로 클램프하여 rand() 범위가 음수가 되지 않도록 보정
    const v = clampVal(preset.variation ?? 0, 0, 1);
    const variationSeed = v === 0 ? 0.5 : rand(0.5 - v / 2, 0.5 + v / 2);

    runLayers(ctx, dest, reverbSend, preset.layers, variationSeed);
  }

  /**
   * 레지스트리 카테고리 + 키로 사운드를 재생한다.
   * enemy 카테고리는 subKey(hit/death/attack 등)를 지정할 수 있다.
   *
   * @param {'classSelect'|'attack'|'defense'|'reaction'|'status'|'ui'|'event'|'enemy'} category
   * @param {string} key
   * @param {object|string} [opts]
   *   - object: { subKey?, dest? }
   *   - string: enemy 서브키를 바로 전달하는 축약형
   * @param {object} [legacyOpts]
   *   opts가 string일 때의 추가 옵션
   */
  function playEvent(category, key, opts = {}, legacyOpts = {}) {
    const normalizedOpts =
      typeof opts === 'string' ? opts :
      (opts && typeof opts === 'object' ? opts : {});

    const isStringSubKey = typeof normalizedOpts === 'string';
    const subKey = isStringSubKey ? normalizedOpts : (normalizedOpts.subKey ?? 'hit');
    const playOpts = isStringSubKey
      ? (legacyOpts && typeof legacyOpts === 'object' ? legacyOpts : {})
      : (() => {
          const { subKey: _ignoredSubKey, ...rest } = normalizedOpts;
          return rest;
        })();

    const preset = getPreset(category, key, subKey);
    if (!preset) {
      const detail = category === 'enemy' ? `${category}/${key}/${subKey}` : `${category}/${key}`;
      console.warn(`[AudioEngine] playEvent: preset not found — ${detail}`);
      return;
    }
    play(preset, playOpts);
  }

  // ─────────────────────────── Ambient System ─────────────────────────────

  /**
   * 지역 Ambient를 시작한다.
   * @param {string|number} regionKeyOrIndex
   *   string → REGION_AMBIENT_PRESETS 키
   *   number → 인덱스 (기존 호환)
   *
   * stopAmbient() 직후 새 ambient를 즉시 시작하면 두 ambient가 과하게 중첩된다.
   * 현재는 stopAmbient 후 CROSSFADE_MS(250ms) 뒤에 시작해 공백은 줄이고 겹침도 제한한다.
   */
  function startAmbient(regionKeyOrIndex) {
    if (!ensureReady('startAmbient')) return;

    const generation = ambientGeneration + 1;
    ambientGeneration = generation;
    stopAmbientInternal({ bumpGeneration: false });

    // [FIX-5] 페이드아웃 완료 후 새 ambient 시작
    const startTimer = registerAmbientTimer(setTimeout(() => {
      consumeAmbientTimer(startTimer);
      if (generation !== ambientGeneration || !ctx) return;
      _startAmbientInternal(regionKeyOrIndex, generation);
    }, CROSSFADE_MS));
  }

  /**
   * 실제 ambient 레이어를 생성하고 재생을 시작하는 내부 함수.
   * startAmbient()에서만 호출한다.
   * @param {string|number} regionKeyOrIndex
   */
  function _startAmbientInternal(regionKeyOrIndex, generation) {
    if (!ctx) return;

    // 인덱스 → 키 변환 (기존 호환)
    const key = typeof regionKeyOrIndex === 'number'
      ? (LEGACY_AMBIENT_KEYS[regionKeyOrIndex] ?? LEGACY_AMBIENT_KEYS[0])
      : regionKeyOrIndex;

    const preset = REGION_AMBIENT_PRESETS[key];
    if (!preset) {
      console.warn(`[AudioEngine] startAmbient: unknown region — ${key}`);
      return;
    }

    const dest = ambientGainNode ?? masterGain;

    preset.layers.forEach(layer => {
      if (layer.kind === 'lfo') {
        // 무한 드론 — stop handle을 보관
        const handle = playLFOTone(ctx, dest, {
          freq:       layer.freq,
          dur:        0,          // 무한
          type:       layer.type ?? 'sine',
          gain:       layer.gain,
          lfoFreq:    layer.lfoFreq  ?? 0.08,
          lfoDepth:   layer.lfoDepth ?? 4,
          attack:     layer.attack   ?? 1.0,
          reverbSend: layer.reverb ? ambientReverbSend : null,
          reverbGain: layer.reverbGain ?? 0.4,
        });
        if (handle) ambientHandles.push(handle);

      } else if (layer.kind === 'sparkle' || layer.kind === 'tension') {
        // 주기적 이벤트 — 재귀 타이머로 관리
        const [minMs, maxMs] = layer.interval ?? [3000, 8000];
        const phaseOffset    = layer.phaseOffset ?? 0;

        const scheduleNext = () => {
          if (generation !== ambientGeneration || !ctx) return;
          const delay = rand(minMs, maxMs);
          const id = registerAmbientTimer(setTimeout(() => {
            consumeAmbientTimer(id);
            if (generation !== ambientGeneration || !ctx) return;
            playAmbientNote(layer.note, dest);
            scheduleNext();
          }, delay));
        };

        const phaseId = registerAmbientTimer(setTimeout(() => {
          consumeAmbientTimer(phaseId);
          if (generation !== ambientGeneration || !ctx) return;
          scheduleNext();
        }, phaseOffset));
      }
    });
  }

  /** ambient 레이어의 단일 note(SoundDef layer)를 즉시 재생 */
  function playAmbientNote(note, dest) {
    if (!ctx || !note) return;
    const d = dest ?? ambientGainNode ?? masterGain;

    // note는 단일 레이어 정의
    runLayers(ctx, d, ambientReverbSend, [note], rand(0, 1));
  }

  /**
   * 현재 Ambient를 모두 중지한다.
   * gain을 먼저 fade out한 뒤 oscillator를 stop하고,
   * fade 완료 후 모든 노드를 disconnect한다.
   */
  function stopAmbientInternal({ bumpGeneration = true } = {}) {
    if (bumpGeneration) ambientGeneration += 1;

    const fadeTime   = 0.4;
    const fadeTimeMs = (fadeTime + 0.1) * 1000;

    // 드론 fade out → stop → disconnect
    ambientHandles.forEach(h => {
      if (h.gainNode && ctx) {
        h.gainNode.gain.setTargetAtTime(0, ctx.currentTime, fadeTime / 3);
        const stopAt = ctx.currentTime + fadeTime;
        try { h.osc?.stop(stopAt); } catch (_) {}
        try { h.lfo?.stop(stopAt); } catch (_) {}

        // [FIX-1] fade 완료 후 rvNode 및 gainNode disconnect
        // [FIX-4] osc, lfo, lfoGain 노드도 명시적으로 disconnect하여 참조 해제
        setTimeout(() => {
          try { h.osc?.disconnect(); }      catch (_) {}
          try { h.lfo?.disconnect(); }      catch (_) {}
          try { h.lfoGain?.disconnect(); }  catch (_) {}
          try { h.gainNode?.disconnect(); } catch (_) {}
          if (h.rvNode) { try { h.rvNode.disconnect(); } catch (_) {} }
        }, fadeTimeMs);
      } else {
        // ctx가 없거나 gainNode가 없는 비정상 상태 — 즉시 정리
        try { h.osc?.stop(); }           catch (_) {}
        try { h.lfo?.stop(); }           catch (_) {}
        try { h.osc?.disconnect(); }     catch (_) {}
        try { h.lfo?.disconnect(); }     catch (_) {}
        try { h.lfoGain?.disconnect(); } catch (_) {}
        try { h.gainNode?.disconnect(); } catch (_) {}
        if (h.rvNode) { try { h.rvNode.disconnect(); } catch (_) {} }
      }
    });
    ambientHandles = [];

    // 타이머 clear (startAmbient의 CROSSFADE 딜레이 타이머 포함)
    ambientTimers.forEach(id => clearTimeout(id));
    ambientTimers = [];
  }

  function stopAmbient() {
    stopAmbientInternal({ bumpGeneration: true });
  }

  // ─────────────────────────── Volume 관리 ────────────────────────────────

  function setVolume(v) {
    _volumes.master = clampVal(v, 0, 1);
    if (masterGain) rampGain(masterGain, _volumes.master);
  }
  function setSfxVolume(v) {
    _volumes.sfx = clampVal(v, 0, 1);
    if (sfxGain) rampGain(sfxGain, _volumes.sfx);
  }
  function setAmbientVolume(v) {
    _volumes.ambient = clampVal(v, 0, 1);
    if (ambientGainNode) rampGain(ambientGainNode, _volumes.ambient);
  }
  function getVolumes() { return { ..._volumes }; }

  function setReverbRouting(mode) {
    const normalized = normalizeReverbRouting(mode);
    if (normalized !== mode) {
      warnOnce(`invalid-reverb-routing:${String(mode)}`, `[AudioEngine] 알 수 없는 reverbRouting 값입니다. 'master' 또는 'bus'를 사용하세요: ${String(mode)}`);
    }
    _config.reverbRouting = normalized;
    if (ctx) applyReverbRouting();
    return _config.reverbRouting;
  }

  function getConfig() {
    return { ..._config };
  }

  // ─────────────────────────── 기존 Public API 호환 래퍼 ──────────────────
  // 기존 코드에서 AudioEngine.playHit() 같이 직접 호출하는 부분을
  // 변경 없이 동작하게 한다.

  // ── 기본 공격
  const playHit        = () => play(ATTACK_PRESETS.slash);
  const playHeavyHit   = () => play(ATTACK_PRESETS.heavy);

  // ── 피격
  const playPlayerHit  = () => play(REACTION_PRESETS.playerHit);

  // ── 크리티컬
  const playCritical   = () => play(ATTACK_PRESETS.critical);

  // ── UI / 카드
  const playCard       = () => play(UI_PRESETS.card);

  /**
   * UI 버튼 클릭음.
   * title_settings_bindings.js 등 AudioEngine.playClick?.() 호출부에 대응한다.
   */
  const playClick      = () => play(UI_PRESETS.click);

  const playSkill      = () => play(STATUS_PRESETS.skill);
  const playEcho       = () => play(STATUS_PRESETS.echo);

  // ── 힐 / 사망
  const playHeal       = () => play(STATUS_PRESETS.heal);
  const playDeath      = () => play(REACTION_PRESETS.enemyDeath);

  // ── 아이템
  const playItemGet    = () => play(UI_PRESETS.itemGet);
  const playLegendary  = () => play(UI_PRESETS.legendary);

  // ── 보스 / 버스트
  const playBossPhase      = () => play(EVENT_PRESETS.bossPhase);
  const playResonanceBurst = () => play(EVENT_PRESETS.resonanceBurst);

  // ── 발소리
  const playFootstep   = () => play(UI_PRESETS.footstep);

  // ── 체인 (체인 수에 따라 동적 생성)
  const playChain = (chainCount) => play(buildChainPreset(chainCount));

  // ── 클래스 선택
  function playClassSelect(cls) {
    const preset = CLASS_SELECT_PRESETS[cls];
    if (preset) {
      play(preset);
    } else {
      warnOnce(`unknown-class-select:${String(cls)}`, `[AudioEngine] 알 수 없는 클래스 선택 프리셋입니다: ${String(cls)}`);
      // 알 수 없는 클래스 → 기본 카드음
      play(UI_PRESETS.card);
    }
  }

  // ─────────────────────────── 정리 / 해제 ────────────────────────────────

  /**
   * AudioContext를 완전히 종료한다.
   * SPA 씬 전환이나 컴포넌트 언마운트 시 호출하면 AudioContext 누적 생성을 방지한다.
   */
  function destroy() {
    stopAmbientInternal({ bumpGeneration: true });

    const closingCtx = ctx;
    const nodesToDisconnect = [masterGain, sfxGain, ambientGainNode, sfxReverbUnit?.wetGain, ambientReverbUnit?.wetGain, sfxReverbUnit?.convolver, ambientReverbUnit?.convolver];
    nodesToDisconnect.forEach(node => {
      if (!node) return;
      try { node.disconnect(); } catch (_) {}
    });

    ctx = null;
    masterGain = null;
    sfxGain = null;
    ambientGainNode = null;
    sfxReverbUnit = null;
    ambientReverbUnit = null;
    sfxReverbSend = null;
    ambientReverbSend = null;
    clearNoiseBufferCache();

    if (!closingCtx) return closingPromise ?? Promise.resolve();

    const closeTask = Promise.resolve()
      .then(() => closingCtx.close())
      .catch(() => {})
      .finally(() => {
        if (closingPromise === closeTask) closingPromise = null;
      });

    closingPromise = closeTask;
    return closeTask;
  }

  // ─────────────────────────── Return Public API ──────────────────────────

  return {
    // ── 초기화
    init,
    resume,
    destroy,

    // ── 신규 API
    play,
    playEvent,
    stopAmbient,

    // ── 기존 호환 API
    playHit,
    playHeavyHit,
    playPlayerHit,
    playCritical,
    playCard,
    playClick,       // ← 신규 추가
    playSkill,
    playEcho,
    playHeal,
    playDeath,
    playItemGet,
    playBossPhase,
    playChain,
    playResonanceBurst,
    startAmbient,
    playFootstep,
    playClassSelect,
    playLegendary,

    // ── 볼륨
    setVolume,
    setSfxVolume,
    setAmbientVolume,
    getVolumes,
    setReverbRouting,
    getConfig,

    // ── 직접 레지스트리 접근 (고급 사용)
    presets: PRESET_REGISTRY,
  };
})();
