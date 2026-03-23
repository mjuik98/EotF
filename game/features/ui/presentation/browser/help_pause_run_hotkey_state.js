import {
  isCombatOverlayActive,
  isInGame,
  isNodeCardOverlayVisible,
  isRunCutsceneVisible,
  listVisibleRunHotkeySurfaces,
} from './help_pause_visibility.js';

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

function getBlockingRunHotkeySurface(doc, gs = null, { allowSurfaces = [] } = {}) {
  const allowed = new Set(allowSurfaces);
  return getRunHotkeyState(doc, gs).visibleSurfaces.find((surface) => !allowed.has(surface)) || null;
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
