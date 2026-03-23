// Keep run hotkey gating DOM-derived for now so global handlers and overlay-local handlers
// resolve the same state without introducing a new GS-level input mode.
export const RUN_HOTKEY_SURFACES = [
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

export function listVisibleRunHotkeySurfaces(doc) {
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
