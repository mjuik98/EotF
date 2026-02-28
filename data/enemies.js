/**
 * enemies.js — 적 데이터
 */

export const ENEMIES = {
    // ── 잔향의 숲 추가 몬스터 ──
    slime: {
        id: 'slime', name: '점액질', icon: '💧', image: 'enemy_slime.png', hp: 20, maxHp: 20, atk: 5, region: 0, xp: 10, gold: 5,
        ai(turn) { return { type: 'strike', intent: `공격 ${this.atk}`, dmg: this.atk }; }
    },
    goblin: {
        id: 'goblin', name: '고블린', icon: '👺', image: 'enemy_goblin.png', hp: 25, maxHp: 25, atk: 6, region: 0, xp: 12, gold: 8,
        ai(turn) {
            if (turn % 3 === 0) return { type: 'scratch', intent: `할퀴기 ${this.atk + 2}`, dmg: this.atk + 2 };
            return { type: 'strike', intent: `단검 ${this.atk}`, dmg: this.atk };
        }
    },
    orc: {
        id: 'orc', name: '오크', icon: '👹', image: 'enemy_orc.png', hp: 45, maxHp: 45, atk: 8, region: 0, xp: 20, gold: 12,
        ai(turn) {
            if (turn % 4 === 0) return { type: 'block', intent: '방어 (방어도 5)', dmg: 0, effect: 'self_shield' };
            return { type: 'strike', intent: `도끼 ${this.atk}`, dmg: this.atk };
        }
    },
    shadow_wolf: {
        id: 'shadow_wolf', name: '그림자 늑대', icon: '🐺', image: 'enemy_shadow_wolf.png', hp: 35, maxHp: 35, atk: 10, region: 0, xp: 18, gold: 10,
        ai(turn) {
            if (turn % 2 === 0) return { type: 'bite', intent: `물기 ${this.atk + 3}`, dmg: this.atk + 3 };
            return { type: 'claw', intent: `발톱 ${this.atk}`, dmg: this.atk };
        }
    },
    forest_wraith: {
        id: 'forest_wraith', name: '숲의 망령', icon: '👻', image: 'enemy_forest_wraith.png', hp: 40, maxHp: 40, atk: 9, region: 0, xp: 22, gold: 12,
        ai(turn) {
            if (turn % 3 === 0) return { type: 'curse', intent: '저주 (약화 부여)', dmg: 0, effect: 'weaken' };
            return { type: 'strike', intent: `사령 공격 ${this.atk}`, dmg: this.atk };
        }
    },
    elite_dire_wolf: {
        id: 'elite_dire_wolf', name: '【정예】다이어 울프', icon: '🐾', image: 'enemy_elite_dire_wolf.png', hp: 80, maxHp: 80, atk: 12, region: 0, xp: 50, gold: 30, isElite: true,
        ai(turn) {
            if (turn % 3 === 0) return { type: 'howl', intent: '울부짖기 (공격력 증가)', dmg: 0, effect: 'self_atk_up' };
            if (turn % 2 === 0) return { type: 'rend', intent: `찢기 ${this.atk + 5} (출혈)`, dmg: this.atk + 5, effect: 'bleed' };
            return { type: 'strike', intent: `물어뜯기 ${this.atk}`, dmg: this.atk };
        }
    },
    fallen_knight: {
        id: 'fallen_knight', name: '타락한 기사', icon: '⚔️', image: 'enemy_fallen_knight.png', hp: 55, maxHp: 55, atk: 12, region: null, xp: 35, gold: 15,
        ai(turn) {
            if (turn % 3 === 0) return { type: 'guard', intent: '방패 방어 (방어도 8)', dmg: 0, effect: 'self_shield' };
            if (turn % 5 === 0) return { type: 'charge', intent: `돌진 ${this.atk + 8}`, dmg: this.atk + 8 };
            return { type: 'slash', intent: `베기 ${this.atk}`, dmg: this.atk };
        }
    },
    moss_golem: {
        id: 'moss_golem', name: '이끼 골렘', icon: '🪨', image: 'enemy_moss_golem.png', hp: 50, maxHp: 50, atk: 9, region: 0, xp: 28, gold: 12,
        ai(turn) {
            if (turn % 4 === 0) return { type: 'harden', intent: '굳기 (방어도 12)', dmg: 0, effect: 'self_shield' };
            if (turn % 3 === 0) return { type: 'slam', intent: `대지 강타 ${this.atk + 5}`, dmg: this.atk + 5 };
            return { type: 'strike', intent: `주먹질 ${this.atk}`, dmg: this.atk };
        }
    },
    echo_bat: {
        id: 'echo_bat', name: '잔향 박쥐', icon: '🦇', image: 'enemy_echo_bat.png', hp: 28, maxHp: 28, atk: 8, region: 0, xp: 18, gold: 7,
        ai(turn) {
            if (turn % 3 === 0) return { type: 'screech', intent: '음파 공격 (약화)', dmg: 5, effect: 'weaken' };
            if (turn % 2 === 0) return { type: 'dive', intent: `급강하 ${this.atk + 3}`, dmg: this.atk + 3 };
            return { type: 'bite', intent: `물기 ${this.atk}`, dmg: this.atk };
        }
    },
    verdant_slayer: {
        id: 'verdant_slayer', name: '초록 학살자', icon: '🌲', image: 'enemy_verdant_slayer.png', hp: 32, maxHp: 32, atk: 9, region: 0, xp: 22, gold: 9,
        ai(turn) {
            if (turn % 3 === 0) return { type: 'slash', intent: `연속 베기 ${this.atk}×2`, dmg: this.atk, multi: 2 };
            return { type: 'strike', intent: `찌르기 ${this.atk}`, dmg: this.atk };
        }
    },
    thistle_back: {
        id: 'thistle_back', name: '엉겅퀴 등피', icon: '🌵', image: 'enemy_thistle_back.png', hp: 40, maxHp: 40, atk: 7, region: 0, xp: 24, gold: 10,
        ai(turn) {
            if (turn % 2 === 0) return { type: 'thorns', intent: '가시 방어 (가시 4)', dmg: 0, effect: 'thorns' };
            return { type: 'slam', intent: `박치기 ${this.atk + 3}`, dmg: this.atk + 3 };
        }
    },
    elite_moss_monarch: {
        id: 'elite_moss_monarch', name: '【정예】이끼 군주', icon: '👑', image: 'enemy_elite_moss_monarch.png', hp: 90, maxHp: 90, atk: 12, region: 0, xp: 70, gold: 40, isElite: true,
        ai(turn) {
            if (turn % 4 === 0) return { type: 'command', intent: '군주의 포효 (전체 공격 강화)', dmg: 0, effect: 'all_atk_up' };
            if (turn % 3 === 0) return { type: 'stomp', intent: `대지 밟기 ${this.atk + 8} (기절)`, dmg: this.atk + 8, effect: 'stun' };
            return { type: 'slam', intent: `일격 ${this.atk + 4}`, dmg: this.atk + 4 };
        }
    },
    elite_ancient_tree: {
        id: 'elite_ancient_tree', name: '【정예】고목 수호자', icon: '🌳', image: 'enemy_elite_ancient_tree.png', hp: 110, maxHp: 110, atk: 11, region: 0, xp: 75, gold: 40, isElite: true,
        ai(turn) {
            if (turn % 5 === 0) return { type: 'spore', intent: '독 포자 (독3)', dmg: 8, effect: 'poison_3' };
            if (turn % 3 === 0) return { type: 'root', intent: '뿌리 속박 (에너지-1)', dmg: 10, effect: 'drain_energy' };
            if (turn % 4 === 0) return { type: 'regen', intent: '생명력 재생 (회복 15.)', dmg: 0, effect: 'self_heal_15' };
            return { type: 'branch', intent: `나뭇가지 ${this.atk}`, dmg: this.atk };
        }
    },
    forest_guardian: {
        id: 'forest_guardian', name: '숲의 수호자', icon: '🛡️', image: 'enemy_forest_guardian.png', hp: 160, maxHp: 160, atk: 14, region: 0, xp: 140, gold: 60, isBoss: true, maxPhase: 2,
        ai(turn) {
            if (turn % 5 === 0) return { type: 'heal', intent: '생명의 기운 (회복 12.)', dmg: 0, effect: 'heal_12' };
            if (turn % 4 === 0) return { type: 'nature_wrath', intent: `자연의 분노 ${this.atk * 2}`, dmg: this.atk * 2 };
            return { type: 'strike', intent: `징벌 ${this.atk}`, dmg: this.atk };
        }
    },
    ancient_echo: {
        id: 'ancient_echo', name: '태고의 잔향', icon: '🌑', image: 'enemy_ancient_echo.png', hp: 145, maxHp: 145, atk: 16, region: 0, xp: 120, gold: 50, isBoss: true, maxPhase: 2, phase: 1,
        ai(turn) {
            if (this.hp < this.maxHp * 0.5 && this.phase === 1) { return { type: 'phase_shift', intent: '⚠️ 위상 전환!', dmg: 0, effect: 'phase_shift' }; }
            if (this.phase === 2) {
                if (turn % 3 === 0) return { type: 'void_burst', intent: `허공 폭발 ${this.atk + 10}`, dmg: this.atk + 10 };
                return { type: 'echo_drain', intent: `잔향 흡수 ${this.atk + 5}`, dmg: this.atk + 5, effect: 'drain_echo' };
            }
            if (turn % 4 === 0) return { type: 'resonance_curse', intent: '잔향 저주', dmg: 8, effect: 'curse' };
            return { type: 'echo_slash', intent: `잔향 참격 ${this.atk}`, dmg: this.atk };
        }
    },

    // ── 침묵의 도시 ──
    silent_sentinel: {
        id: 'silent_sentinel', name: '침묵 파수꾼', icon: '🗿', image: 'enemy_silent_sentinel.png', hp: 60, maxHp: 60, atk: 14, region: 1, xp: 40, gold: 18,
        ai(turn) {
            if (turn % 2 === 0) return { type: 'silence', intent: '침묵 강요 (+3소음)', dmg: 5, effect: 'add_noise' };
            return { type: 'strike', intent: `철권 ${this.atk}`, dmg: this.atk };
        }
    },
    noise_wraith: {
        id: 'noise_wraith', name: '소음 원령', icon: '📢', image: 'enemy_noise_wraith.png', hp: 42, maxHp: 42, atk: 13, region: 1, xp: 38, gold: 16,
        ai(turn) {
            if (turn % 3 === 0) return { type: 'noise_wave', intent: '소음 파동 (+4소음)', dmg: 7, effect: 'add_noise' };
            if (turn % 2 === 0) return { type: 'shriek', intent: `절규 ${this.atk + 4}`, dmg: this.atk + 4 };
            return { type: 'strike', intent: `강타 ${this.atk}`, dmg: this.atk };
        }
    },
    iron_automaton: {
        id: 'iron_automaton', name: '철제 자동병', icon: '🤖', image: 'enemy_iron_automaton.png', hp: 65, maxHp: 65, atk: 12, region: 1, xp: 42, gold: 20,
        ai(turn) {
            if (turn % 4 === 0) return { type: 'overclock', intent: '과부하 (공격력+6)', dmg: 0, effect: 'self_atk_up' };
            if (turn % 3 === 0) return { type: 'cannon', intent: `포격 ${this.atk * 2}`, dmg: this.atk * 2 };
            return { type: 'punch', intent: `주먹 ${this.atk}`, dmg: this.atk };
        }
    },
    rust_stalker: {
        id: 'rust_stalker', name: '녹슨 추적자', icon: '👤', image: 'enemy_rust_stalker.png', hp: 38, maxHp: 38, atk: 11, region: 1, xp: 35, gold: 14,
        ai(turn) {
            if (turn % 3 === 0) return { type: 'poison', intent: '독 단검 (독 2)', dmg: 8, effect: 'poison' };
            return { type: 'stab', intent: `기습 ${this.atk + 4}`, dmg: this.atk + 4 };
        }
    },
    brass_guardian: {
        id: 'brass_guardian', name: '황동 수호병', icon: '🛡️', image: 'enemy_brass_guardian.png', hp: 70, maxHp: 70, atk: 10, region: 1, xp: 40, gold: 18,
        ai(turn) {
            if (turn % 3 === 0) return { type: 'guard', intent: '황동 방어 (방어도 15)', dmg: 0, effect: 'shield' };
            return { type: 'strike', intent: `방패 가격 ${this.atk + 5}`, dmg: this.atk + 5 };
        }
    },
    silent_shade: {
        id: 'silent_shade', name: '침묵의 그림자', icon: '🌑', image: 'enemy_silent_shade.png', hp: 35, maxHp: 35, atk: 12, region: 1, xp: 32, gold: 13,
        ai(turn) {
            if (turn % 2 === 0) return { type: 'vanish', intent: '그림자 숨기 (회피)', dmg: 0, effect: 'dodge' };
            return { type: 'slash', intent: `그림자 베기 ${this.atk}`, dmg: this.atk };
        }
    },
    elite_silence_herald: {
        id: 'elite_silence_herald', name: '【정예】침묵 사도', icon: '🗿', image: 'enemy_elite_silence_herald.png', hp: 95, maxHp: 95, atk: 16, region: 1, xp: 70, gold: 38, isElite: true,
        ai(turn) {
            if (turn === 1) return { type: 'seal', intent: '봉인 (카드 소멸)', dmg: 0, effect: 'exhaust_card' };
            if (turn % 3 === 0) return { type: 'noise_crush', intent: `소음 격쇄 ${this.atk + 8} (+5소음)`, dmg: this.atk + 8, effect: 'add_noise_5' };
            if (turn % 2 === 0) return { type: 'strike', intent: `침묵의 검 ${this.atk + 4}`, dmg: this.atk + 4 };
            return { type: 'bash', intent: `강타 ${this.atk}`, dmg: this.atk };
        }
    },
    elite_gear_titan: {
        id: 'elite_gear_titan', name: '【정예】톱니 타이탄', icon: '⚙️', image: 'enemy_elite_gear_titan.png', hp: 120, maxHp: 120, atk: 15, region: 1, xp: 80, gold: 45, isElite: true,
        ai(turn) {
            if (turn % 4 === 0) return { type: 'crush', intent: `분쇄 ${this.atk * 2} (취약)`, dmg: this.atk * 2, effect: 'vulnerable' };
            return { type: 'slam', intent: `톱니 타격 ${this.atk + 5}`, dmg: this.atk + 5 };
        }
    },
    elite_echo_judge: {
        id: 'elite_echo_judge', name: '【정예】잔향 심판관', icon: '⚖️', image: 'enemy_elite_echo_judge.png', hp: 100, maxHp: 100, atk: 14, region: 1, xp: 75, gold: 40, isElite: true,
        ai(turn) {
            if (turn % 3 === 0) return { type: 'judge', intent: '심판 (에너지 -1)', dmg: 10, effect: 'drain_energy' };
            return { type: 'strike', intent: `정의의 검 ${this.atk + 6}`, dmg: this.atk + 6 };
        }
    },
    silent_tyrant: {
        id: 'silent_tyrant', name: '침묵의 폭군', icon: '🗣️', image: 'enemy_silent_tyrant.png', hp: 200, maxHp: 200, atk: 17, region: 1, xp: 130, gold: 55, isBoss: true, maxPhase: 2, phase: 1,
        ai(turn) {
            if (this.hp < this.maxHp * 0.55 && this.phase === 1) { return { type: 'phase2', intent: '⚠️ 절대 침묵!', dmg: 0, effect: 'phase_shift' }; }
            if (this.phase === 2) {
                if (turn % 2 === 0) return { type: 'noise_burst', intent: `소음 폭발 ${this.atk + 12} (+5소음)`, dmg: this.atk + 12, effect: 'add_noise_5' };
                return { type: 'silence_crush', intent: `침묵 격쇄 ${this.atk + 6}`, dmg: this.atk + 6, effect: 'add_noise' };
            }
            if (turn % 3 === 0) return { type: 'summon_noise', intent: '소음 파동 (+3소음)', dmg: 8, effect: 'add_noise' };
            return { type: 'strike', intent: `철권 ${this.atk}`, dmg: this.atk };
        }
    },
    clockwork_emperor: {
        id: 'clockwork_emperor', name: '태엽 황제', icon: '⚙️', image: 'enemy_clockwork_emperor.png', hp: 220, maxHp: 220, atk: 18, region: 1, xp: 150, gold: 70, isBoss: true, maxPhase: 2,
        ai(turn) {
            if (turn % 5 === 0) return { type: 'overdrive', intent: `오버드라이브 ${this.atk * 2.5 | 0}`, dmg: this.atk * 2.5 | 0 };
            if (turn % 3 === 0) return { type: 'repair', intent: '자가 수리 (회복 15)', dmg: 0, effect: 'heal_15' };
            return { type: 'punch', intent: `황제의 권격 ${this.atk}`, dmg: this.atk };
        }
    },

    // ── 기억의 미궁 ──
    memory_specter: {
        id: 'memory_specter', name: '기억의 환령', icon: '👁️', image: 'enemy_specter.png', hp: 50, maxHp: 50, atk: 14, region: 2, xp: 35, gold: 14,
        ai(turn) {
            if (turn % 5 === 0) return { type: 'memory_steal', intent: '기억 훔치기 (카드 소멸)', dmg: 0, effect: 'exhaust_card' };
            if (turn % 4 === 0) return { type: 'energy_drain', intent: `에너지 흡수 (에너지 -1) ${this.atk}`, dmg: this.atk, effect: 'drain_energy' };
            if (turn % 3 === 0) return { type: 'phase', intent: '위상 이동', dmg: 0, effect: 'dodge' };
            return { type: 'claw', intent: `정신 공격 ${this.atk}`, dmg: this.atk, effect: 'confusion' };
        }
    },
    nightmare_hound: {
        id: 'nightmare_hound', name: '악몽의 사냥개', icon: '🐕', image: 'enemy_nightmare_hound.png', hp: 44, maxHp: 44, atk: 13, region: 2, xp: 30, gold: 12,
        ai(turn) {
            if (turn % 4 === 0) return { type: 'howl', intent: '공포의 포효 (에너지-1)', dmg: 6, effect: 'drain_energy' };
            if (turn % 2 === 0) return { type: 'pounce', intent: `덮치기 ${this.atk + 4}`, dmg: this.atk + 4 };
            return { type: 'bite', intent: `물기 ${this.atk}`, dmg: this.atk };
        }
    },
    phantom_soldier: {
        id: 'phantom_soldier', name: '환영 병사', icon: '👤', image: 'enemy_phantom_soldier.png', hp: 40, maxHp: 40, atk: 12, region: 2, xp: 32, gold: 13,
        ai(turn) {
            if (turn % 4 === 0) return { type: 'clone', intent: '분열 (방어도 10)', dmg: 0, effect: 'self_shield' };
            if (turn % 2 === 0) return { type: 'phase', intent: '위상 이동', dmg: 0, effect: 'dodge' };
            return { type: 'slash', intent: `환영 검 ${this.atk}`, dmg: this.atk };
        }
    },
    memory_thief: {
        id: 'memory_thief', name: '기억 도둑', icon: '👤', image: 'enemy_memory_thief.png', hp: 44, maxHp: 44, atk: 13, region: 2, xp: 38, gold: 25,
        ai(turn) {
            if (turn % 4 === 0) return { type: 'steal_gold', intent: '금전 탈취 (10골드)', dmg: 5, effect: 'steal_gold' };
            return { type: 'stab', intent: `기습 ${this.atk + 6}`, dmg: this.atk + 6 };
        }
    },
    mirror_shade: {
        id: 'mirror_shade', name: '거울 그림자', icon: '🪞', image: 'enemy_mirror_shade.png', hp: 48, maxHp: 48, atk: 12, region: 2, xp: 42, gold: 18,
        ai(turn) {
            if (turn % 2 === 0) return { type: 'reflect', intent: '거울 반사 (가시 5)', dmg: 0, effect: 'thorns_5' };
            return { type: 'slash', intent: `그림자 베기 ${this.atk}`, dmg: this.atk };
        }
    },
    labyrinth_shade: {
        id: 'labyrinth_shade', name: '미궁의 그림자', icon: '🌑', image: 'enemy_labyrinth_shade.png', hp: 46, maxHp: 46, atk: 12, region: 2, xp: 36, gold: 15,
        ai(turn) {
            if (turn % 2 === 0) return { type: 'hide', intent: '그림자 숨기 (회피)', dmg: 0, effect: 'dodge' };
            return { type: 'slash', intent: `그림자 베기 ${this.atk}`, dmg: this.atk };
        }
    },
    nightmare_specter: {
        id: 'nightmare_specter', name: '악몽의 망령', icon: '👻', image: 'enemy_nightmare_specter.png', hp: 52, maxHp: 52, atk: 14, region: null, xp: 40, gold: 16,
        ai(turn) {
            if (turn % 3 === 0) return { type: 'panic', intent: '공포 (방어도 획득 불가)', dmg: 10, effect: 'no_shield' };
            return { type: 'strike', intent: `악몽의 손길 ${this.atk + 4}`, dmg: this.atk + 4 };
        }
    },
    elite_memory_lich: {
        id: 'elite_memory_lich', name: '【정예】기억 리치', icon: '💀', image: 'enemy_elite_memory_lich.png', hp: 100, maxHp: 100, atk: 15, region: 2, xp: 72, gold: 42, isElite: true,
        ai(turn) {
            if (turn === 1) return { type: 'memory_curse', intent: '기억 저주 (에너지-2)', dmg: 5, effect: 'drain_energy_2' };
            if (turn % 4 === 0) return { type: 'drain_cards', intent: '카드 흡수 (소멸 2)', dmg: 8, effect: 'exhaust_card' };
            if (turn % 3 === 0) return { type: 'mind_blast', intent: `정신 폭발 ${this.atk + 10}`, dmg: this.atk + 10 };
            return { type: 'strike', intent: `사령 강타 ${this.atk}`, dmg: this.atk };
        }
    },
    elite_maze_master: {
        id: 'elite_maze_master', name: '【정예】미궁 주권자', icon: '🌀', image: 'enemy_elite_maze_master.png', hp: 115, maxHp: 115, atk: 17, region: 2, xp: 85, gold: 50, isElite: true,
        ai(turn) {
            if (turn % 4 === 0) return { type: 'maze_lock', intent: '미궁 폐쇄 (손패 교체)', dmg: 0, effect: 'discard_hand' };
            if (turn % 3 === 0) return { type: 'crush', intent: `공간 압착 ${this.atk + 10} (+취약)`, dmg: this.atk + 10, effect: 'vulnerable' };
            return { type: 'strike', intent: `미궁의 일격 ${this.atk + 5}`, dmg: this.atk + 5 };
        }
    },
    elite_soul_reaper: {
        id: 'elite_soul_reaper', name: '【정예】영혼 수확자', icon: '⚔️', image: 'enemy_elite_soul_reaper.png', hp: 110, maxHp: 110, atk: 18, region: 2, xp: 90, gold: 55, isElite: true,
        ai(turn) {
            if (turn % 3 === 0) return { type: 'harvest', intent: `영혼 수확 ${this.atk + 8} (HP흡수)`, dmg: this.atk + 8, effect: 'lifesteal' };
            return { type: 'slash', intent: `사선 베기 ${this.atk + 4}`, dmg: this.atk + 4 };
        }
    },
    memory_sovereign: {
        id: 'memory_sovereign', name: '기억의 군주', icon: '👑', image: 'enemy_memory_sovereign.png', hp: 220, maxHp: 220, atk: 18, region: 2, xp: 150, gold: 70, isBoss: true, maxPhase: 3, phase: 1,
        ai(turn) {
            if (this.hp < this.maxHp * 0.66 && this.phase === 1) { return { type: 'phase2', intent: '⚠️ 기억의 각성!', dmg: 0, effect: 'phase_shift' }; }
            if (this.hp < this.maxHp * 0.33 && this.phase === 2) { return { type: 'phase3', intent: '⚠️ 완전 각성!', dmg: 0, effect: 'phase_shift' }; }
            if (this.phase === 3) {
                if (turn % 2 === 0) return { type: 'void_storm', intent: `기억 폭풍 ${this.atk + 15}`, dmg: this.atk + 15 };
                return { type: 'soul_drain', intent: `영혼 흡수 ${this.atk + 8}`, dmg: this.atk + 8, effect: 'drain_echo' };
            }
            if (this.phase === 2) {
                if (turn % 3 === 0) return { type: 'mind_crush', intent: `정신 붕괴 ${this.atk + 10}`, dmg: this.atk + 10, effect: 'exhaust_card' };
                return { type: 'memory_slash', intent: `기억 참격 ${this.atk + 5}`, dmg: this.atk + 5 };
            }
            if (turn % 4 === 0) return { type: 'amnesia', intent: '망각 (에너지-2)', dmg: 5, effect: 'drain_energy_2' };
            return { type: 'slash', intent: `기억 검 ${this.atk}`, dmg: this.atk };
        }
    },
    memory_weaver: {
        id: 'memory_weaver', name: '기억의 직조자', icon: '🕸️', image: 'enemy_memory_weaver.png', hp: 190, maxHp: 190, atk: 16, region: 2, xp: 140, gold: 65, isBoss: true, maxPhase: 2,
        ai(turn) {
            if (turn % 4 === 0) return { type: 'weave', intent: '기억의 실 (카드 소멸)', dmg: 0, effect: 'exhaust_card' };
            return { type: 'strike', intent: `환영 타격 ${this.atk + 6}`, dmg: this.atk + 6 };
        }
    },

    // ── 신의 무덤 ──
    divine_remnant: {
        id: 'divine_remnant', name: '신의 잔재', icon: '⚡', image: 'enemy_divine_remnant.png', hp: 70, maxHp: 70, atk: 15, region: 3, xp: 50, gold: 22,
        ai(turn) {
            if (turn % 5 === 0) return { type: 'energy_smite', intent: `신성 심판 ${this.atk * 2} (에너지 -1)`, dmg: this.atk * 2, effect: 'drain_energy' };
            if (turn % 4 === 0) return { type: 'smite', intent: `신성 심판 ${this.atk * 2}`, dmg: this.atk * 2 };
            if (turn % 3 === 0) return { type: 'barrier', intent: '신성 방어도 15', dmg: 0, effect: 'self_shield_15' };
            return { type: 'strike', intent: `천벌 ${this.atk}`, dmg: this.atk };
        }
    },
    cursed_paladin: {
        id: 'cursed_paladin', name: '저주받은 기사단', icon: '⚔️', image: 'enemy_cursed_paladin.png', hp: 65, maxHp: 65, atk: 13, region: 3, xp: 48, gold: 22,
        ai(turn) {
            if (turn % 4 === 0) return { type: 'holy_smite', intent: `성스러운 심판 ${this.atk * 2}`, dmg: this.atk * 2 };
            if (turn % 3 === 0) return { type: 'barrier', intent: '신성 방어도 12', dmg: 0, effect: 'self_shield' };
            return { type: 'slash', intent: `성검 ${this.atk}`, dmg: this.atk };
        }
    },
    tomb_guardian: {
        id: 'tomb_guardian', name: '무덤 파수병', icon: '🛡️', image: 'enemy_tomb_guardian.png', hp: 85, maxHp: 85, atk: 11, region: 3, xp: 45, gold: 20,
        ai(turn) {
            if (turn % 3 === 0) return { type: 'shield_bash', intent: `방패 강타 ${this.atk + 8} (기절)`, dmg: this.atk + 8, effect: 'stun' };
            return { type: 'guard', intent: '철벽 방어 (방어도 15)', dmg: 0, effect: 'self_shield' };
        }
    },
    holy_guardian: {
        id: 'holy_guardian', name: '성소 수호병', icon: '🏯', image: 'enemy_holy_guardian.png', hp: 80, maxHp: 80, atk: 12, region: 3, xp: 46, gold: 21,
        ai(turn) {
            if (turn % 3 === 0) return { type: 'holy_shield', intent: '성스러운 방패 (방어도 16)', dmg: 0, effect: 'self_shield' };
            return { type: 'strike', intent: `심판의 망치 ${this.atk + 4}`, dmg: this.atk + 4 };
        }
    },
    divine_servant: {
        id: 'divine_servant', name: '신의 하인', icon: '🔅', image: 'enemy_divine_servant.png', hp: 72, maxHp: 72, atk: 13, region: 3, xp: 44, gold: 19,
        ai(turn) {
            if (turn % 4 === 0) return { type: 'curse', intent: '빛의 구속 (약화)', dmg: 0, effect: 'weaken' };
            return { type: 'beam', intent: `빛의 화살 ${this.atk + 6}`, dmg: this.atk + 6 };
        }
    },
    holy_specter: {
        id: 'holy_specter', name: '성스러운 환령', icon: '✨', image: 'enemy_holy_specter.png', hp: 68, maxHp: 68, atk: 15, region: 3, xp: 55, gold: 24,
        ai(turn) {
            if (turn % 4 === 0) return { type: 'smite', intent: `신의 처벌 ${this.atk * 2}`, dmg: this.atk * 2 };
            return { type: 'bless', intent: '빛의 가속 (공격력+4)', dmg: 0, effect: 'self_atk_up' };
        }
    },
    elite_fallen_deity: {
        id: 'elite_fallen_deity', name: '【정예】타락천사', icon: '👼', image: 'enemy_elite_fallen_deity.png', hp: 130, maxHp: 130, atk: 18, region: 3, xp: 90, gold: 55, isElite: true,
        ai(turn) {
            if (turn === 1) return { type: 'curse_all', intent: '전체 저주 (전 디버프)', dmg: 0, effect: 'mass_debuff' };
            if (turn % 3 === 0) return { type: 'divine_strike', intent: `신성 참격 ${this.atk + 12}`, dmg: this.atk + 12 };
            if (turn % 4 === 0) return { type: 'reckoning', intent: `심판 ${this.atk + 8} (약화)`, dmg: this.atk + 8, effect: 'weaken' };
            return { type: 'smite', intent: `천벌 ${this.atk}`, dmg: this.atk };
        }
    },
    elite_judgement_hand: {
        id: 'elite_judgement_hand', name: '【정예】심판의 손', icon: '🖐️', image: 'enemy_elite_judgement_hand.png', hp: 135, maxHp: 135, atk: 21, region: 3, xp: 95, gold: 58, isElite: true,
        ai(turn) {
            if (turn % 3 === 0) return { type: 'crush', intent: `압쇄 ${this.atk + 12} (취약)`, dmg: this.atk + 12, effect: 'vulnerable' };
            return { type: 'strike', intent: `심판의 일격 ${this.atk + 6}`, dmg: this.atk + 6 };
        }
    },
    elite_grave_lord: {
        id: 'elite_grave_lord', name: '【정예】무덤 군주', icon: '☠️', image: 'enemy_elite_grave_lord.png', hp: 140, maxHp: 140, atk: 20, region: 3, xp: 100, gold: 60, isElite: true,
        ai(turn) {
            if (turn === 1) return { type: 'doom', intent: '파멸의 선고 (3턴 후 큰 피해)', dmg: 0, effect: 'doom_3' };
            if (turn % 3 === 0) return { type: 'death_grasp', intent: `죽음의 움켜읨 ${this.atk + 12} (흡혈)`, dmg: this.atk + 12, effect: 'lifesteal' };
            return { type: 'strike', intent: `사령 강타 ${this.atk + 8}`, dmg: this.atk + 8 };
        }
    },
    divine_tyrant: {
        id: 'divine_tyrant', name: '신의 심판관', icon: '⚖️', image: 'enemy_divine_tyrant.png', hp: 240, maxHp: 240, atk: 19, region: 3, xp: 160, gold: 75, isBoss: true, maxPhase: 3, phase: 1,
        ai(turn) {
            if (this.hp < this.maxHp * 0.6 && this.phase === 1) { return { type: 'divine_wrath', intent: '⚠️ 신성 분노!', dmg: 0, effect: 'phase_shift' }; }
            if (this.hp < this.maxHp * 0.3 && this.phase === 2) { return { type: 'final_judgement', intent: '⚠️ 최후의 심판!', dmg: 0, effect: 'phase_shift' }; }
            if (this.phase === 3) {
                if (turn % 3 === 0) return { type: 'mass_debuff', intent: `신성 심판 ${this.atk + 18} (전체 디버프)`, dmg: this.atk + 18, effect: 'mass_debuff' };
                return { type: 'holy_crush', intent: `성스러운 격쇄 ${this.atk + 10}`, dmg: this.atk + 10 };
            }
            if (this.phase === 2) {
                if (turn % 3 === 0) return { type: 'smite_all', intent: `천벌 ${this.atk + 8} (약화)`, dmg: this.atk + 8, effect: 'weaken' };
                return { type: 'barrier', intent: '신성 방어도 20', dmg: 0, effect: 'self_shield_20' };
            }
            if (turn % 4 === 0) return { type: 'curse', intent: `저주 (디버프) ${this.atk + 4}`, dmg: this.atk + 4, effect: 'curse' };
            return { type: 'smite', intent: `천벌 ${this.atk}`, dmg: this.atk };
        }
    },
    grave_executor: {
        id: 'grave_executor', name: '무덤의 집행자', icon: '🪓', image: 'enemy_grave_executor.png', hp: 210, maxHp: 210, atk: 19, region: 3, xp: 155, gold: 72, isBoss: true, maxPhase: 2,
        ai(turn) {
            if (turn % 4 === 0) return { type: 'execute', intent: `사형 구형 ${this.atk * 2.5 | 0}`, dmg: this.atk * 2.5 | 0 };
            return { type: 'strike', intent: `집행의 도끼 ${this.atk + 5}`, dmg: this.atk + 5 };
        }
    },

    // ── 허공의 끝 ──
    echo_devourer: {
        id: 'echo_devourer', name: '메아리 포식자', icon: '🌑', image: 'enemy_echo_devourer.png', hp: 65, maxHp: 65, atk: 18, region: 4, xp: 60, gold: 30,
        ai(turn) {
            if (turn % 3 === 0) return { type: 'devour', intent: `잔향 흡수 ${this.atk + 5}`, dmg: this.atk + 5, effect: 'drain_echo' };
            if (turn % 5 === 0) return { type: 'void_burst', intent: `허공 폭발 ${this.atk * 1.5 | 0}`, dmg: this.atk * 1.5 | 0 };
            return { type: 'claw', intent: `허공 발톱 ${this.atk}`, dmg: this.atk };
        }
    },
    void_remnant: {
        id: 'void_remnant', name: '허공의 잔재', icon: '🌌', image: 'enemy_void_remnant.png', hp: 55, maxHp: 55, atk: 16, region: 4, xp: 52, gold: 26,
        ai(turn) {
            if (turn % 3 === 0) return { type: 'void_drain', intent: `허공 흡수 ${this.atk + 4} (잔향 감소)`, dmg: this.atk + 4, effect: 'drain_echo' };
            if (turn % 4 === 0) return { type: 'collapse', intent: `붕괴 ${this.atk + 8}`, dmg: this.atk + 8 };
            return { type: 'claw', intent: `허공 발톱 ${this.atk}`, dmg: this.atk };
        }
    },
    void_eye_enemy: {
        id: 'void_eye_enemy', name: '허공의 눈', icon: '👁️', image: 'enemy_void_eye_enemy.png', hp: 62, maxHp: 62, atk: 18, region: 4, xp: 58, gold: 32,
        ai(turn) {
            if (turn % 3 === 0) return { type: 'gaze', intent: '심연의 시선 (취약/약화)', dmg: 5, effect: 'weaken_vulnerable' };
            return { type: 'beam', intent: `공허 광선 ${this.atk + 6}`, dmg: this.atk + 6 };
        }
    },
    void_walker: {
        id: 'void_walker', name: '허공 보행자', icon: '🚶', image: 'enemy_void_walker.png', hp: 58, maxHp: 58, atk: 19, region: 4, xp: 62, gold: 35,
        ai(turn) {
            if (turn % 2 === 0) return { type: 'blink', intent: '차원 점멸 (회피)', dmg: 0, effect: 'dodge' };
            return { type: 'reality_slash', intent: `현실 베기 ${this.atk + 10}`, dmg: this.atk + 10 };
        }
    },
    reality_shredder: {
        id: 'reality_shredder', name: '현실 파쇄자', icon: '🌪️', image: 'enemy_reality_shredder.png', hp: 75, maxHp: 75, atk: 21, region: 4, xp: 70, gold: 40,
        ai(turn) {
            if (turn % 4 === 0) return { type: 'shred', intent: `현실 파쇄 ${this.atk * 2} (Echo-10)`, dmg: this.atk * 2, effect: 'drain_echo_10' };
            return { type: 'strike', intent: `차원 강타 ${this.atk + 5}`, dmg: this.atk + 5 };
        }
    },
    void_core_fragment: {
        id: 'void_core_fragment', name: '허공 핵 파편', icon: '💠', image: 'enemy_void_core_fragment.png', hp: 64, maxHp: 64, atk: 17, region: 4, xp: 55, gold: 28,
        ai(turn) {
            if (turn % 3 === 0) return { type: 'pulse', intent: `핵 맥동 ${this.atk + 5} (Echo감소)`, dmg: this.atk + 5, effect: 'drain_echo' };
            return { type: 'strike', intent: `파괴 광선 ${this.atk + 4}`, dmg: this.atk + 4 };
        }
    },
    elite_origin_guard: {
        id: 'elite_origin_guard', name: '【정예】근원 수호자', icon: '🛡️', image: 'enemy_elite_origin_guard.png', hp: 160, maxHp: 160, atk: 20, region: 4, xp: 140, gold: 80, isElite: true,
        ai(turn) {
            if (turn % 5 === 0) return { type: 'origin_shield', intent: '근원의 방패 (무적 1턴)', dmg: 0, effect: 'invincible' };
            if (turn % 3 === 0) return { type: 'counter', intent: '반격 태세 (가시 10)', dmg: 0, effect: 'thorns_10' };
            return { type: 'bash', intent: `근원의 충격 ${this.atk + 15}`, dmg: this.atk + 15 };
        }
    },
    elite_echo_colossus: {
        id: 'elite_echo_colossus', name: '【정예】잔향 거신', icon: '🌟', image: 'enemy_elite_echo_colossus.png', hp: 135, maxHp: 135, atk: 20, region: 4, xp: 120, gold: 70, isElite: true,
        ai(turn) {
            if (turn === 1) return { type: 'echo_suppress', intent: '잔향 억제 (최대 잔향 -20)', dmg: 0, effect: 'drain_echo' };
            if (turn % 3 === 0) return { type: 'colossal_slam', intent: `거신 강타 ${this.atk + 15}`, dmg: this.atk + 15 };
            if (turn % 4 === 0) return { type: 'void_aura', intent: '허공 오라 (에너지-1)', dmg: 10, effect: 'drain_energy' };
            return { type: 'strike', intent: `거신 격 ${this.atk}`, dmg: this.atk };
        }
    },
    elite_void_templar: {
        id: 'elite_void_templar', name: '【정예】허공 기사', icon: '⚔️', image: 'enemy_elite_void_templar.png', hp: 155, maxHp: 155, atk: 19, region: 4, xp: 130, gold: 75, isElite: true,
        ai(turn) {
            if (turn % 4 === 0) return { type: 'shatter', intent: `현실 분쇄 ${this.atk * 2} (에너지-1)`, dmg: this.atk * 2, effect: 'drain_energy' };
            return { type: 'slash', intent: `허공 베기 ${this.atk + 10}`, dmg: this.atk + 10 };
        }
    },
    void_herald: {
        id: 'void_herald', name: '허공의 사도', icon: '🌌', image: 'enemy_void_herald.png', hp: 280, maxHp: 280, atk: 20, region: 4, xp: 200, gold: 100, isBoss: true, maxPhase: 2, phase: 1,
        ai(turn) {
            if (this.hp < this.maxHp * 0.5 && this.phase === 1) { return { type: 'transcend', intent: '⚠️ 허공 초월!', dmg: 0, effect: 'phase_shift' }; }
            if (this.phase === 2) {
                if (turn % 2 === 0) return { type: 'void_collapse', intent: `허공 붕괴 ${this.atk + 12}`, dmg: this.atk + 12 };
                return { type: 'echo_nullify', intent: '잔향 무효화', dmg: this.atk, effect: 'nullify_echo' };
            }
            if (turn % 3 === 0) return { type: 'void_pulse', intent: `허공 파동 ${this.atk + 6}`, dmg: this.atk + 6 };
            return { type: 'strike', intent: `허공 강타 ${this.atk}`, dmg: this.atk };
        }
    },
    echo_origin: {
        id: 'echo_origin', name: '잔향의 근원', icon: '🌟', image: 'enemy_echo_origin.png', hp: 320, maxHp: 320, atk: 22, region: 4, xp: 300, gold: 150, isBoss: true, isHidden: true, maxPhase: 3, phase: 1,
        ai(turn) {
            if (this.hp < this.maxHp * 0.6 && this.phase === 1) { return { type: 'awaken', intent: '⚠️ 근원 각성!', dmg: 0, effect: 'phase_shift' }; }
            if (this.hp < this.maxHp * 0.25 && this.phase === 2) { return { type: 'transcend', intent: '⚠️ 근원 초월!', dmg: 0, effect: 'phase_shift' }; }
            if (this.phase === 3) {
                if (turn % 3 === 0) return { type: 'origin_blast', intent: `근원 폭발 ${this.atk + 20}`, dmg: this.atk + 20 };
                return { type: 'echo_erase', intent: '잔향 완전 소거', dmg: this.atk, effect: 'nullify_echo' };
            }
            if (this.phase === 2) {
                if (turn % 3 === 0) return { type: 'memory_wipe', intent: `기억 소거 ${this.atk + 10}`, dmg: this.atk + 10, effect: 'exhaust_card' };
                return { type: 'resonance', intent: `공명 ${this.atk + 6} (드레인)`, dmg: this.atk + 6, effect: 'drain_echo' };
            }
            if (turn % 4 === 0) return { type: 'loop_crush', intent: `루프 압박 ${this.atk + 8}`, dmg: this.atk + 8 };
            return { type: 'echo_strike', intent: `잔향 격 ${this.atk}`, dmg: this.atk };
        }
    }
};
