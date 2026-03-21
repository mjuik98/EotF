import { describe, expect, it } from 'vitest';

import {
  formatEchoSkillButtonText,
  getCombatDrawButtonCopy,
} from '../game/ui/hud/hud_render_helpers.js';

describe('hud_render_helpers', () => {
  it('formats localized echo skill text by threshold', () => {
    expect(formatEchoSkillButtonText(10)).toBe('⚡ 잔향 스킬 ✦(10/30)');
    expect(formatEchoSkillButtonText(45)).toBe('⚡ 잔향 스킬 ✦(45/60)');
    expect(formatEchoSkillButtonText(130)).toBe('⚡ 잔향 스킬 ✦(130/100)');
  });

  it('returns localized draw button copy for each draw state', () => {
    expect(getCombatDrawButtonCopy({
      inCombat: false,
      playerTurn: false,
      handFull: false,
      hasEnergy: false,
      maxHand: 8,
    })).toEqual({
      label: '🃏 카드 드로우 (1 에너지)',
      title: '전투 중에만 사용할 수 있습니다.',
    });

    expect(getCombatDrawButtonCopy({
      inCombat: true,
      playerTurn: false,
      handFull: false,
      hasEnergy: true,
      maxHand: 8,
    })).toEqual({
      label: '적 턴',
      title: '적 턴에는 카드를 뽑을 수 없습니다.',
    });

    expect(getCombatDrawButtonCopy({
      inCombat: true,
      playerTurn: true,
      handFull: true,
      hasEnergy: true,
      maxHand: 8,
    })).toEqual({
      label: '손패 가득 참',
      title: '손패가 가득 찼습니다 (최대 8장)',
    });

    expect(getCombatDrawButtonCopy({
      inCombat: true,
      playerTurn: true,
      handFull: false,
      hasEnergy: false,
      maxHand: 8,
    })).toEqual({
      label: '에너지 부족',
      title: '카드를 드로우하려면 에너지 1이 필요합니다.',
    });
  });
});
