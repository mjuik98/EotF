import { describe, expect, it } from 'vitest';

import { createUiSurfaceStateController } from '../game/shared/ui/state/ui_surface_state_controller.js';

describe('ui surface state controller', () => {
  it('manages open, pinned, and keyed dataset state through a small shared API', () => {
    const element = { dataset: {} };
    const controller = createUiSurfaceStateController({ element });

    expect(controller.isOpen()).toBe(false);
    expect(controller.isPinned()).toBe(false);
    expect(controller.getValue('itemId')).toBe('');

    controller.open({ pinned: true, values: { itemId: 'codex-entry', placement: 'left' } });

    expect(element.dataset.open).toBe('true');
    expect(element.dataset.pinned).toBe('true');
    expect(element.dataset.itemId).toBe('codex-entry');
    expect(element.dataset.placement).toBe('left');
    expect(controller.isOpen()).toBe(true);
    expect(controller.isPinned()).toBe(true);
    expect(controller.getValue('itemId')).toBe('codex-entry');

    controller.close({ clearKeys: ['itemId', 'placement'] });

    expect(element.dataset.open).toBe('false');
    expect(element.dataset.pinned).toBe('false');
    expect(element.dataset.itemId).toBeUndefined();
    expect(element.dataset.placement).toBeUndefined();
    expect(controller.isOpen()).toBe(false);
  });
});
