/**
 * enemies.js - enemy definitions.
 */

function makeBasicEnemy({
  id,
  name,
  icon,
  hp,
  atk,
  region,
  xp,
  gold,
  heavyBonus = 4,
  effectEvery = 0,
  effect = null,
  effectDmg = 0,
  effectIntent = '',
  comboEvery = 0,
  comboHits = 2,
  comboBonus = 0,
  comboIntent = '연속 공격',
  stunEvery = 0,
  stunBonus = 0,
  stunIntent = '기절 강타',
}) {
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
      if (stunEvery > 0 && turn % stunEvery === 0) {
        return {
          type: 'stun',
          intent: `${stunIntent} ${this.atk + stunBonus}`,
          dmg: this.atk + stunBonus,
          effect: 'stun',
        };
      }
      if (effect && effectEvery > 0 && turn % effectEvery === 0) {
        return { type: effect, intent: effectIntent || '특수', dmg: effectDmg, effect };
      }
      if (comboEvery > 0 && turn % comboEvery === 0) {
        const hits = Math.max(2, Math.floor(Number(comboHits) || 2));
        return {
          type: 'double',
          intent: `${comboIntent} ${this.atk + comboBonus} x${hits}`,
          dmg: this.atk + comboBonus,
          multi: hits,
        };
      }
      if (turn % 3 === 0) {
        return { type: 'heavy', intent: `강공 ${this.atk + heavyBonus}`, dmg: this.atk + heavyBonus };
      }
      return { type: 'strike', intent: `공격 ${this.atk}`, dmg: this.atk };
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
        return { type: 'elite_guard', intent: '수비 (+8 방어막)', dmg: 0, effect: 'self_shield' };
      }
      if (turn % 3 === 0) {
        return { type: 'elite_power', intent: `강타 ${this.atk + (cfg.heavyBonus ?? 8)}`, dmg: this.atk + (cfg.heavyBonus ?? 8) };
      }
      return { type: 'strike', intent: `정예 공격 ${this.atk}`, dmg: this.atk };
    },
  };
}

function makeMiniBossEnemy({
  id,
  name,
  icon,
  hp,
  atk,
  region,
  xp,
  gold,
  maxPhase = 2,
  specialEvery = 3,
  specialEffect = 'heal_15',
  specialBonus = 10,
  comboEvery = 0,
  comboHits = 2,
  comboBonus = 0,
  comboIntent = '연속 강습',
  stunEvery = 0,
  stunBonus = 0,
  stunIntent = '기절 내려찍기',
}) {
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
        return { type: 'phase_shift', intent: '위상 전환', dmg: 0, effect: 'phase_shift' };
      }
      if (this.phase === 2 && this.maxPhase >= 3 && this.hp < this.maxHp * 0.3) {
        return { type: 'phase_shift', intent: '위상 전환', dmg: 0, effect: 'phase_shift' };
      }
      if (stunEvery > 0 && turn % stunEvery === 0) {
        return {
          type: 'stun',
          intent: `${stunIntent} ${this.atk + stunBonus}`,
          dmg: this.atk + stunBonus,
          effect: 'stun',
        };
      }
      if (turn % specialEvery === 0) {
        return { type: 'mini_special', intent: `특수 공격 ${this.atk + specialBonus}`, dmg: this.atk + specialBonus, effect: specialEffect };
      }
      if (comboEvery > 0 && turn % comboEvery === 0) {
        const hits = Math.max(2, Math.floor(Number(comboHits) || 2));
        return {
          type: 'double',
          intent: `${comboIntent} ${this.atk + comboBonus} x${hits}`,
          dmg: this.atk + comboBonus,
          multi: hits,
        };
      }
      return { type: 'strike', intent: `미니보스 강습 ${this.atk + 3}`, dmg: this.atk + 3 };
    },
  };
}

function makeBossEnemy({
  id,
  name,
  icon,
  hp,
  atk,
  region,
  xp,
  gold,
  isHidden = false,
  maxPhase = 2,
  specialEvery = 3,
  specialEffect = 'drain_energy',
  specialBonus = 12,
  comboEvery = 0,
  comboHits = 2,
  comboBonus = 0,
  comboIntent = '연속 참격',
  stunEvery = 0,
  stunBonus = 0,
  stunIntent = '기절 제압',
}) {
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
        return { type: 'phase_shift', intent: '위상 전환', dmg: 0, effect: 'phase_shift' };
      }
      if (this.phase === 2 && this.maxPhase >= 3 && this.hp < this.maxHp * 0.3) {
        return { type: 'phase_shift', intent: '위상 전환', dmg: 0, effect: 'phase_shift' };
      }
      if (stunEvery > 0 && turn % stunEvery === 0) {
        return {
          type: 'stun',
          intent: `${stunIntent} ${this.atk + stunBonus}`,
          dmg: this.atk + stunBonus,
          effect: 'stun',
        };
      }
      if (turn % specialEvery === 0) {
        return { type: 'boss_special', intent: `보스 특수 ${this.atk + specialBonus}`, dmg: this.atk + specialBonus, effect: specialEffect };
      }
      if (comboEvery > 0 && turn % comboEvery === 0) {
        const hits = Math.max(2, Math.floor(Number(comboHits) || 2));
        return {
          type: 'double',
          intent: `${comboIntent} ${this.atk + comboBonus} x${hits}`,
          dmg: this.atk + comboBonus,
          multi: hits,
        };
      }
      return { type: 'strike', intent: `보스 공격 ${this.atk + 4}`, dmg: this.atk + 4 };
    },
  };
}

export const ENEMIES = {
  // Region 0
  slime: makeBasicEnemy({ id: 'slime', name: '슬라임', icon: '💧', hp: 20, atk: 5, region: 0, xp: 10, gold: 5 }),
  goblin: makeBasicEnemy({ id: 'goblin', name: '고블린', icon: '👺', hp: 25, atk: 6, region: 0, xp: 12, gold: 8 }),
  orc: makeBasicEnemy({ id: 'orc', name: '오크', icon: '👹', hp: 45, atk: 8, region: 0, xp: 20, gold: 12, effectEvery: 4, effect: 'self_shield', effectIntent: '수비 (+8 방어막)' }),
  fallen_knight: makeBasicEnemy({ id: 'fallen_knight', name: '타락한 기사', icon: '⚔️', hp: 55, atk: 12, region: 0, xp: 35, gold: 15 }),
  shadow_wolf: makeBasicEnemy({ id: 'shadow_wolf', name: '그림자 늑대', icon: '🐺', hp: 35, atk: 10, region: 0, xp: 18, gold: 10, comboEvery: 4, comboHits: 2, comboBonus: -2, comboIntent: '그림자 연속 물기' }),
  forest_wraith: makeBasicEnemy({ id: 'forest_wraith', name: '숲의 망령', icon: '👻', hp: 40, atk: 9, region: 0, xp: 22, gold: 12, effectEvery: 3, effect: 'weaken', effectIntent: '저주' }),
  moss_golem: makeBasicEnemy({ id: 'moss_golem', name: '이끼 골렘', icon: '🪨', hp: 50, atk: 9, region: 0, xp: 28, gold: 12, effectEvery: 4, effect: 'self_shield', effectIntent: '경화' }),
  echo_bat: makeBasicEnemy({ id: 'echo_bat', name: '잔향 박쥐', icon: '🦇', hp: 28, atk: 8, region: 0, xp: 18, gold: 7, effectEvery: 3, effect: 'weaken', effectIntent: '음파 공격' }),
  verdant_slayer: makeBasicEnemy({ id: 'verdant_slayer', name: '초록 학살자', icon: '🌲', hp: 32, atk: 9, region: 0, xp: 22, gold: 9 }),
  thistle_back: makeBasicEnemy({ id: 'thistle_back', name: '엉겅퀴 등피', icon: '🌵', hp: 40, atk: 7, region: 0, xp: 24, gold: 10, effectEvery: 2, effect: 'thorns', effectIntent: '가시 방어' }),
  elite_dire_wolf: makeEliteEnemy({ id: 'elite_dire_wolf', name: '【정예】다이어 울프', icon: '🐾', hp: 80, atk: 12, region: 0, xp: 50, gold: 30 }),
  elite_ancient_tree: makeEliteEnemy({ id: 'elite_ancient_tree', name: '【정예】고목 수호자', icon: '🌳', hp: 110, atk: 11, region: 0, xp: 75, gold: 40 }),
  elite_moss_monarch: makeEliteEnemy({ id: 'elite_moss_monarch', name: '【정예】이끼 군주', icon: '👑', hp: 90, atk: 12, region: 0, xp: 70, gold: 40 }),
  grove_behemoth: makeMiniBossEnemy({ id: 'grove_behemoth', name: '숲의 거수', icon: '🦬', hp: 130, atk: 13, region: 0, xp: 95, gold: 50, maxPhase: 2, specialEffect: 'self_shield', specialBonus: 8, stunEvery: 5, stunBonus: 0 }),
  ancient_echo: makeBossEnemy({ id: 'ancient_echo', name: '태고의 잔향', icon: '🌑', hp: 145, atk: 16, region: 0, xp: 120, gold: 50, maxPhase: 2, specialEffect: 'drain_echo' }),
  forest_guardian: makeBossEnemy({ id: 'forest_guardian', name: '숲의 수호자', icon: '🛡️', hp: 160, atk: 14, region: 0, xp: 140, gold: 60, maxPhase: 2, specialEffect: 'heal_12' }),

  // Region 1
  silent_sentinel: makeBasicEnemy({ id: 'silent_sentinel', name: '침묵 파수꾼', icon: '🗿', hp: 60, atk: 14, region: 1, xp: 40, gold: 18, effectEvery: 2, effect: 'add_noise', effectIntent: '소음 생성' }),
  noise_wraith: makeBasicEnemy({ id: 'noise_wraith', name: '소음 원령', icon: '📢', hp: 42, atk: 13, region: 1, xp: 38, gold: 16, effectEvery: 3, effect: 'add_noise', effectIntent: '소음 파동' }),
  iron_automaton: makeBasicEnemy({ id: 'iron_automaton', name: '철제 자동병', icon: '🤖', hp: 65, atk: 12, region: 1, xp: 42, gold: 20 }),
  rust_stalker: makeBasicEnemy({ id: 'rust_stalker', name: '녹슨 추적자', icon: '👤', hp: 38, atk: 11, region: 1, xp: 35, gold: 14, effectEvery: 3, effect: 'poison_3', effectIntent: '맹독 찌르기' }),
  brass_guardian: makeBasicEnemy({ id: 'brass_guardian', name: '황동 수호병', icon: '🛡️', hp: 70, atk: 10, region: 1, xp: 40, gold: 18, effectEvery: 3, effect: 'self_shield', effectIntent: '황동 방어' }),
  silent_shade: makeBasicEnemy({ id: 'silent_shade', name: '침묵의 그림자', icon: '🌑', hp: 35, atk: 12, region: 1, xp: 32, gold: 13, effectEvery: 2, effect: 'dodge', effectIntent: '은신', stunEvery: 5, stunBonus: -1, stunIntent: '암습 기절' }),
  elite_silence_herald: makeEliteEnemy({ id: 'elite_silence_herald', name: '【정예】침묵 사도', icon: '🗿', hp: 95, atk: 16, region: 1, xp: 70, gold: 38 }),
  elite_gear_titan: makeEliteEnemy({ id: 'elite_gear_titan', name: '【정예】톱니 타이탄', icon: '⚙️', hp: 120, atk: 15, region: 1, xp: 80, gold: 45 }),
  elite_echo_judge: makeEliteEnemy({ id: 'elite_echo_judge', name: '【정예】잔향 심판관', icon: '⚖️', hp: 100, atk: 14, region: 1, xp: 75, gold: 40 }),
  hush_enforcer: makeMiniBossEnemy({ id: 'hush_enforcer', name: '정적 집행자', icon: '🔕', hp: 165, atk: 16, region: 1, xp: 112, gold: 60, maxPhase: 2, specialEffect: 'add_noise', specialBonus: 9, comboEvery: 4, comboHits: 2, comboBonus: -2, comboIntent: '정적 연타' }),
  silent_tyrant: makeBossEnemy({ id: 'silent_tyrant', name: '침묵의 폭군', icon: '🗣️', hp: 200, atk: 17, region: 1, xp: 130, gold: 55, maxPhase: 2, specialEffect: 'add_noise' }),
  clockwork_emperor: makeBossEnemy({ id: 'clockwork_emperor', name: '태엽 황제', icon: '⚙️', hp: 220, atk: 18, region: 1, xp: 150, gold: 70, maxPhase: 2, specialEffect: 'heal_15', comboEvery: 4, comboHits: 2, comboBonus: -2, comboIntent: '태엽 난타' }),

  // Region 2
  memory_specter: makeBasicEnemy({ id: 'memory_specter', name: '기억의 환령', icon: '👁️', hp: 72, atk: 15, region: 2, xp: 45, gold: 20, effectEvery: 4, effect: 'exhaust_card', effectIntent: '기억 탈취' }),
  nightmare_hound: makeBasicEnemy({ id: 'nightmare_hound', name: '악몽의 사냥개', icon: '🐕', hp: 68, atk: 15, region: 2, xp: 42, gold: 18, comboEvery: 4, comboHits: 2, comboBonus: -1, comboIntent: '악몽 연속 찢기' }),
  phantom_soldier: makeBasicEnemy({ id: 'phantom_soldier', name: '환영 병사', icon: '👤', hp: 65, atk: 14, region: 2, xp: 44, gold: 18, effectEvery: 2, effect: 'dodge', effectIntent: '위상 이동' }),
  memory_thief: makeBasicEnemy({ id: 'memory_thief', name: '기억 도둑', icon: '👤', hp: 70, atk: 15, region: 2, xp: 48, gold: 30, effectEvery: 4, effect: 'exhaust_card', effectIntent: '탈취' }),
  mirror_shade: makeBasicEnemy({ id: 'mirror_shade', name: '거울 그림자', icon: '🪞', hp: 75, atk: 14, region: 2, xp: 52, gold: 22, effectEvery: 2, effect: 'thorns', effectIntent: '반사' }),
  labyrinth_shade: makeBasicEnemy({ id: 'labyrinth_shade', name: '미궁의 그림자', icon: '🌑', hp: 70, atk: 14, region: 2, xp: 46, gold: 20, effectEvery: 2, effect: 'dodge', effectIntent: '은폐' }),
  nightmare_specter: makeBasicEnemy({ id: 'nightmare_specter', name: '악몽의 망령', icon: '👻', hp: 78, atk: 16, region: 2, xp: 50, gold: 22 }),
  elite_memory_lich: makeEliteEnemy({ id: 'elite_memory_lich', name: '【정예】기억 리치', icon: '💀', hp: 145, atk: 18, region: 2, xp: 85, gold: 50 }),
  elite_maze_master: makeEliteEnemy({ id: 'elite_maze_master', name: '【정예】미궁 주권자', icon: '🌀', hp: 160, atk: 20, region: 2, xp: 95, gold: 60 }),
  elite_soul_reaper: makeEliteEnemy({ id: 'elite_soul_reaper', name: '【정예】영혼 수확자', icon: '⚔️', hp: 155, atk: 22, region: 2, xp: 100, gold: 65 }),
  labyrinth_heart: makeMiniBossEnemy({ id: 'labyrinth_heart', name: '미궁의 심장', icon: '🧿', hp: 240, atk: 21, region: 2, xp: 140, gold: 75, maxPhase: 2, specialEffect: 'exhaust_card', specialBonus: 10, stunEvery: 5, stunBonus: 0 }),
  memory_sovereign: makeBossEnemy({ id: 'memory_sovereign', name: '기억의 군주', icon: '👑', hp: 320, atk: 24, region: 2, xp: 170, gold: 85, maxPhase: 3, specialEffect: 'drain_echo', stunEvery: 5, stunBonus: 0 }),
  memory_weaver: makeBossEnemy({ id: 'memory_weaver', name: '기억의 직조자', icon: '🕸️', hp: 280, atk: 22, region: 2, xp: 160, gold: 80, maxPhase: 2, specialEffect: 'exhaust_card' }),

  // Region 3
  divine_remnant: makeBasicEnemy({ id: 'divine_remnant', name: '신의 잔재', icon: '⚡', hp: 90, atk: 18, region: 3, xp: 50, gold: 22, effectEvery: 5, effect: 'drain_energy', effectIntent: '심판' }),
  cursed_paladin: makeBasicEnemy({ id: 'cursed_paladin', name: '저주받은 기사단', icon: '⚔️', hp: 85, atk: 16, region: 3, xp: 48, gold: 22, comboEvery: 4, comboHits: 2, comboBonus: 0, comboIntent: '저주 연속 참격' }),
  tomb_guardian: makeBasicEnemy({ id: 'tomb_guardian', name: '무덤 파수병', icon: '🛡️', hp: 110, atk: 14, region: 3, xp: 45, gold: 20, effectEvery: 3, effect: 'self_shield', effectIntent: '석화 방어', stunEvery: 6, stunBonus: 2, stunIntent: '석관 분쇄' }),
  holy_specter: makeBasicEnemy({ id: 'holy_specter', name: '성스러운 환령', icon: '✨', hp: 88, atk: 19, region: 3, xp: 55, gold: 24 }),
  holy_guardian: makeBasicEnemy({ id: 'holy_guardian', name: '성소 수호병', icon: '🏯', hp: 105, atk: 15, region: 3, xp: 46, gold: 21, effectEvery: 3, effect: 'self_shield', effectIntent: '성역 방어' }),
  divine_servant: makeBasicEnemy({ id: 'divine_servant', name: '신의 하인', icon: '🔅', hp: 95, atk: 17, region: 3, xp: 44, gold: 19, effectEvery: 4, effect: 'weaken', effectIntent: '속박의 빛' }),
  elite_fallen_deity: makeEliteEnemy({ id: 'elite_fallen_deity', name: '【정예】타락천사', icon: '👼', hp: 180, atk: 24, region: 3, xp: 90, gold: 55 }),
  elite_grave_lord: makeEliteEnemy({ id: 'elite_grave_lord', name: '【정예】무덤 군주', icon: '☠️', hp: 200, atk: 26, region: 3, xp: 100, gold: 60 }),
  elite_judgement_hand: makeEliteEnemy({ id: 'elite_judgement_hand', name: '【정예】심판의 손', icon: '🖐️', hp: 190, atk: 28, region: 3, xp: 95, gold: 58 }),
  sepulcher_arbiter: makeMiniBossEnemy({ id: 'sepulcher_arbiter', name: '묘지 중재자', icon: '⚱️', hp: 320, atk: 28, region: 3, xp: 145, gold: 74, maxPhase: 2, specialEffect: 'drain_energy', specialBonus: 11, stunEvery: 4, stunBonus: 1 }),
  divine_tyrant: makeBossEnemy({ id: 'divine_tyrant', name: '신의 심판관', icon: '⚖️', hp: 450, atk: 30, region: 3, xp: 160, gold: 75, maxPhase: 3, specialEffect: 'mass_debuff' }),
  grave_executor: makeBossEnemy({ id: 'grave_executor', name: '무덤의 집행자', icon: '🪓', hp: 400, atk: 28, region: 3, xp: 155, gold: 72, maxPhase: 2, specialEffect: 'lifesteal', comboEvery: 4, comboHits: 2, comboBonus: 0, comboIntent: '집행 연속 베기' }),

  // Region 4
  echo_devourer: makeBasicEnemy({ id: 'echo_devourer', name: '메아리 포식자', icon: '🌑', hp: 120, atk: 26, region: 4, xp: 60, gold: 30, effectEvery: 3, effect: 'drain_echo', effectIntent: '잔향 포식' }),
  void_remnant: makeBasicEnemy({ id: 'void_remnant', name: '허공의 잔재', icon: '🌌', hp: 110, atk: 24, region: 4, xp: 52, gold: 26, effectEvery: 3, effect: 'drain_echo', effectIntent: '공허 흡수' }),
  void_eye_enemy: makeBasicEnemy({ id: 'void_eye_enemy', name: '허공의 눈', icon: '👁️', hp: 115, atk: 26, region: 4, xp: 58, gold: 32, effectEvery: 3, effect: 'weaken_vulnerable', effectIntent: '심연의 시선', stunEvery: 6, stunBonus: 0, stunIntent: '심연 응시' }),
  void_walker: makeBasicEnemy({ id: 'void_walker', name: '허공 보행자', icon: '🚶', hp: 110, atk: 28, region: 4, xp: 62, gold: 35, effectEvery: 2, effect: 'dodge', effectIntent: '점멸', comboEvery: 5, comboHits: 2, comboBonus: -4, comboIntent: '점멸 연타' }),
  reality_shredder: makeBasicEnemy({ id: 'reality_shredder', name: '현실 파쇄자', icon: '🌪️', hp: 140, atk: 32, region: 4, xp: 70, gold: 40, effectEvery: 4, effect: 'drain_echo', effectIntent: '현실 절단' }),
  void_core_fragment: makeBasicEnemy({ id: 'void_core_fragment', name: '허공 핵 파편', icon: '💠', hp: 120, atk: 24, region: 4, xp: 55, gold: 28, effectEvery: 3, effect: 'drain_echo', effectIntent: '맥동' }),
  elite_echo_colossus: makeEliteEnemy({ id: 'elite_echo_colossus', name: '【정예】잔향 거신', icon: '🌟', hp: 280, atk: 32, region: 4, xp: 120, gold: 70 }),
  elite_origin_guard: makeEliteEnemy({ id: 'elite_origin_guard', name: '【정예】근원 수호자', icon: '🛡️', hp: 320, atk: 30, region: 4, xp: 140, gold: 80 }),
  elite_void_templar: makeEliteEnemy({ id: 'elite_void_templar', name: '【정예】허공 기사', icon: '⚔️', hp: 300, atk: 30, region: 4, xp: 130, gold: 75 }),
  rift_collector: makeMiniBossEnemy({ id: 'rift_collector', name: '균열 수집자', icon: '🌀', hp: 480, atk: 35, region: 4, xp: 172, gold: 90, maxPhase: 3, specialEffect: 'drain_echo', specialBonus: 12, comboEvery: 4, comboHits: 2, comboBonus: -3, comboIntent: '균열 연속 절단' }),
  void_herald: makeBossEnemy({ id: 'void_herald', name: '허공의 사도', icon: '🌌', hp: 550, atk: 38, region: 4, xp: 200, gold: 100, maxPhase: 2, specialEffect: 'drain_echo' }),
  echo_origin: makeBossEnemy({ id: 'echo_origin', name: '잔향의 근원', icon: '🌟', hp: 750, atk: 50, region: 4, xp: 300, gold: 150, isHidden: true, maxPhase: 3, specialEffect: 'nullify_echo' }),

  // Region 5
  time_drifter: makeBasicEnemy({ id: 'time_drifter', name: '시간 표류자', icon: '⏳', hp: 55, atk: 10, region: 5, xp: 46, gold: 22, effectEvery: 2, effect: 'heal_15', effectIntent: '되감기' }),
  echo_revenant: makeBasicEnemy({ id: 'echo_revenant', name: '잔향 망령', icon: '👻', hp: 70, atk: 13, region: 5, xp: 54, gold: 26, effectEvery: 3, effect: 'drain_echo', effectIntent: '잔향 흡수' }),
  loop_warden: makeBasicEnemy({ id: 'loop_warden', name: '순환 감시자', icon: '🔁', hp: 90, atk: 15, region: 5, xp: 62, gold: 30, effectEvery: 2, effect: 'self_shield', effectIntent: '순환 방어' }),
  temporal_knight: makeBasicEnemy({ id: 'temporal_knight', name: '시계 기사', icon: '⚔️', hp: 80, atk: 14, region: 5, xp: 60, gold: 28 }),
  time_fracture: makeMiniBossEnemy({ id: 'time_fracture', name: '시간 균열', icon: '🕳️', hp: 180, atk: 18, region: 5, xp: 120, gold: 70, maxPhase: 3, specialEffect: 'heal_30', comboEvery: 4, comboHits: 2, comboBonus: -2, comboIntent: '시공 연속 붕괴' }),
  time_sovereign: makeBossEnemy({ id: 'time_sovereign', name: '시간의 군주', icon: '👑', hp: 260, atk: 20, region: 5, xp: 180, gold: 90, maxPhase: 2, specialEffect: 'drain_energy' }),
  echo_loop: makeBossEnemy({ id: 'echo_loop', name: '루프의 심장', icon: '♾️', hp: 300, atk: 22, region: 5, xp: 210, gold: 110, maxPhase: 3, specialEffect: 'lifesteal' }),

  // Region 6
  abyss_predator: makeBasicEnemy({ id: 'abyss_predator', name: '심연 포식자', icon: '🦈', hp: 75, atk: 16, region: 6, xp: 60, gold: 30, effectEvery: 2, effect: 'drain_echo', effectIntent: '잔향 파열' }),
  corroded_guardian: makeBasicEnemy({ id: 'corroded_guardian', name: '부식 수호병', icon: '🛡️', hp: 100, atk: 14, region: 6, xp: 70, gold: 34, effectEvery: 3, effect: 'self_shield', effectIntent: '부식 방어' }),
  tide_specter: makeBasicEnemy({ id: 'tide_specter', name: '조류 망령', icon: '🌊', hp: 65, atk: 12, region: 6, xp: 52, gold: 24, effectEvery: 3, effect: 'drain_energy', effectIntent: '조류 흡수' }),
  depth_stalker: makeBasicEnemy({ id: 'depth_stalker', name: '심해 추적자', icon: '🐙', hp: 85, atk: 18, region: 6, xp: 74, gold: 36 }),
  abyss_queen: makeMiniBossEnemy({ id: 'abyss_queen', name: '심연 여왕', icon: '👸', hp: 220, atk: 20, region: 6, xp: 150, gold: 80, maxPhase: 2, specialEffect: 'heal_15', stunEvery: 5, stunBonus: 1 }),
  tidal_herald: makeBossEnemy({ id: 'tidal_herald', name: '파도의 사도', icon: '🔱', hp: 300, atk: 23, region: 6, xp: 220, gold: 120, maxPhase: 2, specialEffect: 'drain_energy' }),
  deep_origin: makeBossEnemy({ id: 'deep_origin', name: '심해의 근원', icon: '🌌', hp: 350, atk: 25, region: 6, xp: 280, gold: 150, isHidden: true, maxPhase: 3, specialEffect: 'drain_echo', stunEvery: 5, stunBonus: 1 }),
};
