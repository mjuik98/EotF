const CODEX_STYLE_ID = 'codex-ui-style';
const CODEX_STYLE_HREF = new URL('../../../../../css/codex_v3.css', import.meta.url).href;

export function ensureCodexUiStyle(doc) {
  const resolvedDoc = doc || (typeof document !== 'undefined' ? document : null);
  if (!resolvedDoc?.head || resolvedDoc.getElementById?.(CODEX_STYLE_ID)) return;

  const link = resolvedDoc.createElement('link');
  link.id = CODEX_STYLE_ID;
  link.rel = 'stylesheet';
  link.href = CODEX_STYLE_HREF;
  resolvedDoc.head.appendChild(link);
}
