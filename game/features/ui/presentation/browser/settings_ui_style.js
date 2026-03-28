const SETTINGS_UI_STYLE_ID = 'settings-ui-style';
const SETTINGS_UI_STYLE_HREF = new URL('../../../../../css/settings_modal.css', import.meta.url).href;

export function ensureSettingsUiStyle(doc) {
  const resolvedDoc = doc || (typeof document !== 'undefined' ? document : null);
  if (!resolvedDoc?.head || resolvedDoc.getElementById?.(SETTINGS_UI_STYLE_ID)) return;

  const link = resolvedDoc.createElement('link');
  link.id = SETTINGS_UI_STYLE_ID;
  link.rel = 'stylesheet';
  link.href = SETTINGS_UI_STYLE_HREF;
  resolvedDoc.head.appendChild(link);
}
