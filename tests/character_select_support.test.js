import { describe, expect, it } from 'vitest';
import {
  buildCharacterRadar,
  CHARACTER_SELECT_CHARS,
} from '../game/features/title/ports/public_character_select_presentation_capabilities.js';

describe('character select support modules', () => {
  it('builds a stable, id-sorted character catalog with resolved relic metadata', () => {
    const ids = CHARACTER_SELECT_CHARS.map((entry) => Number(entry.id));
    const sortedIds = [...ids].sort((a, b) => a - b);

    expect(ids).toEqual(sortedIds);

    const berserker = CHARACTER_SELECT_CHARS.find((entry) => entry.class === 'berserker');
    const guardian = CHARACTER_SELECT_CHARS.find((entry) => entry.class === 'guardian');
    const firstRelic = CHARACTER_SELECT_CHARS[0]?.startRelic;

    expect(berserker?.particle).toBe('rage');
    expect(guardian?.particle).toBe('aegis');
    expect(firstRelic).toEqual(expect.objectContaining({
      icon: expect.any(String),
      name: expect.any(String),
      desc: expect.any(String),
    }));
    expect(['string', 'function']).toContain(typeof firstRelic?.passive);
  });

  it('renders radar svg markup with labels and compare layer support', () => {
    const markup = buildCharacterRadar(
      { HP: 80, ATK: 60, DEF: 55, ECH: 70, RHY: 65, RES: 40 },
      '#7CC8FF',
      { HP: 40, ATK: 40, DEF: 40, ECH: 40, RHY: 40, RES: 40 },
      210,
    );

    expect(markup).toContain('<svg');
    expect(markup).toContain('filter="url(#glow7CC8FF)"');
    expect(markup).toContain('공격');
    expect(markup).toContain('리듬');
    expect(markup.match(/<path /g)?.length || 0).toBeGreaterThanOrEqual(2);
  });
});
