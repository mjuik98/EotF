/**
 * items.js — 아이템/유물 데이터
 */
import { LogUtils } from '../game/utils/log_utils.js';
import { CARDS } from './cards.js';
import { Trigger } from '../game/data/triggers.js';
import { CONSTANTS } from '../game/data/constants.js';

export const ITEMS = {
    // ══════════════ COMMON (회색) ══════════════
    void_compass: {
        id: 'void_compass', name: '공허의 나침반', icon: '🧭', rarity: 'common',
        desc: '전투 시작: 카드 1장 드로우.',
        image: 'relic_void_compass.png',
        passive(gs, trigger) { if (trigger === Trigger.COMBAT_START) { gs.drawCards(1); gs.addLog(LogUtils.formatItem('공허의 나침반', '카드 뽑기 +1'), 'item'); } }
    },
    void_shard: {
        id: 'void_shard', name: '공허의 파편', icon: '🔷', rarity: 'common',
        desc: '전투 종료: 잔향 20 충전.',
        image: 'relic_void_shard.png',
        passive(gs, trigger) { if (trigger === Trigger.COMBAT_END) { gs.addEcho(20); gs.addLog(LogUtils.formatItem('공허의 파편', '잔향 +20'), 'item'); } }
    },
    cracked_amulet: {
        id: 'cracked_amulet', name: '부서진 목걸이', icon: '📿', rarity: 'common',
        desc: '매 턴: 체력 2 회복.',
        image: 'relic_cracked_amulet.png',
        passive(gs, trigger) { if (trigger === Trigger.TURN_START) { gs.heal(2); gs.addLog(LogUtils.formatItem('부서진 목걸이', '체력 +2'), 'item'); } }
    },
    worn_pouch: {
        id: 'worn_pouch', name: '낡은 주머니', icon: '👜', rarity: 'common',
        desc: '전투 시작: 골드 5 획득.',
        image: 'relic_worn_pouch.png',
        passive(gs, trigger) { if (trigger === Trigger.COMBAT_START) { gs.addGold(5); gs.addLog(LogUtils.formatItem('낡은 주머니', '골드 +5'), 'item'); } }
    },
    dull_blade: {
        id: 'dull_blade', name: '무딘 검', icon: '🔪', rarity: 'common',
        desc: '카드 사용 시: 10% 확률로 잔향 10 충전.',
        image: 'relic_dull_blade.png',
        passive(gs, trigger) { if (trigger === Trigger.CARD_PLAY && Math.random() < 0.1) { gs.addEcho(10); gs.addLog(LogUtils.formatEcho('무딘 검: 일정 확률로 잔향 +10'), 'echo'); } }
    },
    travelers_map: {
        id: 'travelers_map', name: '여행자의 지도', icon: '🗺️', rarity: 'common',
        desc: '층 이동 시: 체력 3 회복.',
        image: 'relic_travelers_map.png',
        passive(gs, trigger) { if (trigger === Trigger.FLOOR_START) { gs.heal(3); } }
    },
    rift_talisman: {
        id: 'rift_talisman', name: '균열의 부적', icon: '💍', rarity: 'common',
        desc: '전투 시작: 방어막 5 획득.',
        image: 'relic_rift_talisman.png',
        passive(gs, trigger) { if (trigger === Trigger.COMBAT_START) { gs.addShield(5); gs.addLog(LogUtils.formatItem('균열의 부적', '방어막 +5'), 'item'); } }
    },
    blood_shard: {
        id: 'blood_shard', name: '핏빛 파편', icon: '🍷', rarity: 'common',
        desc: '적 처치 시: 잔향 10 충전.',
        image: 'relic_blood_shard.png',
        passive(gs, trigger) { if (trigger === Trigger.ENEMY_KILL) { gs.addEcho(10); gs.addLog(LogUtils.formatItem('핏빛 파편', '잔향 +10'), 'item'); } }
    },
    // ══════════════ UNCOMMON (파랑) ══════════════
    blood_gem: {
        id: 'blood_gem', name: '혈정', icon: '🔴', rarity: 'uncommon',
        desc: '피해를 받을 때마다 잔향을 15 충전합니다.',
        image: 'relic_blood_gem.png',
        passive(gs, trigger, data) { if (trigger === Trigger.DAMAGE_TAKEN && data > 0) { gs.addEcho(15); gs.addLog(LogUtils.formatItem('혈정', '잔향 +15'), 'item'); } }
    },
    phantom_cloak: {
        id: 'phantom_cloak', name: '환영 망토', icon: '🧥', rarity: 'uncommon',
        desc: '전투 시작: 회피 1 획득.',
        image: 'relic_phantom_cloak.png',
        trigger: Trigger.COMBAT_START,
        passive(gs, trigger) { if (trigger === Trigger.COMBAT_START) { gs.addBuff('dodge', 1); gs.addLog(LogUtils.formatItem('환영 망토', '회피 획득'), 'item'); } }
    },
    cursed_tome: {
        id: 'cursed_tome', name: '저주받은 마도서', icon: '📕', rarity: 'uncommon',
        desc: '카드 드로우 시: 5% 확률로 잔향 25 충전.',
        image: 'relic_cursed_tome.png',
        passive(gs, trigger) { if (trigger === Trigger.CARD_PLAY) { gs.addEcho(5); gs.player.hp = Math.max(1, gs.player.hp - 2); gs.markDirty?.('hud'); } }
    },
    ancient_rune: {
        id: 'ancient_rune', name: '고대의 룬석', icon: '🗿', rarity: 'uncommon',
        desc: '보스전 시작 시 최대 체력이 20% 증가합니다.',
        image: 'relic_ancient_rune.png',
        passive(gs, trigger) { if (trigger === Trigger.BOSS_START) { gs.player.maxHp = Math.floor(gs.player.maxHp * 1.2); gs.player.hp = Math.min(gs.player.hp + 20, gs.player.maxHp); gs.addLog(LogUtils.formatItem('고대의 룬석', '체력 강화'), 'item'); gs.markDirty?.('hud'); } }
    },
    echo_chain_ring: {
        id: 'echo_chain_ring', name: '연쇄의 반지', icon: '🔗', rarity: 'uncommon',
        desc: '연쇄가 2 이상이라면, 공격의 피해가 5 증가합니다.',
        image: 'relic_echo_chain_ring.png',
        passive(gs, trigger, data) { if (trigger === Trigger.DEAL_DAMAGE && gs.player.echoChain >= 2) return (data || 0) + 5; }
    },
    bone_charm: {
        id: 'bone_charm', name: '뼈 부적', icon: '🦴', rarity: 'uncommon',
        desc: '적을 처치할 때마다 회복 5.',
        image: 'relic_bone_charm.png',
        passive(gs, trigger) { if (trigger === Trigger.ENEMY_KILL) { gs.heal(5); gs.addLog(LogUtils.formatItem('뼈 부적', '체력 +5'), 'item'); } }
    },
    poison_vial: {
        id: 'poison_vial', name: '독 약병', icon: '🧪', rarity: 'uncommon',
        desc: '전투 시작 시 모든 적에게 독 2중첩을 부여합니다.',
        image: 'relic_poison_vial.png',
        passive(gs, trigger) { if (trigger === Trigger.COMBAT_START) { gs.combat.enemies.forEach((_, i) => gs.applyEnemyStatus('poisoned', 2, i)); gs.addLog(LogUtils.formatSystem('독 약병: 모든 적에게 독 부여!'), 'echo'); } }
    },
    shadow_mask: {
        id: 'shadow_mask', name: '그림자 가면', icon: '🎭', rarity: 'uncommon',
        desc: '카드를 3장 연속으로 사용할 때마다 방어막를 8 얻습니다.',
        image: 'relic_shadow_mask.png',
        passive(gs, trigger) { if (trigger === Trigger.CARD_PLAY) { gs._maskCount = (gs._maskCount || 0) + 1; if (gs._maskCount >= 3) { gs.addShield(8); gs._maskCount = 0; gs.addLog(LogUtils.formatItem('그림자 가면', '방어막 +8'), 'item'); } } }
    },
    // ══════════════ RARE (금색) ══════════════
    resonance_stone: {
        id: 'resonance_stone', name: '공명석', icon: '💎', rarity: 'rare',
        desc: '잔향 연쇄가 3 이상이라면, 카드가 소멸하는 것을 방지합니다.',
        image: 'relic_resonance_stone.png',
        passive(gs, trigger) { if (trigger === Trigger.CARD_DISCARD && gs.player.echoChain >= 3) gs.addLog('💎 공명석: 카드 소멸 방지!', 'echo'); }
    },
    silence_ring: {
        id: 'silence_ring', name: '침묵의 반지', icon: '💍', rarity: 'rare',
        desc: '체력이 30% 미만이라면, 모든 카드의 비용이 2 감소합니다.',
        image: 'relic_silence_ring.png',
        passive(gs, trigger) { if (trigger === Trigger.TURN_START) { const low = gs.player.hp < gs.player.maxHp * CONSTANTS.PLAYER.LOW_HP_RATIO; if (low) { gs.player.costDiscount = Math.max(gs.player.costDiscount || 0, 2); gs.addLog('💍 침묵의 반지: 비용 -2!', 'echo'); } } }
    },
    echo_amplifier: {
        id: 'echo_amplifier', name: '잔향 증폭기', icon: '📡', rarity: 'rare',
        desc: '잔향 연쇄의 피해가 30% 증가합니다.',
        image: 'relic_echo_amplifier.png',
        passive(gs, trigger, data) { if (trigger === Trigger.CHAIN_DMG) return Math.floor(data * 1.3); }
    },
    temporal_lens: {
        id: 'temporal_lens', name: '시간의 렌즈', icon: '🔍', rarity: 'rare',
        desc: '매 3턴마다 사용하는 카드 1장의 비용을 0으로 만듭니다.',
        image: 'relic_temporal_lens.png',
        passive(gs, trigger) {
            if (trigger === Trigger.TURN_START) {
                gs._temporalTurn = (gs._temporalTurn || 0) + 1;
                if (gs._temporalTurn % 3 === 0) {
                    gs.player._freeCardUses = (gs.player._freeCardUses || 0) + 1;
                    gs.addLog('🔍 시간의 렌즈: 이번 턴 카드 1장 무료!', 'echo');
                }
            }
        }
    },
    echo_mirror: {
        id: 'echo_mirror', name: '잔향의 거울', icon: '🪞', rarity: 'rare',
        desc: '공명 폭발 발동 시 주는 피해가 50% 증가합니다.',
        image: 'relic_echo_mirror.png',
        passive(gs, trigger, data) { if (trigger === Trigger.RESONANCE_BURST) return Math.floor((data || 0) * 1.5); }
    },
    void_crystal: {
        id: 'void_crystal', name: '공허의 수정', icon: '💠', rarity: 'rare',
        desc: '피해를 받을 때 15% 확률로 해당 피해를 완전히 무효화합니다.',
        image: 'relic_void_crystal.png',
        passive(gs, trigger, data) { if (trigger === Trigger.DAMAGE_TAKEN && data > 0 && Math.random() < 0.15) { gs.addLog('💠 공허의 수정: 피해 무효화!', 'echo'); return true; } }
    },
    bloodsoaked_robe: {
        id: 'bloodsoaked_robe', name: '피에 물든 로브', icon: '🩸', rarity: 'rare',
        desc: '체력이 50% 미만이라면, 주는 모든 피해가 20% 증가합니다.',
        image: 'relic_bloodsoaked_robe.png',
        passive(gs, trigger, data) {
            if (trigger === Trigger.DEAL_DAMAGE && gs.player.hp < gs.player.maxHp * CONSTANTS.PLAYER.MID_HP_RATIO) {
                return Math.floor((data || 0) * 1.2);
            }
        }
    },
    echo_gauntlet: {
        id: 'echo_gauntlet', name: '잔향의 건틀릿', icon: '🥊', rarity: 'rare',
        desc: '연쇄가 5에 도달하면, 즉시 적에게 기절 1턴을 부여합니다.',
        image: 'relic_echo_gauntlet.png',
        passive(gs, trigger) {
            if (trigger === Trigger.CARD_PLAY && gs.player.echoChain >= CONSTANTS.COMBAT.CHAIN_BURST_THRESHOLD) {
                const aliveIdx = gs.combat.enemies.findIndex(e => e.hp > 0);
                if (aliveIdx >= 0) {
                    gs.applyEnemyStatus('stunned', 1, aliveIdx);
                    gs.addLog('🥊 잔향의 건틀릿: 적 기절!', 'echo');
                    gs.player.echoChain = 0;
                }
            }
        }
    },
    war_drum: {
        id: 'war_drum', name: '전쟁의 북', icon: '🥁', rarity: 'rare',
        desc: '전투 시작 시 에너지를 1 얻습니다. (해당 전투 한정)',
        image: 'relic_war_drum.png',
        passive(gs, trigger) {
            if (trigger === Trigger.COMBAT_START && !gs._warDrumActive) {
                gs._warDrumBaseMax = gs.player.maxEnergy;
                gs.player.maxEnergy += 1;
                gs.player.energy = Math.min(gs.player.energy + 1, gs.player.maxEnergy);
                gs._warDrumActive = true;
                gs.addLog('🥁 전쟁의 북: 에너지 +1!', 'echo');
                gs.markDirty?.('hud');
            }
            if ((trigger === Trigger.COMBAT_END || trigger === 'death') && gs._warDrumActive) {
                gs.player.maxEnergy = gs._warDrumBaseMax ?? Math.max(1, gs.player.maxEnergy - 1);
                gs._warDrumActive = false;
                gs._warDrumBaseMax = undefined;
            }
        }
    },
    // ── 에너지 증감 유물 ──
    energy_core: {
        id: 'energy_core', name: '에너지 핵', icon: '⚡', rarity: 'uncommon',
        desc: '전투를 완료할 때마다 최대 에너지가 1 영구적으로 증가합니다. (최대 5)',
        image: 'relic_energy_core.png',
        passive(gs, trigger) {
            if (trigger === Trigger.COMBAT_START && !gs.meta._energyCoreGranted) {
                if (gs.player.maxEnergy < CONSTANTS.PLAYER.MAX_ENERGY_CAP) {
                    gs.player.maxEnergy++;
                    gs.player.energy = gs.player.maxEnergy;
                    gs.meta._energyCoreGranted = true;
                    gs.addLog('⚡ 에너지 핵: 최대 에너지 +1 영구 증가!', 'echo');
                    if (typeof updateUI === 'function') updateUI();
                }
            }
        }
    },
    echo_battery: {
        id: 'echo_battery', name: '잔향 전지', icon: '🔋', rarity: 'common',
        desc: '카드를 버릴 때마다 에너지를 1 얻습니다. (턴당 1회 한정)',
        image: 'relic_echo_battery.png',
        passive(gs, trigger) {
            if (trigger === Trigger.CARD_DISCARD && !gs._batteryUsedTurn) { gs.player.energy = Math.min(gs.player.maxEnergy, gs.player.energy + 1); gs._batteryUsedTurn = true; gs.addLog('🔋 잔향 전지: 에너지 +1 얻음!', 'echo'); if (typeof updateUI === 'function') updateUI(); }
            if (trigger === Trigger.TURN_START) gs._batteryUsedTurn = false;
        }
    },
    cursed_capacitor: {
        id: 'cursed_capacitor', name: '저주받은 축전기', icon: '🌩️', rarity: 'uncommon',
        desc: '매 턴 시작 시 에너지를 1 추가로 얻지만, 체력을 3 잃습니다.',
        image: 'relic_cursed_capacitor.png',
        passive(gs, trigger) { if (trigger === Trigger.TURN_START) { gs.player.energy = Math.min(gs.player.maxEnergy + 1, gs.player.energy + 1); gs.player.hp = Math.max(1, gs.player.hp - 3); gs.addLog('🌩️ 저주받은 축전기: 에너지 +1 / 체력 -3', 'echo'); if (typeof updateUI === 'function') updateUI(); } }
    },
    void_battery: {
        id: 'void_battery', name: '공허의 전지', icon: '🔌', rarity: 'rare',
        desc: '잔향이 50 이상이라면, 매 턴 시작 시 에너지를 1 추가로 얻습니다.',
        image: 'relic_void_battery.png',
        passive(gs, trigger) { if (trigger === Trigger.TURN_START && gs.player.echo >= 50) { gs.player.energy = Math.min(gs.player.maxEnergy + 1, gs.player.energy + 1); gs.addLog('🔌 공허의 전지: 에너지 +1!', 'echo'); if (typeof updateUI === 'function') updateUI(); } }
    },
    surge_crystal: {
        id: 'surge_crystal', name: '쇄도의 수정', icon: '💫', rarity: 'legendary',
        desc: '전투 시작: 에너지 1 획득. (전투당 1회)',
        image: 'relic_surge_crystal.png',
        passive(gs, trigger) { if (trigger === Trigger.COMBAT_START && !gs._surgeGranted) { gs.player.maxEnergy++; gs.player.energy = gs.player.maxEnergy; gs._surgeGranted = true; gs.addLog('💫 쇄도의 수정: 최대 에너지 +1 영구 증가!', 'echo'); if (typeof updateUI === 'function') updateUI(); } }
    },
    // ══════════════ SET ITEMS — 조각 세트 (2/3개 효과) ══════════════
    // [세트 A] 심연의 삼위일체
    void_eye: {
        id: 'void_eye', name: '공허의 눈', icon: '🌑', rarity: 'uncommon',
        desc: '적을 공격할 때마다 15% 확률로 적에게 약화를 부여합니다. [세트:심연]',
        image: 'relic_void_eye.png',
        passive(gs, trigger) { if (trigger === Trigger.CARD_PLAY && Math.random() < 0.15) { const idx = gs.combat.enemies.findIndex(e => e.hp > 0); if (idx >= 0) { gs.applyEnemyStatus('weakened', 1, idx); gs.addLog('🌑 공허의 눈: 약화 부여!', 'echo'); } } }
    },
    void_fang: {
        id: 'void_fang', name: '공허의 송곳니', icon: '🦷', rarity: 'uncommon',
        desc: '공격 카드를 사용할 때마다 잔향을 8 충전합니다. [세트:심연]',
        image: 'relic_void_fang.png',
        passive(gs, trigger, data) { if (trigger === Trigger.CARD_PLAY && data && CARDS[data.cardId]?.type === 'ATTACK') { gs.addEcho(8); gs.addLog('🦷 공허의 송곳니: 잔향 +8', 'echo'); } }
    },
    void_crown: {
        id: 'void_crown', name: '공허의 왕관', icon: '👁️', rarity: 'rare',
        desc: '카드 사용 시: 카드 비용이 0이면 잔향 10 추가 충전.',
        image: 'relic_void_crown.png',
        passive(gs, trigger) { if (trigger === Trigger.TURN_START) { const low = gs.player.hp < gs.player.maxHp * CONSTANTS.PLAYER.HIGH_HP_RATIO; if (low && !gs._crownActive) { gs.player.costDiscount = (gs.player.costDiscount || 0) + 1; gs._crownActive = true; gs.addLog('👁️ 공허의 왕관: 모든 카드 비용 -1!', 'echo'); } else if (!low && gs._crownActive) { gs.player.costDiscount = Math.max(0, (gs.player.costDiscount || 0) - 1); gs._crownActive = false; } } }
    },
    // [세트 B] 잔향의 삼각
    echo_pendant: {
        id: 'echo_pendant', name: '잔향의 펜던트', icon: '💜', rarity: 'uncommon',
        desc: '매 턴 시작 시 잔향을 12 충전합니다. [세트:잔향]',
        image: 'relic_echo_pendant.png',
        passive(gs, trigger) { if (trigger === Trigger.TURN_START) { gs.addEcho(12); gs.addLog('💜 잔향의 펜던트: 잔향 +12', 'echo'); } }
    },
    echo_bracer: {
        id: 'echo_bracer', name: '잔향의 팔찌', icon: '🔮', rarity: 'uncommon',
        desc: '잔향 효과가 발동할 때마다 회복 3. (전투당 최대 20 회복) [세트:잔향]',
        image: 'relic_echo_bracer.png',
        passive(gs, trigger) {
            if (trigger === Trigger.ECHO_SKILL) {
                gs.combat._bracerHeal = (gs.combat._bracerHeal || 0);
                if (gs.combat._bracerHeal < 20) {
                    gs.heal(3);
                    gs.combat._bracerHeal += 3;
                    gs.addLog(`🔮 잔향의 팔찌: 체력 +3 (${gs.combat._bracerHeal}/20)`, 'heal');
                }
            }
        }
    },
    echo_sigil: {
        id: 'echo_sigil', name: '잔향의 인장', icon: '⚜️', rarity: 'rare',
        desc: '공명 폭발 발동 시 에너지를 2 얻습니다. [세트:잔향]',
        image: 'relic_echo_sigil.png',
        passive(gs, trigger) { if (trigger === Trigger.RESONANCE_BURST) { gs.player.energy = Math.min(gs.player.maxEnergy + 2, gs.player.energy + 2); gs.markDirty?.('hud'); gs.addLog('⚜️ 잔향의 인장: 에너지 +2 얻음!', 'echo'); } }
    },
    // [세트 C] 혈맹의 인장
    blood_seal: {
        id: 'blood_seal', name: '혈인', icon: '🩸', rarity: 'common',
        desc: '피해를 받을 때마다 방어막를 3 얻습니다. [세트:혈맹]',
        image: 'relic_blood_seal.png',
        passive(gs, trigger, data) { if (trigger === Trigger.DAMAGE_TAKEN && data > 0) { gs.addShield(3); gs.addLog('🩸 혈인: 방어막 +3', 'shield'); } }
    },
    blood_oath: {
        id: 'blood_oath', name: '혈맹의 서', icon: '📜', rarity: 'uncommon',
        desc: '카드 사용 시: 체력 50% 이하일 때 피해 +6. [세트:혈맹]',
        image: 'relic_blood_oath.png',
        passive(gs, trigger, data) { if (trigger === Trigger.DEAL_DAMAGE && gs.player.hp <= 50) return (data || 0) + 6; }
    },
    blood_crown: {
        id: 'blood_crown', name: '혈맹의 왕관', icon: '💉', rarity: 'rare',
        desc: '적 처치 시: 체력 8 회복. 잔향 20 충전. [세트:혈맹]',
        image: 'relic_blood_crown.png',
        passive(gs, trigger) { if (trigger === Trigger.ENEMY_KILL) { gs.heal(8); gs.addEcho(20); gs.addLog('💉 혈맹의 왕관: 체력 +8, 잔향 +20', 'heal'); } }
    },

    // ══════════════ LEGENDARY (보라/무지개) ══════════════
    echo_heart: {
        id: 'echo_heart', name: '잔향의 심장', icon: '❤️‍🔥', rarity: 'legendary',
        desc: '패시브: 사망 시 1회 부활. (체력 50% 복원)',
        image: 'relic_echo_heart.png',
        passive(gs, trigger) { if (trigger === Trigger.PRE_DEATH && !gs._heartUsed) { gs._heartUsed = true; gs.player.hp = Math.floor(gs.player.maxHp * CONSTANTS.PLAYER.MID_HP_RATIO); gs.addLog('❤️‍🔥 잔향의 심장: 부활!', 'heal'); return true; } }
    },
    void_throne: {
        id: 'void_throne', name: '공허의 왕좌', icon: '👑', rarity: 'legendary',
        desc: '카드 사용 시: 5장마다 모든 적에게 피해 15.',
        image: 'relic_void_throne.png',
        passive(gs, trigger) { if (trigger === Trigger.CARD_PLAY) { gs._throneCount = (gs._throneCount || 0) + 1; if (gs._throneCount % 5 === 0) { gs.dealDamageAll(15); gs.addLog('👑 공허의 왕좌: 모든 적 피해 15!', 'echo'); } } }
    },
    echo_genesis: {
        id: 'echo_genesis', name: '잔향의 기원', icon: '🌟', rarity: 'legendary',
        desc: '잔향 100 도달 시: 손패 최대 5장의 비용 0. (전투당 1회)',
        image: 'relic_echo_genesis.png',
        passive(gs, trigger) { if (trigger === Trigger.TURN_START && gs.player.echo >= CONSTANTS.ECHO.BURST_THRESHOLD && !gs._genesisUsed) { gs.player._freeCardUses = Math.max(gs.player._freeCardUses || 0, Math.min(5, gs.player.hand.length)); gs._genesisUsed = true; gs.addLog('🌟 잔향의 기원: 손패 카드 비용 0!', 'echo'); } if (trigger === Trigger.COMBAT_END) gs._genesisUsed = false; }
    },
    abyss_codex: {
        id: 'abyss_codex', name: '심연의 비전서', icon: '📖', rarity: 'legendary',
        desc: '전투 시작: 덱에서 무작위 희귀 카드 1장 드로우.',
        image: 'relic_abyss_codex.png',
        passive(gs, trigger) { if (trigger === Trigger.COMBAT_START) { const source = (gs.player.drawPile && gs.player.drawPile.length > 0) ? gs.player.drawPile : gs.player.deck; const rares = source.filter(id => CARDS[id]?.rarity === 'rare'); if (rares.length > 0) { const c = rares[Math.floor(Math.random() * rares.length)]; const idx = source.indexOf(c); source.splice(idx, 1); if (source === gs.player.drawPile) { const dIdx = gs.player.deck.indexOf(c); if (dIdx !== -1) gs.player.deck.splice(dIdx, 1); } gs.player.hand.push(c); gs.addLog(`📖 심연의 비전서: ${CARDS[c]?.name} 뽑음!`, 'echo'); } } }
    },
};
