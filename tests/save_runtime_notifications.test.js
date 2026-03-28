import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createSaveRuntimeNotifications } from '../game/platform/browser/notifications/save_runtime_notifications.js';

function createDoc() {
  const appended = [];
  return {
    appended,
    body: {
      appendChild: vi.fn((node) => {
        appended.push(node);
        return node;
      }),
    },
    createElement: vi.fn(() => ({
      style: { cssText: '' },
      textContent: '',
      remove: vi.fn(),
    })),
  };
}

describe('save_runtime_notifications', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('routes save status calls through the injected presenter', () => {
    const presentSaveStatus = vi.fn(() => true);
    const notifications = createSaveRuntimeNotifications({ presentSaveStatus });

    const shown = notifications.saveStatus({ status: 'saved' }, { doc: createDoc() });

    expect(shown).toBe(true);
    expect(presentSaveStatus).toHaveBeenCalledWith({ status: 'saved' }, expect.any(Object));
  });

  it('shows a localized storage failure notice with the shared notice styling', () => {
    const doc = createDoc();
    const notifications = createSaveRuntimeNotifications();

    const shown = notifications.storageFailure(
      { reason: 'Storage quota exceeded' },
      { doc },
    );

    expect(shown).toBe(true);
    expect(doc.appended).toHaveLength(1);
    expect(doc.appended[0].textContent).toBe('저장 공간이 부족해 현재 런을 유지합니다. Storage quota exceeded');
    expect(doc.appended[0].style.cssText).toContain('Share Tech Mono');

    vi.advanceTimersByTime(4000);

    expect(doc.appended[0].remove).toHaveBeenCalledTimes(1);
  });
});
