import { describe, expect, it } from 'vitest';

import {
  buildStatusTooltipCountdownHTML,
  buildStatusTooltipGaugeHTML,
  buildStatusTooltipNextTurnHTML,
  buildStatusTooltipSourceHTML,
  buildStatusTooltipStatsHTML,
} from '../game/ui/combat/status_tooltip_sections.js';

describe('status tooltip sections', () => {
  it('renders next-turn and source sections from extracted helpers', () => {
    const nextTurnHtml = buildStatusTooltipNextTurnHTML({
      nextTurnText: () => 'test-next-turn',
      nextTurnDmg: () => 5,
    }, {}, 1);
    const sourceHtml = buildStatusTooltipSourceHTML({
      type: 'enemy',
      label: '적',
      name: 'Slime',
      color: '#f00',
    });

    expect(nextTurnHtml).toContain('test-next-turn');
    expect(nextTurnHtml).toContain('-5');
    expect(sourceHtml).toContain('적');
    expect(sourceHtml).toContain('Slime');
  });

  it('renders gauge, countdown, and stats sections from extracted helpers', () => {
    const gaugeHtml = buildStatusTooltipGaugeHTML(1, false, '#fff');
    const countdownHtml = buildStatusTooltipCountdownHTML(3);
    const statsHtml = buildStatusTooltipStatsHTML({
      statLabel: 'Power',
      statValue: () => '7',
      statUnit: '',
      statColor: '#fff',
    }, { stacks: 2 }, 2);

    expect(gaugeHtml).toContain('stt-gauge-area');
    expect(gaugeHtml).toContain('urgent-text');
    expect(countdownHtml).toContain('3');
    expect(statsHtml).toContain('Power');
    expect(statsHtml).toContain('7');
  });
});
