import { describe, expect, it } from 'vitest';

import { createRunBindingCapabilities } from '../game/features/run/ports/public_binding_capabilities.js';
import { createTitleBindingCapabilities } from '../game/features/title/ports/public_binding_capabilities.js';

describe('feature binding capabilities', () => {
  it('exposes run binding creation and entry registration through the public binding port', () => {
    expect(Object.keys(createRunBindingCapabilities()).sort()).toEqual([
      'createCanvas',
      'registerEntry',
    ]);
  });

  it('exposes title binding creation and entry registration through the public binding port', () => {
    expect(Object.keys(createTitleBindingCapabilities()).sort()).toEqual([
      'createTitle',
      'registerTitle',
    ]);
  });
});
