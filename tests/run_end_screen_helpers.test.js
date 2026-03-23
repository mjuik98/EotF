import { describe, expect, it, vi } from 'vitest';
import {
  buildRunEndOverlayMarkup,
  buildRunEndRowsMarkup,
  countUp,
  getRunEndRowAnimationDuration,
  globalProgress,
  normalizeRunEndSummary,
} from '../game/features/title/ports/public_run_end_presentation_capabilities.js';

describe('run end screen helpers', () => {
  it('normalizes summary values and derives progress labels', () => {
    const normalized = normalizeRunEndSummary({
      outcome: 'victory',
      rewards: [
        { label: 'Base', xp: 10 },
        { label: 'Bonus', xp: 15 },
      ],
      before: { level: 2, progress: 0.4 },
      after: { level: 3, totalXp: 220, progress: 0.1 },
    }, {
      title: 'Berserker',
      accent: '#ff5555',
    });

    expect(normalized.outcomeTitle).toBe('승리');
    expect(normalized.summaryTitle).toBe('Berserker - 전투 요약');
    expect(normalized.totalGain).toBe(25);
    expect(normalized.fromPct).toBe(14);
    expect(normalized.toPct).toBe(21);
    expect(normalized.barLeft).toBe('Lv.3 - 220 XP');
    expect(normalized.rowMarkup).toContain('Base');
    expect(normalized.rowMarkup).toContain('classRunEndRowVal-1');
  });

  it('builds the overlay shell and row markup with defaults', () => {
    const overlayMarkup = buildRunEndOverlayMarkup();
    const rowMarkup = buildRunEndRowsMarkup([{ xp: 5 }, { label: 'Elite', xp: 12 }]);

    expect(overlayMarkup).toContain('class-run-end-panel');
    expect(overlayMarkup).toContain('계속하기');
    expect(rowMarkup).toContain('XP');
    expect(rowMarkup).toContain('Elite');
  });

  it('uses bounded durations for row count-ups', () => {
    expect(getRunEndRowAnimationDuration(1)).toBe(220);
    expect(getRunEndRowAnimationDuration(20)).toBe(440);
    expect(getRunEndRowAnimationDuration(100)).toBe(700);
  });

  it('clamps global progress into a stable 0..1 range', () => {
    expect(globalProgress(null)).toBe(0);
    expect(globalProgress({ level: 1, progress: 0.5 })).toBe(0.05);
    expect(globalProgress({ level: 99, progress: 1.5 })).toBe(1);
  });

  it('animates count-up values through the injected RAF scheduler', () => {
    const rafQueue = [];
    const raf = vi.fn((handler) => {
      rafQueue.push(handler);
      return rafQueue.length;
    });
    const steps = [];
    const done = vi.fn();

    countUp({
      from: 0,
      to: 10,
      durationMs: 32,
      raf,
      onStep: (value, ratio) => {
        steps.push({ value, ratio });
      },
      onDone: done,
    });

    while (rafQueue.length) {
      const next = rafQueue.shift();
      next();
    }

    expect(steps.at(-1)?.value).toBe(10);
    expect(steps.at(-1)?.ratio).toBe(1);
    expect(done).toHaveBeenCalledTimes(1);
  });
});
