import { AudioEngine } from '../../../../engine/audio.js';
import { ParticleSystem } from '../../../../engine/particles.js';
import { ScreenShake } from '../../../../engine/screenshake.js';
import { HitStop } from '../../../../engine/hitstop.js';
import { FovEngine } from '../../../../engine/fov.js';
import { DATA } from '../../../../data/game_data.js';
import { NODE_META } from '../../../data/node_meta.js';
import { GS } from '../../../core/game_state.js';
import { GAME, exposeGlobals } from '../../legacy/global_bridge.js';
import { RootUIBindings as GameInit } from '../root_ui_bindings.js';
import { GameAPI } from '../../legacy/game_api_compat.js';
import { DifficultyScaler } from '../../../combat/difficulty_scaler.js';
import { ClassMechanics } from '../../../domain/class/class_mechanics.js';
import { SetBonusSystem } from '../../../systems/set_bonus_system.js';
import { SaveSystem } from '../../../systems/save_system.js';
import {
  RunRules,
  getRegionData,
  getBaseRegionIndex,
  getRegionCount,
  finalizeRunOutcome,
} from '../../../systems/run_rules.js';
import { RandomUtils } from '../../../utils/random_utils.js';
import { CardCostUtils } from '../../../utils/card_cost_utils.js';
import { DescriptionUtils } from '../../../utils/description_utils.js';
import { CustomCursor } from '../../../ui/common/custom_cursor.js';

export function registerCoreModules() {
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
    CustomCursor,
  };
}
