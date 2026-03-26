import path from 'node:path';
import fs from 'node:fs';

import { describe, expect, it } from 'vitest';

import { ROOT, readText, walkJsFiles } from './helpers/guardrail_fs.js';

describe('coupling support facades', () => {
  it('removes the utils-to-shared hand runtime dependency from card cost utils', () => {
    const cardCostUtils = readText('game/utils/card_cost_utils.js');

    expect(cardCostUtils).not.toContain("../shared/state/hand_index_runtime_state.js");
  });

  it('funnels shared and utils browser support through ui feature support facades', () => {
    const uiFeatureSupport = readText('game/features/ui/ports/public_feature_support_capabilities.js');
    const uiSharedSupport = readText('game/features/ui/ports/public_shared_support_capabilities.js');
    const uiTextSupport = readText('game/features/ui/ports/public_text_support_capabilities.js');
    const uiDomSupport = readText('game/features/ui/ports/public_dom_support_capabilities.js');
    const uiLoggingSupport = readText('game/features/ui/ports/public_logging_support_capabilities.js');
    const uiCardMathSupport = readText('game/features/ui/ports/public_card_cost_support_capabilities.js');
    const uiTooltipSupport = readText('game/features/ui/ports/public_tooltip_support_capabilities.js');
    const uiAudioSupport = readText('game/features/ui/ports/public_audio_support_capabilities.js');
    const uiRuntimeDebugSupport = readText('game/features/ui/ports/public_runtime_debug_support_capabilities.js');
    const uiBindingSupport = readText('game/features/ui/ports/public_binding_ref_support_capabilities.js');
    const uiRewardReturnSupport = readText('game/features/ui/ports/public_reward_return_support_capabilities.js');
    const eventItemShop = readText('game/features/event/presentation/browser/event_ui_item_shop.js');
    const runBottomDock = readText('game/features/run/presentation/browser/map_bottom_dock.js');
    const titleClassButtons = readText('game/features/title/platform/browser/class_select_buttons_ui.js');
    const titleClassButtonBindings = readText('game/features/title/platform/browser/class_select_button_bindings.js');
    const runModeText = readText('game/features/run/presentation/browser/run_mode_text_highlight.js');
    const rewardOptionRenderers = readText('game/features/reward/presentation/browser/reward_ui_option_renderers.js');
    const rewardOptionBindings = readText('game/features/reward/presentation/browser/reward_ui_option_bindings.js');
    const classSelectTooltip = readText('game/features/title/platform/browser/class_select_tooltip_ui.js');
    const combatRuntimeDebug = readText('game/features/combat/ports/runtime_debug_snapshot.js');
    const rewardBindingRefs = readText('game/features/reward/ports/public_binding_ref_capabilities.js');

    expect(uiFeatureSupport).toContain("../../../utils/public_feature_support.js");
    expect(uiSharedSupport).toContain("../../../shared/public_feature_support.js");
    expect(uiTextSupport).toContain("../../../utils/public_feature_support.js");
    expect(uiDomSupport).toContain("../../../utils/public_feature_support.js");
    expect(uiLoggingSupport).toContain("../../../utils/public_feature_support.js");
    expect(uiCardMathSupport).toContain("../../../utils/public_feature_support.js");
    expect(uiTooltipSupport).toContain("../../../shared/public_feature_support.js");
    expect(uiAudioSupport).toContain("../../../shared/public_feature_support.js");
    expect(uiRuntimeDebugSupport).toContain("../../../shared/public_feature_support.js");
    expect(uiBindingSupport).toContain("../../../shared/public_feature_support.js");
    expect(uiRewardReturnSupport).toContain("../../../shared/public_feature_support.js");
    expect(eventItemShop).toContain("../../../ui/ports/public_dom_support_capabilities.js");
    expect(eventItemShop).toContain("../../../ui/ports/public_tooltip_support_capabilities.js");
    expect(runBottomDock).toContain("../../../ui/ports/public_dom_support_capabilities.js");
    expect(runModeText).toContain("../../../ui/ports/public_text_support_capabilities.js");
    expect(titleClassButtons).toContain("../../../ui/ports/public_text_support_capabilities.js");
    expect(titleClassButtonBindings).toContain("../../../ui/ports/public_tooltip_support_capabilities.js");
    expect(rewardOptionRenderers).toContain("../../../ui/ports/public_dom_support_capabilities.js");
    expect(rewardOptionBindings).toContain("../../../ui/ports/public_tooltip_support_capabilities.js");
    expect(classSelectTooltip).toContain("../../../ui/ports/public_dom_support_capabilities.js");
    expect(combatRuntimeDebug).toContain("../../ui/ports/public_runtime_debug_support_capabilities.js");
    expect(rewardBindingRefs).toContain("../../ui/ports/public_binding_ref_support_capabilities.js");
  });

  it('keeps broad ui support barrels compat-only for feature consumers', () => {
    const featureFiles = walkJsFiles(path.join(ROOT, 'game', 'features'))
      .map((fullPath) => path.relative(ROOT, fullPath).split(path.sep).join('/'))
      .filter((relPath) => !relPath.startsWith('game/features/ui/ports/'));

    const broadImportUsers = featureFiles.filter((relPath) => {
      const source = readText(relPath);
      return source.includes('public_feature_support_capabilities.js')
        || source.includes('public_shared_support_capabilities.js');
    });

    expect(broadImportUsers).toEqual([]);
  });

  it('keeps broad ui support barrels out of non-barrel game runtime source entirely', () => {
    const gameFiles = walkJsFiles(path.join(ROOT, 'game'))
      .map((fullPath) => path.relative(ROOT, fullPath).split(path.sep).join('/'))
      .filter((relPath) => !relPath.endsWith('game/features/ui/ports/public_feature_support_capabilities.js'))
      .filter((relPath) => !relPath.endsWith('game/features/ui/ports/public_shared_support_capabilities.js'));

    const broadImportUsers = gameFiles.filter((relPath) => {
      const source = readText(relPath);
      return source.includes('public_feature_support_capabilities.js')
        || source.includes('public_shared_support_capabilities.js');
    });

    expect(broadImportUsers).toEqual([]);
  });

  it('keeps narrow ui support ports on canonical support sources instead of broad barrels', () => {
    const uiPortFiles = walkJsFiles(path.join(ROOT, 'game', 'features', 'ui', 'ports'))
      .map((fullPath) => path.relative(ROOT, fullPath).split(path.sep).join('/'))
      .filter((relPath) => relPath.endsWith('_support_capabilities.js'))
      .filter((relPath) => !relPath.endsWith('public_feature_support_capabilities.js'))
      .filter((relPath) => !relPath.endsWith('public_shared_support_capabilities.js'));

    const barrelUsers = uiPortFiles.filter((relPath) => {
      const source = readText(relPath);
      return source.includes('./public_feature_support_capabilities.js')
        || source.includes('./public_shared_support_capabilities.js');
    });

    expect(barrelUsers).toEqual([]);
  });

  it('routes core, platform, and data support imports through local support facades', () => {
    const coreSharedSupport = readText('game/core/shared_support_capabilities.js');
    const coreAudioSupport = readText('game/core/audio_feedback_support_capabilities.js');
    const coreRewardReturnSupport = readText('game/core/reward_return_support_capabilities.js');
    const platformUtilities = readText('game/platform/browser/composition/build_core_utility_modules.js');
    const saveAdapter = readText('game/platform/storage/save_adapter.js');
    const dataSharedSupport = readText('data/runtime_shared_support.js');
    const dataHandStateSupport = readText('data/runtime_hand_state_support.js');
    const cardsData = readText('data/cards.js');
    const eventsData = readText('data/events_data.js');
    const itemsData = readText('data/items.js');
    const legacyCoreSupport = readText('game/platform/legacy/core_support/public_core_support_capabilities.js');
    const legacyStateActionSupport = readText('game/platform/legacy/core_support/public_state_action_support_capabilities.js');

    expect(coreSharedSupport).toContain('./audio_feedback_support_capabilities.js');
    expect(coreSharedSupport).toContain('./reward_return_support_capabilities.js');
    expect(coreAudioSupport).toContain("../shared/public_feature_support.js");
    expect(coreRewardReturnSupport).toContain("../shared/public_feature_support.js");
    expect(platformUtilities).toContain("../../../utils/public_feature_support.js");
    expect(saveAdapter).toContain("../../utils/public_feature_support.js");
    expect(dataSharedSupport).toContain("../game/shared/public_feature_support.js");
    expect(dataHandStateSupport).toContain("../game/shared/state/hand_index_runtime_state.js");
    expect(cardsData).toContain("./runtime_hand_state_support.js");
    expect(eventsData).toContain("./runtime_shared_support.js");
    expect(itemsData).toContain("./runtime_shared_support.js");
    expect(legacyCoreSupport).toContain('./public_state_action_support_capabilities.js');
    expect(legacyStateActionSupport).toContain("../../../core/store/state_actions.js");
  });

  it('keeps compat-only core support barrels out of runtime imports', () => {
    const gameFiles = walkJsFiles(path.join(ROOT, 'game'))
      .map((fullPath) => path.relative(ROOT, fullPath).split(path.sep).join('/'))
      .filter((relPath) => !relPath.endsWith('game/core/shared_support_capabilities.js'))
      .filter((relPath) => !relPath.endsWith('game/platform/legacy/core_support/public_core_support_capabilities.js'));

    const compatBarrelUsers = gameFiles.filter((relPath) => {
      const source = readText(relPath);
      return source.includes('shared_support_capabilities.js')
        || source.includes('public_core_support_capabilities.js');
    });

    expect(compatBarrelUsers).toEqual([]);
  });

  it('marks broad compat support barrels as deprecated-only surfaces', () => {
    const uiFeatureSupport = readText('game/features/ui/ports/public_feature_support_capabilities.js');
    const uiSharedSupport = readText('game/features/ui/ports/public_shared_support_capabilities.js');
    const coreSharedSupport = readText('game/core/shared_support_capabilities.js');
    const legacyCoreSupport = readText('game/platform/legacy/core_support/public_core_support_capabilities.js');

    for (const source of [
      uiFeatureSupport,
      uiSharedSupport,
      coreSharedSupport,
      legacyCoreSupport,
    ]) {
      expect(source).toContain('@deprecated');
      expect(source).toContain('compat-only');
    }
  });

  it('promotes deprecated compat barrel bans into the architecture policy', () => {
    const architecturePolicy = fs.readFileSync(
      path.join(ROOT, 'config', 'architecture_policy.json'),
      'utf8',
    );

    expect(architecturePolicy).toContain('"id": "runtime-no-deprecated-compat-barrels"');
    expect(architecturePolicy).toContain('"game/features/ui/ports/public_feature_support_capabilities.js"');
    expect(architecturePolicy).toContain('"game/features/ui/ports/public_shared_support_capabilities.js"');
    expect(architecturePolicy).toContain('"game/core/shared_support_capabilities.js"');
    expect(architecturePolicy).toContain('"game/platform/legacy/core_support/public_core_support_capabilities.js"');
  });
});
