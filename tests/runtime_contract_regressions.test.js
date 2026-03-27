import { describe, expect, it, vi } from 'vitest';

import * as codexUiHelpers from '../game/features/codex/presentation/browser/codex_ui_helpers.js';
import * as codexFilterHelpers from '../game/features/codex/presentation/browser/codex_ui_filter_helpers.js';
import * as codexStateHelpers from '../game/features/codex/presentation/browser/codex_ui_state_helpers.js';
import { createCombatActions } from '../game/features/combat/platform/browser/create_combat_actions.js';
import {
  buildCombatFlowContractPublicBuilders,
  CombatPublicSurface,
  createCombatCompatCapabilities,
} from '../game/features/combat/ports/public_surface.js';
import { buildCombatFlowContractBuilders } from '../game/features/combat/ports/contracts/build_combat_flow_contracts.js';
import { finishEventFlow, resolveEventChoiceFlow } from '../game/features/event/application/workflows/event_choice_flow.js';
import { startRestFillParticles } from '../game/features/event/presentation/browser/event_ui_particles.js';
import {
  attachGameStateRuntimeMethods,
  CardGameStateRuntimeMethods,
  CombatGameStateRuntimeMethods,
  CoreGameStateRuntimeMethods,
} from '../game/shared/state/game_state_runtime_methods.js';
import { createCharacterSelectRuntime } from '../game/features/title/application/create_character_select_runtime.js';
import { createUiModuleCapabilities } from '../game/features/ui/ports/public_module_capabilities.js';
import { burstEndingWisps, initEndingFx } from '../game/features/ui/presentation/browser/ending_screen_fx.js';
import { takeRewardClaimUseCase } from '../game/features/reward/application/claim_reward_use_case.js';
import * as hudPanelRuntimeHelpers from '../game/features/combat/presentation/browser/hud_panel_runtime_helpers.js';
import { updateActionButtons } from '../game/features/combat/presentation/browser/hud_panel_action_runtime_helpers.js';
import { updateItemPanels } from '../game/features/combat/presentation/browser/hud_panel_item_runtime_helpers.js';
import { updateRunModifierPanel } from '../game/features/combat/presentation/browser/hud_panel_modifier_runtime_helpers.js';
import { getAccessibleNextNodes } from '../game/features/run/presentation/browser/map_ui_next_nodes.js';
import { buildScreenPrimaryModules } from '../game/platform/browser/composition/build_screen_primary_modules.js';

describe('runtime contract regressions', () => {
  it('returns the shell-owned primary module capabilities at runtime', () => {
    expect(buildScreenPrimaryModules()).toEqual(createUiModuleCapabilities().primary);
  });

  it('exposes the character select runtime contract without depending on helper file layout', () => {
    const summaryReplay = { consumePendingSummaries: vi.fn() };
    const updateAll = vi.fn();
    const doc = {
      getElementById: vi.fn(() => ({ classList: { contains: () => false } })),
      querySelectorAll: vi.fn(() => []),
    };
    const runtime = createCharacterSelectRuntime(
      {
        doc,
        win: {},
        gs: { meta: {} },
      },
      {
        chars: [{
          class: 'paladin',
          title: 'Paladin',
          name: 'Guardian',
          accent: '#7CC8FF',
        }],
        createProgressionFacade: vi.fn(() => ({})),
        ensureMeta: vi.fn(),
        createSfx: vi.fn(() => ({ hover: vi.fn() })),
        setupBindings: vi.fn(() => vi.fn()),
        setupCardFx: vi.fn(() => vi.fn()),
        createFlow: vi.fn(() => ({
          go: vi.fn(),
          handleConfirm: vi.fn(),
        })),
        openSkillModal: vi.fn(),
        closeSkillModal: vi.fn(),
        createParticleRuntime: vi.fn(() => ({
          start: vi.fn(),
          stop: vi.fn(),
        })),
        createSummaryReplay: vi.fn(() => summaryReplay),
        LevelUpPopup: vi.fn(() => ({ destroy: vi.fn() })),
        RunEndScreen: vi.fn(() => ({ destroy: vi.fn() })),
        createMountRuntime: vi.fn(() => ({
          updateAll,
          renderPhase: vi.fn(),
          resolveClass: vi.fn(),
          saveProgressMeta: vi.fn(),
        })),
      },
    );

    runtime.onEnter();
    runtime.showPendingSummaries();

    expect(updateAll).toHaveBeenCalledTimes(2);
    expect(summaryReplay.consumePendingSummaries).toHaveBeenCalledTimes(1);
    expect(runtime.getSelectionSnapshot()).toEqual({
      index: 0,
      phase: 'select',
      classId: 'paladin',
      title: 'Paladin',
      name: 'Guardian',
      accent: '#7CC8FF',
    });
  });

  it('orchestrates success and failure reward-claim branches through the injected handlers', () => {
    const gs = {};
    const onFailure = vi.fn();
    const lockRewardFlowFn = vi.fn();
    const setRewardPickedState = vi.fn();
    const playRewardClaimFeedbackFn = vi.fn();
    const showItemToast = vi.fn();
    const scheduleRewardReturnFn = vi.fn();
    const failure = { success: false, reason: 'invalid-reward' };
    const success = {
      success: true,
      notification: {
        payload: { id: 'echo_bell' },
        options: { forceQueue: true },
      },
    };

    expect(takeRewardClaimUseCase({
      gs,
      data: {},
      rewardType: 'item',
      rewardId: 'bad_reward',
      claimRewardFn: vi.fn(() => failure),
      isRewardFlowLockedFn: vi.fn(() => false),
      lockRewardFlowFn,
      setRewardPickedState,
      playRewardClaimFeedbackFn,
      showItemToast,
      scheduleRewardReturnFn,
      onFailure,
    })).toEqual(failure);

    expect(onFailure).toHaveBeenCalledWith(failure);
    expect(lockRewardFlowFn).not.toHaveBeenCalled();

    expect(takeRewardClaimUseCase({
      gs,
      data: {},
      rewardType: 'item',
      rewardId: 'echo_bell',
      claimRewardFn: vi.fn(() => success),
      isRewardFlowLockedFn: vi.fn(() => false),
      lockRewardFlowFn,
      setRewardPickedState,
      playRewardClaimFeedbackFn,
      showItemToast,
      scheduleRewardReturnFn,
      returnFromReward: vi.fn(),
      feedbackDeps: { audioEngine: {} },
    })).toEqual(success);

    expect(lockRewardFlowFn).toHaveBeenCalledWith(gs);
    expect(setRewardPickedState).toHaveBeenCalledWith(true);
    expect(playRewardClaimFeedbackFn).toHaveBeenCalledWith({ audioEngine: {} });
    expect(showItemToast).toHaveBeenCalledWith(success.notification.payload, success.notification.options);
    expect(scheduleRewardReturnFn).toHaveBeenCalledWith({ returnFromReward: expect.any(Function) });
  });

  it('re-exports state and filter helpers through a stable codex ui helper surface', () => {
    expect(codexUiHelpers.ensureCodexState).toBe(codexStateHelpers.ensureCodexState);
    expect(codexUiHelpers.buildCodexProgress).toBe(codexStateHelpers.buildCodexProgress);
    expect(codexUiHelpers.applyCodexFilter).toBe(codexFilterHelpers.applyCodexFilter);
    expect(codexUiHelpers.getCodexFilterDefinitions).toBe(codexFilterHelpers.getCodexFilterDefinitions);
  });

  it('assembles turn, ui, player, and feedback actions into one runtime surface', () => {
    const startCombat = vi.fn();
    const renderCombatEnemies = vi.fn();
    const drawCard = vi.fn();
    const showTurnBanner = vi.fn();
    const ports = {
      getBaseCardDeps: vi.fn(() => ({ kind: 'card' })),
      getCardTargetDeps: vi.fn(() => ({ kind: 'target' })),
      getCombatDeps: vi.fn((extra = {}) => ({ kind: 'combat', ...extra })),
      getCombatTurnBaseDeps: vi.fn(() => ({ kind: 'turn' })),
      getFeedbackDeps: vi.fn(() => ({ kind: 'feedback' })),
      getHudDeps: vi.fn(() => ({ kind: 'hud' })),
    };
    const actions = createCombatActions(
      {
        CombatActionsUI: { drawCard },
        CombatHudUI: { showTurnBanner },
        CombatStartUI: { startCombat },
        CombatUI: { renderCombatEnemies },
      },
      {},
      ports,
    );

    actions.startCombat(true);
    actions.renderCombatEnemies(true);
    actions.drawCard();
    actions.showTurnBanner('player');

    expect(typeof actions.playCard).toBe('function');
    expect(typeof actions.showItemToast).toBe('function');
    expect(startCombat).toHaveBeenCalledWith(true, expect.objectContaining({
      kind: 'combat',
      shuffleArray: expect.any(Function),
    }));
    expect(renderCombatEnemies).toHaveBeenCalledWith(expect.objectContaining({
      kind: 'combat',
      forceFullRender: true,
      hideIntentTooltipHandlerName: 'hideIntentTooltip',
      selectTargetHandlerName: 'selectTarget',
      showIntentTooltipHandlerName: 'showIntentTooltip',
    }));
    expect(drawCard).toHaveBeenCalledWith(expect.objectContaining({
      kind: 'combat',
      gs: undefined,
    }));
    expect(showTurnBanner).toHaveBeenCalledWith('player', { kind: 'hud' });
  });

  it('exposes compat capabilities and flow builders through the public combat surface', () => {
    const compat = CombatPublicSurface.compat;
    const ctx = { gs: { combat: {} } };

    expect(compat).toEqual(createCombatCompatCapabilities());
    expect(Object.keys(compat).sort()).toEqual([
      'CardMethods',
      'CombatLifecycle',
      'CombatMethods',
      'DamageSystem',
      'DeathHandler',
      'TurnManager',
    ]);
    const publicBuilders = buildCombatFlowContractPublicBuilders(ctx);
    const directBuilders = buildCombatFlowContractBuilders(ctx);

    expect(Object.keys(publicBuilders)).toEqual(Object.keys(directBuilders));
    expect(publicBuilders.combatFlow).toBeTypeOf('function');
  });

  it('returns a safe fallback without canvas contexts and still exposes burst helpers', () => {
    const session = { cleanups: [] };
    const doc = {
      getElementById: vi.fn(() => null),
    };
    const wisps = [];

    expect(initEndingFx(doc, {}, session)).toEqual({ wisps: [] });
    expect(session.cleanups).toEqual([]);

    burstEndingWisps(wisps, 48, 64, 5);

    expect(wisps).toHaveLength(5);
    expect(wisps.every((wisp) => Number.isFinite(wisp.x) && Number.isFinite(wisp.y))).toBe(true);
  });

  it('guards missing runtime context and finishes event flow through the shared flow controls', () => {
    const clearCurrentEvent = vi.fn();
    const showGameplayScreen = vi.fn();
    const updateUI = vi.fn();
    const renderMinimap = vi.fn();
    const updateNextNodes = vi.fn();
    const gs = { _eventLock: true };

    expect(resolveEventChoiceFlow(0, {
      gs: null,
      event: {},
      doc: {},
    })).toBeNull();

    finishEventFlow(
      { getElementById: vi.fn(() => null) },
      gs,
      {
        flowUi: {
          dismissModal(_doc, onDone) {
            onDone?.();
          },
        },
        showGameplayScreen,
        updateNextNodes,
        updateUI,
        renderMinimap,
      },
      clearCurrentEvent,
    );

    expect(clearCurrentEvent).toHaveBeenCalledTimes(1);
    expect(gs._eventLock).toBe(false);
    expect(showGameplayScreen).toHaveBeenCalledTimes(1);
    expect(updateUI).toHaveBeenCalledTimes(1);
    expect(renderMinimap).toHaveBeenCalledTimes(1);
    expect(updateNextNodes).toHaveBeenCalledTimes(1);
  });

  it('returns a safe no-op controller when the particle canvas is unavailable', () => {
    const controller = startRestFillParticles({
      querySelector: () => null,
    });

    expect(typeof controller.setBoost).toBe('function');
    expect(typeof controller.stop).toBe('function');
    expect(() => controller.setBoost(0.75)).not.toThrow();
    expect(() => controller.stop()).not.toThrow();
  });

  it('attaches core methods by default and opt-in combat/card compat methods when requested', () => {
    const coreOnly = attachGameStateRuntimeMethods({ combat: { log: [] } });
    const full = attachGameStateRuntimeMethods({ combat: { log: [] } }, {
      includeCards: true,
      includeCombat: true,
    });
    const coreKey = Object.keys(CoreGameStateRuntimeMethods)[0];
    const combatKey = Object.keys(CombatGameStateRuntimeMethods)[0];
    const cardKey = Object.keys(CardGameStateRuntimeMethods)[0];

    expect(coreOnly).toHaveProperty(coreKey);
    expect(coreOnly).not.toHaveProperty(combatKey);
    expect(coreOnly).not.toHaveProperty(cardKey);

    expect(full).toHaveProperty(coreKey);
    expect(full).toHaveProperty(combatKey);
    expect(full).toHaveProperty(cardKey);
  });

  it('re-exports focused hud panel update helpers through one runtime surface', () => {
    expect(hudPanelRuntimeHelpers.updateActionButtons).toBe(updateActionButtons);
    expect(hudPanelRuntimeHelpers.updateItemPanels).toBe(updateItemPanels);
    expect(hudPanelRuntimeHelpers.updateRunModifierPanel).toBe(updateRunModifierPanel);
  });

  it('returns only accessible, unvisited nodes on the next floor', () => {
    expect(getAccessibleNextNodes({
      currentFloor: 2,
      mapNodes: [
        { floor: 2, accessible: true, visited: false, id: 'current' },
        { floor: 3, accessible: true, visited: false, id: 'combat' },
        { floor: 3, accessible: false, visited: false, id: 'locked' },
        { floor: 3, accessible: true, visited: true, id: 'visited' },
        { floor: 4, accessible: true, visited: false, id: 'later' },
      ],
    })).toEqual([
      { floor: 3, accessible: true, visited: false, id: 'combat' },
    ]);
  });
});
