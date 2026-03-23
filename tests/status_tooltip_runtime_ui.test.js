import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ensureStatusTooltipRoot,
  positionStatusTooltipFromEvent,
  positionStatusTooltipToRect,
  renderStatusTooltipElement,
  scheduleStatusTooltipHide,
} from '../game/features/combat/public.js';

function createElement() {
  return {
    id: '',
    className: '',
    style: {},
    dataset: {},
    innerHTML: '',
    offsetHeight: 320,
    classList: { remove: vi.fn(), add: vi.fn() },
  };
}

describe('status_tooltip_runtime_ui', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('ensures the shared tooltip root exists once and reuses it', () => {
    const appended = [];
    const el = createElement();
    let existing = null;
    const doc = {
      body: { appendChild: vi.fn((node) => { appended.push(node); existing = node; return node; }) },
      createElement: vi.fn(() => el),
      getElementById: vi.fn(() => existing),
    };

    const first = ensureStatusTooltipRoot(doc);
    const second = ensureStatusTooltipRoot(doc);

    expect(first).toBe(el);
    expect(second).toBe(el);
    expect(doc.body.appendChild).toHaveBeenCalledTimes(1);
    expect(first.id).toBe('statusTooltip');
    expect(first.className).toBe('stt');
  });

  it('renders tooltip metadata and positions the tooltip from rects/events', () => {
    const el = createElement();
    const rect = { right: 300, left: 240, top: 40 };
    const win = { innerWidth: 340, innerHeight: 280 };

    renderStatusTooltipElement(
      el,
      'focus',
      { buff: true, name: '집중', icon: '🎯', desc: '설명' },
      { stacks: 1 },
      '<div>tooltip</div>',
      { statusContainerId: 'player' },
    );

    expect(el.innerHTML).toContain('tooltip');
    expect(el.dataset.statusKey).toBe('focus');
    expect(el.dataset.statusContainerId).toBe('player');
    expect(el.style.boxShadow).toContain('rgba(');

    expect(positionStatusTooltipToRect(rect, el, win)).toEqual({ x: 8, y: 8 });
    expect(el.style.left).toBe('8px');
    expect(el.style.top).toBe('8px');

    const event = { currentTarget: { getBoundingClientRect: () => ({ right: 50, left: 10, top: 20 }) } };
    expect(positionStatusTooltipFromEvent(event, el, { innerWidth: 600, innerHeight: 500 })).toEqual({ x: 60, y: 20 });
  });

  it('schedules tooltip hide against the shared root element', () => {
    const tooltip = { classList: { remove: vi.fn() } };
    const doc = { getElementById: vi.fn((id) => (id === 'statusTooltip' ? tooltip : null)) };

    scheduleStatusTooltipHide(doc);
    vi.advanceTimersByTime(79);
    expect(tooltip.classList.remove).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(tooltip.classList.remove).toHaveBeenCalledWith('visible');
  });
});
