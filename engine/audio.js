const AudioEngine = (() => {
  let ctx = null, masterGain = null, reverbNode = null;
  let sfxGain = null, ambientGainNode = null;
  let ambientOsc = null, ambientStarted = false;

  function init() {
    if (ctx) return;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = ctx.createGain();
      masterGain.gain.value = 0.35;
      masterGain.connect(ctx.destination);
      // SFX sub-gain
      sfxGain = ctx.createGain();
      sfxGain.gain.value = 0.7;
      sfxGain.connect(masterGain);
      // Ambient sub-gain
      ambientGainNode = ctx.createGain();
      ambientGainNode.gain.value = 0.4;
      ambientGainNode.connect(masterGain);
      // リバーブ
      const convolver = ctx.createConvolver();
      const len = ctx.sampleRate * 1.5;
      const buf = ctx.createBuffer(2, len, ctx.sampleRate);
      for (let c = 0; c < 2; c++) {
        const d = buf.getChannelData(c);
        for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2);
      }
      convolver.buffer = buf;
      reverbNode = ctx.createGain();
      reverbNode.gain.value = 0.2;
      convolver.connect(reverbNode);
      reverbNode.connect(sfxGain);
    } catch (e) { }
  }

  function resume() { if (ctx?.state === 'suspended') ctx.resume(); }

  function tone(freq, dur, type = 'sine', gain = 0.2, detune = 0) {
    if (!ctx) return;
    const dest = sfxGain || masterGain;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type; osc.frequency.value = freq; osc.detune.value = detune;
    g.gain.setValueAtTime(0, ctx.currentTime);
    g.gain.linearRampToValueAtTime(gain, ctx.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.connect(g); g.connect(dest);
    if (reverbNode) g.connect(reverbNode);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + dur);
  }

  function chord(freqs, dur, type = 'sine', gain = 0.12) {
    freqs.forEach((f, i) => tone(f, dur, type, gain, i * 5));
  }

  function playHit() { tone(180, 0.15, 'square', 0.15); tone(120, 0.2, 'sawtooth', 0.1); }
  // 강타 - 크고 묵직한 타격음
  function playHeavyHit() {
    tone(90, 0.05, 'square', 0.3);
    setTimeout(() => tone(60, 0.35, 'sawtooth', 0.25), 30);
    setTimeout(() => tone(40, 0.5, 'sine', 0.15), 60);
  }
  // 피격 - 날카롭고 짧은 충격음
  function playPlayerHit() {
    tone(220, 0.04, 'sawtooth', 0.28);
    setTimeout(() => tone(110, 0.2, 'square', 0.18), 20);
    setTimeout(() => tone(80, 0.3, 'sine', 0.1), 50);
  }
  // 크리티컬 타격
  function playCritical() {
    tone(300, 0.03, 'square', 0.35);
    setTimeout(() => tone(150, 0.08, 'square', 0.28), 20);
    setTimeout(() => tone(75, 0.4, 'sawtooth', 0.2), 50);
    setTimeout(() => chord([523, 659], 0.3, 'sine', 0.1), 100);
  }
  function playCard() { tone(440, 0.12, 'sine', 0.1); tone(550, 0.08, 'sine', 0.07); }
  // 스킬(방어/버프) 카드 사운드 — 부드러운 상승음 (playHit과 동일 레벨)
  function playSkill() {
    tone(330, 0.15, 'sine', 0.15);
    setTimeout(() => tone(440, 0.12, 'sine', 0.12), 60);
    setTimeout(() => tone(550, 0.18, 'sine', 0.10), 120);
  }
  // Echo/Power 카드 사운드 — 신비로운 반짝임 (playHit과 동일 레벨)
  function playEcho() {
    chord([392, 523, 659], 0.35, 'sine', 0.12);
    setTimeout(() => tone(784, 0.25, 'sine', 0.10, 10), 80);
  }
  function playHeal() { chord([523, 659, 784], 0.5, 'sine', 0.1); }
  function playDeath() { chord([110, 138, 165], 1.5, 'sawtooth', 0.2); }
  function playItemGet() { chord([523, 659, 784, 1047], 0.8, 'sine', 0.12); }
  function playBossPhase() { chord([110, 146, 220, 293], 1.2, 'sawtooth', 0.25); tone(55, 1.5, 'sine', 0.3); }

  function playChain(chain) {
    const baseFreqs = [261, 329, 392, 523, 659];
    const f = baseFreqs[Math.min(chain - 1, 4)] || 261;
    chord([f, f * 1.25, f * 1.5], 0.3, 'sine', 0.1 + chain * 0.02);
  }

  function playResonanceBurst() {
    [261, 329, 392, 523, 659, 784, 1047].forEach((f, i) => {
      setTimeout(() => tone(f, 0.6, 'sine', 0.15), i * 60);
    });
    tone(55, 2, 'sawtooth', 0.25);
  }

  const ambientFreqs = [
    [65, 82, 110], [55, 69, 87], [73, 92, 123], [51, 65, 82], [87, 110, 146]
  ];

  function startAmbient(regionIdx) {
    if (!ctx) return;
    if (ambientOsc) { try { ambientOsc.stop(); } catch (e) { } ambientOsc = null; }
    ambientStarted = false;
    const freqs = ambientFreqs[regionIdx] || ambientFreqs[0];
    const osc = ctx.createOscillator();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    const g = ctx.createGain();
    osc.type = 'sine'; osc.frequency.value = freqs[0];
    lfo.type = 'sine'; lfo.frequency.value = 0.08;
    lfoGain.gain.value = 3;
    g.gain.value = 0.04;
    lfo.connect(lfoGain); lfoGain.connect(osc.frequency);
    const ambDest = ambientGainNode || masterGain;
    osc.connect(g); g.connect(ambDest);
    if (reverbNode) g.connect(reverbNode);
    osc.start(); lfo.start();
    ambientOsc = osc;
  }

  function playFootstep() { tone(80 + Math.random() * 40, 0.1, 'square', 0.05); }

  function setVolume(v) { if (masterGain) masterGain.gain.value = Math.max(0, Math.min(1, v)); }
  function setSfxVolume(v) { if (sfxGain) sfxGain.gain.value = Math.max(0, Math.min(1, v)); }
  function setAmbientVolume(v) { if (ambientGainNode) ambientGainNode.gain.value = Math.max(0, Math.min(1, v)); }

  // 클래스 선택 시 고유 사운드
  function playClassSelect(cls) {
    switch (cls) {
      case 'swordsman': // 검: 금속 강타
        tone(220, 0.07, 'square', 0.18);
        setTimeout(() => tone(440, 0.12, 'square', 0.13), 70);
        setTimeout(() => tone(330, 0.25, 'sine', 0.08), 150);
        break;
      case 'mage': // 마법: 신비로운 화음
        chord([523, 659, 784], 0.4, 'sine', 0.09);
        setTimeout(() => tone(1047, 0.5, 'sine', 0.07, 7), 120);
        break;
      case 'hunter': // 사냥꾼: 날카롭고 짧은 음
        tone(880, 0.05, 'sawtooth', 0.14);
        setTimeout(() => tone(660, 0.07, 'sawtooth', 0.10), 55);
        setTimeout(() => tone(440, 0.18, 'sine', 0.07), 110);
        break;
      default:
        playCard();
    }
  }

  function playLegendary() {
    // 저음 베이스 → 상승 아르페지오 → 마지막 화음
    tone(55, 1.8, 'sawtooth', 0.18);
    tone(110, 1.4, 'sine', 0.12);
    [261, 329, 392, 523, 659, 784, 1047, 1319].forEach((f, i) => {
      setTimeout(() => tone(f, 0.5, 'sine', 0.12 - i * 0.008), i * 80);
    });
    setTimeout(() => chord([523, 659, 784, 1047, 1319], 1.2, 'sine', 0.1), 700);
  }

  return {
    init, resume, playHit, playHeavyHit, playPlayerHit, playCritical,
    playCard, playSkill, playEcho, playHeal, playDeath, playItemGet,
    playBossPhase, playChain, playResonanceBurst, startAmbient, playFootstep,
    setVolume, setSfxVolume, setAmbientVolume, playClassSelect, playLegendary
  };
})();

// ────────────────────────────────────────
// PARTICLE SYSTEM
// ────────────────────────────────────────
