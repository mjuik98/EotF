const registries = new WeakMap();
let registrationOrder = 0;

function getRegistry(doc) {
  if (!doc) return null;
  let registry = registries.get(doc);
  if (!registry) {
    registry = new Map();
    registries.set(doc, registry);
  }
  return registry;
}

function normalizeScopes(scopes) {
  if (!Array.isArray(scopes) || scopes.length === 0) return ['run'];
  return scopes.filter(Boolean);
}

function defaultSwallowEscape(event) {
  event?.preventDefault?.();
  event?.stopPropagation?.();
  event?.stopImmediatePropagation?.();
}

function isHelpMenuVisible(doc) {
  const helpMenu = doc?.getElementById?.('helpMenu') || null;
  return Boolean(helpMenu && helpMenu.style?.display !== 'none');
}

function closeVisibleById(context, id, close) {
  const element = context.doc?.getElementById?.(id) || null;
  if (!isVisibleOverlayElement(element, context.doc)) return false;
  if (typeof close !== 'function') return false;
  return close(element, context) !== false;
}

function isPauseMenuVisible(doc) {
  return isVisibleOverlayElement(doc?.getElementById?.('pauseMenu') || null, doc);
}

const RUN_ESCAPE_SURFACES = Object.freeze([
  {
    key: 'codexDetail',
    isVisible: ({ doc }) => isVisibleOverlayElement(doc?.getElementById?.('cxDetailPopup') || null, doc),
    close: (_element, context) => closeVisibleById(context, 'cxDetailPopup', (popup) => {
      const closeButton = context.doc?.getElementById?.('cxPopupClose') || null;
      if (typeof closeButton?.click === 'function') closeButton.click();
      else popup.classList?.remove?.('open');
    }),
  },
  {
    key: 'combatRelicDetail',
    isVisible: ({ doc }) => isVisibleOverlayElement(doc?.getElementById?.('combatRelicPanel') || null, doc),
    close: (_element, context) => closeVisibleById(context, 'combatRelicPanel', (panel) => {
      if (typeof panel.__closeEscapeSurface !== 'function') return false;
      panel.__closeEscapeSurface();
    }),
  },
  {
    key: 'mapRelicDetail',
    isVisible: ({ doc }) => isVisibleOverlayElement(doc?.getElementById?.('mapRelicDetailPanel') || null, doc),
    close: (_element, context) => closeVisibleById(context, 'mapRelicDetailPanel', (panel) => {
      if (typeof panel.__closeEscapeSurface !== 'function') return false;
      panel.__closeEscapeSurface();
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

const TITLE_ESCAPE_SURFACES = Object.freeze([
  {
    key: 'codexDetail',
    isVisible: ({ doc }) => isVisibleOverlayElement(doc?.getElementById?.('cxDetailPopup') || null, doc),
    close: (_element, context) => closeVisibleById(context, 'cxDetailPopup', (popup) => {
      const closeButton = context.doc?.getElementById?.('cxPopupClose') || null;
      if (typeof closeButton?.click === 'function') closeButton.click();
      else popup.classList?.remove?.('open');
    }),
  },
  {
    key: 'classSelectRelicDetail',
    isVisible: ({ doc }) => isVisibleOverlayElement(doc?.getElementById?.('classSelectRelicDetail') || null, doc),
    close: (_element, context) => closeVisibleById(context, 'classSelectRelicDetail', (panel) => {
      if (typeof panel.__closeEscapeSurface !== 'function') return false;
      panel.__closeEscapeSurface();
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

function getStaticEscapeSurfaces(scope) {
  if (scope === 'title') return TITLE_ESCAPE_SURFACES;
  return RUN_ESCAPE_SURFACES;
}

export function isEscapeKey(event) {
  return event?.key === 'Escape' || event?.key === 'Esc';
}

export function isVisibleOverlayElement(element, doc = null) {
  const fallbackDoc = typeof document !== 'undefined' ? document : null;
  const resolvedDoc = doc || fallbackDoc;
  if (!element) return false;
  if (element.id === 'settingsModal') {
    return !!element.classList?.contains?.('active');
  }
  if (element.hidden) return false;

  const inlineDisplay = String(element.style?.display || '').trim().toLowerCase();
  if (inlineDisplay === 'none') return false;

  if (element.dataset?.open === 'true') return true;
  if (element.classList?.contains?.('active')) return true;
  if (element.classList?.contains?.('open')) return true;

  const fallbackView = typeof window !== 'undefined' ? window : null;
  const view = resolvedDoc?.defaultView || fallbackView;
  if (typeof view?.getComputedStyle !== 'function') {
    return Boolean(inlineDisplay);
  }

  const computed = view.getComputedStyle(element);
  if (computed.display === 'none') return false;
  if (computed.visibility === 'hidden') return false;

  const opacity = Number.parseFloat(computed.opacity || '1');
  const pointerEvents = String(computed.pointerEvents || '').toLowerCase();
  if (
    !element.classList?.contains?.('active')
    && !element.classList?.contains?.('open')
    && element.dataset?.open !== 'true'
    && opacity <= 0
    && pointerEvents === 'none'
  ) {
    return false;
  }

  return true;
}

export function registerEscapeSurface(doc, key, surface = {}) {
  const registry = getRegistry(doc);
  if (!registry || key == null) return () => {};

  const nextSurface = {
    close: surface.close,
    hotkeyKey: surface.hotkeyKey || surface.key || 'detail',
    isVisible: surface.isVisible || (() => false),
    order: ++registrationOrder,
    priority: Number(surface.priority || 0),
    scopes: normalizeScopes(surface.scopes),
  };
  registry.set(key, nextSurface);

  return () => {
    const current = registry.get(key);
    if (current === nextSurface) registry.delete(key);
  };
}

export function listVisibleRegisteredEscapeSurfaces(doc, { scope = 'run' } = {}) {
  const registry = registries.get(doc);
  if (!registry) return [];

  return Array.from(registry.values())
    .filter((surface) => surface.scopes.includes(scope))
    .filter((surface) => surface.isVisible?.({ doc }) === true)
    .sort((left, right) => {
      if (right.priority !== left.priority) return right.priority - left.priority;
      return right.order - left.order;
    });
}

export function listVisibleRegisteredEscapeSurfaceKeys(doc, { scope = 'run' } = {}) {
  return listVisibleRegisteredEscapeSurfaces(doc, { scope })
    .map((surface) => surface.hotkeyKey)
    .filter(Boolean);
}

export function listVisibleEscapeSurfaceKeys(doc, { scope = 'run' } = {}) {
  const registered = listVisibleRegisteredEscapeSurfaceKeys(doc, { scope });
  const statics = getStaticEscapeSurfaces(scope)
    .filter((surface) => surface.isVisible({ doc }))
    .map((surface) => surface.key);
  return Array.from(new Set([...registered, ...statics]));
}

export function closeTopEscapeSurface(event, context = {}) {
  const doc = context.doc || null;
  if (!doc) return false;

  const scope = context.scope || 'run';
  const swallowEscape = context.swallowEscape || defaultSwallowEscape;

  const registeredSurface = listVisibleRegisteredEscapeSurfaces(doc, { scope })[0] || null;
  if (registeredSurface) {
    swallowEscape(event);
    registeredSurface.close?.({ ...context, doc, event });
    return true;
  }

  const staticSurfaces = getStaticEscapeSurfaces(scope);
  for (const surface of staticSurfaces) {
    if (!surface.isVisible({ ...context, doc })) continue;
    const handled = surface.close(null, { ...context, doc, event });
    if (handled === false) continue;
    swallowEscape(event);
    return true;
  }

  return false;
}
