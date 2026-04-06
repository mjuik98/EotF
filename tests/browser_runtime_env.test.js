import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  resolveBrowserDocument,
  resolveBrowserWindow,
  resolveBrowserRuntime,
  resolveRequestAnimationFrame,
  resolveDepsFactory,
} from '../game/platform/browser/runtime_env.js';
import { createRunCanvasPorts } from '../game/features/run/ports/create_run_canvas_ports.js';
import { createUiPorts } from '../game/features/ui/ports/create_ui_ports.js';
import { getDoc, getHudUpdateDeps } from '../game/shared/runtime/hud_runtime_deps.js';

describe('browser runtime env', () => {
  const originalWindow = globalThis.window;
  const originalDocument = globalThis.document;
  const originalDepsFactory = globalThis.__ECHO_DEPS_FACTORY__;

  afterEach(() => {
    globalThis.window = originalWindow;
    globalThis.document = originalDocument;
    globalThis.__ECHO_DEPS_FACTORY__ = originalDepsFactory;
  });

  it('prefers injected browser runtime objects before host globals', () => {
    const doc = { id: 'doc' };
    const win = { id: 'win' };

    expect(resolveBrowserDocument({ doc, win: { document: { id: 'ignored' } } })).toBe(doc);
    expect(resolveBrowserWindow({ win, doc: { defaultView: { id: 'ignored' } } })).toBe(win);
    expect(resolveBrowserRuntime({ doc, win })).toEqual({ doc, win });
  });

  it('derives doc and win from the injected counterpart before falling back to globals', () => {
    const doc = { id: 'doc', defaultView: { id: 'doc-win' } };
    const win = { id: 'win', document: { id: 'win-doc' } };

    expect(resolveBrowserDocument({ win })).toEqual({ id: 'win-doc' });
    expect(resolveBrowserWindow({ doc })).toEqual({ id: 'doc-win' });
  });

  it('falls back to global browser runtime and deps factory host when injections are absent', () => {
    const win = { id: 'global-win', document: { id: 'global-doc' } };
    const hudDeps = { token: 'hud-deps' };
    globalThis.window = win;
    globalThis.document = win.document;
    globalThis.__ECHO_DEPS_FACTORY__ = {
      getHudUpdateDeps: vi.fn(() => hudDeps),
    };

    expect(resolveBrowserDocument()).toBe(win.document);
    expect(resolveBrowserWindow()).toBe(win);
    expect(resolveBrowserRuntime()).toEqual({ doc: win.document, win });
    expect(resolveDepsFactory()).toBe(globalThis.__ECHO_DEPS_FACTORY__);
  });

  it('binds requestAnimationFrame to the resolved window and provides a timeout fallback', () => {
    const win = {
      requestAnimationFrame: vi.fn((cb) => {
        cb();
        return 77;
      }),
    };
    const raf = resolveRequestAnimationFrame({ win });

    expect(typeof raf).toBe('function');
    const callback = vi.fn();
    expect(raf(callback)).toBe(77);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(win.requestAnimationFrame).toHaveBeenCalledTimes(1);
    expect(typeof resolveRequestAnimationFrame({})).toBe('function');
  });

  it('routes run/ui/hud consumers through the shared runtime env resolution rules', () => {
    const scopedCanvasDeps = vi.fn(() => ({ token: 'canvas-deps' }));
    const doc = { id: 'doc' };
    doc.defaultView = {
      id: 'doc-win',
      document: doc,
      requestAnimationFrame: vi.fn(),
    };
    globalThis.window = undefined;
    globalThis.document = undefined;
    globalThis.__ECHO_DEPS_FACTORY__ = {
      getHudUpdateDeps: vi.fn(() => ({ token: 'hud-deps' })),
    };

    const runPorts = createRunCanvasPorts({
      featureScopes: {
        core: {
          GAME: {
            getCanvasDeps: scopedCanvasDeps,
          },
        },
      },
    }, { doc });
    const uiPorts = createUiPorts({ win: doc.defaultView });

    expect(runPorts.doc).toBe(doc);
    expect(runPorts.win).toBe(doc.defaultView);
    expect(typeof runPorts.requestAnimationFrame).toBe('function');
    expect(runPorts.getCanvasDeps()).toEqual({
      token: 'canvas-deps',
      doc,
      win: doc.defaultView,
    });
    expect(uiPorts.doc).toBe(doc);
    expect(getDoc({ win: doc.defaultView })).toBe(doc);
    expect(getHudUpdateDeps()).toEqual({ token: 'hud-deps' });
  });
});
