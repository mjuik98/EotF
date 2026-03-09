import { afterEach, describe, expect, it, vi } from 'vitest';
import { StoryUI } from '../game/ui/screens/story_ui.js';
import { EndingScreenUI } from '../game/ui/screens/ending_screen_ui.js';

function createDeps({ storyPieces = [], fragments = [], runCount = 1 } = {}) {
  return {
    gs: {
      meta: {
        runCount,
        storyPieces: [...storyPieces],
        inscriptions: {},
        _hiddenEndingHinted: false,
      },
    },
    data: {
      storyFragments: [...fragments],
      inscriptions: {},
    },
  };
}

function createDoc() {
  const elements = new Map();
  const body = {
    children: [],
    appendChild(node) {
      this.children.push(node);
      if (node?.id) elements.set(node.id, node);
      return node;
    },
  };

  const unregisterNode = (node) => {
    if (!node) return;
    if (node.id) elements.delete(node.id);
    if (Array.isArray(node.children)) {
      node.children.forEach(unregisterNode);
    }
  };

  function createElement(tagName) {
    const el = {
      tagName: String(tagName || '').toUpperCase(),
      id: '',
      style: {},
      textContent: '',
      innerHTML: '',
      disabled: false,
      children: [],
      append(...nodes) {
        this.children.push(...nodes);
        nodes.forEach((node) => {
          if (node?.id) elements.set(node.id, node);
        });
      },
      appendChild(node) {
        this.children.push(node);
        if (node?.id) elements.set(node.id, node);
        return node;
      },
      remove() {
        unregisterNode(this);
      },
    };
    return el;
  }

  return {
    body,
    createElement,
    getElementById(id) {
      return elements.get(id) || null;
    },
  };
}

describe('StoryUI stage fragment flow', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows the next unseen fragment instead of repeating the current run fragment', () => {
    const deps = createDeps({
      storyPieces: [1],
      runCount: 1,
      fragments: [
        { id: 1, run: 1, title: 'A', text: 'A' },
        { id: 2, run: 2, title: 'B', text: 'B' },
      ],
    });
    const displaySpy = vi.spyOn(StoryUI, 'displayFragment').mockReturnValue(true);

    const shown = StoryUI.showRunFragment(deps);

    expect(shown).toBe(true);
    expect(displaySpy).toHaveBeenCalledWith(
      { id: 2, run: 2, title: 'B', text: 'B' },
      deps,
    );
    expect(deps.gs.meta.storyPieces).toEqual([1, 2]);
  });

  it('progresses sequentially across repeated stage entries', () => {
    const deps = createDeps({
      fragments: [
        { id: 1, run: 1, title: 'A', text: 'A' },
        { id: 2, run: 2, title: 'B', text: 'B' },
        { id: 3, run: 3, title: 'C', text: 'C' },
      ],
    });
    const displaySpy = vi.spyOn(StoryUI, 'displayFragment').mockReturnValue(true);

    StoryUI.showRunFragment(deps);
    StoryUI.showRunFragment(deps);

    expect(displaySpy).toHaveBeenCalledTimes(2);
    expect(displaySpy.mock.calls[0][0].id).toBe(1);
    expect(displaySpy.mock.calls[1][0].id).toBe(2);
    expect(deps.gs.meta.storyPieces).toEqual([1, 2]);
  });

  it('returns false when there is no unseen fragment left', () => {
    const deps = createDeps({
      storyPieces: [1, 2],
      fragments: [
        { id: 1, run: 1, title: 'A', text: 'A' },
        { id: 2, run: 2, title: 'B', text: 'B' },
      ],
    });
    const displaySpy = vi.spyOn(StoryUI, 'displayFragment').mockReturnValue(true);

    const shown = StoryUI.showRunFragment(deps);

    expect(shown).toBe(false);
    expect(displaySpy).not.toHaveBeenCalled();
  });

  it('unlockNextFragment unlocks one unseen fragment at a time', () => {
    const deps = createDeps({
      storyPieces: [1],
      fragments: [
        { id: 1, run: 1, title: 'A', text: 'A' },
        { id: 2, run: 2, title: 'B', text: 'B' },
      ],
    });

    StoryUI.unlockNextFragment(deps);
    StoryUI.unlockNextFragment(deps);

    expect(deps.gs.meta.storyPieces).toEqual([1, 2]);
  });

  it('delegates normal ending rendering to EndingScreenUI', () => {
    const deps = {
      gs: {
        meta: { runCount: 3, storyPieces: [1, 2], inscriptions: {} },
        player: { kills: 12, deck: [] },
        stats: { damageDealt: 300, damageTaken: 40, cardsPlayed: 8, maxChain: 3 },
      },
      data: { storyFragments: [] },
    };
    const showSpy = vi.spyOn(EndingScreenUI, 'show').mockReturnValue(true);

    StoryUI.showNormalEnding(deps);

    expect(showSpy).toHaveBeenCalledWith(false, deps);
  });

  it('displayFragment with closeEffect none removes overlay immediately and fires close callback', () => {
    const doc = createDoc();
    const onFragmentClosed = vi.fn();

    const shown = StoryUI.displayFragment(
      { id: 1, run: 1, title: 'A', text: 'A' },
      { doc, closeEffect: 'none', onFragmentClosed },
    );

    expect(shown).toBe(true);
    const button = doc.getElementById('storyContinueBtn');
    expect(button).toBeTruthy();

    button.onclick();

    expect(onFragmentClosed).toHaveBeenCalledTimes(1);
    expect(doc.getElementById('storyContinueBtn')).toBeNull();
  });
});
