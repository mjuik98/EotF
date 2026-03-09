import { describe, expect, it, vi } from 'vitest';
import {
  buildIntroOverlay,
  buildIntroSequence,
  createIntroParticles,
  getReturnLine,
  INTRO_RETURN_LINES,
  mountRunStartHandoffBlackout,
} from '../game/ui/title/intro_cinematic_helpers.js';

function createDoc() {
  const appended = [];
  const headChildren = [];
  const existing = new Map();

  return {
    body: {
      appendChild: vi.fn((el) => {
        appended.push(el);
        if (el.id) existing.set(el.id, el);
      }),
    },
    head: {
      appendChild: vi.fn((el) => {
        headChildren.push(el);
        if (el.id) existing.set(el.id, el);
      }),
    },
    createElement: vi.fn((tag) => {
      const el = {
        id: '',
        tagName: tag.toUpperCase(),
        style: {},
        dataset: {},
        textContent: '',
        children: [],
        appendChild(child) {
          this.children.push(child);
        },
        querySelector() {
          return null;
        },
        remove: vi.fn(() => {
          if (el.id) existing.delete(el.id);
        }),
      };
      return el;
    }),
    getElementById: vi.fn((id) => existing.get(id) || null),
    appended,
    headChildren,
  };
}

describe('intro cinematic helpers', () => {
  it('clamps return lines to the last known entry', () => {
    expect(getReturnLine(2)).toBe(INTRO_RETURN_LINES[0]);
    expect(getReturnLine(999)).toBe(INTRO_RETURN_LINES.at(-1));
  });

  it('builds first-run and repeat-run sequences with the right shape', () => {
    const doc = createDoc();
    const firstRun = buildIntroSequence(doc, 'berserker', 1);
    const repeatRun = buildIntroSequence(doc, 'paladin', 3);

    expect(firstRun.isFirstRun).toBe(true);
    expect(firstRun.nodes).toHaveLength(5);
    expect(firstRun.totalDuration).toBe(4800);
    expect(repeatRun.isFirstRun).toBe(false);
    expect(repeatRun.nodes).toHaveLength(5);
    expect(repeatRun.totalDuration).toBe(3800);
    expect(repeatRun.nodes[1].textContent).toContain(getReturnLine(3));
  });

  it('builds overlay shell nodes and particle seeds', () => {
    const doc = createDoc();
    const { canvas, overlay, skipHint, textBox } = buildIntroOverlay(doc);
    const particles = createIntroParticles(1920, 1080, 8);

    expect(overlay.id).toBe('introCinematicOverlay');
    expect(canvas.tagName).toBe('CANVAS');
    expect(skipHint.textContent).toContain('SKIP');
    expect(textBox.children).toHaveLength(0);
    expect(particles).toHaveLength(8);
    expect(particles.every((p) => p.x >= 0 && p.x <= 1920)).toBe(true);
  });

  it('mounts a single blackout overlay and replaces any prior one', () => {
    const doc = createDoc();
    const old = { id: 'runStartHandoffBlackoutOverlay', remove: vi.fn() };
    doc.getElementById = vi.fn((id) => (id === 'runStartHandoffBlackoutOverlay' ? old : null));

    mountRunStartHandoffBlackout(doc);

    expect(old.remove).toHaveBeenCalledTimes(1);
    expect(doc.body.appendChild).toHaveBeenCalledTimes(1);
    expect(doc.body.appendChild.mock.calls[0][0].id).toBe('runStartHandoffBlackoutOverlay');
  });
});
