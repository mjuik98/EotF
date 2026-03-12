import { getDoc } from './help_pause_ui_helpers.js';
import {
  createAbandonConfirm,
  createReturnTitleConfirm,
} from './help_pause_ui_overlays.js';
import { confirmReturnToTitleRuntime } from './help_pause_ui_return_runtime.js';

export function toggleAbandonConfirmRuntime(deps = {}, onConfirm = () => {}) {
  const doc = getDoc(deps);
  const existing = doc.getElementById('abandonConfirm');
  if (existing) {
    existing.remove();
    return false;
  }

  const confirmEl = createAbandonConfirm(
    doc,
    () => confirmEl.remove(),
    () => onConfirm(),
  );
  doc.body.appendChild(confirmEl);
  return true;
}

export function toggleReturnTitleConfirmRuntime(deps = {}) {
  const doc = getDoc(deps);
  const existing = doc.getElementById('returnTitleConfirm');
  if (existing) {
    existing.remove();
    return false;
  }

  const win = deps?.win || doc?.defaultView || null;
  const confirmEl = createReturnTitleConfirm(
    doc,
    () => confirmEl.remove(),
    () => {
      confirmEl.remove();
      confirmReturnToTitleRuntime({
        ...deps,
        win,
      });
    },
  );
  doc.body.appendChild(confirmEl);
  return true;
}
