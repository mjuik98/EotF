import { afterEach, describe, expect, it } from 'vitest';

import { createBootstrapContext } from '../game/core/bootstrap/create_bootstrap_context.js';

describe('createBootstrapContext', () => {
  const originalWindow = globalThis.window;
  const originalDocument = globalThis.document;

  afterEach(() => {
    globalThis.window = originalWindow;
    globalThis.document = originalDocument;
  });

  it('uses explicit runtime objects when provided', () => {
    const doc = { body: {} };
    const win = { location: {} };
    const depsFactory = { id: 'deps' };
    const modules = { id: 'modules' };

    const context = createBootstrapContext(
      { doc, win },
      { depsFactory, createModuleRegistry: () => modules },
    );

    expect(context).toEqual({
      doc,
      win,
      deps: depsFactory,
      modules,
    });
  });

  it('falls back to null-safe globals when the runtime does not inject them', () => {
    globalThis.window = undefined;
    globalThis.document = undefined;

    const depsFactory = { id: 'deps' };
    const modules = { id: 'modules' };

    const context = createBootstrapContext(
      {},
      { depsFactory, createModuleRegistry: () => modules },
    );

    expect(context).toEqual({
      doc: null,
      win: null,
      deps: depsFactory,
      modules,
    });
  });
});
