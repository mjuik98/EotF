import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  buildCardPopupPayload,
  buildCodexNavBlock,
  buildCodexQuoteBlock,
  buildCodexRecordBlock,
  buildCodexSetPopupBlock,
  buildEnemyPopupPayload,
  buildItemPopupPayload,
} from '../game/features/codex/presentation/browser/codex_ui_popup_blocks.js';
import {
  buildCardPopupPayload as buildCardPayload,
  buildEnemyPopupPayload as buildEnemyPayload,
  buildItemPopupPayload as buildItemPayload,
} from '../game/features/codex/public.js';

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
    expect(buildCodexQuoteBlock('기록된 문장')).toContain('기록된 문장');
    expect(buildCodexRecordBlock(
      { meta: { codexRecords: { cards: { strike: { used: 4, firstSeen: 'loop-1', upgradedDiscovered: true, upgradeUsed: 2, upgradeFirstSeen: 'loop-2' } } } } },
      'cards',
      'strike',
    )).toContain('강화 사용 횟수');
    expect(buildCodexRecordBlock(
      { meta: { codexRecords: { enemies: { wolf: { encounters: 4, kills: 2, firstSeen: 'loop-1' } } } } },
      'enemies',
      'wolf',
    )).toContain('처치율');
  });

  it('builds enemy, card, and item popup payloads', () => {
    const enemyPayload = buildEnemyPayload(
      { id: 'wolf', name: 'Wolf', isElite: true, icon: 'W', atk: 5, hp: 12 },
      { safeHtml: (value) => value, navHtml: '<nav />', quoteHtml: '<quote />' },
    );
    const cardPayload = buildCardPayload(
      { id: 'judgement', name: 'Judgement', type: 'ATTACK', rarity: 'common', cost: 1, desc: 'Deal 6', icon: 'S' },
      { gs: { meta: { codexRecords: { cards: { judgement: { used: 4, upgradedDiscovered: true, upgradeUsed: 1, upgradeFirstSeen: 'loop-2' } } } } }, data: { cards: { judgement_plus: { id: 'judgement_plus', type: 'ATTACK', name: 'Judgement+', cost: 2, desc: 'Deal 9' } } }, safeHtml: (value) => value },
    );
    const itemPayload = buildItemPayload(
      { id: 'void_compass', name: 'Void Compass', rarity: 'rare', desc: 'Gain power', icon: 'R', set: 'void' },
      {
        gs: { meta: { codex: { enemies: new Set(), cards: new Set(), items: new Set(['void_compass']) }, codexRecords: { items: { void_compass: { found: 2 } } } } },
        data: { itemSets: { void: { name: 'Void Set', items: ['void_compass'], effect: 'Bonus' } }, items: { void_compass: { id: 'void_compass', name: 'Void Compass' } } },
        safeHtml: (value) => value,
      },
    );

    expect(enemyPayload.theme.border).toContain('192,132,252');
    expect(enemyPayload.html).toContain('Wolf');
    expect(cardPayload.html).toContain('Judgement');
    expect(cardPayload.html).toContain('강화 사용 횟수');
    expect(cardPayload.html).toContain('강화 첫 발견');
    expect(cardPayload.html).toContain('해금 조건');
    expect(itemPayload.html).toContain('Void Compass');
    expect(itemPayload.html).toContain('Void Set');
    expect(itemPayload.html).toContain('해금 조건');
  });

  it('keeps codex popup keyword palette aligned with readable comparison surfaces', () => {
    const source = fs.readFileSync(path.join(process.cwd(), 'css/codex_v3.css'), 'utf8');

    expect(source).toContain('.cx-popup-desc .kw-dmg');
    expect(source).toContain('.cx-popup-desc .kw-shield');
    expect(source).toContain('.cx-popup-desc .kw-echo');
    expect(source).toContain('.cx-popup-desc .kw-buff.kw-block');
  });
});
