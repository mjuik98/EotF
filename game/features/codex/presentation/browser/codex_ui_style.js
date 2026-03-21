const CODEX_STYLE_ID = 'codex-ui-style';
const CODEX_STYLE_HREF = '/css/codex_v3.css';

export function ensureCodexUiStyle(doc) {
  if (!doc?.head || doc.getElementById?.(CODEX_STYLE_ID)) return;

  const link = doc.createElement('link');
  link.id = CODEX_STYLE_ID;
  link.rel = 'stylesheet';
  link.href = CODEX_STYLE_HREF;
  doc.head.appendChild(link);
}
