import { describe, expect, it } from 'vitest';

import {
  handleRunInputAction,
  handleRunSessionHotkeyEvent,
  getRunHotkeyPolicy,
  getRunHotkeyState,
} from '../game/features/run_session/public.js';

describe('run_session_public', () => {
  it('exposes the coarse run-session hotkey surface', () => {
    expect(typeof handleRunInputAction).toBe('function');
    expect(typeof handleRunSessionHotkeyEvent).toBe('function');
    expect(typeof getRunHotkeyPolicy).toBe('function');
    expect(typeof getRunHotkeyState).toBe('function');
  });
});
