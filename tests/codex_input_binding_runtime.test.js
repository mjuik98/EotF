import { describe, expect, it, vi } from 'vitest';

import { bindCodexGlobalKeys } from '../game/features/codex/presentation/browser/codex_ui_runtime.js';
import * as popupRuntime from '../game/features/codex/presentation/browser/codex_ui_popup_runtime.js';
import * as controller from '../game/features/codex/presentation/browser/codex_ui_controller.js';

describe('codex_input_binding_runtime', () => {
  it('keeps codex popup keyboard handling local to popup navigation keys', () => {
    const closeSpy = vi.spyOn(popupRuntime, 'closeCodexDetailPopup').mockImplementation(() => {});
    const navigateSpy = vi.spyOn(controller, 'navigateCodexPopup').mockImplementation(() => {});
    const listeners = {};
    const popup = {
      classList: {
        contains: (name) => name === 'open',
      },
    };
    const doc = {
      getElementById: vi.fn((id) => (id === 'cxDetailPopup' ? popup : null)),
      addEventListener: vi.fn((name, handler) => {
        listeners[name] = handler;
      }),
    };
    const state = {};

    bindCodexGlobalKeys(state, { doc });

    listeners.keydown({ key: 'KeyC' });
    expect(closeSpy).not.toHaveBeenCalled();
    expect(navigateSpy).not.toHaveBeenCalled();

    listeners.keydown({ key: 'Escape' });
    listeners.keydown({ key: 'ArrowRight' });

    expect(closeSpy).toHaveBeenCalledWith(state, doc);
    expect(navigateSpy).toHaveBeenCalledWith(state, 1);

    closeSpy.mockRestore();
    navigateSpy.mockRestore();
  });
});
