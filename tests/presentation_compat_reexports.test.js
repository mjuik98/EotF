import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

describe('presentation compat re-exports', () => {
  it('keeps migrated combat presentation files as thin feature re-exports', () => {
    const files = {
      'game/presentation/combat/combat_enemy_list_presenter.js': [
        'export {',
        '  buildCombatEnemyHandlers,',
        '  cleanupCombatTooltips,',
        '  needsCombatEnemyFullRender,',
        '  renderCombatEnemyList,',
        "} from '../../features/combat/ports/public_presentation_capabilities.js';",
      ].join('\n'),
      'game/presentation/combat/combat_enemy_view_model_presenter.js': [
        'export {',
        '  buildEnemyHpText,',
        '  buildEnemyViewModel,',
        "} from '../../features/combat/ports/public_presentation_capabilities.js';",
      ].join('\n'),
      'game/presentation/combat/combat_turn_action_presenter.js': [
        'export {',
        '  dispatchCombatTurnUiAction,',
        '  playEnemyAttackHitUi,',
        '  playEnemyStatusTickEffects,',
        "} from '../../features/combat/ports/public_presentation_capabilities.js';",
      ].join('\n'),
      'game/presentation/combat/combat_turn_state_presenter.js': [
        'export {',
        '  cleanupCombatTurnTooltips,',
        '  setEnemyTurnUiState,',
        '  setPlayerTurnUiState,',
        '  showBossPhaseShiftUi,',
        '  syncCombatTurnEnergy,',
        "} from '../../features/combat/ports/public_presentation_capabilities.js';",
      ].join('\n'),
    };

    for (const [file, expected] of Object.entries(files)) {
      const source = fs.readFileSync(path.join(process.cwd(), file), 'utf8').trim();
      expect(source).toBe(expected);
    }
  });

  it('keeps reward screen compat runtimes as thin feature re-exports', () => {
    const rewardRuntimeSource = fs.readFileSync(
      path.join(process.cwd(), 'game/ui/screens/reward_ui_runtime.js'),
      'utf8',
    ).trim();
    const rewardScreenRuntimeSource = fs.readFileSync(
      path.join(process.cwd(), 'game/ui/screens/reward_ui_screen_runtime.js'),
      'utf8',
    ).trim();

    expect(rewardRuntimeSource).toBe([
      'export {',
      '  finishReward,',
      '  REWARD_CLAIM_KEY,',
      '  REWARD_SKIP_KEY,',
      '  skipRewardRuntime,',
      '  takeRewardBlessingRuntime,',
      '  takeRewardCardRuntime,',
      '  takeRewardItemRuntime,',
      '  takeRewardRemoveRuntime,',
      '  takeRewardUpgradeRuntime,',
      "} from '../../features/reward/ports/public_presentation_capabilities.js';",
    ].join('\n'));
    expect(rewardScreenRuntimeSource).toBe(
      "export { showRewardScreenRuntime } from '../../features/reward/ports/runtime/public_reward_runtime_surface.js';",
    );
  });
});
