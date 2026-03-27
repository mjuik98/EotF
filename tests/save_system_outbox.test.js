import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SaveAdapter } from '../game/core/save_adapter.js';
import {
  SaveSystem,
  bindSaveNotifications,
  bindSaveStorage,
} from '../game/shared/save/public.js';
import { presentSaveStatus } from '../game/platform/browser/notifications/save_status_presenter.js';
import { silenceConsole } from './helpers/silence_console.js';

function createRunState() {
  return {
    player: {
      hp: 20,
      maxHp: 30,
      deck: ['strike'],
      gold: 10,
      buffs: { regen: 2 },
      hand: ['temp'],
      upgradedCards: new Set(['strike+']),
    },
    combat: { active: false },
    currentRegion: 1,
    currentFloor: 3,
    mapNodes: null,
    visitedNodes: new Set(['1-1']),
    currentNode: '1-1',
    stats: { kills: 1 },
    worldMemory: { shrineSeen: true },
  };
}

describe('SaveSystem outbox', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
    silenceConsole(['warn']);
    bindSaveStorage(SaveAdapter);
    bindSaveNotifications({ saveStatus: presentSaveStatus });
    SaveSystem.clearOutbox();
    SaveSystem.resetOutboxMetrics();
    SaveSystem._lastSaveError = null;
  });

  afterEach(() => {
    bindSaveStorage(SaveAdapter);
    bindSaveNotifications(null);
    SaveSystem.clearOutbox();
    SaveSystem.resetOutboxMetrics();
    SaveSystem._lastSaveError = null;
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('queues failed meta saves and flushes when adapter recovers', () => {
    let failWrites = true;
    const metaWrites = [];
    vi.spyOn(SaveAdapter, 'save').mockImplementation((key, payload) => {
      if (key === SaveSystem.META_KEY) {
        metaWrites.push(payload);
        return !failWrites;
      }
      return true;
    });

    const gs = {
      meta: {
        codex: {
          enemies: new Set(['wolf']),
          cards: new Set(['strike']),
          items: new Set(['potion']),
        },
      },
    };

    SaveSystem.saveMeta({ gs });
    expect(SaveSystem.getOutboxSize()).toBe(1);
    expect(metaWrites).toHaveLength(1);

    failWrites = false;
    const remaining = SaveSystem.flushOutbox();

    expect(remaining).toBe(0);
    expect(SaveSystem.getOutboxSize()).toBe(0);
    expect(metaWrites).toHaveLength(2);

    const payload = metaWrites[1];
    expect(payload.codex.enemies).toEqual(['wolf']);
    expect(payload.codex.cards).toEqual(['strike']);
    expect(payload.codex.items).toEqual(['potion']);
  });

  it('coalesces queued entries by key and keeps the latest payload', () => {
    let failWrites = true;
    const saveSpy = vi.spyOn(SaveAdapter, 'save').mockImplementation(() => !failWrites);

    SaveSystem._persistWithOutbox(SaveSystem.SAVE_KEY, { seq: 1 });
    SaveSystem._persistWithOutbox(SaveSystem.SAVE_KEY, { seq: 2 });

    expect(SaveSystem.getOutboxSize()).toBe(1);

    failWrites = false;
    SaveSystem.flushOutbox();

    expect(SaveSystem.getOutboxSize()).toBe(0);
    const [, payload] = saveSpy.mock.calls[saveSpy.mock.calls.length - 1];
    expect(payload.seq).toBe(2);
  });

  it('retries queued writes with exponential backoff', () => {
    let callCount = 0;
    vi.spyOn(SaveAdapter, 'save').mockImplementation((key) => {
      if (key === SaveSystem.META_KEY) {
        callCount += 1;
      }
      return callCount >= 4;
    });

    SaveSystem._persistWithOutbox(SaveSystem.META_KEY, { id: 'meta' });
    expect(SaveSystem.getOutboxSize()).toBe(1);
    expect(callCount).toBe(1);

    vi.advanceTimersByTime(1000);
    expect(callCount).toBe(2);

    vi.advanceTimersByTime(1000);
    expect(callCount).toBe(3);

    vi.advanceTimersByTime(1999);
    expect(callCount).toBe(3);

    vi.advanceTimersByTime(1);
    expect(callCount).toBe(4);
    expect(SaveSystem.getOutboxSize()).toBe(0);
  });

  it('preserves run save snapshot while queued', () => {
    let failWrites = true;
    const saveSpy = vi.spyOn(SaveAdapter, 'save').mockImplementation(() => !failWrites);

    const gs = createRunState();
    SaveSystem.saveRun({ gs, isGameStarted: () => true });
    expect(SaveSystem.getOutboxSize()).toBe(1);

    gs.player.hp = 1;
    gs.stats.kills = 99;
    gs.worldMemory.shrineSeen = false;

    failWrites = false;
    SaveSystem.flushOutbox();

    const [, payload] = saveSpy.mock.calls[saveSpy.mock.calls.length - 1];
    expect(payload.player.hp).toBe(20);
    expect(payload.stats.kills).toBe(1);
    expect(payload.worldMemory.shrineSeen).toBe(true);
  });

  it('returns queued status when run save falls back to the outbox', () => {
    vi.spyOn(SaveAdapter, 'save').mockReturnValue(false);
    const gs = createRunState();

    const result = SaveSystem.saveRun({ gs, isGameStarted: () => true });

    expect(result).toMatchObject({
      status: 'queued',
      persisted: false,
      queueDepth: 1,
    });
    expect(SaveSystem.getOutboxSize()).toBe(1);
  });

  it('persists queued outbox entries across a memory reset and clears the persisted queue after flush', () => {
    const storage = new Map();
    let failRunSave = true;

    vi.spyOn(SaveAdapter, 'save').mockImplementation((key, data) => {
      if (key === SaveSystem.SAVE_KEY && failRunSave) return false;
      storage.set(key, JSON.parse(JSON.stringify(data)));
      return true;
    });
    vi.spyOn(SaveAdapter, 'load').mockImplementation((key) => {
      const data = storage.get(key);
      return data ? JSON.parse(JSON.stringify(data)) : null;
    });
    vi.spyOn(SaveAdapter, 'remove').mockImplementation((key) => {
      storage.delete(key);
    });

    const gs = createRunState();
    const queued = SaveSystem.saveRun({ gs, isGameStarted: () => true });

    expect(queued).toMatchObject({
      status: 'queued',
      persisted: false,
      queueDepth: 1,
    });
    expect(storage.get(SaveSystem.OUTBOX_KEY)).toEqual([
      expect.objectContaining({
        key: SaveSystem.SAVE_KEY,
        attempts: 0,
      }),
    ]);

    SaveSystem._outbox = [];
    SaveSystem._outboxLoaded = false;

    expect(SaveSystem.getOutboxSize()).toBe(1);
    expect(SaveSystem.hasSave()).toBe(true);
    expect(SaveSystem.readRunPreview()).toEqual(expect.objectContaining({
      player: expect.objectContaining({ hp: 20 }),
      currentRegion: 1,
      currentFloor: 3,
      saveState: 'queued',
    }));

    failRunSave = false;
    expect(SaveSystem.flushOutbox()).toBe(0);
    expect(SaveSystem.getOutboxSize()).toBe(0);
    expect(storage.has(SaveSystem.OUTBOX_KEY)).toBe(false);
    expect(storage.get(SaveSystem.SAVE_KEY)).toEqual(expect.objectContaining({
      player: expect.objectContaining({ hp: 20 }),
    }));
  });

  it('ignores and prunes stale queued run saves when no direct save exists', () => {
    const removeSpy = vi.spyOn(SaveAdapter, 'remove').mockImplementation(() => {});
    vi.spyOn(SaveAdapter, 'save').mockReturnValue(true);
    vi.spyOn(SaveAdapter, 'load').mockImplementation((key) => {
      if (key !== SaveSystem.OUTBOX_KEY) return null;
      return [{
        key: SaveSystem.SAVE_KEY,
        data: {
          version: 2,
          player: {
            hp: 20,
            maxHp: 30,
            deck: ['strike'],
            gold: 10,
            buffs: {},
            upgradedCards: [],
          },
          currentRegion: 2,
          currentFloor: 5,
          regionFloors: { 2: 5 },
          regionRoute: { 2: ['elite'] },
          mapNodes: [{ id: '2-5' }],
          visitedNodes: ['2-4', '2-5'],
          currentNode: '2-5',
          stats: { kills: 3 },
          worldMemory: { shrineSeen: true },
        },
        attempts: 0,
        createdAt: Date.now() - (8 * 24 * 60 * 60 * 1000),
        nextAttemptAt: Date.now() - 1000,
      }];
    });

    SaveSystem._outbox = [];
    SaveSystem._outboxLoaded = false;

    expect(SaveSystem.hasSave()).toBe(false);
    expect(SaveSystem.readRunPreview()).toBe(null);
    expect(SaveSystem.getOutboxSize()).toBe(0);
    expect(removeSpy).toHaveBeenCalledWith(SaveSystem.OUTBOX_KEY);
  });

  it('returns saved status and clears the last save error when the run save persists', () => {
    vi.spyOn(SaveAdapter, 'save').mockReturnValue(true);
    SaveSystem._lastSaveError = new Error('stale');
    const gs = createRunState();

    const result = SaveSystem.saveRun({ gs, isGameStarted: () => true });

    expect(result).toMatchObject({
      status: 'saved',
      persisted: true,
      queueDepth: 0,
    });
    expect(SaveSystem._lastSaveError).toBe(null);
  });

  it('reads a run preview without mutating the live gs', () => {
    vi.spyOn(SaveAdapter, 'load').mockImplementation((key) => {
      if (key === SaveSystem.META_KEY) {
        return {
          version: 2,
          runConfig: { ascension: 4, endless: true },
        };
      }
      return {
        version: 1,
        player: {
          hp: 20,
          maxHp: 30,
          deck: ['strike'],
          gold: 10,
          buffs: { regen: 2 },
          upgradedCards: ['strike+'],
        },
        currentRegion: 2,
        currentFloor: 5,
        regionFloors: { 2: 5 },
        regionRoute: { 2: ['elite'] },
        mapNodes: [{ id: '2-5' }],
        visitedNodes: ['2-4', '2-5'],
        currentNode: '2-5',
        stats: { kills: 3 },
        worldMemory: { shrineSeen: true },
      };
    });
    const gs = {
      player: {
        hp: 1,
        maxHp: 1,
        deck: [],
        gold: 0,
        buffs: {},
        upgradedCards: new Set(),
      },
      currentRegion: 0,
      currentFloor: 1,
    };

    const preview = SaveSystem.readRunPreview();

    expect(preview.currentRegion).toBe(2);
    expect(preview.currentFloor).toBe(5);
    expect(preview.player.hp).toBe(20);
    expect(preview.meta.runConfig.ascension).toBe(4);
    expect(preview.saveState).toBe('saved');
    expect(gs.player.hp).toBe(1);
    expect(gs.currentRegion).toBe(0);
    expect(gs.currentFloor).toBe(1);
  });

  it('tracks outbox telemetry for failures, retries, and success', () => {
    let callCount = 0;
    vi.spyOn(SaveAdapter, 'save').mockImplementation((key) => {
      if (key === SaveSystem.SAVE_KEY) {
        callCount += 1;
        return callCount >= 3;
      }
      return true;
    });

    SaveSystem._persistWithOutbox(SaveSystem.SAVE_KEY, { stage: 1 });
    expect(SaveSystem.getOutboxSize()).toBe(1);

    vi.advanceTimersByTime(1000);
    expect(SaveSystem.getOutboxSize()).toBe(1);

    vi.advanceTimersByTime(1000);
    expect(SaveSystem.getOutboxSize()).toBe(0);

    const metrics = SaveSystem.getOutboxMetrics();
    expect(metrics.initialFailures).toBe(1);
    expect(metrics.queuedWrites).toBe(1);
    expect(metrics.retryFailures).toBe(1);
    expect(metrics.retrySuccesses).toBe(1);
    expect(metrics.queueDepth).toBe(0);
    expect(metrics.lastFailureAt).toBeGreaterThan(0);
    expect(metrics.lastSuccessAt).toBeGreaterThan(0);
  });

  it('treats invalid stored run payloads as absent saves', () => {
    vi.spyOn(SaveAdapter, 'load').mockReturnValue({
      version: 2,
      player: {
        hp: 10,
      },
    });

    expect(SaveSystem.hasSave()).toBe(false);
  });

  it('discards unsupported future-version run saves and prunes queued copies', () => {
    const storage = new Map([
      [SaveSystem.SAVE_KEY, {
        version: 999,
        player: {
          hp: 20,
          maxHp: 30,
          deck: ['strike'],
          gold: 10,
          buffs: {},
          upgradedCards: [],
        },
        currentRegion: 2,
        currentFloor: 5,
      }],
      [SaveSystem.OUTBOX_KEY, [{
        key: SaveSystem.SAVE_KEY,
        data: {
          version: 999,
          player: {
            hp: 22,
            maxHp: 30,
            deck: ['strike'],
            gold: 11,
            buffs: {},
            upgradedCards: [],
          },
          currentRegion: 3,
          currentFloor: 6,
        },
        attempts: 0,
        createdAt: Date.now(),
        nextAttemptAt: Date.now(),
      }]],
    ]);
    vi.spyOn(SaveAdapter, 'load').mockImplementation((key) => structuredClone(storage.get(key)) ?? null);
    const removeSpy = vi.spyOn(SaveAdapter, 'remove').mockImplementation((key) => {
      storage.delete(key);
    });
    vi.spyOn(SaveAdapter, 'save').mockImplementation((key, data) => {
      storage.set(key, structuredClone(data));
      return true;
    });

    SaveSystem._outbox = [];
    SaveSystem._outboxLoaded = false;

    expect(SaveSystem.hasSave()).toBe(false);
    expect(SaveSystem.readRunPreview()).toBe(null);
    expect(SaveSystem.getOutboxSize()).toBe(0);
    expect(storage.has(SaveSystem.SAVE_KEY)).toBe(false);
    expect(storage.has(SaveSystem.OUTBOX_KEY)).toBe(false);
    expect(removeSpy).toHaveBeenCalledWith(SaveSystem.SAVE_KEY);
    expect(removeSpy).toHaveBeenCalledWith(SaveSystem.OUTBOX_KEY);
  });

  it('hydrates migrated meta saves and ensures run config', () => {
    vi.spyOn(SaveAdapter, 'load').mockReturnValue({
      version: 1,
      codex: {
        enemies: ['wolf'],
        cards: ['strike'],
        items: ['potion'],
      },
    });
    const ensureMeta = vi.fn();
    const gs = {
      meta: {
        codex: {
          enemies: new Set(),
          cards: new Set(),
          items: new Set(),
        },
      },
    };

    SaveSystem.loadMeta({
      gs,
      runRules: { ensureMeta },
    });

    expect(Array.from(gs.meta.codex.enemies)).toEqual(['wolf']);
    expect(Array.from(gs.meta.codex.cards)).toEqual(['strike']);
    expect(Array.from(gs.meta.codex.items)).toEqual(['potion']);
    expect(gs.meta.version).toBe(2);
    expect(gs.meta.runConfig).toEqual({});
    expect(ensureMeta).toHaveBeenCalledWith(gs.meta);
  });

  it('hydrates valid run saves and clears queued run entries on explicit clear', () => {
    vi.spyOn(SaveAdapter, 'load').mockReturnValue({
      version: 1,
      player: {
        hp: 20,
        maxHp: 30,
        deck: ['strike'],
        gold: 10,
        buffs: { regen: 2 },
        upgradedCards: ['strike+'],
      },
      currentRegion: 2,
      currentFloor: 5,
      regionFloors: { 2: 5 },
      regionRoute: { 2: ['elite'] },
      mapNodes: [{ id: '2-5' }],
      visitedNodes: ['2-4', '2-5'],
      currentNode: '2-5',
      stats: { kills: 3 },
      worldMemory: { shrineSeen: true },
    });
    const removeSpy = vi.spyOn(SaveAdapter, 'remove').mockImplementation(() => {});
    const gs = {
      player: {
        hp: 1,
        maxHp: 1,
        deck: [],
        gold: 0,
        buffs: {},
        upgradedCards: new Set(),
      },
      currentRegion: 0,
      currentFloor: 1,
      regionFloors: {},
      regionRoute: {},
      mapNodes: null,
      visitedNodes: new Set(),
      currentNode: null,
      stats: {},
      worldMemory: {},
    };

    SaveSystem._outbox = [
      { key: SaveSystem.SAVE_KEY, data: { stale: true } },
      { key: SaveSystem.META_KEY, data: { keep: true } },
    ];

    expect(SaveSystem.loadRun({ gs })).toBe(true);
    expect(gs.player.hp).toBe(20);
    expect(gs.player.maxHp).toBe(30);
    expect(Array.from(gs.player.upgradedCards)).toEqual(['strike+']);
    expect(gs.currentRegion).toBe(2);
    expect(gs.currentFloor).toBe(5);
    expect(Array.from(gs.visitedNodes)).toEqual(['2-4', '2-5']);
    expect(gs.currentNode).toBe('2-5');
    expect(gs.stats).toEqual({ kills: 3 });
    expect(gs.worldMemory).toEqual({ shrineSeen: true });

    SaveSystem.clearSave();

    expect(removeSpy).toHaveBeenCalledWith(SaveSystem.SAVE_KEY);
    expect(SaveSystem._outbox).toEqual([{ key: SaveSystem.META_KEY, data: { keep: true } }]);
  });

  it('renders and expires the save badge with injected document state', () => {
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

    SaveSystem.showSaveBadge({ doc });

    expect(doc.createElement).toHaveBeenCalledWith('div');
    expect(doc.body.appendChild).toHaveBeenCalledTimes(1);
    expect(appended[0].textContent).toBe('Saved');

    vi.advanceTimersByTime(1800);

    expect(appended[0].remove).toHaveBeenCalledTimes(1);
  });

  it('reuses a single active save notice instead of stacking duplicate toasts', () => {
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

    SaveSystem.showSaveStatus({ status: 'queued', persisted: false, queueDepth: 1 }, { doc });
    SaveSystem.showSaveStatus({ status: 'error', persisted: false, queueDepth: 1 }, { doc });

    expect(doc.body.appendChild).toHaveBeenCalledTimes(1);
    expect(appended).toHaveLength(1);
    expect(appended[0].textContent).toBe('저장에 실패해 현재 런을 유지합니다. 대기 1건');

    vi.advanceTimersByTime(4000);

    expect(appended[0].remove).toHaveBeenCalledTimes(1);
    expect(removed).toEqual(['저장에 실패해 현재 런을 유지합니다. 대기 1건']);
  });

  it('delegates save status presentation to an injected presenter when provided', () => {
    const presentSaveStatus = vi.fn();
    vi.spyOn(SaveSystem, 'getOutboxMetrics').mockReturnValue({
      directWrites: 0,
      initialFailures: 1,
      queuedWrites: 1,
      coalescedWrites: 0,
      retryFailures: 0,
      retrySuccesses: 0,
      lastSuccessAt: 0,
      lastFailureAt: 0,
      queueDepth: 3,
      nextRetryAt: new Date('2026-01-01T00:00:05Z').getTime(),
    });

    SaveSystem.showSaveStatus(
      { status: 'queued', persisted: false, queueDepth: 1 },
      { presentSaveStatus, doc: { body: null } },
    );
    SaveSystem.showSaveBadge({
      presentSaveStatus,
      doc: { body: null },
    });

    expect(presentSaveStatus).toHaveBeenNthCalledWith(1, {
      status: 'queued',
      persisted: false,
      queueDepth: 3,
      nextRetryAt: new Date('2026-01-01T00:00:05Z').getTime(),
    }, expect.objectContaining({
      presentSaveStatus,
    }));
    expect(presentSaveStatus).toHaveBeenNthCalledWith(2, {
      status: 'saved',
      persisted: true,
      queueDepth: 0,
    }, expect.objectContaining({
      presentSaveStatus,
    }));
  });
});
