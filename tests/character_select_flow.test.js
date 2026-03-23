import { describe, expect, it, vi } from 'vitest';
import {
  createCharacterSelectFlow,
  setCharacterSelectVisibility,
} from '../game/features/title/ports/public_character_select_presentation_capabilities.js';

function createClassList(initial = []) {
  const set = new Set(initial);
  return {
    add: (...tokens) => tokens.forEach((token) => set.add(token)),
    remove: (...tokens) => tokens.forEach((token) => set.delete(token)),
    contains: (token) => set.has(token),
  };
}

function createNode() {
  return {
    style: {},
    classList: createClassList(),
  };
}

describe('character select flow helper', () => {
  it('updates card and panel visibility styles', () => {
    const card = createNode();
    const panel = createNode();
    const resolveById = (id) => ({ charCard: card, infoPanel: panel }[id] || null);

    setCharacterSelectVisibility(resolveById, false, 1);
    expect(card.style.opacity).toBe('0');
    expect(card.style.transform).toBe('perspective(600px) translateX(-44px) scale(.92)');
    expect(panel.style.transform).toBe('translateX(16px)');

    setCharacterSelectVisibility(resolveById, true, 0);
    expect(card.style.opacity).toBe('1');
    expect(panel.style.transform).toBe('translateX(0)');
  });

  it('handles nav, jump, and confirm sequencing through timers', () => {
    const state = { idx: 0, phase: 'select' };
    const chars = [{ name: 'A' }, { name: 'B' }, { name: 'C' }];
    const card = createNode();
    const panel = createNode();
    const root = createNode();
    const timers = [];
    const sfx = {
      nav: vi.fn(),
      select: vi.fn(),
    };
    const updateAll = vi.fn();
    const renderPhase = vi.fn();
    const onConfirm = vi.fn();
    const log = vi.fn();

    const flow = createCharacterSelectFlow({
      state,
      chars,
      resolveById: (id) => ({ charCard: card, infoPanel: panel, charSelectSubScreen: root }[id] || null),
      sfx,
      updateAll,
      renderPhase,
      onConfirm,
      setTimeoutImpl: (handler, delay) => {
        timers.push({ handler, delay });
      },
      log,
    });

    flow.go(1);
    expect(sfx.nav).toHaveBeenCalledTimes(1);
    expect(card.style.opacity).toBe('0');
    expect(timers[0].delay).toBe(250);
    timers.shift().handler();
    expect(state.idx).toBe(1);
    expect(updateAll).toHaveBeenCalledTimes(1);
    expect(card.style.opacity).toBe('1');

    flow.jumpTo(2);
    expect(sfx.nav).toHaveBeenCalledTimes(2);
    timers.shift().handler();
    expect(state.idx).toBe(2);

    flow.handleConfirm();
    expect(log).toHaveBeenCalledWith('[CharacterSelectUI] Character selected:', chars[2]);
    expect(sfx.select).toHaveBeenCalledTimes(1);
    expect(state.phase).toBe('burst');
    expect(root.classList.contains('is-focus-locked')).toBe(true);
    expect(renderPhase).toHaveBeenCalledTimes(1);
    expect(timers[0].delay).toBe(650);
    timers.shift().handler();
    expect(state.phase).toBe('done');
    expect(renderPhase).toHaveBeenCalledTimes(2);
    expect(onConfirm).toHaveBeenCalledWith(chars[2]);
  });
});
