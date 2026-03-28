const TITLE_SCREEN_STYLE_ID = 'title-screen-ui-style';
const TITLE_SCREEN_STYLE_HREF = new URL('../../../../../css/title_screen.css', import.meta.url).href;

export function ensureTitleScreenUiStyle(doc) {
  const resolvedDoc = doc || (typeof document !== 'undefined' ? document : null);
  if (!resolvedDoc?.head || resolvedDoc.getElementById?.(TITLE_SCREEN_STYLE_ID)) return;

  const link = resolvedDoc.createElement('link');
  link.id = TITLE_SCREEN_STYLE_ID;
  link.rel = 'stylesheet';
  link.href = TITLE_SCREEN_STYLE_HREF;
  resolvedDoc.head.appendChild(link);
}
