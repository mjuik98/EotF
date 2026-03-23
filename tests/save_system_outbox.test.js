import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SaveAdapter } from '../game/core/save_adapter.js';
import { bindSaveStorage } from '../game/shared/save/public.js';
import { SaveSystem } from '../game/systems/save_system.js';
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
    SaveSystem.clearOutbox();
    SaveSystem.resetOutboxMetrics();
    SaveSystem._lastSaveError = null;
  });

  afterEach(() => {
    bindSaveStorage(SaveAdapter);
    SaveSystem.clearOutbox();
    SaveSystem.resetOutboxMetrics();
    SaveSystem._lastSaveError = null;
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('queues failed meta saves and flushes when adapter recovers', () => {
    let failWrites = true;
    const saveSpy = vi.spyOn(SaveAdapter, 'save').mockImplementation(() => !failWrites);

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
    expect(saveSpy).toHaveBeenCalledTimes(1);

    failWrites = false;
    const remaining = SaveSystem.flushOutbox();

    expect(remaining).toBe(0);
    expect(SaveSystem.getOutboxSize()).toBe(0);
    expect(saveSpy).toHaveBeenCalledTimes(2);

    const [, payload] = saveSpy.mock.calls[1];
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
    vi.spyOn(SaveAdapter, 'save').mockImplementation(() => {
      callCount += 1;
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

  it('tracks outbox telemetry for failures, retries, and success', () => {
    let callCount = 0;
    vi.spyOn(SaveAdapter, 'save').mockImplementation(() => {
      callCount += 1;
      return callCount >= 3;
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
});
