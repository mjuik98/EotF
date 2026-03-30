import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import { createPauseMenu } from '../game/features/ui/public.js';

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

function findByClassName(node, token) {
  if (!node) return null;
  if (String(node.className || '').split(/\s+/).includes(token)) return node;
  for (const child of node.children || []) {
    const found = findByClassName(child, token);
    if (found) return found;
  }
  return null;
}

describe('help_pause_ui_pause_menu_overlay', () => {
  it('builds the pause menu without duplicating sound controls from settings', () => {
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
    expect(menu.className).toContain('hp-overlay');
    expect(menu.className).toContain('hp-overlay-pause');
    expect(menu.children[0].className).toContain('hp-panel');
    expect(menu.children[0].className).toContain('gm-modal-panel');
    expect(findByClassName(menu, 'hp-volume-panel')).toBeNull();
    expect(findById(menu, 'volMasterSlider')).toBeNull();
    expect(findById(menu, 'volSfxSlider')).toBeNull();
    expect(findById(menu, 'volAmbientSlider')).toBeNull();
    const meta = findByClassName(menu, 'hp-menu-meta');
    expect(meta.textContent).toContain('총 7회차');
    expect(meta.textContent).toContain('지역 2');
    expect(meta.textContent).toContain('5층');
    expect(meta.textContent).toContain('3/10');
  });

  it('restores the system cursor for help-pause overlays on top of the global custom cursor mode', () => {
    const css = readFileSync(new URL('../css/styles.css', import.meta.url), 'utf8');

    expect(css).toMatch(/\.hp-overlay\s*\{[^}]*cursor:\s*auto;/s);
    expect(css).toMatch(/\.hp-overlay button\s*\{[^}]*cursor:\s*pointer;/s);
  });
});
