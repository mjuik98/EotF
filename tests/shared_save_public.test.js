import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

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
import * as SaveMigrations from '../game/shared/save/save_migrations.js';
import * as SaveOutboxMetrics from '../game/shared/save/save_outbox_metrics.js';
import * as SaveRepository from '../game/shared/save/save_repository.js';

describe('shared save public surface', () => {
  it('exposes the canonical save surface through shared/save/public.js', () => {
    expect(SaveSystem).toBeTypeOf('object');
    expect(typeof buildMetaSave).toBe('function');
    expect(typeof buildRunSave).toBe('function');
    expect(typeof createOutboxMetrics).toBe('function');
    expect(typeof summarizeOutboxMetrics).toBe('function');
  });

  it('keeps canonical save helper modules aligned with the shared public surface', () => {
    expect(SaveMigrations.META_SAVE_VERSION).toBe(META_SAVE_VERSION);
    expect(SaveMigrations.RUN_SAVE_VERSION).toBe(RUN_SAVE_VERSION);
    expect(SaveMigrations.migrateMetaSave).toBe(migrateMetaSave);
    expect(SaveMigrations.migrateRunSave).toBe(migrateRunSave);
    expect(SaveRepository.buildMetaSave).toBe(buildMetaSave);
    expect(SaveRepository.buildRunSave).toBe(buildRunSave);
    expect(SaveOutboxMetrics.createOutboxMetrics).toBe(createOutboxMetrics);
    expect(SaveOutboxMetrics.summarizeOutboxMetrics).toBe(summarizeOutboxMetrics);
  });

  it('removes the legacy save wrapper files once callers use shared ownership directly', () => {
    const removedFiles = [
      'game/systems/save_system.js',
      'game/systems/save_migrations.js',
      'game/systems/save/save_outbox_metrics.js',
      'game/systems/save/save_outbox_queue.js',
      'game/systems/save/save_repository.js',
    ];

    removedFiles.forEach((file) => {
      expect(fs.existsSync(path.join(process.cwd(), file))).toBe(false);
    });
  });
});
