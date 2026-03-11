import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

function createAudioParam(initial = 0) {
  return {
    value: initial,
    setValueAtTime: vi.fn(function setValueAtTime(value) {
      this.value = value;
    }),
    linearRampToValueAtTime: vi.fn(function linearRampToValueAtTime(value) {
      this.value = value;
    }),
    exponentialRampToValueAtTime: vi.fn(function exponentialRampToValueAtTime(value) {
      this.value = value;
    }),
    cancelScheduledValues: vi.fn(),
    cancelAndHoldAtTime: vi.fn(),
    setTargetAtTime: vi.fn(function setTargetAtTime(value) {
      this.value = value;
    }),
  };
}

function createNode(label) {
  return {
    label,
    connect: vi.fn(),
    disconnect: vi.fn(),
  };
}

function createOscillatorNode(kind, sink) {
  const listeners = new Map();
  return {
    kind,
    type: 'sine',
    frequency: createAudioParam(0),
    detune: createAudioParam(0),
    connect: vi.fn(),
    disconnect: vi.fn(),
    addEventListener: vi.fn((eventName, handler) => {
      listeners.set(eventName, handler);
    }),
    start: vi.fn(),
    stop: vi.fn(() => {
      const handler = listeners.get('ended');
      if (handler) handler();
    }),
    _listeners: listeners,
    _sink: sink,
  };
}

function createGainNode(label) {
  return {
    label,
    gain: createAudioParam(0),
    connect: vi.fn(),
    disconnect: vi.fn(),
  };
}

function createBuffer(numberOfChannels, length, sampleRate) {
  const channels = Array.from({ length: numberOfChannels }, () => new Float32Array(length));
  return {
    sampleRate,
    length,
    getChannelData: vi.fn((channel) => channels[channel]),
  };
}

function createAudioContextStub() {
  const sink = {
    oscillators: [],
    gains: [],
    bufferSources: [],
    filters: [],
    convolvers: [],
    closed: 0,
    resumed: 0,
  };

  class FakeAudioContext {
    constructor() {
      this.sampleRate = 44100;
      this.currentTime = 0;
      this.state = 'running';
      this.destination = createNode('destination');
    }

    createGain() {
      const node = createGainNode('gain');
      sink.gains.push(node);
      return node;
    }

    createOscillator() {
      const node = createOscillatorNode('oscillator', sink);
      sink.oscillators.push(node);
      return node;
    }

    createBufferSource() {
      const node = createOscillatorNode('bufferSource', sink);
      node.buffer = null;
      sink.bufferSources.push(node);
      return node;
    }

    createBiquadFilter() {
      const node = {
        type: 'lowpass',
        frequency: createAudioParam(0),
        Q: createAudioParam(1),
        connect: vi.fn(),
        disconnect: vi.fn(),
      };
      sink.filters.push(node);
      return node;
    }

    createConvolver() {
      const node = {
        buffer: null,
        connect: vi.fn(),
        disconnect: vi.fn(),
      };
      sink.convolvers.push(node);
      return node;
    }

    createBuffer(numberOfChannels, length, sampleRate) {
      return createBuffer(numberOfChannels, length, sampleRate);
    }

    close() {
      sink.closed += 1;
      this.state = 'closed';
      return Promise.resolve();
    }

    resume() {
      sink.resumed += 1;
      this.state = 'running';
      return Promise.resolve();
    }
  }

  return { FakeAudioContext, sink };
}

async function loadAudioEngine() {
  vi.resetModules();
  return import('../engine/audio.js');
}

describe('AudioEngine', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(async () => {
    vi.useRealTimers();
    delete globalThis.AudioContext;
    delete globalThis.webkitAudioContext;
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it('returns false from init when AudioContext is unavailable', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { AudioEngine } = await loadAudioEngine();

    expect(AudioEngine.init()).toBe(false);
    expect(warnSpy).toHaveBeenCalled();
  });

  it('supports playClick and playEvent for registered presets', async () => {
    const { FakeAudioContext, sink } = createAudioContextStub();
    globalThis.AudioContext = FakeAudioContext;
    const { AudioEngine } = await loadAudioEngine();

    expect(AudioEngine.init()).toBe(true);
    AudioEngine.playClick();
    AudioEngine.playEvent('ui', 'click');

    expect(sink.oscillators.length + sink.bufferSources.length).toBeGreaterThan(0);

    await AudioEngine.destroy();
    expect(sink.closed).toBe(1);
  });

  it('maps numeric ambient regions and cleans up ambient playback safely', async () => {
    const { FakeAudioContext, sink } = createAudioContextStub();
    globalThis.AudioContext = FakeAudioContext;
    const { AudioEngine } = await loadAudioEngine();

    AudioEngine.init();
    AudioEngine.startAmbient(3);
    await vi.advanceTimersByTimeAsync(500);

    expect(sink.oscillators.length).toBeGreaterThan(0);

    expect(() => AudioEngine.stopAmbient()).not.toThrow();
    await vi.advanceTimersByTimeAsync(600);

    await expect(AudioEngine.destroy()).resolves.toBeUndefined();
    expect(sink.closed).toBe(1);
  });

  it('preserves master, sfx, and ambient volume controls', async () => {
    const { FakeAudioContext } = createAudioContextStub();
    globalThis.AudioContext = FakeAudioContext;
    const { AudioEngine } = await loadAudioEngine();

    AudioEngine.init();
    AudioEngine.setVolume(0.8);
    AudioEngine.setSfxVolume(0.55);
    AudioEngine.setAmbientVolume(0.25);

    expect(AudioEngine.getVolumes()).toEqual({
      master: 0.8,
      sfx: 0.55,
      ambient: 0.25,
    });

    await AudioEngine.destroy();
  });
});
