import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it, vi } from 'vitest';

import { buildRuntimeBootBindings } from '../game/core/bootstrap/build_runtime_boot_bindings.js';

describe('buildRuntimeBootBindings scoped registry usage', () => {
  it('keeps runtime boot bindings routed through scoped registry helpers instead of flat module lookups', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'game/core/bootstrap/build_runtime_boot_bindings.js'),
      'utf8',
    );

    expect(source).toContain("from '../bindings/module_registry_scopes.js'");
    expect(source).not.toContain('modules.GameInit');
    expect(source).not.toContain('titleModules.GameInit');
    expect(source).not.toContain('modules.MazeSystem');
    expect(source).not.toContain('modules.GS');
    expect(source).not.toContain('modules.FovEngine');
    expect(source).not.toContain('modules.AudioEngine');
    expect(source).not.toContain('modules.GAME');
    expect(source).not.toContain('modules.StoryUI');
  });

  it('reads GameInit from the core scope while keeping MazeSystem in the run scope', () => {
    const boot = vi.fn();
    const syncVolumeUI = vi.fn();
    const exposeGlobals = vi.fn();
    const configure = vi.fn();
    const register = vi.fn();
    const finalizeRunOutcome = vi.fn();
    const patchRefs = vi.fn();
    const schedule = vi.fn();

    const modules = {
      exposeGlobals,
      featureScopes: {
        core: {
          AudioEngine: { id: 'audio' },
          FovEngine: { id: 'fov' },
          GAME: { register },
          GS: { currentScreen: 'title' },
          GameInit: { boot, syncVolumeUI },
        },
        run: {
          MazeSystem: { configure },
          finalizeRunOutcome,
        },
        title: {},
        screen: {},
      },
    };

    const fns = {
      advanceToNextRegion: vi.fn(),
      switchScreen: vi.fn(),
      updateUI: vi.fn(),
      updateNextNodes: vi.fn(),
      renderMinimap: vi.fn(),
      showWorldMemoryNotice: vi.fn(),
      startCombat: vi.fn(),
    };
    const deps = {
      getStoryDeps: () => ({}),
      patchRefs,
    };

    const bindings = buildRuntimeBootBindings({
      modules,
      fns,
      deps,
      doc: {},
      win: {},
      schedule,
    });

    bindings.bootGameInit();
    bindings.exposeRuntimeGlobals();
    bindings.configureMaze();
    bindings.registerBindings();

    expect(boot).toHaveBeenCalledTimes(1);
    expect(exposeGlobals).toHaveBeenCalledTimes(1);
    const globalsPayload = exposeGlobals.mock.calls[0][0];
    expect(typeof globalsPayload._syncVolumeUI).toBe('function');
    globalsPayload._syncVolumeUI();
    expect(syncVolumeUI).toHaveBeenCalledWith(modules.featureScopes.core.AudioEngine);
    expect(configure).toHaveBeenCalledWith(
      expect.objectContaining({
        gs: modules.featureScopes.core.GS,
        fovEngine: modules.featureScopes.core.FovEngine,
      }),
    );
    expect(register).toHaveBeenCalledWith('finalizeRunOutcome', finalizeRunOutcome);
  });
});
