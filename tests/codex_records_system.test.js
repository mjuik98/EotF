import { describe, expect, it } from 'vitest';
import {
  ensureCodexRecords,
  ensureCodexState,
  getCardUpgradeId,
  isCardUpgradeVariant,
  registerCardDiscovered,
  registerCardUsed,
  registerEnemyEncounter,
  registerEnemyKill,
  resolveCodexCardId,
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

  it('normalizes upgraded cards into the base card entry', () => {
    const gs = { meta: {} };
    registerCardDiscovered(gs, 'strike_plus', { date: '2026-03-06' });
    registerCardUsed(gs, 'strike_plus', 3, { date: '2026-03-07' });

    const rec = gs.meta.codexRecords.cards.strike;
    expect(gs.meta.codex.cards.has('strike')).toBe(true);
    expect(gs.meta.codex.cards.has('strike_plus')).toBe(false);
    expect(rec.used).toBe(3);
    expect(rec.upgradeUsed).toBe(3);
    expect(rec.upgradedDiscovered).toBe(true);
    expect(rec.upgradeFirstSeen).toBe('2026-03-06');
  });

  it('migrates legacy upgraded card records into the base card record', () => {
    const gs = {
      meta: {
        codex: { cards: ['strike_plus'] },
        codexRecords: {
          cards: {
            strike: { used: 1, firstSeen: '2026-03-07' },
            strike_plus: { used: 2, firstSeen: '2026-03-06' },
          },
        },
      },
    };

    const codex = ensureCodexState(gs);
    const records = ensureCodexRecords(gs);

    expect(codex.cards.has('strike')).toBe(true);
    expect(codex.cards.has('strike_plus')).toBe(false);
    expect(records.cards.strike.used).toBe(3);
    expect(records.cards.strike.upgradeUsed).toBe(2);
    expect(records.cards.strike.upgradedDiscovered).toBe(true);
    expect(records.cards.strike.firstSeen).toBe('2026-03-06');
    expect(records.cards.strike.upgradeFirstSeen).toBe('2026-03-06');
  });

  it('exposes helpers for resolving base and upgrade card ids', () => {
    expect(resolveCodexCardId('strike_plus')).toBe('strike');
    expect(resolveCodexCardId('strike')).toBe('strike');
    expect(getCardUpgradeId('strike')).toBe('strike_plus');
    expect(isCardUpgradeVariant('strike_plus')).toBe(true);
    expect(isCardUpgradeVariant('strike')).toBe(false);
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
