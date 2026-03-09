import { describe, expect, it } from 'vitest';

import {
  buildEndingPayload,
  buildEndingScreenDOM,
  decorateEndingPayloadForOutcome,
} from '../game/ui/screens/ending_screen_helpers.js';

function createMockElement(tagName = 'div') {
  return {
    tagName: String(tagName).toUpperCase(),
    id: '',
    style: {},
    children: [],
    innerHTML: '',
    textContent: '',
    className: '',
    appendChild(child) {
      this.children.push(child);
      return child;
    },
  };
}

function createMockDocument() {
  return {
    createElement(tagName) {
      return createMockElement(tagName);
    },
  };
}

describe('ending_screen_helpers', () => {
  it('builds payload with fallback region and deck metadata', () => {
    const payload = buildEndingPayload({
      meta: {
        storyPieces: [1, 2],
        inscriptions: { flow: 2 },
        runCount: 4,
      },
      player: {
        kills: 6,
        deck: ['spark'],
      },
      stats: {
        maxChain: 5,
        damageDealt: 234,
        cardsPlayed: 9,
        clearTimeMs: 90500,
        regionClearTimes: [15000],
      },
      currentRegion: 0,
    }, {
      storyFragments: [1, 2, 3],
      cards: {
        spark: { name: 'Spark', rarity: 'rare', icon: '⚡' },
      },
      inscriptions: {
        flow: { name: 'Flow', icon: '🜁' },
      },
    });

    expect(payload.score).toBe(45);
    expect(payload.rank.glyph).toBe('C');
    expect(payload.regions[0]).toMatchObject({ name: '지역 1', icon: '🌲', time: '00:15', boss: true });
    expect(payload.deck[0]).toMatchObject({ id: 'spark', title: 'Spark', cls: 'r' });
    expect(payload.inscriptions[0]).toMatchObject({ id: 'flow', level: 2, icon: '🜁', name: 'Flow' });
    expect(payload.chips).toContain('4회차');
  });

  it('decorates abandon outcome and removes codex button from markup', () => {
    const payload = decorateEndingPayloadForOutcome({
      chips: ['노 데스'],
      title: 'base',
      subtitle: 'base',
      eyebrow: 'base',
      quote: 'base',
      stats: [],
    }, 'abandon');
    const root = buildEndingScreenDOM(createMockDocument(), {
      ...payload,
      stats: [],
    });

    expect(payload.title).toBe('멈춘 메아리');
    expect(payload.chips).toContain('런 포기');
    expect(root.innerHTML).not.toContain('btnCodex');
  });
});
