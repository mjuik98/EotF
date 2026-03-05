import { AudioEngine } from '../../../engine/audio.js';
import { ParticleSystem } from '../../../engine/particles.js';
import { ScreenShake } from '../../../engine/screenshake.js';
import { HitStop } from '../../../engine/hitstop.js';
import { FovEngine } from '../../../engine/fov.js';

import { DATA } from '../../../data/game_data.js';
import { NODE_META } from '../../data/node_meta.js';

import { GS } from '../game_state.js';
import { GAME, exposeGlobals } from '../global_bridge.js';
import { GameInit } from '../game_init.js';
import { GameAPI } from '../game_api.js';

import { DifficultyScaler } from '../../combat/difficulty_scaler.js';
import { ClassMechanics } from '../../combat/class_mechanics.js';

import { SetBonusSystem } from '../../systems/set_bonus_system.js';
import { SaveSystem } from '../../systems/save_system.js';
import {
  RunRules,
  getRegionData,
  getBaseRegionIndex,
  getRegionCount,
  finalizeRunOutcome,
} from '../../systems/run_rules.js';

import { RandomUtils } from '../../utils/random_utils.js';
import { CardCostUtils } from '../../utils/card_cost_utils.js';
import { DescriptionUtils } from '../../utils/description_utils.js';

import { TitleCanvasUI } from '../../ui/title/title_canvas_ui.js';
import { GameCanvasSetupUI } from '../../ui/title/game_canvas_setup_ui.js';
import { ClassSelectUI } from '../../ui/title/class_select_ui.js';
import { CharacterSelectUI } from '../../ui/title/character_select_ui.js';
import { GameBootUI } from '../../ui/title/game_boot_ui.js';

import { CombatStartUI } from '../../ui/combat/combat_start_ui.js';
import { CombatUI } from '../../ui/combat/combat_ui.js';
import { CombatHudUI } from '../../ui/combat/combat_hud_ui.js';
import { EchoSkillUI } from '../../ui/combat/echo_skill_ui.js';
import { CombatTurnUI } from '../../ui/combat/combat_turn_ui.js';
import { StatusEffectsUI } from '../../ui/combat/status_effects_ui.js';
import { CombatInfoUI } from '../../ui/combat/combat_info_ui.js';
import { CombatActionsUI } from '../../ui/combat/combat_actions_ui.js';

import { CardUI } from '../../ui/cards/card_ui.js';
import { CardTargetUI } from '../../ui/cards/card_target_ui.js';
import { TooltipUI } from '../../ui/cards/tooltip_ui.js';
import { DeckModalUI } from '../../ui/cards/deck_modal_ui.js';

import { HudUpdateUI } from '../../ui/hud/hud_update_ui.js';
import { FeedbackUI } from '../../ui/hud/feedback_ui.js';
import { DomValueUI } from '../../ui/hud/dom_value_ui.js';

import { WorldCanvasUI } from '../../ui/map/world_canvas_ui.js';
import { WorldRenderLoopUI } from '../../ui/map/world_render_loop_ui.js';
import { MapGenerationUI } from '../../ui/map/map_generation_ui.js';
import { MapNavigationUI } from '../../ui/map/map_navigation_ui.js';
import { MapUI } from '../../ui/map/map_ui.js';
import { MazeSystem } from '../../ui/map/maze_system_ui.js';
import { RegionTransitionUI } from '../../ui/map/region_transition_ui.js';

import { ScreenUI } from '../../ui/screens/screen_ui.js';
import { EventUI } from '../../ui/screens/event_ui.js';
import { RewardUI } from '../../ui/screens/reward_ui.js';
import { CodexUI } from '../../ui/screens/codex_ui.js';
import { StoryUI } from '../../ui/screens/story_ui.js';
import { MetaProgressionUI } from '../../ui/screens/meta_progression_ui.js';
import { HelpPauseUI } from '../../ui/screens/help_pause_ui.js';
import { SettingsUI } from '../../ui/screens/settings_ui.js';

import { RunModeUI } from '../../ui/run/run_mode_ui.js';
import { RunStartUI } from '../../ui/run/run_start_ui.js';
import { RunSetupUI } from '../../ui/run/run_setup_ui.js';
import { RunReturnUI } from '../../ui/run/run_return_ui.js';

/**
 * Builds a single module registry for composition root wiring.
 * Keeping this map out of main.js reduces entry-point fan-out.
 */
export function createModuleRegistry() {
  return {
    AudioEngine,
    ParticleSystem,
    ScreenShake,
    HitStop,
    FovEngine,

    DATA,
    NODE_META,

    GS,
    GAME,
    GameInit,
    GameAPI,
    exposeGlobals,

    DifficultyScaler,
    ClassMechanics,

    SetBonusSystem,
    SaveSystem,
    RunRules,
    getRegionData,
    getBaseRegionIndex,
    getRegionCount,
    finalizeRunOutcome,

    RandomUtils,
    CardCostUtils,
    DescriptionUtils,

    TitleCanvasUI,
    GameCanvasSetupUI,
    ClassSelectUI,
    CharacterSelectUI,
    GameBootUI,

    CombatStartUI,
    CombatUI,
    CombatHudUI,
    EchoSkillUI,
    CombatTurnUI,
    StatusEffectsUI,
    CombatInfoUI,
    CombatActionsUI,

    CardUI,
    CardTargetUI,
    TooltipUI,
    DeckModalUI,

    HudUpdateUI,
    FeedbackUI,
    DomValueUI,

    WorldCanvasUI,
    WorldRenderLoopUI,
    MapGenerationUI,
    MapNavigationUI,
    MapUI,
    MazeSystem,
    RegionTransitionUI,

    ScreenUI,
    EventUI,
    RewardUI,
    CodexUI,
    StoryUI,
    MetaProgressionUI,
    HelpPauseUI,
    SettingsUI,

    RunModeUI,
    RunStartUI,
    RunSetupUI,
    RunReturnUI,

    _gameStarted: false,
    _canvasRefs: null,
  };
}
