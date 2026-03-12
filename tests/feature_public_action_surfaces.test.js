import { beforeEach, describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  buildCombatUiContractPublicBuilders: vi.fn(() => ({ hudUpdate: vi.fn() })),
  buildCombatRuntimeSubscriberPublicActions: vi.fn(() => ({ renderCombatCards: vi.fn() })),
  buildRunFlowContractPublicBuilders: vi.fn(() => ({ runStart: vi.fn() })),
  buildRunBootPublicActions: vi.fn(() => ({ drawCard: vi.fn() })),
  buildRunUiContractPublicBuilders: vi.fn(() => ({ worldCanvas: vi.fn() })),
  buildTitleBootPublicActions: vi.fn(() => ({ startGame: vi.fn() })),
  buildTitleRunContractPublicBuilders: vi.fn(() => ({ runMode: vi.fn() })),
  buildUiShellContractPublicBuilders: vi.fn(() => ({ settings: vi.fn() })),
  buildUiRuntimeSubscriberPublicActions: vi.fn(() => ({ updateUI: vi.fn() })),
  createCombatPorts: vi.fn(() => ({
    getCombatDeps: vi.fn(() => ({ token: 'combat-deps' })),
    getHudDeps: vi.fn(() => ({ token: 'hud-deps' })),
  })),
  createUiBindingContext: vi.fn(() => ({ actions: { switchScreen: vi.fn(), updateUI: vi.fn() }, ports: { getScreenDeps: vi.fn(() => ({ token: 'screen-deps' })) } })),
  createCombatBindingsActions: vi.fn(() => ({ startCombat: vi.fn() })),
  createEventRewardBindingActions: vi.fn(() => ({ skipReward: vi.fn() })),
  createRunCanvasBindings: vi.fn(() => ({ renderWorld: vi.fn() })),
  createTitleBindings: vi.fn(() => ({ openSettings: vi.fn() })),
}));

vi.mock('../game/features/combat/public.js', () => ({
  buildCombatUiContractPublicBuilders: hoisted.buildCombatUiContractPublicBuilders,
  buildCombatRuntimeSubscriberPublicActions: hoisted.buildCombatRuntimeSubscriberPublicActions,
  createCombatPorts: hoisted.createCombatPorts,
  createCombatBindingsActions: hoisted.createCombatBindingsActions,
}));

vi.mock('../game/features/event/public.js', () => ({
  createEventRewardBindingActions: hoisted.createEventRewardBindingActions,
}));

vi.mock('../game/features/run/public.js', () => ({
  buildRunFlowContractPublicBuilders: hoisted.buildRunFlowContractPublicBuilders,
  buildRunBootPublicActions: hoisted.buildRunBootPublicActions,
  buildRunUiContractPublicBuilders: hoisted.buildRunUiContractPublicBuilders,
  createRunCanvasBindings: hoisted.createRunCanvasBindings,
}));

vi.mock('../game/features/title/public.js', () => ({
  buildTitleBootPublicActions: hoisted.buildTitleBootPublicActions,
  buildTitleRunContractPublicBuilders: hoisted.buildTitleRunContractPublicBuilders,
  createTitleBindings: hoisted.createTitleBindings,
}));

vi.mock('../game/features/ui/public.js', () => ({
  buildUiShellContractPublicBuilders: hoisted.buildUiShellContractPublicBuilders,
  buildUiRuntimeSubscriberPublicActions: hoisted.buildUiRuntimeSubscriberPublicActions,
  createUiBindingContext: hoisted.createUiBindingContext,
}));

import { createUIBindings } from '../game/core/bindings/ui_bindings.js';
import { createTitleSettingsBindings } from '../game/core/bindings/title_settings_bindings.js';
import { createCombatBindings } from '../game/core/bindings/combat_bindings.js';
import { createCanvasBindings } from '../game/core/bindings/canvas_bindings.js';
import { applyEventRewardBindings } from '../game/core/bindings/event_reward_bindings_runtime.js';
import { buildRuntimeSubscriberActionGroups } from '../game/core/bootstrap/build_runtime_subscriber_action_groups.js';
import { buildGameBootActionGroups } from '../game/core/bootstrap/build_game_boot_action_groups.js';
import { buildUiContractBuilders } from '../game/core/deps/contracts/ui_contract_builders.js';
import { buildRunContractBuilders } from '../game/core/deps/contracts/run_contract_builders.js';
import { createLegacyCombatCompat } from '../game/platform/legacy/adapters/create_legacy_combat_compat.js';

describe('feature public action surfaces', () => {
  beforeEach(() => {
    Object.values(hoisted).forEach((value) => value.mockReset?.());
    hoisted.createUiBindingContext.mockReturnValue({
      actions: { switchScreen: vi.fn(), updateUI: vi.fn() },
      ports: { getScreenDeps: vi.fn(() => ({ token: 'screen-deps' })) },
    });
    hoisted.createTitleBindings.mockReturnValue({ openSettings: vi.fn() });
    hoisted.createCombatBindingsActions.mockReturnValue({ startCombat: vi.fn() });
    hoisted.createCombatPorts.mockReturnValue({
      getCombatDeps: vi.fn(() => ({ token: 'combat-deps' })),
      getHudDeps: vi.fn(() => ({ token: 'hud-deps' })),
    });
    hoisted.createRunCanvasBindings.mockReturnValue({ renderWorld: vi.fn() });
    hoisted.createEventRewardBindingActions.mockReturnValue({ skipReward: vi.fn() });
    hoisted.buildCombatUiContractPublicBuilders.mockReturnValue({ hudUpdate: vi.fn() });
    hoisted.buildCombatRuntimeSubscriberPublicActions.mockReturnValue({ renderCombatCards: vi.fn() });
    hoisted.buildRunFlowContractPublicBuilders.mockReturnValue({ runStart: vi.fn() });
    hoisted.buildUiRuntimeSubscriberPublicActions.mockReturnValue({ updateUI: vi.fn() });
    hoisted.buildRunUiContractPublicBuilders.mockReturnValue({ worldCanvas: vi.fn() });
    hoisted.buildTitleBootPublicActions.mockReturnValue({ startGame: vi.fn() });
    hoisted.buildTitleRunContractPublicBuilders.mockReturnValue({ runMode: vi.fn() });
    hoisted.buildRunBootPublicActions.mockReturnValue({ drawCard: vi.fn() });
    hoisted.buildUiShellContractPublicBuilders.mockReturnValue({ settings: vi.fn() });
  });

  it('routes core ui bindings through the ui feature public facade', () => {
    const modules = { GAME: { getScreenDeps: vi.fn(() => ({ token: 'screen-deps' })) }, GS: { dispatch: vi.fn() }, ScreenUI: {} };
    const fns = {};

    createUIBindings(modules, fns);

    expect(hoisted.createUiBindingContext).toHaveBeenCalledWith(modules, fns);
  });

  it('routes title settings bindings through the title feature public facade', () => {
    const modules = {};
    const fns = {};

    createTitleSettingsBindings(modules, fns);

    expect(hoisted.createTitleBindings).toHaveBeenCalledWith(modules, fns);
  });

  it('routes combat bindings through the combat feature public facade', () => {
    const modules = {};
    const fns = {};

    createCombatBindings(modules, fns);

    expect(hoisted.createCombatBindingsActions).toHaveBeenCalledWith(modules, fns);
  });

  it('routes canvas bindings through the run feature public facade', () => {
    const modules = {};
    const fns = {};

    createCanvasBindings(modules, fns);

    expect(hoisted.createRunCanvasBindings).toHaveBeenCalledWith(modules, fns);
  });

  it('routes event reward bindings through the event feature public facade', () => {
    const modules = {};
    const fns = {};

    applyEventRewardBindings({ modules, fns });

    expect(hoisted.createEventRewardBindingActions).toHaveBeenCalledWith(modules, fns);
  });

  it('routes runtime subscriber groups through feature public facades', () => {
    const fns = {};

    expect(buildRuntimeSubscriberActionGroups(fns)).toEqual({
      gameplay: expect.any(Object),
      shell: expect.any(Object),
    });
    expect(hoisted.buildCombatRuntimeSubscriberPublicActions).toHaveBeenCalledWith(fns);
    expect(hoisted.buildUiRuntimeSubscriberPublicActions).toHaveBeenCalledWith(fns);
  });

  it('routes game boot groups through feature public facades', () => {
    const fns = {};

    expect(buildGameBootActionGroups(fns)).toEqual({
      title: expect.any(Object),
      run: expect.any(Object),
    });
    expect(hoisted.buildTitleBootPublicActions).toHaveBeenCalledWith(fns);
    expect(hoisted.buildRunBootPublicActions).toHaveBeenCalledWith(fns);
  });

  it('routes core ui contract builders through feature public facades', () => {
    const ctx = {};

    expect(buildUiContractBuilders(ctx)).toEqual({
      hudUpdate: expect.any(Function),
      settings: expect.any(Function),
      worldCanvas: expect.any(Function),
    });
    expect(hoisted.buildCombatUiContractPublicBuilders).toHaveBeenCalledWith(ctx);
    expect(hoisted.buildUiShellContractPublicBuilders).toHaveBeenCalledWith(ctx);
    expect(hoisted.buildRunUiContractPublicBuilders).toHaveBeenCalledWith(ctx);
  });

  it('routes core run contract builders through feature public facades', () => {
    const ctx = {};

    expect(buildRunContractBuilders(ctx)).toEqual({
      runMode: expect.any(Function),
      runStart: expect.any(Function),
    });
    expect(hoisted.buildTitleRunContractPublicBuilders).toHaveBeenCalledWith(ctx);
    expect(hoisted.buildRunFlowContractPublicBuilders).toHaveBeenCalledWith(ctx);
  });

  it('routes legacy combat compat through the combat feature public facade', () => {
    const combatDeps = { token: 'combat-deps' };
    const hudDeps = { token: 'hud-deps' };
    const getCombatDeps = vi.fn(() => combatDeps);
    const getHudDeps = vi.fn(() => hudDeps);
    hoisted.createCombatPorts.mockReturnValue({ getCombatDeps, getHudDeps });
    const modules = {
      CombatUI: {
        hideEnemyStatusTooltip: vi.fn(),
        showEnemyStatusTooltip: vi.fn(),
      },
      CombatHudUI: {
        updateEchoSkillBtn: vi.fn(),
      },
      GS: {},
    };

    const compat = createLegacyCombatCompat(modules);
    compat.hideEnemyStatusTooltip();
    compat.showEnemyStatusTooltip('event', 'burn');
    compat.updateEchoSkillBtn();

    expect(hoisted.createCombatPorts).toHaveBeenCalledWith(modules);
    expect(modules.CombatUI.hideEnemyStatusTooltip).toHaveBeenCalledWith(combatDeps);
    expect(modules.CombatUI.showEnemyStatusTooltip).toHaveBeenCalledWith('event', 'burn', combatDeps);
    expect(modules.CombatHudUI.updateEchoSkillBtn).toHaveBeenCalledWith(hudDeps);
  });
});
