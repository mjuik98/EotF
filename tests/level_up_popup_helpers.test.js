import { describe, expect, it, vi } from 'vitest';
import {
  buildLevelUpParticles,
  buildLevelUpPopupMarkup,
  drawStar4,
  normalizeLevelUpPayload,
  parseAccentRgb,
  resizeFullscreenCanvas,
} from '../game/features/title/ports/public_presentation_capabilities.js';

describe('level up popup helpers', () => {
  it('normalizes popup payload with defaults', () => {
    expect(normalizeLevelUpPayload({
      classTitle: '성기사',
      newLevel: 4,
      bonusText: '성역 해금.',
      accent: '#ffd700',
    })).toEqual({
      accent: '#ffd700',
      bonusText: '성역 해금.',
      eyebrow: '성기사 - 레벨 상승',
      levelText: 'Lv.4',
    });

    expect(normalizeLevelUpPayload({})).toEqual({
      accent: '#8b6dff',
      bonusText: '클래스 숙련도 보상이 해금되었습니다.',
      eyebrow: '클래스 - 레벨 상승',
      levelText: 'Lv.1',
    });
  });

  it('builds popup markup and parses accent rgb channels', () => {
    const markup = buildLevelUpPopupMarkup();

    expect(markup).toContain('classLvupParticleCanvas');
    expect(markup).toContain('클릭하거나 ESC로 닫기');
    expect(parseAccentRgb('#7CC8FF')).toEqual([124, 200, 255]);
  });

  it('seeds centered particle bursts with mixed star/dot particles', () => {
    const particles = buildLevelUpParticles('#ff5555', 1200, 800, 10);

    expect(particles).toHaveLength(10);
    expect(particles[0].x).toBe(600);
    expect(particles[0].y).toBe(400);
    expect(particles.some((particle) => particle.star)).toBe(true);
    expect(particles.some((particle) => !particle.star)).toBe(true);
  });

  it('resizes fullscreen canvas against the provided window', () => {
    const canvas = { width: 0, height: 0 };
    resizeFullscreenCanvas(canvas, { innerWidth: 1280, innerHeight: 720 });
    expect(canvas).toEqual({ width: 1280, height: 720 });
  });

  it('draws a four-point star polygon through the canvas api', () => {
    const ctx = {
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      closePath: vi.fn(),
      fill: vi.fn(),
    };

    drawStar4(ctx, 10, 20, 8, 4);

    expect(ctx.beginPath).toHaveBeenCalledTimes(1);
    expect(ctx.moveTo).toHaveBeenCalledTimes(1);
    expect(ctx.lineTo).toHaveBeenCalledTimes(7);
    expect(ctx.closePath).toHaveBeenCalledTimes(1);
    expect(ctx.fill).toHaveBeenCalledTimes(1);
  });
});
