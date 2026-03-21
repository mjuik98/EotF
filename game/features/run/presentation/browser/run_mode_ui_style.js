const RUN_MODE_STYLE_ID = 'run-mode-ui-style';
const RUN_MODE_STYLE_HREF = '/css/run-rules-redesign.css';

export function ensureRunModeUiStyle(doc) {
  if (!doc?.head || doc.getElementById?.(RUN_MODE_STYLE_ID)) return;

  const link = doc.createElement('link');
  link.id = RUN_MODE_STYLE_ID;
  link.rel = 'stylesheet';
  link.href = RUN_MODE_STYLE_HREF;
  doc.head.appendChild(link);
}
