import { describe, expect, it, vi } from 'vitest';
import { MapGenerationUI } from '../game/ui/map/map_generation_ui.js';
import { MapNavigationUI } from '../game/ui/map/map_navigation_ui.js';

function buildFloorMap(nodes = []) {
  const byFloor = new Map();
  nodes.forEach((node) => {
    const list = byFloor.get(node.floor);
    if (list) list.push(node);
    else byFloor.set(node.floor, [node]);
  });
  return byFloor;
}

describe('map branching constraints', () => {
  it('keeps floor node count <= 5 and parent branching between 1..3', () => {
    const gs = {
      mapNodes: [],
      currentNode: null,
      currentFloor: 0,
    };
    const deps = {
      gs,
      getRegionData: () => ({ floors: 8 }),
      getBaseRegionIndex: () => 0,
      updateNextNodes: vi.fn(),
      updateUI: vi.fn(),
    };

    MapGenerationUI.generateMap(0, deps);

    const byFloor = buildFloorMap(gs.mapNodes);
    const totalFloors = Math.max(...gs.mapNodes.map((n) => n.floor));
    const byId = new Map(gs.mapNodes.map((node) => [node.id, node]));

    byFloor.forEach((nodes) => {
      expect(nodes.length).toBeLessThanOrEqual(5);
    });

    for (let floor = 1; floor < totalFloors; floor++) {
      const nodes = byFloor.get(floor) || [];
      nodes.forEach((node) => {
        expect(Array.isArray(node.children)).toBe(true);
        expect(node.children.length).toBeGreaterThanOrEqual(1);
        expect(node.children.length).toBeLessThanOrEqual(3);
        node.children.forEach((childId) => {
          const child = byId.get(childId);
          expect(child).toBeTruthy();
          expect(child.floor).toBe(node.floor + 1);
        });
      });
    }
  });

  it('ensures every node on next floor is reachable from previous floor', () => {
    const gs = {
      mapNodes: [],
      currentNode: null,
      currentFloor: 0,
    };

    MapGenerationUI.generateMap(0, {
      gs,
      getRegionData: () => ({ floors: 9 }),
      getBaseRegionIndex: () => 0,
      updateNextNodes: vi.fn(),
      updateUI: vi.fn(),
    });

    const byFloor = buildFloorMap(gs.mapNodes);
    const totalFloors = Math.max(...gs.mapNodes.map((n) => n.floor));

    for (let floor = 2; floor <= totalFloors; floor++) {
      const prevNodes = byFloor.get(floor - 1) || [];
      const nodes = byFloor.get(floor) || [];
      const incoming = new Map(nodes.map((node) => [node.id, 0]));

      prevNodes.forEach((parent) => {
        (parent.children || []).forEach((childId) => {
          if (!incoming.has(childId)) return;
          incoming.set(childId, (incoming.get(childId) || 0) + 1);
        });
      });

      nodes.forEach((node) => {
        expect((incoming.get(node.id) || 0) > 0).toBe(true);
      });
    }
  });

  it('opens only linked children as accessible next nodes (with legacy fallback)', () => {
    vi.useFakeTimers();

    const gs = {
      player: { class: 'hunter' },
      mapNodes: [
        { id: '1-0', floor: 1, type: 'combat', visited: false, accessible: true, children: ['2-1'] },
        { id: '2-0', floor: 2, type: 'combat', visited: false, accessible: false },
        { id: '2-1', floor: 2, type: 'combat', visited: false, accessible: false },
      ],
      currentNode: null,
      currentFloor: 0,
      combat: { active: false },
      triggerItems: vi.fn(),
    };

    const deps = {
      gs,
      doc: { getElementById: vi.fn(() => null) },
      renderMinimap: vi.fn(),
      updateUI: vi.fn(),
      updateNextNodes: vi.fn(),
      startCombat: vi.fn(),
      classMechanics: {},
    };

    MapNavigationUI.moveToNode('1-0', deps);
    expect(gs.mapNodes.find((n) => n.id === '2-1')?.accessible).toBe(true);
    expect(gs.mapNodes.find((n) => n.id === '2-0')?.accessible).toBe(false);

    vi.runAllTimers();

    const gsLegacy = {
      player: { class: 'hunter' },
      mapNodes: [
        { id: '1-0', floor: 1, type: 'combat', visited: false, accessible: true },
        { id: '2-0', floor: 2, type: 'combat', visited: false, accessible: false },
        { id: '2-1', floor: 2, type: 'combat', visited: false, accessible: false },
      ],
      currentNode: null,
      currentFloor: 0,
      combat: { active: false },
      triggerItems: vi.fn(),
    };

    MapNavigationUI.moveToNode('1-0', { ...deps, gs: gsLegacy });
    expect(gsLegacy.mapNodes.find((n) => n.id === '2-1')?.accessible).toBe(true);
    expect(gsLegacy.mapNodes.find((n) => n.id === '2-0')?.accessible).toBe(true);

    vi.runAllTimers();
    vi.useRealTimers();
  });
});
