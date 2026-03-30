import { describe, expect, it, vi } from 'vitest';

import {
  canOpenFullMap,
  canToggleDeckView,
  getRunHotkeyState,
} from '../game/features/ui/public.js';
import { registerEscapeSurface } from '../game/shared/runtime/overlay_escape_support.js';

function createModalElement({ active = true } = {}) {
  return {
    hidden: false,
    style: {},
    classList: {
      contains: (name) => active && name === 'active',
    },
    remove: vi.fn(),
  };
}

function createOpenPopupElement() {
  return {
    hidden: false,
    style: { display: 'block' },
    classList: {
      contains: (name) => name === 'open',
      remove: vi.fn(),
    },
  };
}

function createDoc(elements = {}) {
  return {
    getElementById: (id) => elements[id] || null,
    defaultView: {
      getComputedStyle: (el) => ({
        display: el?.style?.display || 'block',
        visibility: el?.style?.visibility || 'visible',
        opacity: el?.style?.opacity || (el?.classList?.contains?.('active') ? '1' : '0'),
        pointerEvents: el?.style?.pointerEvents || (el?.classList?.contains?.('active') ? 'auto' : 'none'),
      }),
    },
  };
}

function registerVisibleSurface(doc, key, hotkeyKey = key) {
  return registerEscapeSurface(doc, key, {
    close: vi.fn(),
    hotkeyKey,
    isVisible: () => true,
    priority: 400,
    scopes: ['run'],
  });
}

describe('help_pause_ui_helpers run hotkey state', () => {
  it('reports gameplay mode when no run-blocking surface is visible', () => {
    const gs = {
      currentScreen: 'game',
      combat: { active: false },
    };

    expect(getRunHotkeyState(createDoc(), gs)).toEqual({
      mode: 'exploration',
      activeSurface: null,
      visibleSurfaces: [],
      allowsCombatHotkeys: false,
      allowsRunNavigationHotkeys: true,
    });
    expect(canOpenFullMap(createDoc(), gs)).toBe(true);
    expect(canToggleDeckView(createDoc(), gs)).toBe(true);
  });

  it('reports the codex modal as the active run-blocking surface', () => {
    const doc = createDoc({
      codexModal: createModalElement(),
    });

    expect(getRunHotkeyState(doc, {
      currentScreen: 'game',
      combat: { active: false },
    })).toEqual({
      mode: 'modal',
      activeSurface: 'codex',
      visibleSurfaces: ['codex'],
      allowsCombatHotkeys: false,
      allowsRunNavigationHotkeys: false,
    });
    expect(canOpenFullMap(doc)).toBe(false);
    expect(canToggleDeckView(doc)).toBe(false);
  });

  [
    ['codex detail popup', 'codexDetail'],
    ['combat relic detail panel', 'combatRelicDetail'],
    ['map relic detail panel', 'mapRelicDetail'],
  ].forEach(([label, surfaceKey]) => {
    it(`treats the ${label} as a higher-priority surface than the codex modal`, () => {
      const doc = createDoc({
        codexModal: createModalElement(),
      });
      registerVisibleSurface(doc, surfaceKey);

      expect(getRunHotkeyState(doc, {
        currentScreen: 'game',
        combat: { active: false },
      })).toEqual({
        mode: 'modal',
        activeSurface: surfaceKey,
        visibleSurfaces: [surfaceKey, 'codex'],
        allowsCombatHotkeys: false,
        allowsRunNavigationHotkeys: false,
      });
      expect(canOpenFullMap(doc)).toBe(false);
      expect(canToggleDeckView(doc)).toBe(false);
    });
  });

  it('lets deck view toggle itself while still blocking other run shortcuts', () => {
    const doc = createDoc({
      deckViewModal: createModalElement(),
    });

    expect(getRunHotkeyState(doc, {
      currentScreen: 'combat',
      combat: { active: true, playerTurn: true },
    })).toEqual({
      mode: 'modal',
      activeSurface: 'deckView',
      visibleSurfaces: ['deckView'],
      allowsCombatHotkeys: false,
      allowsRunNavigationHotkeys: false,
    });
    expect(canToggleDeckView(doc)).toBe(true);
    expect(canOpenFullMap(doc)).toBe(false);
  });

  it('classifies active combat turns separately from exploration', () => {
    expect(getRunHotkeyState(createDoc(), {
      currentScreen: 'combat',
      combat: { active: true, playerTurn: true },
    })).toEqual({
      mode: 'combat',
      activeSurface: null,
      visibleSurfaces: [],
      allowsCombatHotkeys: true,
      allowsRunNavigationHotkeys: true,
    });
  });

  it('classifies node-card overlay flow as navigation', () => {
    const nodeCardOverlay = createModalElement();
    nodeCardOverlay.style.opacity = '1';
    nodeCardOverlay.style.pointerEvents = 'auto';
    nodeCardOverlay.classList.contains = () => false;

    expect(getRunHotkeyState(createDoc({
      nodeCardOverlay,
    }), {
      currentScreen: 'game',
      combat: { active: false },
    })).toEqual({
      mode: 'navigation',
      activeSurface: null,
      visibleSurfaces: [],
      allowsCombatHotkeys: false,
      allowsRunNavigationHotkeys: true,
    });
  });

  it('classifies intro and transition overlays as cutscene policy', () => {
    const introCinematicOverlay = createModalElement();
    introCinematicOverlay.style.opacity = '1';
    introCinematicOverlay.style.pointerEvents = 'auto';
    introCinematicOverlay.classList.contains = () => false;

    expect(getRunHotkeyState(createDoc({
      introCinematicOverlay,
    }), {
      currentScreen: 'game',
      combat: { active: false },
    })).toEqual({
      mode: 'cutscene',
      activeSurface: null,
      visibleSurfaces: [],
      allowsCombatHotkeys: false,
      allowsRunNavigationHotkeys: false,
    });
    expect(canOpenFullMap(createDoc({ introCinematicOverlay }), {
      currentScreen: 'game',
      combat: { active: false },
    })).toBe(false);
    expect(canToggleDeckView(createDoc({ introCinematicOverlay }), {
      currentScreen: 'game',
      combat: { active: false },
    })).toBe(false);
  });
});
