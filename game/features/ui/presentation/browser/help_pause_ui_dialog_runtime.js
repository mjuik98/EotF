import { getDoc } from './help_pause_ui_helpers.js';
import {
  createAbandonConfirm,
  createQuitGameConfirm,
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

function confirmQuitGameRuntime(deps = {}) {
  const win = deps?.win || deps?.doc?.defaultView || null;
  if (typeof deps?.quitGameRequest === 'function') {
    return deps.quitGameRequest({
      ...deps,
      win,
    }) !== false;
  }

  win?.close?.();
  return false;
}

export function toggleQuitGameConfirmRuntime(deps = {}) {
  const doc = getDoc(deps);
  const existing = doc.getElementById('quitGameConfirm');
  if (existing) {
    existing.remove();
    return false;
  }

  const win = deps?.win || doc?.defaultView || null;
  const confirmEl = createQuitGameConfirm(
    doc,
    () => confirmEl.remove(),
    () => {
      const quitHandled = confirmQuitGameRuntime({
        ...deps,
        win,
      });
      if (quitHandled) {
        confirmEl.remove();
        return;
      }

      const statusEl = confirmEl.querySelector?.('#quitGameStatus')
        || confirmEl.children?.[0]?.children?.[1]?.children?.find?.((child) => child?.id === 'quitGameStatus')
        || null;
      const cancelBtn = confirmEl.querySelector?.('#quitGameCancelBtn')
        || confirmEl.children?.[0]?.children?.at?.(-1)?.children?.[0]?.children?.[0]
        || null;
      const submitBtn = confirmEl.querySelector?.('#quitGameSubmitBtn')
        || confirmEl.children?.[0]?.children?.at?.(-1)?.children?.[0]?.children?.[1]
        || null;

      if (statusEl) {
        statusEl.textContent = '창 닫기를 요청했습니다. 반응이 없으면 브라우저 탭이나 창을 직접 닫아주세요.';
      }
      if (cancelBtn) cancelBtn.textContent = '닫기';
      if (submitBtn) {
        submitBtn.textContent = '종료 요청됨';
        submitBtn.disabled = true;
      }
    },
  );
  doc.body.appendChild(confirmEl);
  return true;
}
