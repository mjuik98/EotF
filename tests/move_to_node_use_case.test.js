import { describe, expect, it, vi } from 'vitest';

import { moveToNodeUseCase } from '../game/features/run/public.js';

describe('move_to_node_use_case', () => {
  it('applies node traversal state changes and linked child accessibility', () => {
    const gs = {
      _nodeMoveLock: false,
      currentFloor: 0,
      currentNode: null,
      player: { class: 'swordsman' },
      mapNodes: [
        { id: '1-0', floor: 1, type: 'event', visited: false, accessible: true, children: ['2-1'] },
        { id: '2-0', floor: 2, type: 'combat', visited: false, accessible: false },
        { id: '2-1', floor: 2, type: 'rest', visited: false, accessible: false },
      ],
      triggerItems: vi.fn(),
    };
    const classMechanics = {
      swordsman: {
        onMove: vi.fn(),
      },
    };
    const lockNodeMovement = vi.fn((state, locked) => {
      state._nodeMoveLock = locked;
    });

    const result = moveToNodeUseCase({
      combatNodeTypes: ['combat', 'elite', 'mini_boss', 'boss'],
      floorStartTrigger: 'floor_start',
      gs,
      nodeRef: '1-0',
      classMechanics,
      lockNodeMovement,
    });

    expect(result).toEqual(expect.objectContaining({
      ok: true,
      isCombatNode: false,
      node: gs.mapNodes[0],
      prevFloor: 0,
    }));
    expect(lockNodeMovement).toHaveBeenCalledWith(gs, true);
    expect(gs.currentNode).toBe(gs.mapNodes[0]);
    expect(gs.currentFloor).toBe(1);
    expect(gs.mapNodes[0].visited).toBe(true);
    expect(gs.mapNodes[1].accessible).toBe(false);
    expect(gs.mapNodes[2].accessible).toBe(true);
    expect(gs.triggerItems).toHaveBeenCalledWith('floor_start', { floor: 1 });
    expect(classMechanics.swordsman.onMove).toHaveBeenCalledWith(gs);
  });

  it('returns a blocked result without mutating state when node cannot be entered', () => {
    const gs = {
      _nodeMoveLock: false,
      currentFloor: 0,
      currentNode: null,
      player: { class: 'hunter' },
      mapNodes: [
        { id: '1-0', floor: 1, type: 'combat', visited: true, accessible: true },
      ],
      triggerItems: vi.fn(),
    };
    const lockNodeMovement = vi.fn();

    const result = moveToNodeUseCase({
      combatNodeTypes: ['combat', 'elite', 'mini_boss', 'boss'],
      floorStartTrigger: 'floor_start',
      gs,
      nodeRef: '1-0',
      lockNodeMovement,
    });

    expect(result).toEqual(expect.objectContaining({
      ok: false,
      reason: 'blocked-node',
    }));
    expect(lockNodeMovement).not.toHaveBeenCalled();
    expect(gs.currentNode).toBeNull();
    expect(gs.currentFloor).toBe(0);
    expect(gs.triggerItems).not.toHaveBeenCalled();
  });
});
