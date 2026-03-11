import { describe, expect, it, vi } from 'vitest';

import { executeBindingSetupSequence } from '../game/core/bootstrap/execute_binding_setup_sequence.js';

describe('executeBindingSetupSequence', () => {
  it('runs setup steps in order and returns the shared fns object', () => {
    const callOrder = [];
    const context = {
      modules: { GAME: {} },
      deps: { token: 'deps' },
      fns: {},
    };

    const result = executeBindingSetupSequence(context, [
      ({ fns }) => {
        callOrder.push('bindings');
        fns.startGame = vi.fn();
      },
      ({ fns, deps }) => {
        callOrder.push(`legacy:${deps.token}`);
        fns.updateUI = vi.fn();
      },
      ({ fns }) => {
        callOrder.push('deps');
        fns.processDirtyFlags = vi.fn();
      },
    ]);

    expect(callOrder).toEqual(['bindings', 'legacy:deps', 'deps']);
    expect(result).toBe(context.fns);
    expect(result).toMatchObject({
      startGame: expect.any(Function),
      updateUI: expect.any(Function),
      processDirtyFlags: expect.any(Function),
    });
  });
});
