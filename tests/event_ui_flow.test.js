import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { dismissEventModalSpy } = vi.hoisted(() => ({
  dismissEventModalSpy: vi.fn((modal, onDone) => {
    onDone?.();
  }),
}));

vi.mock('../game/features/event/platform/event_runtime_dom.js', async () => {
  const actual = await vi.importActual('../game/features/event/platform/event_runtime_dom.js');
  return {
    ...actual,
    dismissEventModalRuntime: dismissEventModalSpy,
  };
});

import { finishEventFlow, resolveEventChoiceFlow } from '../game/features/event/public.js';

function createClassList() {
  const classes = new Set();
  return {
    add: vi.fn((...tokens) => tokens.forEach((token) => classes.add(token))),
    remove: vi.fn((...tokens) => tokens.forEach((token) => classes.delete(token))),
    contains: (token) => classes.has(token),
  };
}

function createElementFactory(elements) {
  return function createElement(tagName) {
    const listeners = {};
    const el = {
      tagName: String(tagName || '').toUpperCase(),
      style: {},
      className: '',
      title: '',
      attributes: {},
      children: [],
      innerHTML: '',
      classList: createClassList(),
      listeners,
      appendChild(node) {
        this.children.push(node);
        if (node?.id) elements[node.id] = node;
        return node;
      },
      addEventListener: vi.fn((name, handler) => {
        listeners[name] = handler;
      }),
      setAttribute: vi.fn((name, value) => {
        el.attributes[name] = String(value);
      }),
    };

    Object.defineProperty(el, 'id', {
      get: () => el._id || '',
      set: (value) => {
        el._id = value;
        if (value) elements[value] = el;
      },
    });

    Object.defineProperty(el, 'textContent', {
      get: () => el._textContent || '',
      set: (value) => {
        el._textContent = String(value ?? '');
        if (el._textContent === '') el.children = [];
      },
    });

    return el;
  };
}

function createDoc() {
  const elements = {};
  const createElement = createElementFactory(elements);
  const register = (id) => {
    const el = createElement('div');
    el.id = id;
    elements[id] = el;
    return el;
  };

  const body = createElement('body');
  body.appendChild = (node) => {
    body.children.push(node);
    if (node?.id) elements[node.id] = node;
    return node;
  };

  const eventModal = register('eventModal');
  const eventChoices = register('eventChoices');
  register('eventDesc');

  return {
    body,
    createElement,
    getElementById: vi.fn((id) => elements[id] || null),
    elements,
    refs: {
      eventModal,
      eventChoices,
    },
  };
}

describe('event_ui_flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('finishes the event modal flow and clears lock state', () => {
    const doc = createDoc();
    const gs = { _eventLock: true };
    const clearCurrentEvent = vi.fn();
    const deps = {
      showGameplayScreen: vi.fn(),
      updateUI: vi.fn(),
      renderMinimap: vi.fn(),
      updateNextNodes: vi.fn(),
    };

    finishEventFlow(doc, gs, deps, clearCurrentEvent);

    expect(dismissEventModalSpy).toHaveBeenCalledWith(doc.refs.eventModal, expect.any(Function), deps);
    expect(clearCurrentEvent).toHaveBeenCalledTimes(1);
    expect(gs._eventLock).toBe(false);
    expect(deps.showGameplayScreen).toHaveBeenCalledTimes(1);
    expect(deps.updateUI).toHaveBeenCalledTimes(1);
    expect(deps.renderMinimap).toHaveBeenCalledTimes(1);
    expect(deps.updateNextNodes).toHaveBeenCalledTimes(1);
  });

  it('rerenders persistent choices and shows acquisition toasts', () => {
    const doc = createDoc();
    const gs = {
      _eventLock: false,
      player: { gold: 10, hp: 10, maxHp: 20, deck: [], hand: [], graveyard: [] },
    };
    const showItemToast = vi.fn();
    const updateUI = vi.fn();
    const onRefreshGoldBar = vi.fn();
    const onResolveChoice = vi.fn();

    resolveEventChoiceFlow(0, {
      gs,
      event: {
        persistent: true,
        choices: [{ text: 'Take reward' }],
      },
      doc,
      deps: { updateUI, showItemToast },
      sharedData: {
        cards: { strike: { id: 'strike', name: 'Strike', rarity: 'common' } },
        items: { charm: { id: 'charm', name: 'Charm' } },
      },
      onResolveChoice,
      onRefreshGoldBar,
      resolveChoice: vi.fn(() => ({
        resultText: '피해 14. 잔향 20 충전 [소진]',
        acquiredCard: 'strike',
        acquiredItem: 'charm',
      })),
    });

    expect(updateUI).toHaveBeenCalledTimes(1);
    expect(onRefreshGoldBar).toHaveBeenCalledTimes(2);
    expect(showItemToast).toHaveBeenNthCalledWith(
      1,
      { id: 'strike', name: 'Strike', rarity: 'common' },
      expect.objectContaining({ typeLabel: expect.stringMatching(/card acquired$/) }),
    );
    expect(showItemToast).toHaveBeenNthCalledWith(2, { id: 'charm', name: 'Charm' });
    expect(doc.elements.eventDesc.innerHTML).toContain('kw-dmg');
    expect(doc.elements.eventDesc.innerHTML).toContain('kw-echo');
    expect(doc.refs.eventChoices.children).toHaveLength(1);
    expect(typeof doc.refs.eventChoices.children[0].listeners.click).toBe('function');
    expect(gs._eventLock).toBe(false);
  });

  it('renders a continue choice for a closable upgrade result', () => {
    const doc = createDoc();
    const gs = { _eventLock: false };
    const onFinish = vi.fn();
    const showItemToast = vi.fn();

    resolveEventChoiceFlow(0, {
      gs,
      event: {
        persistent: false,
        choices: [{ text: '카드 강화', cssClass: 'shop-choice-upgrade' }],
      },
      doc,
      deps: { showItemToast, updateUI: vi.fn() },
      onFinish,
      onRefreshGoldBar: vi.fn(),
      resolveChoice: vi.fn(() => ({
        resultText: 'Slash 강화 완료',
        isFail: false,
        shouldClose: true,
      })),
    });

    expect(showItemToast).toHaveBeenCalledWith({
      name: 'Upgrade: Slash',
      icon: '\u2728',
      desc: 'Slash 강화 완료',
    });
    expect(doc.refs.eventChoices.children).toHaveLength(1);
    expect(doc.refs.eventChoices.children[0].id).toBe('eventChoiceContinue');
    expect(gs._eventLock).toBe(true);

    doc.refs.eventChoices.children[0].listeners.click();
    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  it('unlocks and plays hit audio when resolution throws', () => {
    const doc = createDoc();
    const gs = { _eventLock: false };
    const audioEngine = { playEvent: vi.fn(), playHit: vi.fn() };
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = resolveEventChoiceFlow(0, {
      gs,
      event: { persistent: false, choices: [{ text: 'Broken path' }] },
      doc,
      audioEngine,
      resolveChoice: vi.fn(() => {
        throw new Error('boom');
      }),
    });

    expect(result).toBeNull();
    expect(audioEngine.playEvent).toHaveBeenCalledWith('attack', 'slash');
    expect(audioEngine.playHit).not.toHaveBeenCalled();
    expect(gs._eventLock).toBe(false);

    consoleErrorSpy.mockRestore();
  });
});
