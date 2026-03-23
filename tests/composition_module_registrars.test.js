import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it, vi } from 'vitest';

const codexHoisted = vi.hoisted(() => ({
  createLazyCodexModule: vi.fn(() => ({
    __lazyModule: true,
    openCodex: vi.fn(),
    closeCodex: vi.fn(),
    setCodexTab: vi.fn(),
    renderCodexContent: vi.fn(),
  })),
}));

const eventHoisted = vi.hoisted(() => ({
  createLazyEventModule: vi.fn(() => ({
    __lazyModule: true,
    triggerRandomEvent: vi.fn(),
    updateEventGoldBar: vi.fn(),
    showEvent: vi.fn(),
    resolveEvent: vi.fn(),
    showShop: vi.fn(),
    showRestSite: vi.fn(),
    showCardDiscard: vi.fn(),
    showItemShop: vi.fn(),
    api: {
      showEvent: vi.fn(),
      resolveEvent: vi.fn(),
      showShop: vi.fn(),
      showRestSite: vi.fn(),
      showItemShop: vi.fn(),
    },
  })),
}));

const rewardHoisted = vi.hoisted(() => ({
  createLazyRewardModule: vi.fn(() => ({
    __lazyModule: true,
    showRewardScreen: vi.fn(),
    takeRewardBlessing: vi.fn(),
    takeRewardCard: vi.fn(),
    takeRewardItem: vi.fn(),
    takeRewardUpgrade: vi.fn(),
    takeRewardRemove: vi.fn(),
    showSkipConfirm: vi.fn(),
    hideSkipConfirm: vi.fn(),
    skipReward: vi.fn(),
  })),
}));

const runHoisted = vi.hoisted(() => ({
  createRunModuleCapabilities: vi.fn(() => ({
    map: { MapUI: { id: 'map' }, MazeSystem: { id: 'maze' } },
    flow: { RunModeUI: { id: 'mode' }, RunStartUI: { id: 'start' } },
  })),
}));

const screenHoisted = vi.hoisted(() => ({
  buildScreenPrimaryModules: vi.fn(() => ({ ScreenUI: { id: 'screen' }, EventUI: { id: 'event' } })),
  buildScreenOverlayModules: vi.fn(() => ({ HelpPauseUI: { id: 'help' }, SettingsUI: { id: 'settings' } })),
}));

const titleHoisted = vi.hoisted(() => ({
  createTitleModuleCapabilities: vi.fn(() => ({
    canvas: { TitleCanvasUI: { id: 'title-canvas' } },
    flow: { ClassSelectUI: { id: 'class-select' }, GameBootUI: { id: 'boot' } },
  })),
}));

const coreHoisted = vi.hoisted(() => ({
  buildCoreEngineModules: vi.fn(() => ({ AudioEngine: { id: 'audio' }, GS: { id: 'gs' } })),
  buildCoreRuntimeBridgeModules: vi.fn(() => ({ GAME: { id: 'game' }, GameInit: { id: 'init' } })),
  buildCoreSystemModules: vi.fn(() => ({ RunRules: { id: 'rules' }, SaveSystem: { id: 'save' } })),
}));

vi.mock('../game/features/codex/platform/browser/create_lazy_codex_module.js', () => ({
  createLazyCodexModule: codexHoisted.createLazyCodexModule,
}));

vi.mock('../game/features/event/platform/browser/create_lazy_event_module.js', () => ({
  createLazyEventModule: eventHoisted.createLazyEventModule,
}));

vi.mock('../game/features/reward/platform/browser/create_lazy_reward_module.js', () => ({
  createLazyRewardModule: rewardHoisted.createLazyRewardModule,
}));

vi.mock('../game/features/run/ports/public_module_capabilities.js', () => ({
  createRunModuleCapabilities: runHoisted.createRunModuleCapabilities,
}));

vi.mock('../game/platform/browser/composition/build_screen_primary_modules.js', () => ({
  buildScreenPrimaryModules: screenHoisted.buildScreenPrimaryModules,
}));

vi.mock('../game/platform/browser/composition/build_screen_overlay_modules.js', () => ({
  buildScreenOverlayModules: screenHoisted.buildScreenOverlayModules,
}));

vi.mock('../game/features/title/ports/public_module_capabilities.js', () => ({
  createTitleModuleCapabilities: titleHoisted.createTitleModuleCapabilities,
}));

vi.mock('../game/platform/browser/composition/build_core_engine_modules.js', () => ({
  buildCoreEngineModules: coreHoisted.buildCoreEngineModules,
}));

vi.mock('../game/platform/browser/composition/build_core_runtime_bridge_modules.js', () => ({
  buildCoreRuntimeBridgeModules: coreHoisted.buildCoreRuntimeBridgeModules,
}));

vi.mock('../game/platform/browser/composition/build_core_system_modules.js', () => ({
  buildCoreSystemModules: coreHoisted.buildCoreSystemModules,
}));

import { registerCodexModules } from '../game/platform/browser/composition/register_codex_modules.js';
import { registerEventModules } from '../game/platform/browser/composition/register_event_modules.js';
import { registerRewardModules } from '../game/platform/browser/composition/register_reward_modules.js';
import { registerRunModules } from '../game/platform/browser/composition/register_run_modules.js';
import { registerScreenModules } from '../game/platform/browser/composition/register_screen_modules.js';
import { registerTitleModules } from '../game/platform/browser/composition/register_title_modules.js';
import { registerCoreModules } from '../game/platform/browser/composition/register_core_runtime_modules.js';

describe('composition module registrars', () => {
  it('publishes a lazy codex facade instead of eagerly importing the full codex screen module', () => {
    const { CodexUI } = registerCodexModules();

    expect(CodexUI).toMatchObject({
      __lazyModule: true,
      openCodex: expect.any(Function),
      closeCodex: expect.any(Function),
      setCodexTab: expect.any(Function),
      renderCodexContent: expect.any(Function),
    });
  });

  it('publishes a lazy event facade instead of eagerly importing the full event screen module', () => {
    const { EventUI } = registerEventModules();

    expect(EventUI).toMatchObject({
      __lazyModule: true,
      triggerRandomEvent: expect.any(Function),
      updateEventGoldBar: expect.any(Function),
      showEvent: expect.any(Function),
      resolveEvent: expect.any(Function),
      showShop: expect.any(Function),
      showRestSite: expect.any(Function),
      showCardDiscard: expect.any(Function),
      showItemShop: expect.any(Function),
      api: {
        showEvent: expect.any(Function),
        resolveEvent: expect.any(Function),
        showShop: expect.any(Function),
        showRestSite: expect.any(Function),
        showItemShop: expect.any(Function),
      },
    });
  });

  it('publishes a lazy reward facade instead of eagerly importing the full reward screen module', () => {
    const { RewardUI } = registerRewardModules();

    expect(RewardUI).toMatchObject({
      __lazyModule: true,
      showRewardScreen: expect.any(Function),
      takeRewardBlessing: expect.any(Function),
      takeRewardCard: expect.any(Function),
      takeRewardItem: expect.any(Function),
      takeRewardUpgrade: expect.any(Function),
      takeRewardRemove: expect.any(Function),
      showSkipConfirm: expect.any(Function),
      hideSkipConfirm: expect.any(Function),
      skipReward: expect.any(Function),
    });
  });

  it('merges run module capability slices directly from the run feature port', () => {
    expect(registerRunModules()).toEqual({
      MapUI: { id: 'map' },
      MazeSystem: { id: 'maze' },
      RunModeUI: { id: 'mode' },
      RunStartUI: { id: 'start' },
    });
    expect(runHoisted.createRunModuleCapabilities).toHaveBeenCalledTimes(1);
  });

  it('merges primary screen modules and overlay/meta modules', () => {
    expect(registerScreenModules()).toEqual({
      ScreenUI: { id: 'screen' },
      EventUI: { id: 'event' },
      HelpPauseUI: { id: 'help' },
      SettingsUI: { id: 'settings' },
    });
    expect(screenHoisted.buildScreenPrimaryModules).toHaveBeenCalledTimes(1);
    expect(screenHoisted.buildScreenOverlayModules).toHaveBeenCalledTimes(1);
  });

  it('merges title module capability slices directly from the title feature port', () => {
    expect(registerTitleModules()).toEqual({
      TitleCanvasUI: { id: 'title-canvas' },
      ClassSelectUI: { id: 'class-select' },
      GameBootUI: { id: 'boot' },
    });
    expect(titleHoisted.createTitleModuleCapabilities).toHaveBeenCalledTimes(1);
  });

  it('merges core engine, runtime bridge, and system module groups', () => {
    const modules = registerCoreModules();

    expect(coreHoisted.buildCoreEngineModules).toHaveBeenCalledTimes(1);
    expect(coreHoisted.buildCoreRuntimeBridgeModules).toHaveBeenCalledTimes(1);
    expect(coreHoisted.buildCoreSystemModules).toHaveBeenCalledTimes(1);
    expect(modules).toEqual({
      AudioEngine: { id: 'audio' },
      GS: { id: 'gs' },
      GAME: { id: 'game' },
      GameInit: { id: 'init' },
      RunRules: { id: 'rules' },
      SaveSystem: { id: 'save' },
    });
  });
});
