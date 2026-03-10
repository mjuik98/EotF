import { describe, expect, it } from 'vitest';
import { buildStatusTooltipHTML } from '../game/ui/combat/status_tooltip_builder.js';
import { getEnemyStatusMeta, getEnemyStatusName } from '../data/status_effects_data.js';

describe('status tooltip builder focus coverage', () => {
  it('renders focus buff tooltip details instead of falling back to a bare description', () => {
    const html = buildStatusTooltipHTML(
      'focus',
      { name: '집중', icon: '🎯', buff: true, desc: '다음 공격이 치명타가 됩니다.' },
      { stacks: 1 },
    );

    expect(html).toContain('집중');
    expect(html).toContain('Focus');
    expect(html).toContain('다음 공격 치명타');
    expect(html).toContain('공격 즉시 해제');
  });

  it('renders critical_turn tooltip metadata for full-turn critical buffs', () => {
    const html = buildStatusTooltipHTML(
      'critical_turn',
      { name: '치명 턴', icon: '💥', buff: true, desc: '이번 턴 모든 공격이 치명타가 됩니다.' },
      { stacks: 1 },
    );

    expect(html).toContain('Critical Turn');
    expect(html).toContain('이번 턴 전체 치명타');
    expect(html).toContain('턴 종료 시 해제');
  });
  it('fills missing enemy tooltip fields from the shared status metadata accessors', () => {
    const meta = getEnemyStatusMeta('draw_block');
    const html = buildStatusTooltipHTML('draw_block', null, 2);

    expect(html).toContain(getEnemyStatusName('draw_block'));
    expect(html).toContain(meta?.icon ?? '');
    expect(html).toContain(meta?.desc ?? '');
  });
});
