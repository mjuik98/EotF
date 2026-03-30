import {
  INPUT_ACTION_DECK_VIEW,
  resolveKeyboardActionFromSettings,
} from '../../ports/public_input_capabilities.js';
import { handleRunInputAction } from '../../application/handle_run_input_action.js';
import {
  closeTopEscapeSurface,
  isVisibleModal,
  listVisibleEscapeSurfaceKeys,
} from './run_session_overlay_escape_support.js';

export { closeTopEscapeSurface, isVisibleModal };

// Keep DOM-derived run-session visibility centralized here so legacy UI helpers can
// delegate without owning the browser hotkey rules.
export const RUN_HOTKEY_SURFACES = Object.freeze([
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
]);

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

export function getRunSessionDoc(deps = {}) {
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

export function isCombatOverlayActive(doc) {
  const overlay = doc?.getElementById?.('combatOverlay');
  return Boolean(overlay?.classList?.contains('active'));
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

export function listVisibleRunHotkeySurfaces(doc) {
  if (!doc) return [];
  return listVisibleEscapeSurfaceKeys(doc, { scope: 'run' });
}

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

  if (isRunCutsceneVisible(doc)) return resolveState('cutscene', { visibleSurfaces });
  if (isNodeCardOverlayVisible(doc)) return resolveState('navigation', { visibleSurfaces });
  if (gs?.combat?.active) return resolveState('combat', { visibleSurfaces });
  if (gs?.currentScreen === 'title') return resolveState('title', { visibleSurfaces });
  if (isInGame(gs) || isCombatOverlayActive(doc)) return resolveState('exploration', { visibleSurfaces });
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
  if (!getRunHotkeyPolicy(hotkeyState.mode).deckView) return false;
  return getBlockingRunHotkeySurface(doc, gs, { allowSurfaces: ['deckView'] }) === null;
}

export function canOpenFullMap(doc, gs = null) {
  const hotkeyState = getRunHotkeyState(doc, gs);
  if (!getRunHotkeyPolicy(hotkeyState.mode).fullMap) return false;
  return getBlockingRunHotkeySurface(doc, gs) === null;
}

export function handleRunSessionHotkeyEvent(event, context = {}) {
  const { deps = {}, onCancel, onTargetCycle, ui } = context;
  const doc = context.doc || getRunSessionDoc(context) || getRunSessionDoc(deps);
  if (!doc || !ui) return false;
  if (doc.querySelector?.('.settings-keybind-btn.listening')) return false;

  const actionId = resolveKeyboardActionFromSettings(event, context.keybindings);
  if (!actionId) return false;

  const gs = deps?.gs || deps?.State || deps?.state || null;
  const runHotkeyState = getRunHotkeyState(doc, gs);
  const hotkeyPolicy = getRunHotkeyPolicy(runHotkeyState.mode);

  return handleRunInputAction(actionId, {
    ...context,
    actionId,
    deps,
    doc,
    event,
    gs,
    hotkeyPolicy,
    inGame: isInGame(gs) || isCombatOverlayActive(doc),
    isDeckViewVisible: isDeckViewVisible(doc),
    canToggleDeckView: actionId === INPUT_ACTION_DECK_VIEW ? canToggleDeckView(doc, gs) : false,
    hasBlockingGameplayModal: hasBlockingGameplayModal(doc, gs),
    onCancel,
    onTargetCycle,
    runHotkeyState,
  });
}
