import { describe, expect, it } from 'vitest';

import {
  buildCardPopupPayload,
  buildCodexNavBlock,
  buildCodexSetPopupBlock,
  buildEnemyPopupPayload,
  buildItemPopupPayload,
} from '../game/ui/screens/codex_ui_popup_payloads.js';

describe('codex_ui_popup_payloads', () => {
  it('builds nav and set blocks from codex ownership state', () => {
    const nav = buildCodexNavBlock([{ name: 'A' }, { name: 'B' }, { name: 'C' }], 1);
    const setBlock = buildCodexSetPopupBlock(
      { set: 'void' },
      {
        itemSets: {
          void: { name: 'Void Set', effect: 'Bonus', items: ['a', 'b'], color: '#00ffcc' },
        },
        items: {
          a: { id: 'a', name: 'A' },
          b: { id: 'b', name: 'B' },
        },
      },
      { meta: { codex: { enemies: new Set(), cards: new Set(), items: new Set(['a']) } } },
    );

    expect(nav).toContain('2 / 3');
    expect(setBlock).toContain('Void Set');
    expect(setBlock).toContain('1/2 보유');
  });

  it('builds enemy, card, and item popup payloads', () => {
    const enemyPayload = buildEnemyPopupPayload(
      { id: 'wolf', name: 'Wolf', isElite: true, icon: 'W', atk: 5, hp: 12 },
      { safeHtml: (value) => value, navHtml: '<nav />', quoteHtml: '<quote />' },
    );
    const cardPayload = buildCardPopupPayload(
      { id: 'strike', name: 'Strike', type: 'ATTACK', rarity: 'common', cost: 1, desc: 'Deal 6', icon: 'S' },
      { gs: { meta: { codexRecords: { cards: { strike: { used: 4 } } } } }, data: { cards: {} }, safeHtml: (value) => value },
    );
    const itemPayload = buildItemPopupPayload(
      { id: 'relic', name: 'Relic', rarity: 'rare', desc: 'Gain power', icon: 'R', set: 'void' },
      {
        gs: { meta: { codex: { enemies: new Set(), cards: new Set(), items: new Set(['relic']) }, codexRecords: { items: { relic: { found: 2 } } } } },
        data: { itemSets: { void: { name: 'Void Set', items: ['relic'], effect: 'Bonus' } }, items: { relic: { id: 'relic', name: 'Relic' } } },
        safeHtml: (value) => value,
      },
    );

    expect(enemyPayload.theme.border).toContain('192,132,252');
    expect(enemyPayload.html).toContain('Wolf');
    expect(cardPayload.html).toContain('Strike');
    expect(cardPayload.html).toContain('사용 횟수');
    expect(itemPayload.html).toContain('Relic');
    expect(itemPayload.html).toContain('Void Set');
  });
});
