import { describe, expect, it } from 'vitest';

import {
  applyRelicDetailLayout,
  resolveFloatingRelicDetailTop,
  resolveRelicDetailPlacement,
} from '../game/features/run/presentation/browser/map_relic_detail_layout.js';

function createElement(rect, extra = {}) {
  return {
    style: {},
    dataset: {},
    clientHeight: rect?.height || 0,
    offsetHeight: rect?.height || 0,
    getBoundingClientRect: () => rect,
    ...extra,
  };
}

describe('map relic detail layout', () => {
  it('chooses inline placement on narrow viewports and floating-left when room exists', () => {
    const panel = createElement({ left: 320, top: 0, height: 420 });
    const detailPanel = createElement({ width: 220, height: 160 });

    expect(resolveRelicDetailPlacement(panel, detailPanel, { innerWidth: 960 })).toBe('inline');
    expect(resolveRelicDetailPlacement(panel, detailPanel, { innerWidth: 1440 })).toBe('floating-left');
    expect(resolveRelicDetailPlacement(createElement({ left: 120, top: 0, height: 420 }), detailPanel, { innerWidth: 1440 })).toBe('inline');
  });

  it('clamps floating detail top within the panel bounds', () => {
    const panel = createElement({ left: 320, top: 100, height: 320 });
    const detailPanel = createElement({ width: 220, height: 180 });
    const activeSlot = createElement({ top: 360, height: 40 });

    expect(resolveFloatingRelicDetailTop(panel, detailPanel, activeSlot)).toBe(128);
  });

  it('applies floating-left styles when the viewport allows it', () => {
    const panel = createElement({ left: 320, top: 100, height: 320 });
    const detailPanel = createElement({ width: 220, height: 180 });
    const activeSlot = createElement({ top: 360, height: 40 });

    applyRelicDetailLayout(panel, detailPanel, { innerWidth: 1440 }, activeSlot);

    expect(detailPanel.dataset.placement).toBe('floating-left');
    expect(detailPanel.style.position).toBe('absolute');
    expect(detailPanel.style.right).toContain('100%');
    expect(detailPanel.style.width).toContain('320px');
  });
});
