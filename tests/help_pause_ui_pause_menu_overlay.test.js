import { describe, expect, it, vi } from 'vitest';
import { createPauseMenu } from '../game/ui/screens/help_pause_ui_pause_menu_overlay.js';

function createElementFactory(elements) {
  return function createElement(tagName) {
    const el = {
      tagName: String(tagName || '').toUpperCase(),
      id: '',
      style: {
        setProperty: vi.fn(),
      },
      className: '',
      textContent: '',
      innerHTML: '',
      children: [],
      append(...nodes) {
        this.children.push(...nodes);
      },
      appendChild(node) {
        this.children.push(node);
        if (node?.id) elements[node.id] = node;
        return node;
      },
    };
    return el;
  };
}

function createDoc() {
  const elements = {};
  return {
    createElement: createElementFactory(elements),
    elements,
  };
}

function findById(node, id) {
  if (!node) return null;
  if (node.id === id) return node;
  for (const child of node.children || []) {
    const found = findById(child, id);
    if (found) return found;
  }
  return null;
}

describe('help_pause_ui_pause_menu_overlay', () => {
  it('builds the pause menu and seeds volume sliders from the audio engine', () => {
    const doc = createDoc();
    const callbacks = {
      onResume: vi.fn(),
      onOpenDeck: vi.fn(),
      onOpenCodex: vi.fn(),
      onOpenSettings: vi.fn(),
      onOpenHelp: vi.fn(),
      onAbandon: vi.fn(),
      onReturnToTitle: vi.fn(),
      onQuitGame: vi.fn(),
      onSetMasterVolume: vi.fn(),
      onSetSfxVolume: vi.fn(),
      onSetAmbientVolume: vi.fn(),
    };

    const menu = createPauseMenu(
      doc,
      {
        currentRegion: 1,
        currentFloor: 5,
        meta: {
          runCount: 7,
          storyPieces: [1, 2, 3],
        },
      },
      {
        audioEngine: {
          getVolumes: () => ({
            master: 0.5,
            sfx: 0.8,
            ambient: 0.25,
          }),
        },
      },
      callbacks,
    );

    expect(menu.id).toBe('pauseMenu');
    const masterSlider = findById(menu, 'volMasterSlider');
    const sfxSlider = findById(menu, 'volSfxSlider');
    const ambientSlider = findById(menu, 'volAmbientSlider');
    const masterValue = findById(menu, 'volMasterSliderVal');
    const sfxValue = findById(menu, 'volSfxSliderVal');
    const ambientValue = findById(menu, 'volAmbientSliderVal');

    expect(masterSlider.value).toBe(50);
    expect(sfxSlider.value).toBe(80);
    expect(ambientSlider.value).toBe(25);
    expect(masterValue.textContent).toBe('50%');
    expect(sfxValue.textContent).toBe('80%');
    expect(ambientValue.textContent).toBe('25%');
    expect(masterSlider.style.setProperty).toHaveBeenCalledWith('--fill-percent', '50%');
    expect(menu.children.at(-1).textContent).toContain('총 7회차');
    expect(menu.children.at(-1).textContent).toContain('지역 2');
    expect(menu.children.at(-1).textContent).toContain('5층');
    expect(menu.children.at(-1).textContent).toContain('3/10');
  });
});
