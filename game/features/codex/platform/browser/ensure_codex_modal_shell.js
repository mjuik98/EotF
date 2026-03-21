const CODEX_MODAL_SHELL_MARKUP = `
<div class="codex-modal-inner"></div>
`.trim();

function resolveDoc(doc = null) {
  if (doc) return doc;
  return typeof document !== 'undefined' ? document : null;
}

export function buildCodexModalShellMarkup() {
  return CODEX_MODAL_SHELL_MARKUP;
}

export function ensureCodexModalShell(doc = null) {
  const resolvedDoc = resolveDoc(doc);
  const container = resolvedDoc?.getElementById?.('codexModal') || null;

  if (!container) return null;
  if (container.querySelector?.('.codex-modal-inner')) return container;

  container.innerHTML = buildCodexModalShellMarkup();
  return container;
}
