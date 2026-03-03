/**
 * enemies.js - enemy definitions.
 */

function makeBasicEnemy({ id, name, icon, hp, atk, region, xp, gold, heavyBonus = 4, effectEvery = 0, effect = null, effectDmg = 0, effectIntent = '' }) {
  return {
    id,
    name,
    icon,
    hp,
    maxHp: hp,
    atk,
    region,
    xp,
    gold,
    ai(turn) {
      if (effect && effectEvery > 0 && turn % effectEvery === 0) {
        return { type: effect, intent: effectIntent || 'Special', dmg: effectDmg, effect };
      }
      if (turn % 3 === 0) {
        return { type: 'heavy', intent: `Heavy ${this.atk + heavyBonus}`, dmg: this.atk + heavyBonus };
      }
      return { type: 'strike', intent: `Attack ${this.atk}`, dmg: this.atk };
    },
  };
}

function makeEliteEnemy(cfg) {
  const base = makeBasicEnemy({
    ...cfg,
    hp: cfg.hp,
    heavyBonus: cfg.heavyBonus ?? 8,
  });
  return {
    ...base,
    isElite: true,
    ai(turn) {
      if (turn % 4 === 0) {
        return { type: 'elite_guard', intent: 'Guard (+8 Shield)', dmg: 0, effect: 'self_shield' };
      }
      if (turn % 3 === 0) {
        return { type: 'elite_power', intent: `Power Strike ${this.atk + (cfg.heavyBonus ?? 8)}`, dmg: this.atk + (cfg.heavyBonus ?? 8) };
      }
      return { type: 'strike', intent: `Elite Attack ${this.atk}`, dmg: this.atk };
    },
  };
}

function makeMiniBossEnemy({ id, name, icon, hp, atk, region, xp, gold, maxPhase = 2, specialEvery = 3, specialEffect = 'heal_15', specialBonus = 10 }) {
  return {
    id,
    name,
    icon,
    hp,
    maxHp: hp,
    atk,
    region,
    xp,
    gold,
    isMiniBoss: true,
    maxPhase,
    phase: 1,
    ai(turn) {
      if (this.phase === 1 && this.maxPhase >= 2 && this.hp < this.maxHp * 0.6) {
        return { type: 'phase_shift', intent: 'Phase Shift', dmg: 0, effect: 'phase_shift' };
      }
      if (this.phase === 2 && this.maxPhase >= 3 && this.hp < this.maxHp * 0.3) {
        return { type: 'phase_shift', intent: 'Phase Shift', dmg: 0, effect: 'phase_shift' };
      }
      if (turn % specialEvery === 0) {
        return { type: 'mini_special', intent: `Special ${this.atk + specialBonus}`, dmg: this.atk + specialBonus, effect: specialEffect };
      }
      return { type: 'strike', intent: `Mini Boss Strike ${this.atk + 3}`, dmg: this.atk + 3 };
    },
  };
}

function makeBossEnemy({ id, name, icon, hp, atk, region, xp, gold, isHidden = false, maxPhase = 2, specialEvery = 3, specialEffect = 'drain_energy', specialBonus = 12 }) {
  return {
    id,
    name,
    icon,
    hp,
    maxHp: hp,
    atk,
    region,
    xp,
    gold,
    isBoss: true,
    isHidden,
    maxPhase,
    phase: 1,
    ai(turn) {
      if (this.phase === 1 && this.maxPhase >= 2 && this.hp < this.maxHp * 0.6) {
        return { type: 'phase_shift', intent: 'Phase Shift', dmg: 0, effect: 'phase_shift' };
      }
      if (this.phase === 2 && this.maxPhase >= 3 && this.hp < this.maxHp * 0.3) {
        return { type: 'phase_shift', intent: 'Phase Shift', dmg: 0, effect: 'phase_shift' };
      }
      if (turn % specialEvery === 0) {
        return { type: 'boss_special', intent: `Boss Special ${this.atk + specialBonus}`, dmg: this.atk + specialBonus, effect: specialEffect };
      }
      return { type: 'strike', intent: `Boss Attack ${this.atk + 4}`, dmg: this.atk + 4 };
    },
  };
}

export const ENEMIES = {
  // Region 0
  slime: makeBasicEnemy({ id: 'slime', name: 'Slime', icon: 'S', hp: 20, atk: 5, region: 0, xp: 10, gold: 5 }),
  goblin: makeBasicEnemy({ id: 'goblin', name: 'Goblin', icon: 'G', hp: 25, atk: 6, region: 0, xp: 12, gold: 8 }),
  orc: makeBasicEnemy({ id: 'orc', name: 'Orc', icon: 'O', hp: 45, atk: 8, region: 0, xp: 20, gold: 12, effectEvery: 4, effect: 'self_shield', effectIntent: 'Guard (+8 Shield)' }),
  fallen_knight: makeBasicEnemy({ id: 'fallen_knight', name: 'Fallen Knight', icon: 'K', hp: 55, atk: 12, region: 0, xp: 35, gold: 15 }),
  shadow_wolf: makeBasicEnemy({ id: 'shadow_wolf', name: 'Shadow Wolf', icon: 'W', hp: 35, atk: 10, region: 0, xp: 18, gold: 10 }),
  forest_wraith: makeBasicEnemy({ id: 'forest_wraith', name: 'Forest Wraith', icon: 'F', hp: 40, atk: 9, region: 0, xp: 22, gold: 12, effectEvery: 3, effect: 'weaken', effectIntent: 'Curse' }),
  moss_golem: makeBasicEnemy({ id: 'moss_golem', name: 'Moss Golem', icon: 'M', hp: 50, atk: 9, region: 0, xp: 28, gold: 12, effectEvery: 4, effect: 'self_shield', effectIntent: 'Harden' }),
  echo_bat: makeBasicEnemy({ id: 'echo_bat', name: 'Echo Bat', icon: 'B', hp: 28, atk: 8, region: 0, xp: 18, gold: 7, effectEvery: 3, effect: 'weaken', effectIntent: 'Screech' }),
  verdant_slayer: makeBasicEnemy({ id: 'verdant_slayer', name: 'Verdant Slayer', icon: 'V', hp: 32, atk: 9, region: 0, xp: 22, gold: 9 }),
  thistle_back: makeBasicEnemy({ id: 'thistle_back', name: 'Thistle Back', icon: 'T', hp: 40, atk: 7, region: 0, xp: 24, gold: 10, effectEvery: 2, effect: 'thorns', effectIntent: 'Thorn Guard' }),
  elite_dire_wolf: makeEliteEnemy({ id: 'elite_dire_wolf', name: 'Dire Wolf', icon: 'W', hp: 80, atk: 12, region: 0, xp: 50, gold: 30 }),
  elite_ancient_tree: makeEliteEnemy({ id: 'elite_ancient_tree', name: 'Ancient Tree', icon: 'T', hp: 110, atk: 11, region: 0, xp: 75, gold: 40 }),
  elite_moss_monarch: makeEliteEnemy({ id: 'elite_moss_monarch', name: 'Moss Monarch', icon: 'M', hp: 90, atk: 12, region: 0, xp: 70, gold: 40 }),
  ancient_echo: makeBossEnemy({ id: 'ancient_echo', name: 'Ancient Echo', icon: 'A', hp: 145, atk: 16, region: 0, xp: 120, gold: 50, maxPhase: 2, specialEffect: 'drain_echo' }),
  forest_guardian: makeBossEnemy({ id: 'forest_guardian', name: 'Forest Guardian', icon: 'F', hp: 160, atk: 14, region: 0, xp: 140, gold: 60, maxPhase: 2, specialEffect: 'heal_12' }),

  // Region 1
  silent_sentinel: makeBasicEnemy({ id: 'silent_sentinel', name: 'Silent Sentinel', icon: 'S', hp: 60, atk: 14, region: 1, xp: 40, gold: 18, effectEvery: 2, effect: 'add_noise', effectIntent: 'Noise' }),
  noise_wraith: makeBasicEnemy({ id: 'noise_wraith', name: 'Noise Wraith', icon: 'N', hp: 42, atk: 13, region: 1, xp: 38, gold: 16, effectEvery: 3, effect: 'add_noise', effectIntent: 'Noise Wave' }),
  iron_automaton: makeBasicEnemy({ id: 'iron_automaton', name: 'Iron Automaton', icon: 'I', hp: 65, atk: 12, region: 1, xp: 42, gold: 20 }),
  rust_stalker: makeBasicEnemy({ id: 'rust_stalker', name: 'Rust Stalker', icon: 'R', hp: 38, atk: 11, region: 1, xp: 35, gold: 14, effectEvery: 3, effect: 'poison_3', effectIntent: 'Toxic Stab' }),
  brass_guardian: makeBasicEnemy({ id: 'brass_guardian', name: 'Brass Guardian', icon: 'B', hp: 70, atk: 10, region: 1, xp: 40, gold: 18, effectEvery: 3, effect: 'self_shield', effectIntent: 'Brass Guard' }),
  silent_shade: makeBasicEnemy({ id: 'silent_shade', name: 'Silent Shade', icon: 'H', hp: 35, atk: 12, region: 1, xp: 32, gold: 13, effectEvery: 2, effect: 'dodge', effectIntent: 'Vanish' }),
  elite_silence_herald: makeEliteEnemy({ id: 'elite_silence_herald', name: 'Silence Herald', icon: 'H', hp: 95, atk: 16, region: 1, xp: 70, gold: 38 }),
  elite_gear_titan: makeEliteEnemy({ id: 'elite_gear_titan', name: 'Gear Titan', icon: 'T', hp: 120, atk: 15, region: 1, xp: 80, gold: 45 }),
  elite_echo_judge: makeEliteEnemy({ id: 'elite_echo_judge', name: 'Echo Judge', icon: 'J', hp: 100, atk: 14, region: 1, xp: 75, gold: 40 }),
  silent_tyrant: makeBossEnemy({ id: 'silent_tyrant', name: 'Silent Tyrant', icon: 'T', hp: 200, atk: 17, region: 1, xp: 130, gold: 55, maxPhase: 2, specialEffect: 'add_noise' }),
  clockwork_emperor: makeBossEnemy({ id: 'clockwork_emperor', name: 'Clockwork Emperor', icon: 'E', hp: 220, atk: 18, region: 1, xp: 150, gold: 70, maxPhase: 2, specialEffect: 'heal_15' }),

  // Region 2
  memory_specter: makeBasicEnemy({ id: 'memory_specter', name: 'Memory Specter', icon: 'M', hp: 50, atk: 14, region: 2, xp: 35, gold: 14, effectEvery: 4, effect: 'exhaust_card', effectIntent: 'Memory Steal' }),
  nightmare_hound: makeBasicEnemy({ id: 'nightmare_hound', name: 'Nightmare Hound', icon: 'N', hp: 44, atk: 13, region: 2, xp: 30, gold: 12 }),
  phantom_soldier: makeBasicEnemy({ id: 'phantom_soldier', name: 'Phantom Soldier', icon: 'P', hp: 40, atk: 12, region: 2, xp: 32, gold: 13, effectEvery: 2, effect: 'dodge', effectIntent: 'Phase' }),
  memory_thief: makeBasicEnemy({ id: 'memory_thief', name: 'Memory Thief', icon: 'T', hp: 44, atk: 13, region: 2, xp: 38, gold: 25, effectEvery: 4, effect: 'exhaust_card', effectIntent: 'Steal' }),
  mirror_shade: makeBasicEnemy({ id: 'mirror_shade', name: 'Mirror Shade', icon: 'R', hp: 48, atk: 12, region: 2, xp: 42, gold: 18, effectEvery: 2, effect: 'thorns', effectIntent: 'Reflect' }),
  labyrinth_shade: makeBasicEnemy({ id: 'labyrinth_shade', name: 'Labyrinth Shade', icon: 'L', hp: 46, atk: 12, region: 2, xp: 36, gold: 15, effectEvery: 2, effect: 'dodge', effectIntent: 'Hide' }),
  nightmare_specter: makeBasicEnemy({ id: 'nightmare_specter', name: 'Nightmare Specter', icon: 'S', hp: 52, atk: 14, region: 2, xp: 40, gold: 16 }),
  elite_memory_lich: makeEliteEnemy({ id: 'elite_memory_lich', name: 'Memory Lich', icon: 'L', hp: 100, atk: 15, region: 2, xp: 72, gold: 42 }),
  elite_maze_master: makeEliteEnemy({ id: 'elite_maze_master', name: 'Maze Master', icon: 'M', hp: 115, atk: 17, region: 2, xp: 85, gold: 50 }),
  elite_soul_reaper: makeEliteEnemy({ id: 'elite_soul_reaper', name: 'Soul Reaper', icon: 'R', hp: 110, atk: 18, region: 2, xp: 90, gold: 55 }),
  memory_sovereign: makeBossEnemy({ id: 'memory_sovereign', name: 'Memory Sovereign', icon: 'S', hp: 220, atk: 18, region: 2, xp: 150, gold: 70, maxPhase: 3, specialEffect: 'drain_echo' }),
  memory_weaver: makeBossEnemy({ id: 'memory_weaver', name: 'Memory Weaver', icon: 'W', hp: 190, atk: 16, region: 2, xp: 140, gold: 65, maxPhase: 2, specialEffect: 'exhaust_card' }),

  // Region 3
  divine_remnant: makeBasicEnemy({ id: 'divine_remnant', name: 'Divine Remnant', icon: 'D', hp: 70, atk: 15, region: 3, xp: 50, gold: 22, effectEvery: 5, effect: 'drain_energy', effectIntent: 'Judgment' }),
  cursed_paladin: makeBasicEnemy({ id: 'cursed_paladin', name: 'Cursed Paladin', icon: 'P', hp: 65, atk: 13, region: 3, xp: 48, gold: 22 }),
  tomb_guardian: makeBasicEnemy({ id: 'tomb_guardian', name: 'Tomb Guardian', icon: 'G', hp: 85, atk: 11, region: 3, xp: 45, gold: 20, effectEvery: 3, effect: 'self_shield', effectIntent: 'Stone Guard' }),
  holy_specter: makeBasicEnemy({ id: 'holy_specter', name: 'Holy Specter', icon: 'S', hp: 68, atk: 15, region: 3, xp: 55, gold: 24 }),
  holy_guardian: makeBasicEnemy({ id: 'holy_guardian', name: 'Holy Guardian', icon: 'H', hp: 80, atk: 12, region: 3, xp: 46, gold: 21, effectEvery: 3, effect: 'self_shield', effectIntent: 'Holy Shield' }),
  divine_servant: makeBasicEnemy({ id: 'divine_servant', name: 'Divine Servant', icon: 'V', hp: 72, atk: 13, region: 3, xp: 44, gold: 19, effectEvery: 4, effect: 'weaken', effectIntent: 'Binding Light' }),
  elite_fallen_deity: makeEliteEnemy({ id: 'elite_fallen_deity', name: 'Fallen Deity', icon: 'D', hp: 130, atk: 18, region: 3, xp: 90, gold: 55 }),
  elite_grave_lord: makeEliteEnemy({ id: 'elite_grave_lord', name: 'Grave Lord', icon: 'L', hp: 140, atk: 20, region: 3, xp: 100, gold: 60 }),
  elite_judgement_hand: makeEliteEnemy({ id: 'elite_judgement_hand', name: 'Judgement Hand', icon: 'H', hp: 135, atk: 21, region: 3, xp: 95, gold: 58 }),
  divine_tyrant: makeBossEnemy({ id: 'divine_tyrant', name: 'Divine Tyrant', icon: 'T', hp: 240, atk: 19, region: 3, xp: 160, gold: 75, maxPhase: 3, specialEffect: 'mass_debuff' }),
  grave_executor: makeBossEnemy({ id: 'grave_executor', name: 'Grave Executor', icon: 'X', hp: 210, atk: 19, region: 3, xp: 155, gold: 72, maxPhase: 2, specialEffect: 'lifesteal' }),

  // Region 4
  echo_devourer: makeBasicEnemy({ id: 'echo_devourer', name: 'Echo Devourer', icon: 'E', hp: 65, atk: 18, region: 4, xp: 60, gold: 30, effectEvery: 3, effect: 'drain_echo', effectIntent: 'Devour Echo' }),
  void_remnant: makeBasicEnemy({ id: 'void_remnant', name: 'Void Remnant', icon: 'V', hp: 55, atk: 16, region: 4, xp: 52, gold: 26, effectEvery: 3, effect: 'drain_echo', effectIntent: 'Void Drain' }),
  void_eye_enemy: makeBasicEnemy({ id: 'void_eye_enemy', name: 'Void Eye', icon: 'O', hp: 62, atk: 18, region: 4, xp: 58, gold: 32, effectEvery: 3, effect: 'weaken_vulnerable', effectIntent: 'Abyss Gaze' }),
  void_walker: makeBasicEnemy({ id: 'void_walker', name: 'Void Walker', icon: 'W', hp: 58, atk: 19, region: 4, xp: 62, gold: 35, effectEvery: 2, effect: 'dodge', effectIntent: 'Blink' }),
  reality_shredder: makeBasicEnemy({ id: 'reality_shredder', name: 'Reality Shredder', icon: 'R', hp: 75, atk: 21, region: 4, xp: 70, gold: 40, effectEvery: 4, effect: 'drain_echo', effectIntent: 'Reality Rend' }),
  void_core_fragment: makeBasicEnemy({ id: 'void_core_fragment', name: 'Void Core Fragment', icon: 'C', hp: 64, atk: 17, region: 4, xp: 55, gold: 28, effectEvery: 3, effect: 'drain_echo', effectIntent: 'Pulse' }),
  elite_echo_colossus: makeEliteEnemy({ id: 'elite_echo_colossus', name: 'Echo Colossus', icon: 'C', hp: 135, atk: 20, region: 4, xp: 120, gold: 70 }),
  elite_origin_guard: makeEliteEnemy({ id: 'elite_origin_guard', name: 'Origin Guard', icon: 'G', hp: 160, atk: 20, region: 4, xp: 140, gold: 80 }),
  elite_void_templar: makeEliteEnemy({ id: 'elite_void_templar', name: 'Void Templar', icon: 'T', hp: 155, atk: 19, region: 4, xp: 130, gold: 75 }),
  void_herald: makeBossEnemy({ id: 'void_herald', name: 'Void Herald', icon: 'H', hp: 280, atk: 20, region: 4, xp: 200, gold: 100, maxPhase: 2, specialEffect: 'drain_echo' }),
  echo_origin: makeBossEnemy({ id: 'echo_origin', name: 'Echo Origin', icon: 'O', hp: 320, atk: 22, region: 4, xp: 300, gold: 150, isHidden: true, maxPhase: 3, specialEffect: 'nullify_echo' }),

  // Region 5
  time_drifter: makeBasicEnemy({ id: 'time_drifter', name: 'Time Drifter', icon: 'T', hp: 55, atk: 10, region: 5, xp: 46, gold: 22, effectEvery: 2, effect: 'heal_15', effectIntent: 'Rewind' }),
  echo_revenant: makeBasicEnemy({ id: 'echo_revenant', name: 'Echo Revenant', icon: 'R', hp: 70, atk: 13, region: 5, xp: 54, gold: 26, effectEvery: 3, effect: 'drain_echo', effectIntent: 'Echo Drain' }),
  loop_warden: makeBasicEnemy({ id: 'loop_warden', name: 'Loop Warden', icon: 'L', hp: 90, atk: 15, region: 5, xp: 62, gold: 30, effectEvery: 2, effect: 'self_shield', effectIntent: 'Loop Guard' }),
  temporal_knight: makeBasicEnemy({ id: 'temporal_knight', name: 'Temporal Knight', icon: 'K', hp: 80, atk: 14, region: 5, xp: 60, gold: 28 }),
  time_fracture: makeMiniBossEnemy({ id: 'time_fracture', name: 'Time Fracture', icon: 'F', hp: 180, atk: 18, region: 5, xp: 120, gold: 70, maxPhase: 3, specialEffect: 'heal_30' }),
  time_sovereign: makeBossEnemy({ id: 'time_sovereign', name: 'Time Sovereign', icon: 'S', hp: 260, atk: 20, region: 5, xp: 180, gold: 90, maxPhase: 2, specialEffect: 'drain_energy' }),
  echo_loop: makeBossEnemy({ id: 'echo_loop', name: 'Heart Of Loop', icon: 'H', hp: 300, atk: 22, region: 5, xp: 210, gold: 110, maxPhase: 3, specialEffect: 'lifesteal' }),

  // Region 6
  abyss_predator: makeBasicEnemy({ id: 'abyss_predator', name: 'Abyss Predator', icon: 'A', hp: 75, atk: 16, region: 6, xp: 60, gold: 30, effectEvery: 2, effect: 'drain_echo', effectIntent: 'Echo Rend' }),
  corroded_guardian: makeBasicEnemy({ id: 'corroded_guardian', name: 'Corroded Guardian', icon: 'G', hp: 100, atk: 14, region: 6, xp: 70, gold: 34, effectEvery: 3, effect: 'self_shield', effectIntent: 'Corrode Guard' }),
  tide_specter: makeBasicEnemy({ id: 'tide_specter', name: 'Tide Specter', icon: 'Y', hp: 65, atk: 12, region: 6, xp: 52, gold: 24, effectEvery: 3, effect: 'drain_energy', effectIntent: 'Tide Drain' }),
  depth_stalker: makeBasicEnemy({ id: 'depth_stalker', name: 'Depth Stalker', icon: 'D', hp: 85, atk: 18, region: 6, xp: 74, gold: 36 }),
  abyss_queen: makeMiniBossEnemy({ id: 'abyss_queen', name: 'Abyss Queen', icon: 'Q', hp: 220, atk: 20, region: 6, xp: 150, gold: 80, maxPhase: 2, specialEffect: 'heal_15' }),
  tidal_herald: makeBossEnemy({ id: 'tidal_herald', name: 'Tidal Herald', icon: 'J', hp: 300, atk: 23, region: 6, xp: 220, gold: 120, maxPhase: 2, specialEffect: 'drain_energy' }),
  deep_origin: makeBossEnemy({ id: 'deep_origin', name: 'Deep Origin', icon: 'O', hp: 350, atk: 25, region: 6, xp: 280, gold: 150, isHidden: true, maxPhase: 3, specialEffect: 'drain_echo' }),
};
