import { describe, expect, it } from 'vitest';

import {
  getInputActionMeta,
  getInputHelpEntries,
} from '../game/shared/input/public.js';

describe('input help entries', () => {
  it('exposes shared input metadata for help and settings surfaces', () => {
    expect(getInputActionMeta('pause')).toEqual(expect.objectContaining({
      category: 'global',
      description: '일시정지 (창 닫기)',
    }));
    expect(getInputActionMeta('targetCycle')).toEqual(expect.objectContaining({
      category: 'combat',
      description: '다음 적 대상 전환',
    }));
  });

  it('builds ordered help entries with resolved labels from canonical action ids', () => {
    const entries = getInputHelpEntries({
      pause: 'KeyP',
      deckView: 'KeyK',
      help: 'Slash',
      echoSkill: 'KeyR',
      drawCard: 'KeyG',
      endTurn: 'Enter',
      nextTarget: 'Tab',
    });

    expect(entries.map((entry) => entry.keyLabel)).toEqual([
      'P',
      'K',
      '?',
      'R',
      'G',
      'Enter',
      '1 - 0',
      'Tab',
    ]);
    expect(entries.map((entry) => entry.description)).toEqual([
      '일시정지 (창 닫기)',
      '덱 보기',
      '도움말 열기',
      '잔향 스킬 발동 (전투 중)',
      '카드 드로우 (전투 중)',
      '턴 종료 (전투 중)',
      '손패 카드 빠른 사용',
      '다음 적 대상 전환',
    ]);
  });
});
