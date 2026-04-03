import { getStaticEscapeSurfaces } from './overlay_escape_surface_definitions.js';
import { defaultSwallowEscape, isEscapeKey } from './overlay_escape_visibility.js';

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
  const scope = context.scope || 'run';
  const swallowEscape = context.swallowEscape || defaultSwallowEscape;
  if (!doc || !isEscapeKey(event)) return false;

  const registeredSurface = listVisibleRegisteredEscapeSurfaces(doc, { scope })[0];
  if (registeredSurface) {
    const handled = registeredSurface.close?.(event, context);
    if (handled !== false) {
      swallowEscape(event);
      return true;
    }
  }

  const staticSurface = getStaticEscapeSurfaces(scope)
    .find((surface) => surface.isVisible({ doc }));
  if (!staticSurface) return false;

  swallowEscape(event);
  const handled = staticSurface.close?.(null, context);
  return handled !== false;
}
