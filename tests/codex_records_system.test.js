import { describe, expect, it } from 'vitest';
import {
  ensureCodexRecords,
  ensureCodexState,
  registerCardDiscovered,
  registerCardUsed,
  registerEnemyEncounter,
  registerEnemyKill,
  registerItemFound,
} from '../game/systems/codex_records_system.js';

describe('codex_records_system', () => {
  it('normalizes codex and codexRecords containers', () => {
    const gs = { meta: { codex: { enemies: ['wolf'], cards: [], items: null }, codexRecords: null } };
    const codex = ensureCodexState(gs);
    const records = ensureCodexRecords(gs);

    expect(codex.enemies instanceof Set).toBe(true);
    expect(codex.enemies.has('wolf')).toBe(true);
    expect(codex.cards instanceof Set).toBe(true);
    expect(codex.items instanceof Set).toBe(true);

    expect(records).toEqual({ enemies: {}, cards: {}, items: {} });
  });

  it('tracks enemy encounter and kill counters with firstSeen', () => {
    const gs = { meta: {} };
    registerEnemyEncounter(gs, 'wolf', 2, { date: '2026-03-06' });
    registerEnemyKill(gs, 'wolf', 1, { date: '2026-03-07' });

    const rec = gs.meta.codexRecords.enemies.wolf;
    expect(rec.encounters).toBe(2);
    expect(rec.kills).toBe(1);
    expect(rec.firstSeen).toBe('2026-03-06');
    expect(gs.meta.codex.enemies.has('wolf')).toBe(true);
  });

  it('keeps enemy encounters at least as large as kills', () => {
    const gs = { meta: {} };
    registerEnemyKill(gs, 'boar', 3, { date: '2026-03-06' });

    const rec = gs.meta.codexRecords.enemies.boar;
    expect(rec.kills).toBe(3);
    expect(rec.encounters).toBe(3);
  });

  it('tracks card discovery and usage', () => {
    const gs = { meta: {} };
    registerCardDiscovered(gs, 'strike', { date: '2026-03-06' });
    registerCardUsed(gs, 'strike', 2, { date: '2026-03-07' });

    const rec = gs.meta.codexRecords.cards.strike;
    expect(rec.used).toBe(2);
    expect(rec.firstSeen).toBe('2026-03-06');
    expect(gs.meta.codex.cards.has('strike')).toBe(true);
  });

  it('tracks item acquisition count', () => {
    const gs = { meta: {} };
    registerItemFound(gs, 'void_compass', 2, { date: '2026-03-06' });
    registerItemFound(gs, 'void_compass', 1, { date: '2026-03-07' });

    const rec = gs.meta.codexRecords.items.void_compass;
    expect(rec.found).toBe(3);
    expect(rec.firstSeen).toBe('2026-03-06');
    expect(gs.meta.codex.items.has('void_compass')).toBe(true);
  });
});
