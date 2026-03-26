import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createSaveStatusPresenter,
  presentSaveStatus,
} from '../game/shared/save/save_status_presenter.js';

describe('save_status_presenter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('renders and expires a saved badge with injected document state', () => {
    const appended = [];
    const doc = {
      body: {
        appendChild: vi.fn((node) => {
          appended.push(node);
        }),
      },
      createElement: vi.fn(() => ({
        style: { cssText: '' },
        textContent: '',
        remove: vi.fn(),
      })),
    };

    presentSaveStatus(
      { status: 'saved', persisted: true, queueDepth: 0 },
      { doc },
    );

    expect(doc.createElement).toHaveBeenCalledWith('div');
    expect(doc.body.appendChild).toHaveBeenCalledTimes(1);
    expect(appended[0].textContent).toBe('Saved');

    vi.advanceTimersByTime(1800);

    expect(appended[0].remove).toHaveBeenCalledTimes(1);
  });

  it('reuses a single presenter runtime instead of stacking duplicate toasts', () => {
    const appended = [];
    const removed = [];
    const doc = {
      body: {
        appendChild: vi.fn((node) => {
          appended.push(node);
        }),
      },
      createElement: vi.fn(() => ({
        style: { cssText: '' },
        textContent: '',
        remove: vi.fn(function remove() {
          removed.push(this.textContent);
        }),
      })),
    };
    const presenter = createSaveStatusPresenter();

    presenter.present(
      { status: 'queued', persisted: false, queueDepth: 1 },
      { doc },
    );
    presenter.present(
      { status: 'error', persisted: false, queueDepth: 1 },
      { doc },
    );

    expect(doc.body.appendChild).toHaveBeenCalledTimes(1);
    expect(appended).toHaveLength(1);
    expect(appended[0].textContent).toBe('저장에 실패해 현재 런을 유지합니다.');

    vi.advanceTimersByTime(4000);

    expect(appended[0].remove).toHaveBeenCalledTimes(1);
    expect(removed).toEqual(['저장에 실패해 현재 런을 유지합니다.']);
  });
});
