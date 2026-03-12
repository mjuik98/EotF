import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const EXACT_REEXPORTS = new Map([
  [
    'game/ui/map/map_navigation_ui.js',
    "export { MapNavigationUI } from '../../features/run/presentation/browser/map_navigation_ui.js';\n",
  ],
  [
    'game/ui/map/map_ui.js',
    "export { MapUI } from '../../features/run/presentation/browser/map_ui.js';\n",
  ],
  [
    'game/ui/map/maze_system_ui.js',
    "export { MazeSystem } from '../../features/run/presentation/browser/maze_system_ui.js';\n",
  ],
  [
    'game/ui/map/world_canvas_ui.js',
    "export { WorldCanvasUI } from '../../features/run/presentation/browser/world_canvas_ui.js';\n",
  ],
  [
    'game/ui/map/world_render_loop_ui.js',
    "export { WorldRenderLoopUI } from '../../features/run/presentation/browser/world_render_loop_ui.js';\n",
  ],
  [
    'game/ui/hud/dom_value_ui.js',
    "export { DomValueUI } from '../../features/combat/presentation/browser/dom_value_ui.js';\n",
  ],
  [
    'game/ui/hud/feedback_ui.js',
    "export { FeedbackUI } from '../../features/combat/presentation/browser/feedback_ui.js';\n",
  ],
  [
    'game/ui/hud/hud_update_ui.js',
    "export { HudUpdateUI } from '../../features/combat/presentation/browser/hud_update_ui.js';\n",
  ],
  [
    'game/ui/effects/echo_ripple_transition.js',
    "export { startEchoRippleDissolve } from '../../platform/browser/effects/echo_ripple_transition.js';\n",
  ],
  [
    'game/ui/title/class_select_ui.js',
    "export { ClassSelectUI } from '../../features/title/presentation/browser/class_select_ui.js';\n",
  ],
  [
    'game/ui/title/character_select_ui.js',
    "export { CharacterSelectUI } from '../../features/title/presentation/browser/character_select_ui.js';\n",
  ],
  [
    'game/ui/title/game_boot_ui.js',
    "export { GameBootUI } from '../../features/title/presentation/browser/game_boot_ui.js';\n",
  ],
  [
    'game/ui/title/title_canvas_ui.js',
    "export { TitleCanvasUI } from '../../features/title/presentation/browser/title_canvas_ui.js';\n",
  ],
  [
    'game/ui/title/game_canvas_setup_ui.js',
    "export { GameCanvasSetupUI } from '../../features/title/presentation/browser/game_canvas_setup_ui.js';\n",
  ],
  [
    'game/ui/title/intro_cinematic_ui.js',
    "export { IntroCinematicUI } from '../../features/title/presentation/browser/intro_cinematic_ui.js';\n",
  ],
  [
    'game/ui/title/level_up_popup_ui.js',
    "export { LevelUpPopupUI } from '../../features/title/presentation/browser/level_up_popup_ui.js';\n",
  ],
  [
    'game/ui/title/run_end_screen_ui.js',
    "export { RunEndScreenUI } from '../../features/title/presentation/browser/run_end_screen_ui.js';\n",
  ],
  [
    'game/ui/title/class_select_buttons_ui.js',
    "export { renderClassSelectButtons } from '../../features/title/platform/browser/class_select_buttons_ui.js';\n",
  ],
  [
    'game/ui/title/class_select_selection_ui.js',
    "export * from '../../features/title/platform/browser/class_select_selection_ui.js';\n",
  ],
  [
    'game/ui/title/class_select_tooltip_ui.js',
    "export * from '../../features/title/platform/browser/class_select_tooltip_ui.js';\n",
  ],
  [
    'game/ui/title/character_select_audio.js',
    "export { createCharacterSelectSfx } from '../../features/title/platform/browser/character_select_audio.js';\n",
  ],
  [
    'game/ui/title/character_select_fx.js',
    "export { setupCharacterCardFx } from '../../features/title/platform/browser/character_select_fx.js';\n",
  ],
  [
    'game/ui/title/character_select_bindings.js',
    "export * from '../../features/title/platform/browser/character_select_bindings.js';\n",
  ],
  [
    'game/ui/title/character_select_flow.js',
    "export * from '../../features/title/platform/browser/character_select_flow.js';\n",
  ],
  [
    'game/ui/title/character_select_modal.js',
    "export * from '../../features/title/platform/browser/character_select_modal.js';\n",
  ],
  [
    'game/ui/title/character_select_summary_replay.js',
    "export { createCharacterSummaryReplay } from '../../features/title/platform/browser/character_select_summary_replay.js';\n",
  ],
  [
    'game/ui/run/run_mode_ui.js',
    "export { RunModeUI } from '../../features/run/presentation/browser/run_mode_ui.js';\n",
  ],
  [
    'game/ui/run/run_start_ui.js',
    "export { RunStartUI } from '../../features/run/presentation/browser/run_start_ui.js';\n",
  ],
  [
    'game/ui/run/run_setup_ui.js',
    "export { RunSetupUI } from '../../features/run/presentation/browser/run_setup_ui.js';\n",
  ],
  [
    'game/ui/run/run_return_ui.js',
    "export { RunReturnUI } from '../../features/run/presentation/browser/run_return_ui.js';\n",
  ],
  [
    'game/ui/combat/combat_start_ui.js',
    "export { CombatStartUI } from '../../features/combat/presentation/browser/combat_start_ui.js';\n",
  ],
  [
    'game/ui/combat/combat_ui.js',
    "export {\n  CombatUI,\n  ENEMY_STATUS_DESC,\n  ENEMY_STATUS_KR,\n  resolveEnemyStatusTooltipMetrics,\n} from '../../features/combat/presentation/browser/combat_ui.js';\n",
  ],
  [
    'game/ui/combat/combat_hud_ui.js',
    "export { CombatHudUI } from '../../features/combat/presentation/browser/combat_hud_ui.js';\n",
  ],
  [
    'game/ui/combat/echo_skill_ui.js',
    "export { EchoSkillUI } from '../../features/combat/presentation/browser/echo_skill_ui.js';\n",
  ],
  [
    'game/ui/combat/status_effects_ui.js',
    "export {\n  resolvePlayerStatusTooltipMetrics,\n  StatusEffectsUI,\n} from '../../features/combat/presentation/browser/status_effects_ui.js';\n",
  ],
  [
    'game/ui/combat/combat_info_ui.js',
    "export { CombatInfoUI } from '../../features/combat/presentation/browser/combat_info_ui.js';\n",
  ],
  [
    'game/ui/combat/combat_actions_ui.js',
    "export { CombatActionsUI } from '../../features/combat/presentation/browser/combat_actions_ui.js';\n",
  ],
  [
    'game/ui/cards/card_ui.js',
    "export { CardUI } from '../../features/combat/presentation/browser/card_ui.js';\n",
  ],
  [
    'game/ui/cards/card_target_ui.js',
    "export { CardTargetUI } from '../../features/combat/presentation/browser/card_target_ui.js';\n",
  ],
  [
    'game/ui/cards/tooltip_ui.js',
    "export { TooltipUI } from '../../features/combat/presentation/browser/tooltip_ui.js';\n",
  ],
  [
    'game/ui/cards/deck_modal_ui.js',
    "export { DeckModalUI } from '../../features/combat/presentation/browser/deck_modal_ui.js';\n",
  ],
  [
    'game/presentation/combat/combat_turn_ui.js',
    "export { CombatTurnUI } from '../../features/combat/presentation/browser/combat_turn_ui.js';\n",
  ],
  [
    'game/ui/screens/screen_ui.js',
    "export { ScreenUI } from '../../features/ui/presentation/browser/screen_ui.js';\n",
  ],
  [
    'game/ui/screens/ending_screen_ui.js',
    "export { EndingScreenUI } from '../../features/ui/presentation/browser/ending_screen_ui.js';\n",
  ],
  [
    'game/ui/screens/story_ui.js',
    "export { StoryUI } from '../../features/ui/presentation/browser/story_ui.js';\n",
  ],
  [
    'game/ui/screens/meta_progression_ui.js',
    "export { MetaProgressionUI } from '../../features/ui/presentation/browser/meta_progression_ui.js';\n",
  ],
  [
    'game/ui/screens/help_pause_ui.js',
    "export { HelpPauseUI } from '../../features/ui/presentation/browser/help_pause_ui.js';\n",
  ],
  [
    'game/ui/screens/settings_ui.js',
    "export { SettingsUI } from '../../features/ui/presentation/browser/settings_ui.js';\n",
  ],
  [
    'game/ui/screens/codex_ui.js',
    "export { CodexUI } from '../../features/codex/presentation/browser/codex_ui.js';\n",
  ],
]);

describe('ui feature entry compat reexports', () => {
  it('keeps moved ui entrypoints as thin feature-local reexports', () => {
    for (const [file, expected] of EXACT_REEXPORTS) {
      const source = fs.readFileSync(path.join(process.cwd(), file), 'utf8');
      expect(source).toBe(expected);
    }
  });
});
