import { isVisibleOverlayElement } from './overlay_escape_visibility.js';

function isHelpMenuVisible(doc) {
  const helpMenu = doc?.getElementById?.('helpMenu') || null;
  return Boolean(helpMenu && helpMenu.style?.display !== 'none');
}

function isPauseMenuVisible(doc) {
  return isVisibleOverlayElement(doc?.getElementById?.('pauseMenu') || null, doc);
}

function closeVisibleById(context, id, close) {
  const element = context.doc?.getElementById?.(id) || null;
  if (!isVisibleOverlayElement(element, context.doc)) return false;
  if (typeof close !== 'function') return false;
  return close(element, context) !== false;
}

export const RUN_ESCAPE_SURFACES = Object.freeze([
  {
    key: 'quitGame',
    isVisible: ({ doc }) => isVisibleOverlayElement(doc?.getElementById?.('quitGameConfirm') || null, doc),
    close: (_element, context) => closeVisibleById(context, 'quitGameConfirm', () => {
      context.doc.getElementById('quitGameConfirm')?.remove?.();
    }),
  },
  {
    key: 'fullMap',
    isVisible: ({ doc }) => isVisibleOverlayElement(doc?.getElementById?.('fullMapOverlay') || null, doc),
    close: (_element, context) => closeVisibleById(context, 'fullMapOverlay', (overlay) => {
      if (typeof overlay._closeFullMap === 'function') overlay._closeFullMap();
      else overlay.remove?.();
    }),
  },
  {
    key: 'battleChronicle',
    isVisible: ({ doc }) => isVisibleOverlayElement(doc?.getElementById?.('battleChronicleOverlay') || null, doc),
    close: (_element, context) => closeVisibleById(context, 'battleChronicleOverlay', () => {
      if (typeof context.deps?.closeBattleChronicle !== 'function') return false;
      return context.deps.closeBattleChronicle() !== false;
    }),
  },
  {
    key: 'returnTitle',
    isVisible: ({ doc }) => isVisibleOverlayElement(doc?.getElementById?.('returnTitleConfirm') || null, doc),
    close: (_element, context) => closeVisibleById(context, 'returnTitleConfirm', () => {
      context.doc.getElementById('returnTitleConfirm')?.remove?.();
    }),
  },
  {
    key: 'abandonConfirm',
    isVisible: ({ doc }) => isVisibleOverlayElement(doc?.getElementById?.('abandonConfirm') || null, doc),
    close: (_element, context) => closeVisibleById(context, 'abandonConfirm', () => {
      context.doc.getElementById('abandonConfirm')?.remove?.();
    }),
  },
  {
    key: 'help',
    isVisible: ({ doc }) => isHelpMenuVisible(doc),
    close: (_element, context) => {
      if (!isHelpMenuVisible(context.doc)) return false;
      context.ui?.toggleHelp?.(context.deps);
      return true;
    },
  },
  {
    key: 'deckView',
    isVisible: ({ doc }) => isVisibleOverlayElement(doc?.getElementById?.('deckViewModal') || null, doc),
    close: (_element, context) => closeVisibleById(context, 'deckViewModal', () => {
      if (typeof context.deps?.closeDeckView !== 'function') return false;
      return context.deps.closeDeckView() !== false;
    }),
  },
  {
    key: 'codex',
    isVisible: ({ doc }) => isVisibleOverlayElement(doc?.getElementById?.('codexModal') || null, doc),
    close: (_element, context) => closeVisibleById(context, 'codexModal', () => {
      if (typeof context.deps?.closeCodex !== 'function') return false;
      return context.deps.closeCodex() !== false;
    }),
  },
  {
    key: 'runSettings',
    isVisible: ({ doc }) => isVisibleOverlayElement(doc?.getElementById?.('runSettingsModal') || null, doc),
    close: (_element, context) => closeVisibleById(context, 'runSettingsModal', () => {
      if (typeof context.deps?.closeRunSettings !== 'function') return false;
      return context.deps.closeRunSettings() !== false;
    }),
  },
  {
    key: 'settings',
    isVisible: ({ doc }) => isVisibleOverlayElement(doc?.getElementById?.('settingsModal') || null, doc),
    close: (_element, context) => closeVisibleById(context, 'settingsModal', () => {
      if (typeof context.deps?.closeSettings !== 'function') return false;
      return context.deps.closeSettings() !== false;
    }),
  },
  {
    key: 'pause',
    isVisible: ({ doc }) => isPauseMenuVisible(doc),
    close: (_element, context) => {
      if (!isPauseMenuVisible(context.doc)) return false;
      context.ui?.togglePause?.(context.deps);
      return true;
    },
  },
]);

export const TITLE_ESCAPE_SURFACES = Object.freeze([
  {
    key: 'quitGame',
    isVisible: ({ doc }) => isVisibleOverlayElement(doc?.getElementById?.('quitGameConfirm') || null, doc),
    close: (_element, context) => closeVisibleById(context, 'quitGameConfirm', () => {
      context.doc.getElementById('quitGameConfirm')?.remove?.();
    }),
  },
  {
    key: 'codex',
    isVisible: ({ doc }) => isVisibleOverlayElement(doc?.getElementById?.('codexModal') || null, doc),
    close: (_element, context) => closeVisibleById(context, 'codexModal', () => {
      context.actions?.closeCodex?.();
    }),
  },
  {
    key: 'runSettings',
    isVisible: ({ doc }) => isVisibleOverlayElement(doc?.getElementById?.('runSettingsModal') || null, doc),
    close: (_element, context) => closeVisibleById(context, 'runSettingsModal', () => {
      context.actions?.closeRunSettings?.();
    }),
  },
  {
    key: 'settings',
    isVisible: ({ doc }) => isVisibleOverlayElement(doc?.getElementById?.('settingsModal') || null, doc),
    close: (_element, context) => closeVisibleById(context, 'settingsModal', () => {
      context.actions?.closeSettings?.();
    }),
  },
]);

export function getStaticEscapeSurfaces(scope) {
  if (scope === 'title') return TITLE_ESCAPE_SURFACES;
  return RUN_ESCAPE_SURFACES;
}
