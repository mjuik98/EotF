/**
 * main.js — Entry Point (순수 오케스트레이터)
 *
 * 책임: import 선언 → 모듈 조립 → 바인딩 셋업 → 부트 실행
 * 비즈니스 로직이나 래퍼 함수가 이 파일에 존재하지 않습니다.
 */

// ─── Engine ───
import { AudioEngine } from '../../engine/audio.js';
import { ParticleSystem } from '../../engine/particles.js';
import { ScreenShake } from '../../engine/screenshake.js';
import { HitStop } from '../../engine/hitstop.js';
import { FovEngine } from '../../engine/fov.js';

// ─── Data ───
import { DATA } from '../../data/game_data.js';
import { NODE_META } from '../data/node_meta.js';

// ─── Core ───
import { GS } from './game_state.js';
import { GAME, exposeGlobals } from './global_bridge.js';
import { GameInit } from './game_init.js';
import { GameAPI } from './game_api.js';

// ─── Combat ───
import { DifficultyScaler } from '../combat/difficulty_scaler.js';
import { ClassMechanics } from '../combat/class_mechanics.js';

// ─── Systems ───
import { SetBonusSystem } from '../systems/set_bonus_system.js';
import { SaveSystem } from '../systems/save_system.js';
import { RunRules, getRegionData, getBaseRegionIndex, getRegionCount, finalizeRunOutcome } from '../systems/run_rules.js';

// ─── Utils ───
import { RandomUtils } from '../utils/random_utils.js';
import { CardCostUtils } from '../utils/card_cost_utils.js';
import { DescriptionUtils } from '../utils/description_utils.js';

// ─── UI: Title ───
import { TitleCanvasUI } from '../ui/title/title_canvas_ui.js';
import { GameCanvasSetupUI } from '../ui/title/game_canvas_setup_ui.js';
import { ClassSelectUI } from '../ui/title/class_select_ui.js';
import { GameBootUI } from '../ui/title/game_boot_ui.js';

// ─── UI: Combat ───
import { CombatStartUI } from '../ui/combat/combat_start_ui.js';
import { CombatUI } from '../ui/combat/combat_ui.js';
import { CombatHudUI } from '../ui/combat/combat_hud_ui.js';
import { EchoSkillUI } from '../ui/combat/echo_skill_ui.js';
import { CombatTurnUI } from '../ui/combat/combat_turn_ui.js';
import { StatusEffectsUI } from '../ui/combat/status_effects_ui.js';
import { CombatInfoUI } from '../ui/combat/combat_info_ui.js';
import { CombatActionsUI } from '../ui/combat/combat_actions_ui.js';

// ─── UI: Cards ───
import { CardUI } from '../ui/cards/card_ui.js';
import { CardTargetUI } from '../ui/cards/card_target_ui.js';
import { TooltipUI } from '../ui/cards/tooltip_ui.js';
import { DeckModalUI } from '../ui/cards/deck_modal_ui.js';

// ─── UI: HUD ───
import { HudUpdateUI } from '../ui/hud/hud_update_ui.js';
import { FeedbackUI } from '../ui/hud/feedback_ui.js';
import { DomValueUI } from '../ui/hud/dom_value_ui.js';

// ─── UI: Map ───
import { WorldCanvasUI } from '../ui/map/world_canvas_ui.js';
import { WorldRenderLoopUI } from '../ui/map/world_render_loop_ui.js';
import { MapGenerationUI } from '../ui/map/map_generation_ui.js';
import { MapNavigationUI } from '../ui/map/map_navigation_ui.js';
import { MapUI } from '../ui/map/map_ui.js';
import { MazeSystem } from '../ui/map/maze_system_ui.js';
import { RegionTransitionUI } from '../ui/map/region_transition_ui.js';

// ─── UI: Screens ───
import { ScreenUI } from '../ui/screens/screen_ui.js';
import { EventUI } from '../ui/screens/event_ui.js';
import { RewardUI } from '../ui/screens/reward_ui.js';
import { CodexUI } from '../ui/screens/codex_ui.js';
import { StoryUI } from '../ui/screens/story_ui.js';
import { MetaProgressionUI } from '../ui/screens/meta_progression_ui.js';
import { HelpPauseUI } from '../ui/screens/help_pause_ui.js';

// ─── UI: Feedback ───

// ─── UI: Run ───
import { RunModeUI } from '../ui/run/run_mode_ui.js';
import { RunStartUI } from '../ui/run/run_start_ui.js';
import { RunSetupUI } from '../ui/run/run_setup_ui.js';
import { RunReturnUI } from '../ui/run/run_return_ui.js';

// ─── Architecture Modules ───
import { setupBindings } from './event_bindings.js';
import * as Deps from './deps_factory.js';
import { bootGame } from './init_sequence.js';

// ──────────────────────────────────────────────────────────────────────────────
//  ECHO OF THE FALLEN — Entry Point
// ──────────────────────────────────────────────────────────────────────────────

// 게임 시작 상태
let _gameStarted = false;

// 모든 모듈 참조를 하나의 객체로 조립
const modules = {
  // Engine
  AudioEngine, ParticleSystem, ScreenShake, HitStop, FovEngine,
  // Data
  DATA, NODE_META,
  // Core
  GS, GAME, GameInit, GameAPI, exposeGlobals,
  // Combat
  DifficultyScaler, ClassMechanics,
  // Systems
  SetBonusSystem, SaveSystem, RunRules,
  getRegionData, getBaseRegionIndex, getRegionCount, finalizeRunOutcome,
  // Utils
  RandomUtils, CardCostUtils, DescriptionUtils,
  // UI Modules
  TitleCanvasUI, GameCanvasSetupUI, ClassSelectUI, GameBootUI,
  CombatStartUI, CombatUI, CombatHudUI, EchoSkillUI, CombatTurnUI,
  StatusEffectsUI, CombatInfoUI, CombatActionsUI,
  CardUI, CardTargetUI, TooltipUI, DeckModalUI,
  HudUpdateUI, FeedbackUI, DomValueUI,
  WorldCanvasUI, WorldRenderLoopUI, MapGenerationUI, MapNavigationUI,
  MapUI, MazeSystem, RegionTransitionUI,
  ScreenUI, EventUI, RewardUI, CodexUI, StoryUI,
  MetaProgressionUI, HelpPauseUI,
  RunModeUI, RunStartUI, RunSetupUI, RunReturnUI,
  // State
  _gameStarted,
  _canvasRefs: null,
};

// Step 1: 래퍼 함수 + window/GAME 바인딩 셋업
const fns = setupBindings(modules);

// Step 2: 부트 시퀀스 실행
bootGame(modules, fns, Deps);

// updateNextNodes는 다른 모듈에서 import될 수 있으므로 export
export { fns };
export function updateNextNodes() { fns.updateNextNodes(); }
