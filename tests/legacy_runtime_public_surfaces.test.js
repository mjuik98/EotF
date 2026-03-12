import { beforeEach, describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  assignLegacyCompatSurface: vi.fn((target, api) => Object.assign(target, api)),
  buildLegacyGameApiCompatPayload: vi.fn(() => ({
    playerActions: { addGold: vi.fn() },
    screenActions: { setScreen: vi.fn() },
  })),
  buildLegacyGameApiActionGroups: vi.fn(() => ({
    runActions: { startGame: vi.fn() },
  })),
  composeLegacyGameApiPayload: vi.fn(({ actionGroups, queryBindings }) => ({
    ...actionGroups,
    queryBindings,
  })),
  buildLegacyMetricsQueryBindings: vi.fn(() => ({ getRuntimeMetrics: vi.fn(), resetRuntimeMetrics: vi.fn() })),
  buildLegacySaveQueryBindings: vi.fn(() => ({ getSaveOutboxMetrics: vi.fn(), flushSaveOutbox: vi.fn() })),
  composeLegacyGameApiQueryGroups: vi.fn((groups) => groups),
  composeLegacyGameApiRuntimeQueryGroups: vi.fn((groups) => groups),
  flattenLegacyGameApiQueryGroups: vi.fn((groups) => ({ ...groups.module, ...groups.runtime })),
  flattenLegacyGameApiRuntimeQueryGroups: vi.fn((groups) => ({ ...groups.save, ...groups.metrics, ...groups.hud })),
  buildLegacySharedModuleQueries: vi.fn(() => ({ AudioEngine: { id: 'audio' } })),
  buildLegacyUtilityQueries: vi.fn(() => ({ DescriptionUtils: { id: 'desc' } })),
  composeLegacyWindowQueryGroups: vi.fn((groups) => groups),
  mergeLegacyWindowQueryGroups: vi.fn((groups) => ({ ...groups.ui, ...groups.utility })),
  createLegacyGameApi: vi.fn((payload) => payload),
}));

vi.mock('../game/platform/legacy/build_legacy_game_api_compat_payload.js', () => ({
  buildLegacyGameApiCompatPayload: hoisted.buildLegacyGameApiCompatPayload,
}));

vi.mock('../game/platform/legacy/create_legacy_game_api.js', () => ({
  createLegacyGameApi: hoisted.createLegacyGameApi,
}));

vi.mock('../game/shared/runtime/public.js', () => ({
  assignLegacyCompatSurface: hoisted.assignLegacyCompatSurface,
  buildLegacyGameApiActionGroups: hoisted.buildLegacyGameApiActionGroups,
  composeLegacyGameApiPayload: hoisted.composeLegacyGameApiPayload,
  buildLegacyMetricsQueryBindings: hoisted.buildLegacyMetricsQueryBindings,
  buildLegacySaveQueryBindings: hoisted.buildLegacySaveQueryBindings,
  composeLegacyGameApiQueryGroups: hoisted.composeLegacyGameApiQueryGroups,
  composeLegacyGameApiRuntimeQueryGroups: hoisted.composeLegacyGameApiRuntimeQueryGroups,
  buildLegacySharedModuleQueries: hoisted.buildLegacySharedModuleQueries,
  buildLegacyUtilityQueries: hoisted.buildLegacyUtilityQueries,
  composeLegacyWindowQueryGroups: hoisted.composeLegacyWindowQueryGroups,
  flattenLegacyGameApiQueryGroups: hoisted.flattenLegacyGameApiQueryGroups,
  flattenLegacyGameApiRuntimeQueryGroups: hoisted.flattenLegacyGameApiRuntimeQueryGroups,
  mergeLegacyWindowQueryGroups: hoisted.mergeLegacyWindowQueryGroups,
}));

import { buildLegacyGameAPIModuleQueries } from '../game/platform/legacy/game_api_module_queries.js';
import { buildLegacyWindowUtilityQueries } from '../game/platform/legacy/window_binding_utility_queries.js';
import { buildLegacyGameAPIFacade } from '../game/platform/legacy/game_api_facade.js';
import { buildLegacyGameApiPayload } from '../game/platform/legacy/build_legacy_game_api_payload.js';
import { attachLegacyWindowQueries } from '../game/platform/legacy/window_binding_queries.js';

describe('legacy runtime public surfaces', () => {
  beforeEach(() => {
    Object.values(hoisted).forEach((value) => value.mockClear?.());
    hoisted.assignLegacyCompatSurface.mockImplementation((target, api) => Object.assign(target, api));
    hoisted.buildLegacySharedModuleQueries.mockReturnValue({ AudioEngine: { id: 'audio' } });
    hoisted.buildLegacyUtilityQueries.mockReturnValue({ DescriptionUtils: { id: 'desc' } });
    hoisted.buildLegacyGameApiCompatPayload.mockReturnValue({
      playerActions: { addGold: vi.fn() },
      screenActions: { setScreen: vi.fn() },
    });
    hoisted.buildLegacyGameApiActionGroups.mockReturnValue({
      runActions: { startGame: vi.fn() },
    });
    hoisted.composeLegacyGameApiPayload.mockImplementation(({ actionGroups, queryBindings }) => ({
      ...actionGroups,
      queryBindings,
    }));
    hoisted.buildLegacyMetricsQueryBindings.mockReturnValue({ getRuntimeMetrics: vi.fn(), resetRuntimeMetrics: vi.fn() });
    hoisted.buildLegacySaveQueryBindings.mockReturnValue({ getSaveOutboxMetrics: vi.fn(), flushSaveOutbox: vi.fn() });
    hoisted.composeLegacyGameApiQueryGroups.mockImplementation((groups) => groups);
    hoisted.composeLegacyGameApiRuntimeQueryGroups.mockImplementation((groups) => groups);
    hoisted.composeLegacyWindowQueryGroups.mockImplementation((groups) => groups);
    hoisted.flattenLegacyGameApiQueryGroups.mockImplementation((groups) => ({ ...groups.module, ...groups.runtime }));
    hoisted.flattenLegacyGameApiRuntimeQueryGroups.mockImplementation((groups) => ({ ...groups.save, ...groups.metrics, ...groups.hud }));
    hoisted.mergeLegacyWindowQueryGroups.mockImplementation((groups) => ({ ...groups.ui, ...groups.utility }));
    hoisted.createLegacyGameApi.mockImplementation((payload) => payload);
  });

  it('routes legacy game api module queries through shared runtime public bindings', () => {
    const modules = { AudioEngine: { id: 'audio' } };

    expect(buildLegacyGameAPIModuleQueries(modules)).toEqual({ AudioEngine: { id: 'audio' } });
    expect(hoisted.buildLegacySharedModuleQueries).toHaveBeenCalledWith(modules);
  });

  it('routes legacy window utility queries through shared runtime public bindings', () => {
    const modules = { DescriptionUtils: { id: 'desc' } };

    expect(buildLegacyWindowUtilityQueries(modules)).toEqual({ DescriptionUtils: { id: 'desc' } });
    expect(hoisted.buildLegacyUtilityQueries).toHaveBeenCalledWith(modules);
  });

  it('routes legacy compat api assembly through the compat payload builder', () => {
    const apiRef = {};

    expect(buildLegacyGameAPIFacade(apiRef)).toEqual({
      playerActions: expect.any(Object),
      screenActions: expect.any(Object),
    });
    expect(hoisted.buildLegacyGameApiCompatPayload).toHaveBeenCalledWith(apiRef);
    expect(hoisted.createLegacyGameApi).toHaveBeenCalledWith(
      hoisted.buildLegacyGameApiCompatPayload.mock.results[0].value,
    );
  });

  it('routes legacy game api payload grouping through shared runtime public bindings', () => {
    const commandBindings = { startGame: vi.fn() };
    const queryBindings = { getMetrics: vi.fn() };

    expect(buildLegacyGameApiPayload({ commandBindings, queryBindings })).toEqual({
      runActions: expect.any(Object),
      queryBindings,
    });
    expect(hoisted.buildLegacyGameApiActionGroups).toHaveBeenCalledWith(commandBindings);
    expect(hoisted.composeLegacyGameApiPayload).toHaveBeenCalledWith({
      actionGroups: expect.any(Object),
      queryBindings,
    });
  });

  it('routes legacy window query binding merge through shared runtime public bindings', () => {
    const root = {};
    const modules = {};
    const fns = {};
    const deps = {};

    attachLegacyWindowQueries(root, modules, fns, deps);

    expect(hoisted.composeLegacyWindowQueryGroups).toHaveBeenCalledWith({
      ui: expect.any(Object),
      utility: expect.any(Object),
    });
    expect(hoisted.mergeLegacyWindowQueryGroups).toHaveBeenCalledWith({
      ui: expect.any(Object),
      utility: expect.any(Object),
    });
  });

  it('routes legacy game api query group composition and flattening through shared runtime bindings', async () => {
    const { buildLegacyGameAPIQueryGroups } = await import('../game/platform/legacy/build_legacy_game_api_query_groups.js');
    const { buildLegacyGameAPIRuntimeQueries } = await import('../game/platform/legacy/game_api_runtime_queries.js');
    const { buildLegacyGameAPIQueryBindings } = await import('../game/platform/legacy/game_api_query_bindings.js');

    const modules = {};
    const deps = {};
    const runtimeMetrics = {};

    buildLegacyGameAPIQueryGroups(modules, deps, runtimeMetrics);
    buildLegacyGameAPIRuntimeQueries(modules, deps, runtimeMetrics);
    buildLegacyGameAPIQueryBindings(modules, deps, runtimeMetrics);

    expect(hoisted.composeLegacyGameApiQueryGroups).toHaveBeenCalledWith({
      module: expect.any(Object),
      runtime: expect.any(Object),
    });
    expect(hoisted.composeLegacyGameApiRuntimeQueryGroups).toHaveBeenCalledWith({
      save: expect.any(Object),
      metrics: expect.any(Object),
      hud: expect.any(Object),
    });
    expect(hoisted.flattenLegacyGameApiRuntimeQueryGroups).toHaveBeenCalledWith({
      save: expect.any(Object),
      metrics: expect.any(Object),
      hud: expect.any(Object),
    });
    expect(hoisted.flattenLegacyGameApiQueryGroups).toHaveBeenCalledWith({
      module: expect.any(Object),
      runtime: expect.any(Object),
    });
  });

});
