import { describe, expect, it, vi } from 'vitest';

import { presentNodeTransition } from '../game/ui/map/map_navigation_presenter.js';

describe('node_transition_presenter', () => {
  it('updates non-combat navigation UI and dispatches the next node action', () => {
    const overlay = { style: {} };
    const nodeHandoff = {
      openEvent: vi.fn(),
    };
    const deps = {
      audioEngine: { id: 'audio' },
      doc: {
        getElementById: vi.fn((id) => (id === 'nodeCardOverlay' ? overlay : null)),
      },
      nodeHandoff,
      renderMinimap: vi.fn(),
      updateUI: vi.fn(),
      updateNextNodes: vi.fn(),
    };
    const schedule = vi.fn((callback) => callback());
    const playFootstep = vi.fn();
    const unlockNodeMovement = vi.fn();

    const result = presentNodeTransition({
      ok: true,
      isCombatNode: false,
      node: { type: 'event' },
    }, deps, {
      schedule,
      playFootstep,
      unlockNodeMovement,
    });

    expect(result.ok).toBe(true);
    expect(overlay.style.pointerEvents).toBe('none');
    expect(overlay.style.display).toBe('none');
    expect(playFootstep).toHaveBeenCalledWith(deps.audioEngine);
    expect(deps.renderMinimap).toHaveBeenCalledTimes(1);
    expect(deps.updateUI).toHaveBeenCalledTimes(1);
    expect(deps.updateNextNodes).toHaveBeenCalledTimes(1);
    expect(nodeHandoff.openEvent).toHaveBeenCalledTimes(1);
    expect(unlockNodeMovement).toHaveBeenCalledTimes(1);
    expect(schedule).toHaveBeenCalledWith(expect.any(Function), 300);
  });

  it('skips next-node overlay refresh for combat transitions and unlocks after action', () => {
    const nodeHandoff = {
      startCombat: vi.fn(),
    };
    const deps = {
      nodeHandoff,
      updateNextNodes: vi.fn(),
    };
    const schedule = vi.fn((callback) => callback());
    const unlockNodeMovement = vi.fn();

    presentNodeTransition({
      ok: true,
      isCombatNode: true,
      node: { type: 'boss' },
    }, deps, {
      schedule,
      playFootstep: vi.fn(),
      hideOverlay: vi.fn(),
      unlockNodeMovement,
    });

    expect(deps.updateNextNodes).not.toHaveBeenCalled();
    expect(nodeHandoff.startCombat).toHaveBeenCalledWith('boss');
    expect(unlockNodeMovement).toHaveBeenCalledTimes(1);
  });
});
