import { buildSaveQueueSuffix } from '../../../shared/save/save_status_formatters.js';
import { buildNoticeStyle } from './notice_surface.js';

function getDoc(deps = {}) {
  return deps.doc || null;
}

function resolvePresentation(status) {
  if (status?.status === 'saved') {
    return {
      text: 'Saved',
      tone: 'info',
      durationMs: 1800,
    };
  }

  if (status?.status === 'queued') {
    return {
      text: `저장을 완료하지 못해 현재 런을 유지합니다.${buildSaveQueueSuffix(status) ? ` ${buildSaveQueueSuffix(status)}` : ''}`,
      tone: 'warn',
      durationMs: 4000,
    };
  }

  if (status?.status === 'error') {
    return {
      text: `저장에 실패해 현재 런을 유지합니다.${buildSaveQueueSuffix(status) ? ` ${buildSaveQueueSuffix(status)}` : ''}`,
      tone: 'error',
      durationMs: 4000,
    };
  }

  return null;
}

export function createSaveStatusPresenter() {
  let activeEl = null;
  let activeTimer = null;

  function present(status, deps = {}) {
    const presentation = resolvePresentation(status);
    if (!presentation) return false;

    const doc = getDoc(deps);
    if (!doc?.body) return false;

    const el = activeEl || doc.createElement('div');
    el.textContent = presentation.text;
    el.style.cssText = buildNoticeStyle(presentation.tone);

    if (!activeEl) {
      doc.body.appendChild(el);
      activeEl = el;
    }

    if (activeTimer) {
      clearTimeout(activeTimer);
    }

    activeTimer = setTimeout(() => {
      activeEl?.remove?.();
      activeEl = null;
      activeTimer = null;
    }, presentation.durationMs);

    return true;
  }

  return {
    present,
  };
}

const defaultSaveStatusPresenter = createSaveStatusPresenter();

export function presentSaveStatus(status, deps = {}) {
  if (typeof deps.presentSaveStatus === 'function' && deps.presentSaveStatus !== presentSaveStatus) {
    return deps.presentSaveStatus(status, deps);
  }
  return defaultSaveStatusPresenter.present(status, deps);
}
