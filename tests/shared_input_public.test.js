import { describe, expect, it } from 'vitest';

import {
  INPUT_ACTION_IDS,
  getInputActionMeta,
  getInputBindingCode,
  getInputHelpEntries,
  resolveKeyboardActionFromSettings,
} from '../game/shared/input/public.js';

describe('shared_input_public', () => {
  it('re-exports the shared input surface from one coarse entrypoint', () => {
    expect(INPUT_ACTION_IDS.PAUSE).toBe('pause');
    expect(typeof getInputBindingCode).toBe('function');
    expect(typeof getInputActionMeta).toBe('function');
    expect(typeof getInputHelpEntries).toBe('function');
    expect(typeof resolveKeyboardActionFromSettings).toBe('function');
  });
});
