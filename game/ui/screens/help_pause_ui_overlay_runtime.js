import { getDoc } from './help_pause_ui_helpers.js';
import {
  createHelpMenu,
  createMobileWarning,
} from './help_pause_ui_overlays.js';

function getWin(deps = {}, doc = null) {
  return deps?.win || doc?.defaultView || null;
}

export function showMobileWarningRuntime(deps = {}) {
  const doc = getDoc(deps);
  const win = getWin(deps, doc);
  const isMobile = Boolean(win && (win.innerWidth < 900 || 'ontouchstart' in win));
  if (!doc || !isMobile || doc.getElementById('mobileWarn')) return false;

  const warn = createMobileWarning(doc, () => warn.remove());
  doc.body.appendChild(warn);
  return true;
}

export function toggleHelpOverlayRuntime(deps = {}, onClose = () => {}) {
  const doc = getDoc(deps);
  if (!doc) return false;

  const existing = doc.getElementById('helpMenu');
  if (existing) {
    existing.remove();
    onClose();
    return false;
  }

  const menu = createHelpMenu(doc, deps, () => {
    menu.remove();
    onClose();
  });
  doc.body.appendChild(menu);
  return true;
}
