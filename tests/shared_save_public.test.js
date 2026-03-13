import { describe, expect, it } from 'vitest';

import { SaveSystem as LegacySaveSystem } from '../game/systems/save_system.js';
import {
  META_SAVE_VERSION,
  RUN_SAVE_VERSION,
  SaveSystem,
  buildMetaSave,
  buildRunSave,
  createOutboxMetrics,
  migrateMetaSave,
  migrateRunSave,
  summarizeOutboxMetrics,
} from '../game/shared/save/public.js';
import * as LegacySaveMigrations from '../game/systems/save_migrations.js';
import * as LegacySaveOutboxMetrics from '../game/systems/save/save_outbox_metrics.js';
import * as LegacySaveRepository from '../game/systems/save/save_repository.js';

describe('shared save public surface', () => {
  it('exposes the canonical save surface through shared/save/public.js', () => {
    expect(SaveSystem).toBe(LegacySaveSystem);
    expect(typeof buildMetaSave).toBe('function');
    expect(typeof buildRunSave).toBe('function');
    expect(typeof createOutboxMetrics).toBe('function');
    expect(typeof summarizeOutboxMetrics).toBe('function');
  });

  it('keeps legacy save helpers as compat wrappers over shared ownership', () => {
    expect(LegacySaveMigrations.META_SAVE_VERSION).toBe(META_SAVE_VERSION);
    expect(LegacySaveMigrations.RUN_SAVE_VERSION).toBe(RUN_SAVE_VERSION);
    expect(LegacySaveMigrations.migrateMetaSave).toBe(migrateMetaSave);
    expect(LegacySaveMigrations.migrateRunSave).toBe(migrateRunSave);
    expect(LegacySaveRepository.buildMetaSave).toBe(buildMetaSave);
    expect(LegacySaveRepository.buildRunSave).toBe(buildRunSave);
    expect(LegacySaveOutboxMetrics.createOutboxMetrics).toBe(createOutboxMetrics);
    expect(LegacySaveOutboxMetrics.summarizeOutboxMetrics).toBe(summarizeOutboxMetrics);
  });
});
