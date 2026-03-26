import { describe, expect, it } from 'vitest';

import { readText } from './helpers/guardrail_fs.js';

describe('coupling support facades', () => {
  it('removes the utils-to-shared hand runtime dependency from card cost utils', () => {
    const cardCostUtils = readText('game/utils/card_cost_utils.js');

    expect(cardCostUtils).not.toContain("../shared/state/hand_index_runtime_state.js");
  });

  it('funnels shared and utils browser support through ui feature support facades', () => {
    const uiFeatureSupport = readText('game/features/ui/ports/public_feature_support_capabilities.js');
    const uiSharedSupport = readText('game/features/ui/ports/public_shared_support_capabilities.js');
    const eventItemShop = readText('game/features/event/presentation/browser/event_ui_item_shop.js');
    const runBottomDock = readText('game/features/run/presentation/browser/map_bottom_dock.js');
    const titleClassButtons = readText('game/features/title/platform/browser/class_select_buttons_ui.js');

    expect(uiFeatureSupport).toContain("../../../utils/public_feature_support.js");
    expect(uiSharedSupport).toContain("../../../shared/public_feature_support.js");
    expect(eventItemShop).toContain("../../../ui/ports/public_feature_support_capabilities.js");
    expect(eventItemShop).toContain("../../../ui/ports/public_shared_support_capabilities.js");
    expect(runBottomDock).toContain("../../../ui/ports/public_feature_support_capabilities.js");
    expect(titleClassButtons).toContain("../../../ui/ports/public_feature_support_capabilities.js");
    expect(titleClassButtons).toContain("../../../ui/ports/public_shared_support_capabilities.js");
  });

  it('routes core, platform, and data support imports through local support facades', () => {
    const coreSharedSupport = readText('game/core/shared_support_capabilities.js');
    const platformUtilities = readText('game/platform/browser/composition/build_core_utility_modules.js');
    const saveAdapter = readText('game/platform/storage/save_adapter.js');
    const dataSharedSupport = readText('data/runtime_shared_support.js');
    const dataHandStateSupport = readText('data/runtime_hand_state_support.js');
    const cardsData = readText('data/cards.js');
    const eventsData = readText('data/events_data.js');
    const itemsData = readText('data/items.js');
    const legacyCoreSupport = readText('game/platform/legacy/core_support/public_core_support_capabilities.js');

    expect(coreSharedSupport).toContain("../shared/public_feature_support.js");
    expect(platformUtilities).toContain("../../../utils/public_feature_support.js");
    expect(saveAdapter).toContain("../../utils/public_feature_support.js");
    expect(dataSharedSupport).toContain("../game/shared/public_feature_support.js");
    expect(dataHandStateSupport).toContain("../game/shared/state/hand_index_runtime_state.js");
    expect(cardsData).toContain("./runtime_hand_state_support.js");
    expect(eventsData).toContain("./runtime_shared_support.js");
    expect(itemsData).toContain("./runtime_shared_support.js");
    expect(legacyCoreSupport).toContain("../../../core/store/state_actions.js");
  });
});
