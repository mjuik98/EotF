import { describe, expect, it, vi } from 'vitest';

import { runEndingScene } from '../game/ui/screens/ending_screen_scene_runtime.js';

function createNode(id = '') {
  return {
    id,
    style: {},
    textContent: '',
    children: [],
    classList: {
      added: [],
      add(value) {
        this.added.push(value);
      },
    },
    appendChild(child) {
      this.children.push(child);
      return child;
    },
    insertBefore(child, anchor) {
      const index = this.children.indexOf(anchor);
      if (index < 0) {
        this.children.push(child);
        return child;
      }
      this.children.splice(index, 0, child);
      return child;
    },
  };
}

describe('ending_screen_scene_runtime', () => {
  it('schedules reveal, quote, stat, and burst timing through the scene runner', () => {
    const nodes = new Map();
    ['s0', 's1', 's2', 's3', 's4', 's5', 's6', 's6b', 's7', 's8', 'quote', 'qcursor', 'sv0', 'sv1', 'sv2', 'sv3', 'sv4', 'tlLine', 'clrT']
      .forEach((id) => nodes.set(id, createNode(id)));
    const track = { offsetWidth: 300 };
    const doc = {
      getElementById(id) {
        return nodes.get(id) || null;
      },
      createElement() {
        return createNode();
      },
      querySelector(selector) {
        return selector === '.tl-track' ? track : null;
      },
    };
    const timeouts = [];
    const setTimeout = vi.fn((fn, delay) => {
      timeouts.push(delay);
      return timeouts.length;
    });
    const deps = {
      win: {
        innerWidth: 1280,
        innerHeight: 720,
        setTimeout,
      },
      requestAnimationFrame: vi.fn(() => 1),
      cancelAnimationFrame: vi.fn(),
      audioEngine: {
        playResonanceBurst: vi.fn(),
      },
    };
    const payload = {
      quote: 'AB',
      clear: '03:21',
      stats: [{ value: 1 }, { value: 2 }, { value: 3 }, { value: 4 }, { value: 5 }],
    };
    const session = { timers: [], cleanups: [] };
    const burst = vi.fn();

    runEndingScene(doc, deps, payload, [], session, burst);

    expect(timeouts).toEqual(expect.arrayContaining([400, 900, 1600, 3800, 4100, 4220, 4340, 4460, 4580, 4800, 5200, 1200]));
    expect(session.timers).toHaveLength(19);
    expect(nodes.get('quote').children).toContain(nodes.get('qcursor'));
    expect(deps.audioEngine.playResonanceBurst).not.toHaveBeenCalled();
  });
});
