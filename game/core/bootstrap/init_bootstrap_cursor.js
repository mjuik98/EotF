export function initBootstrapCursor({ modules, doc, win, logger = console }) {
  try {
    modules.CustomCursor?.init?.({ doc, win });
  } catch (e) {
    logger.error('[Main] CustomCursor init failed:', e);
  }
}
