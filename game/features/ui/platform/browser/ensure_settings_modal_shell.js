import { buildSettingsModalShellFrame } from './settings_modal_shell_frame.js';
import {
  buildSettingsModalPanelsMarkup,
  buildSettingsModalTabsMarkup,
} from './settings_modal_shell_panels.js';

function resolveDoc(doc = null) {
  if (doc) return doc;
  return typeof document !== 'undefined' ? document : null;
}

export function buildSettingsModalShellMarkup() {
  return buildSettingsModalShellFrame({
    tabsMarkup: buildSettingsModalTabsMarkup(),
    panelsMarkup: buildSettingsModalPanelsMarkup(),
  });
}

export function ensureSettingsModalShell(doc = null) {
  const resolvedDoc = resolveDoc(doc);
  const container = resolvedDoc?.getElementById?.('settingsModal') || null;

  if (!container) return null;
  if (resolvedDoc.querySelector?.('.settings-modal-inner')) return container;

  container.innerHTML = buildSettingsModalShellMarkup();
  return container;
}
