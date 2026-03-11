import { describe, expect, it } from 'vitest';

import { buildBindingStateHelpers } from '../game/core/bootstrap/build_binding_state_helpers.js';

describe('buildBindingStateHelpers', () => {
  it('exposes runtime state accessors and mutators', () => {
    const modules = { _gameStarted: false };

    const helpers = buildBindingStateHelpers({ modules });

    expect(helpers._gameStarted()).toBe(false);
    helpers.markGameStarted();
    expect(modules._gameStarted).toBe(true);
  });
});
