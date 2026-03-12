import { describe, expect, it, vi } from 'vitest';

const { discardEventCardSpy } = vi.hoisted(() => ({
  discardEventCardSpy: vi.fn(),
}));

vi.mock('../game/features/event/application/discard_event_card_use_case.js', () => ({
  discardEventCard: discardEventCardSpy,
}));

vi.mock('../game/features/event/presentation/browser/event_ui_helpers.js', () => ({
  dismissTransientOverlay: vi.fn((overlay) => overlay?.remove?.()),
  getAudioEngine: vi.fn((deps) => deps.audioEngine),
}));

import { showEventCardDiscardOverlay } from '../game/ui/screens/event_ui_card_discard.js';

function createClassList() {
  const set = new Set();
  return {
    add: vi.fn((...names) => names.forEach((name) => set.add(name))),
    remove: vi.fn((...names) => names.forEach((name) => set.delete(name))),
    contains: (name) => set.has(name),
  };
}

function createElementFactory(elements) {
  return function createElement(tagName) {
    const el = {
      tagName: String(tagName || '').toUpperCase(),
      id: '',
      style: {},
      className: '',
      textContent: '',
      innerHTML: '',
      title: '',
      children: [],
      classList: createClassList(),
      append(...nodes) {
        this.children.push(...nodes);
        nodes.forEach((node) => {
          if (node?.id) elements[node.id] = node;
        });
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

describe('showEventCardDiscardOverlay', () => {
  it('logs a hit when no cards are available', () => {
    const gs = {
      player: { deck: [], hand: [], graveyard: [] },
      addLog: vi.fn(),
    };
    const audioEngine = { playEvent: vi.fn(), playHit: vi.fn() };
    const screenShake = { shake: vi.fn() };

    showEventCardDiscardOverlay(gs, { cards: {} }, false, {
      doc: createDoc(),
      audioEngine,
      screenShake,
    });

    expect(audioEngine.playEvent).toHaveBeenCalledWith('attack', 'slash');
    expect(audioEngine.playHit).not.toHaveBeenCalled();
    expect(screenShake.shake).toHaveBeenCalledWith(10, 0.4);
    expect(gs.addLog).toHaveBeenCalledWith('No cards are available for this action.', 'damage');
  });

  it('renders unique card choices with count badges and cancel handling', () => {
    const doc = createDoc();
    const onCancel = vi.fn();
    const gs = {
      player: { deck: ['strike', 'strike'], hand: ['guard'], graveyard: [] },
      addLog: vi.fn(),
    };

    showEventCardDiscardOverlay(gs, {
      cards: {
        strike: { rarity: 'common', icon: 'S', name: 'Strike', desc: 'Deal damage' },
        guard: { rarity: 'common', icon: 'G', name: 'Guard', desc: 'Gain block' },
      },
    }, false, { doc, onCancel });

    const overlay = doc.elements.cardDiscardOverlay;
    const list = doc.elements.discardCardList;
    expect(overlay).toBeTruthy();
    expect(list.children).toHaveLength(2);
    expect(list.children[0].children.at(-1).textContent).toBe('x2');

    const cancelBtn = overlay.children[2];
    cancelBtn.onclick();
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(doc.elements.cardDiscardOverlay).toBeUndefined();
  });

  it('discards the chosen card and triggers item/update hooks on success', () => {
    discardEventCardSpy.mockReturnValueOnce({ success: true });
    const doc = createDoc();
    const playItemGet = vi.fn();
    const updateUI = vi.fn();
    const audioEngine = { playEvent: vi.fn(), playItemGet: vi.fn() };
    const gs = {
      player: { deck: ['strike'], hand: [], graveyard: [] },
      addLog: vi.fn(),
    };
    const data = {
      cards: {
        strike: { rarity: 'common', icon: 'S', name: 'Strike', desc: 'Deal damage' },
      },
    };

    showEventCardDiscardOverlay(gs, data, true, { doc, playItemGet, updateUI, audioEngine });

    const cardBtn = doc.elements.discardCardList.children[0];
    cardBtn.onclick();

    expect(discardEventCardSpy).toHaveBeenCalledWith({ gs, cardId: 'strike', data, isBurn: true });
    expect(playItemGet).toHaveBeenCalledTimes(1);
    expect(audioEngine.playEvent).not.toHaveBeenCalled();
    expect(audioEngine.playItemGet).not.toHaveBeenCalled();
    expect(updateUI).toHaveBeenCalledTimes(1);
    expect(doc.elements.cardDiscardOverlay).toBeUndefined();
  });

  it('uses the audio engine itemGet event when no injected playItemGet hook exists', () => {
    discardEventCardSpy.mockReturnValueOnce({ success: true });
    const doc = createDoc();
    const updateUI = vi.fn();
    const audioEngine = { playEvent: vi.fn(), playItemGet: vi.fn() };
    const gs = {
      player: { deck: ['strike'], hand: [], graveyard: [] },
      addLog: vi.fn(),
    };
    const data = {
      cards: {
        strike: { rarity: 'common', icon: 'S', name: 'Strike', desc: 'Deal damage' },
      },
    };

    showEventCardDiscardOverlay(gs, data, true, { doc, updateUI, audioEngine });

    const cardBtn = doc.elements.discardCardList.children[0];
    cardBtn.onclick();

    expect(audioEngine.playEvent).toHaveBeenCalledWith('ui', 'itemGet');
    expect(audioEngine.playItemGet).not.toHaveBeenCalled();
    expect(updateUI).toHaveBeenCalledTimes(1);
  });
});
