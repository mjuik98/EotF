import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { createRestEventUseCaseSpy, startRestFillParticlesSpy } = vi.hoisted(() => ({
  createRestEventUseCaseSpy: vi.fn(),
  startRestFillParticlesSpy: vi.fn(() => ({
    setBoost: vi.fn(),
    stop: vi.fn(),
  })),
}));

vi.mock('../game/features/event/application/create_rest_event_use_case.js', () => ({
  createRestEventUseCase: createRestEventUseCaseSpy,
}));

vi.mock('../game/features/event/presentation/browser/event_ui_particles.js', () => ({
  startRestFillParticles: startRestFillParticlesSpy,
}));

import {
  applyRestFillSequenceFrame,
  buildRestRecoveryResultText,
  buildRestRecoverySnapshot,
  computeRestFillBoost,
  showEventRestSiteOverlay,
} from '../game/features/event/public.js';

function createElementFactory(elements) {
  return function createElement(tagName) {
    const classTokens = new Set();
    const el = {
      tagName: String(tagName || '').toUpperCase(),
      id: '',
      style: {},
      className: '',
      innerHTML: '',
      textContent: '',
      children: [],
      classList: {
        add: vi.fn((...tokens) => tokens.forEach((token) => classTokens.add(token))),
        remove: vi.fn((...tokens) => tokens.forEach((token) => classTokens.delete(token))),
        contains: (token) => classTokens.has(token),
      },
      appendChild(node) {
        this.children.push(node);
        if (node?.id) elements[node.id] = node;
        return node;
      },
      remove() {
        if (this.id) delete elements[this.id];
      },
    };
    Object.defineProperty(el, 'id', {
      get: () => el._id || '',
      set: (value) => {
        el._id = value;
        if (value) elements[value] = el;
      },
    });
    return el;
  };
}

function createDoc() {
  const elements = {};
  const createElement = createElementFactory(elements);
  const body = createElement('body');
  body.appendChild = (node) => {
    body.children.push(node);
    if (node?.id) elements[node.id] = node;
    return node;
  };

  return {
    body,
    createElement,
    getElementById: vi.fn((id) => elements[id] || null),
    elements,
  };
}

describe('event_ui_rest_site', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('builds and describes rest recovery snapshots', () => {
    const gs = {
      player: { hp: 20, maxHp: 40, echo: 10 },
      heal: vi.fn((amount) => { gs.player.hp += amount; }),
      addEcho: vi.fn((amount) => { gs.player.echo += amount; }),
    };
    const snapshot = buildRestRecoverySnapshot(gs, {
      getHealAmount: vi.fn(() => 12),
    });

    expect(snapshot).toEqual({
      oldHp: 20,
      oldEcho: 10,
      newHp: 32,
      newEcho: 40,
      maxHp: 40,
      echoMax: 100,
    });
    expect(buildRestRecoveryResultText(snapshot)).toBe('체력을 12 회복하고 잔향을 30 얻었습니다. 다음 행동을 선택하세요.');
  });

  it('updates rest fill bars during the heal window and only plays heal audio once', () => {
    const doc = createDoc();
    const hpBar = doc.createElement('div');
    hpBar.id = 'restHpFill';
    const echoBar = doc.createElement('div');
    echoBar.id = 'restEchoFill';
    const hpVal = doc.createElement('div');
    hpVal.id = 'restHpValue';
    const echoVal = doc.createElement('div');
    echoVal.id = 'restEchoValue';
    const audioEngine = { playEvent: vi.fn(), playHeal: vi.fn() };
    const state = { playedSound: false };
    const snapshot = {
      oldHp: 20,
      oldEcho: 10,
      newHp: 32,
      newEcho: 40,
      maxHp: 40,
      echoMax: 100,
    };

    applyRestFillSequenceFrame(doc, snapshot, 1000, audioEngine, state);
    applyRestFillSequenceFrame(doc, snapshot, 1200, audioEngine, state);

    expect(hpBar.style.width).toMatch(/%$/);
    expect(echoBar.style.width).toMatch(/%$/);
    expect(hpVal.textContent).toContain('/');
    expect(echoVal.textContent).toContain('/100');
    expect(audioEngine.playEvent).toHaveBeenCalledWith('status', 'heal');
    expect(audioEngine.playHeal).not.toHaveBeenCalled();
    expect(computeRestFillBoost(0)).toBeCloseTo(0.1);
    expect(computeRestFillBoost(1600)).toBeGreaterThan(0.16);
  });

  it('runs the rest overlay sequence and hands the resulting event back to EventUI', () => {
    const doc = createDoc();
    const showEvent = vi.fn();
    const updateUI = vi.fn();
    const gs = {
      player: { hp: 20, maxHp: 40, echo: 10 },
      heal: vi.fn((amount) => { gs.player.hp += amount; }),
      addEcho: vi.fn((amount) => { gs.player.echo += amount; }),
    };
    createRestEventUseCaseSpy.mockReturnValueOnce({ title: '휴식', choices: [] });

    showEventRestSiteOverlay(gs, { cards: {} }, {
      getHealAmount: vi.fn(() => 12),
    }, {
      doc,
      audioEngine: { playHeal: vi.fn() },
      showCardDiscard: vi.fn(),
      showEvent,
      updateUI,
    });

    expect(startRestFillParticlesSpy).toHaveBeenCalledTimes(1);
    vi.runAllTimers();

    expect(createRestEventUseCaseSpy).toHaveBeenCalledTimes(1);
    expect(showEvent).toHaveBeenCalledWith(expect.objectContaining({
      title: '휴식',
      desc: '체력을 12 회복하고 잔향을 30 얻었습니다. 다음 행동을 선택하세요.',
    }));
    expect(updateUI).toHaveBeenCalledTimes(1);
  });

  it('finishes the rest overlay when animation frames use browser relative timestamps', () => {
    const doc = createDoc();
    const showEvent = vi.fn();
    const gs = {
      player: { hp: 20, maxHp: 40, echo: 10 },
      heal: vi.fn((amount) => { gs.player.hp += amount; }),
      addEcho: vi.fn((amount) => { gs.player.echo += amount; }),
    };
    const frameCallbacks = [];

    createRestEventUseCaseSpy.mockReturnValueOnce({ title: '휴식', choices: [] });

    showEventRestSiteOverlay(gs, { cards: {} }, {
      getHealAmount: vi.fn(() => 12),
    }, {
      doc,
      now: () => 1000,
      requestAnimationFrame: vi.fn((callback) => {
        frameCallbacks.push(callback);
        return frameCallbacks.length;
      }),
      audioEngine: { playHeal: vi.fn() },
      showCardDiscard: vi.fn(),
      showEvent,
      updateUI: vi.fn(),
    });

    expect(showEvent).not.toHaveBeenCalled();

    for (let i = 0; i < 6 && frameCallbacks.length > 0; i += 1) {
      const callback = frameCallbacks.shift();
      callback(5000);
    }
    vi.runAllTimers();

    expect(showEvent).toHaveBeenCalledWith(expect.objectContaining({
      title: '휴식',
      desc: '체력을 12 회복하고 잔향을 30 얻었습니다. 다음 행동을 선택하세요.',
    }));
  });
});
