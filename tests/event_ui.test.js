import { describe, expect, it, vi } from 'vitest';
import { EventUI } from '../game/features/event/public.js';

function createClassList() {
  const set = new Set();
  return {
    add: vi.fn((...names) => names.forEach((name) => set.add(name))),
    remove: vi.fn((...names) => names.forEach((name) => set.delete(name))),
    contains: (name) => set.has(name),
    toggle: vi.fn((name, force) => {
      if (force === undefined) {
        if (set.has(name)) {
          set.delete(name);
          return false;
        }
        set.add(name);
        return true;
      }
      if (force) set.add(name);
      else set.delete(name);
      return !!force;
    }),
  };
}

function createElementFactory(elements) {
  return function createElement(tagName) {
    const listeners = {};
    const el = {
      tagName: String(tagName || '').toUpperCase(),
      id: '',
      style: {},
      className: '',
      textContent: '',
      innerHTML: '',
      title: '',
      children: [],
      attributes: {},
      classList: createClassList(),
      addEventListener: vi.fn((name, handler) => {
        listeners[name] = handler;
      }),
      setAttribute: vi.fn((name, value) => {
        el.attributes[name] = String(value);
      }),
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
      listeners,
    };
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

  const eventChoices = register('eventChoices');
  const eventModal = register('eventModal');
  eventModal.classList = createClassList();
  register('eventEyebrow');
  register('eventTitle');
  register('eventDesc');
  register('eventImageContainer');
  register('eventGoldDisplay');
  register('eventHpDisplay');
  register('eventDeckDisplay');

  return {
    body,
    createElement,
    getElementById: vi.fn((id) => elements[id] || null),
    elements,
    refs: {
      eventChoices,
      eventModal,
    },
  };
}

describe('EventUI', () => {
  it('showEvent renders choice states and wires enabled choices to resolveEvent', () => {
    const doc = createDoc();
    const gs = {
      player: {
        gold: 15,
        hp: 21,
        maxHp: 30,
        deck: ['a', 'b'],
        hand: ['c'],
        graveyard: ['d', 'e'],
      },
      _eventLock: true,
    };
    const disabledPredicate = vi.fn(() => true);
    const deps = { doc, gs };
    const resolveSpy = vi.spyOn(EventUI, 'resolveEvent').mockImplementation(() => {});

    EventUI.showEvent({
      title: 'A Strange Chamber',
      desc: 'Two paths appear.',
      choices: [
        { text: 'Locked gate', isDisabled: disabledPredicate, disabledReason: 'Need a key' },
        { text: 'Open passage', cssClass: 'primary-choice' },
      ],
    }, deps);

    const [disabledChoice, enabledChoice] = doc.refs.eventChoices.children;

    expect(disabledPredicate).toHaveBeenCalledWith(gs);
    expect(gs._eventLock).toBe(false);
    expect(doc.elements.eventGoldDisplay.textContent).toBe(15);
    expect(doc.elements.eventHpDisplay.textContent).toBe('21/30');
    expect(doc.elements.eventDeckDisplay.textContent).toBe(5);
    expect(disabledChoice.classList.contains('disabled')).toBe(true);
    expect(disabledChoice.attributes['aria-disabled']).toBe('true');
    expect(disabledChoice.title).toBe('Need a key');
    expect(enabledChoice.classList.contains('primary-choice')).toBe(true);
    expect(typeof enabledChoice.listeners.click).toBe('function');
    enabledChoice.listeners.click();
    expect(resolveSpy).toHaveBeenCalledWith(1, deps);
    expect(doc.refs.eventModal.classList.add).toHaveBeenCalledWith('active');

    resolveSpy.mockRestore();
  });

  it('updateEventGoldBar refreshes gold, hp, and aggregate deck count', () => {
    const doc = createDoc();
    const deps = {
      doc,
      gs: {
        player: {
          gold: 88,
          hp: 12,
          maxHp: 40,
          deck: ['a'],
          hand: ['b', 'c'],
          graveyard: ['d'],
        },
      },
    };

    EventUI.updateEventGoldBar(deps);

    expect(doc.elements.eventGoldDisplay.textContent).toBe(88);
    expect(doc.elements.eventHpDisplay.textContent).toBe('12/40');
    expect(doc.elements.eventDeckDisplay.textContent).toBe(4);
  });
});
