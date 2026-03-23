import { SettingsManager } from '../../../../core/settings_manager.js';

// Keep run hotkey gating DOM-derived for now so global handlers and overlay-local handlers
// resolve the same state without introducing a new GS-level input mode.
const RUN_HOTKEY_SURFACES = [
  { key: 'help', isVisible: (doc) => isHelpMenuVisible(doc) },
  { key: 'pause', isVisible: (doc) => isPauseMenuVisible(doc) },
  { key: 'fullMap', isVisible: (doc) => isFullMapOverlayVisible(doc) },
  { key: 'battleChronicle', id: 'battleChronicleOverlay' },
  { key: 'returnTitle', id: 'returnTitleConfirm' },
  { key: 'abandonConfirm', id: 'abandonConfirm' },
  { key: 'deckView', id: 'deckViewModal' },
  { key: 'codex', id: 'codexModal' },
  { key: 'runSettings', id: 'runSettingsModal' },
  { key: 'settings', id: 'settingsModal' },
];

export const RUN_HOTKEY_MODE_POLICY = {
  modal: {
    help: false,
    deckView: false,
    codex: false,
    pause: false,
    fullMap: false,
    combatHotkeys: false,
    runNavigationHotkeys: false,
  },
  cutscene: {
    help: false,
    deckView: false,
    codex: false,
    pause: false,
    fullMap: false,
    combatHotkeys: false,
    runNavigationHotkeys: false,
  },
  navigation: {
    help: true,
    deckView: true,
    codex: true,
    pause: true,
    fullMap: true,
    combatHotkeys: false,
    runNavigationHotkeys: true,
  },
  combat: {
    help: true,
    deckView: true,
    codex: true,
    pause: true,
    fullMap: false,
    combatHotkeys: true,
    runNavigationHotkeys: true,
  },
  title: {
    help: false,
    deckView: false,
    codex: false,
    pause: false,
    fullMap: false,
    combatHotkeys: false,
    runNavigationHotkeys: false,
  },
  exploration: {
    help: true,
    deckView: true,
    codex: true,
    pause: true,
    fullMap: true,
    combatHotkeys: false,
    runNavigationHotkeys: true,
  },
  gameplay: {
    help: false,
    deckView: false,
    codex: false,
    pause: false,
    fullMap: false,
    combatHotkeys: false,
    runNavigationHotkeys: false,
  },
};

export function getRunHotkeyPolicy(mode) {
  return RUN_HOTKEY_MODE_POLICY[mode] || RUN_HOTKEY_MODE_POLICY.gameplay;
}

export function getDoc(deps) {
  return deps?.doc || deps?.win?.document || null;
}

export function isInGame(gs) {
  return (
    gs?.currentScreen === 'game'
    || gs?.currentScreen === 'combat'
    || gs?.currentScreen === 'reward'
    || gs?.combat?.active === true
  );
}

export function resolveGs(deps = {}) {
  return deps?.gs
    || deps?.State
    || deps?.state
    || null;
}

export function clearActiveRunSave(deps = {}) {
  if (typeof deps.clearActiveRunSave === 'function') {
    deps.clearActiveRunSave();
    return;
  }

  const saveSystem = deps.saveSystem || deps.SaveSystem || null;
  saveSystem?.clearSave?.();
}

export function isCombatOverlayActive(doc) {
  const overlay = doc?.getElementById?.('combatOverlay');
  return Boolean(overlay?.classList?.contains('active'));
}

export function isVisibleModal(el, doc) {
  if (!el) return false;
  if (el.hidden) return false;

  const inlineDisplay = String(el.style?.display || '').trim().toLowerCase();
  if (inlineDisplay === 'none') return false;

  const view = doc?.defaultView || null;
  if (typeof view?.getComputedStyle !== 'function') {
    return Boolean(el.classList?.contains('active') || inlineDisplay);
  }

  const computed = view.getComputedStyle(el);
  if (computed.display === 'none') return false;
  if (computed.visibility === 'hidden') return false;

  const opacity = Number.parseFloat(computed.opacity || '1');
  const pointerEvents = String(computed.pointerEvents || '').toLowerCase();
  if (!el.classList?.contains('active') && opacity <= 0 && pointerEvents === 'none') {
    return false;
  }

  return true;
}

export function isFullMapOverlayVisible(doc) {
  return isVisibleModal(doc?.getElementById?.('fullMapOverlay') || null, doc);
}

export function isPauseMenuVisible(doc) {
  return isVisibleModal(doc?.getElementById?.('pauseMenu') || null, doc);
}

export function isHelpMenuVisible(doc) {
  const helpMenu = doc?.getElementById?.('helpMenu') || null;
  return Boolean(helpMenu && helpMenu.style?.display !== 'none');
}

export function isDeckViewVisible(doc) {
  return isVisibleModal(doc?.getElementById?.('deckViewModal') || null, doc);
}

export function isNodeCardOverlayVisible(doc) {
  return isVisibleModal(doc?.getElementById?.('nodeCardOverlay') || null, doc);
}

export function isRunCutsceneVisible(doc) {
  if (!doc) return false;
  if (isVisibleModal(doc.getElementById?.('introCinematicOverlay') || null, doc)) return true;
  if (isVisibleModal(doc.getElementById?.('runEntryTransitionOverlay') || null, doc)) return true;
  if (isVisibleModal(doc.getElementById?.('runStageFadeTransitionOverlay') || null, doc)) return true;
  const storyOverlay = doc.getElementById?.('storyContinueBtn')?.parentElement || null;
  return isVisibleModal(storyOverlay, doc);
}

function listVisibleRunHotkeySurfaces(doc) {
  if (!doc) return [];
  return RUN_HOTKEY_SURFACES
    .filter((surface) => {
      if (typeof surface.isVisible === 'function') {
        return surface.isVisible(doc);
      }
      return isVisibleModal(doc.getElementById?.(surface.id) || null, doc);
    })
    .map((surface) => surface.key);
}

export function getRunHotkeyState(doc, gs = null) {
  const resolveState = (mode, { activeSurface = null, visibleSurfaces = [] } = {}) => {
    const policy = getRunHotkeyPolicy(mode);
    const combatTurnActive = Boolean(gs?.combat?.playerTurn);
    return {
      mode,
      activeSurface,
      visibleSurfaces,
      allowsCombatHotkeys: policy.combatHotkeys && combatTurnActive,
      allowsRunNavigationHotkeys: policy.runNavigationHotkeys && (mode !== 'combat' || combatTurnActive),
    };
  };

  const visibleSurfaces = listVisibleRunHotkeySurfaces(doc);
  if (visibleSurfaces.length > 0) {
    return resolveState('modal', {
      activeSurface: visibleSurfaces[0] || null,
      visibleSurfaces,
    });
  }

  if (isRunCutsceneVisible(doc)) {
    return resolveState('cutscene', { visibleSurfaces });
  }

  if (isNodeCardOverlayVisible(doc)) {
    return resolveState('navigation', { visibleSurfaces });
  }

  if (gs?.combat?.active) {
    return resolveState('combat', { visibleSurfaces });
  }

  if (gs?.currentScreen === 'title') {
    return resolveState('title', { visibleSurfaces });
  }

  if (isInGame(gs) || isCombatOverlayActive(doc)) {
    return resolveState('exploration', { visibleSurfaces });
  }

  return resolveState('gameplay', { visibleSurfaces });
}

function getBlockingRunHotkeySurface(doc, gs = null, { allowSurfaces = [] } = {}) {
  const allowed = new Set(allowSurfaces);
  return getRunHotkeyState(doc, gs).visibleSurfaces.find((surface) => !allowed.has(surface)) || null;
}

export function hasBlockingGameplayModal(doc, gs = null) {
  return getBlockingRunHotkeySurface(doc, gs) !== null;
}

export function canToggleDeckView(doc, gs = null) {
  const hotkeyState = getRunHotkeyState(doc, gs);
  if (hotkeyState.activeSurface === 'deckView') {
    return getBlockingRunHotkeySurface(doc, gs, { allowSurfaces: ['deckView'] }) === null;
  }
  if (!getRunHotkeyPolicy(hotkeyState.mode).deckView) {
    return false;
  }
  return getBlockingRunHotkeySurface(doc, gs, { allowSurfaces: ['deckView'] }) === null;
}

export function canOpenFullMap(doc, gs = null) {
  const hotkeyState = getRunHotkeyState(doc, gs);
  if (!getRunHotkeyPolicy(hotkeyState.mode).fullMap) {
    return false;
  }
  return getBlockingRunHotkeySurface(doc, gs) === null;
}

export function eventMatchesCode(e, code) {
  if (!e || !code) return false;
  if (e.code === code) return true;

  if (code === 'Escape') return e.key === 'Escape' || e.key === 'Esc';
  if (code === 'Enter') return e.key === 'Enter';
  if (code === 'Tab') return e.key === 'Tab';
  if (code === 'Slash') return e.key === '/' || e.key === '?';

  if (code.startsWith('Key')) {
    return String(e.key || '').toUpperCase() === code.slice(3);
  }
  if (code.startsWith('Digit')) {
    return e.key === code.slice(5);
  }
  return false;
}

export function getKeybindingCode(action, fallback) {
  const code = SettingsManager.get(`keybindings.${action}`);
  if (typeof code === 'string' && code.trim()) return code;
  return fallback;
}

export function keyCodeToLabel(code) {
  if (!code || typeof code !== 'string') return '';
  if (code === 'Escape') return 'ESC';
  if (code === 'Enter') return 'Enter';
  if (code === 'Tab') return 'Tab';
  if (code === 'Slash') return '?';
  if (code === 'Space') return 'SPACE';
  if (code.startsWith('Key')) return code.slice(3).toUpperCase();
  if (code.startsWith('Digit')) return code.slice(5);
  return code;
}
