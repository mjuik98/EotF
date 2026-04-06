import { resolveBrowserRuntime } from '../runtime_env.js';

export function downloadTextFile(filename, text, options = {}) {
  const { doc, win } = resolveBrowserRuntime(options);
  if (!doc || !win?.URL?.createObjectURL) return false;

  const blob = new Blob([text], { type: options.type || 'application/json;charset=utf-8' });
  const url = win.URL.createObjectURL(blob);
  const anchor = doc.createElement?.('a');
  if (!anchor) {
    win.URL.revokeObjectURL?.(url);
    return false;
  }

  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';
  doc.body?.appendChild?.(anchor);
  anchor.click?.();
  anchor.remove?.();
  win.URL.revokeObjectURL?.(url);
  return true;
}

export async function readImportFileText(file) {
  if (typeof file?.text === 'function') {
    return file.text();
  }

  return '';
}
