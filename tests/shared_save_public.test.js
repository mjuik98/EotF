import { describe, expect, it } from 'vitest';

import { SaveSystem as LegacySaveSystem } from '../game/systems/save_system.js';
import {
  SaveSystem,
  buildMetaSave,
  buildRunSave,
  createOutboxMetrics,
  summarizeOutboxMetrics,
} from '../game/shared/save/public.js';

describe('shared save public surface', () => {
  it('exposes the canonical save surface through shared/save/public.js', () => {
    expect(SaveSystem).toBe(LegacySaveSystem);
    expect(typeof buildMetaSave).toBe('function');
    expect(typeof buildRunSave).toBe('function');
    expect(typeof createOutboxMetrics).toBe('function');
    expect(typeof summarizeOutboxMetrics).toBe('function');
  });
});
