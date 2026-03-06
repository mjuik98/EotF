/**
 * cards.js — 카드 데이터, 업그레이드 맵, 에셋 경로
 */
import { LogUtils } from '../game/utils/log_utils.js';


export const ASSETS = {
    avatars: {
        swordsman: '🗡️',
        mage: '🪄',
        hunter: '⚔️',
        paladin: '✨',
        berserker: '🪓',
        guardian: '🛡️'
    }
};

export const UPGRADE_MAP = {
    'strike': 'strike_plus', 'defend': 'defend_plus', 'echo_strike': 'echo_strike_plus',
    'quick_step': 'quick_step_plus', 'heavy_blow': 'heavy_blow_plus', 'echo_wave': 'echo_wave_plus',
    'foot_step': 'foot_step_plus',
    'resonance': 'resonance_plus', 'soul_rend': 'soul_rend_plus', 'twin_strike': 'twin_strike_plus',
    'echo_shield': 'echo_shield_plus', 'acceleration': 'acceleration_plus', 'foresight': 'foresight_plus',
    'silent_stab': 'silent_stab_plus', 'vanish': 'vanish_plus', 'surge': 'surge_plus',
    'flame_slash': 'flame_slash_plus', 'echo_tide': 'echo_tide_plus', 'tempo_strike': 'tempo_strike_plus',
    'holy_strike': 'holy_strike_plus', 'blood_fury': 'blood_fury_plus', 'iron_defense': 'iron_defense_plus',
    'abyssal_thirst': 'abyssal_thirst_plus', 'battle_dance': 'battle_dance_plus',
    'vibrations_end': 'vibrations_end_plus', 'temporal_echo': 'temporal_echo_plus',
    'silent_strike': 'silent_strike_plus', 'brand_of_light': 'brand_of_light_plus',
    'resonant_shield': 'resonant_shield_plus', 'charge': 'charge_plus', 'afterimage': 'afterimage_plus',
    'phantom_blade': 'phantom_blade_plus', 'echo_dance': 'echo_dance_plus', 'blade_dance': 'blade_dance_plus',
    'counter': 'counter_plus', 'time_echo': 'time_echo_plus', 'void_mirror': 'void_mirror_plus',
    'arcane_storm': 'arcane_storm_plus', 'prediction': 'prediction_plus', 'time_warp': 'time_warp_plus',
    'death_mark': 'death_mark_plus', 'shadow_step': 'shadow_step_plus', 'poison_blade': 'poison_blade_plus',
    'phantom_step': 'phantom_step_plus', 'echo_burst': 'echo_burst_plus', 'void_blade': 'void_blade_plus',
    'soul_armor': 'soul_armor_plus', 'soul_harvest': 'soul_harvest_plus', 'echo_overload': 'echo_overload_plus',
    'desperate_strike': 'desperate_strike_plus', 'reverberation': 'reverberation_plus', 'sanctuary': 'sanctuary_plus',
    'dark_pact': 'dark_pact_plus', 'overcharge': 'overcharge_plus', 'void_tap': 'void_tap_plus',
    'energy_siphon': 'energy_siphon_plus', 'ember_wave': 'ember_wave_plus', 'echo_reflect': 'echo_reflect_plus',
    'chain_reaction': 'chain_reaction_plus', 'revival_echo': 'revival_echo_plus', 'void_surge': 'void_surge_plus',
    'resonance_flow': 'resonance_flow_plus', 'echo_cascade': 'echo_cascade_plus', 'echo_lull': 'echo_lull_plus',
    'divine_grace': 'divine_grace_plus', 'blessing_of_light': 'blessing_of_light_plus', 'reckless_swing': 'reckless_swing_plus',
    'berserk_mode': 'berserk_mode_plus', 'shield_slam': 'shield_slam_plus', 'unbreakable_wall': 'unbreakable_wall_plus',
    'focus': 'focus_plus', 'combat_frenzy': 'combat_frenzy_plus', 'vampiric_touch': 'vampiric_touch_plus', 'spike_shield': 'spike_shield_plus',
    'hallowed_ground': 'hallowed_ground_plus', 'retribution': 'retribution_plus', 'divine_aura': 'divine_aura_plus',
    'frenzy_strike': 'frenzy_strike_plus', 'endure': 'endure_plus', 'blood_contract': 'blood_contract_plus',
    'bastion': 'bastion_plus', 'iron_spikes': 'iron_spikes_plus', 'fortify': 'fortify_plus',
    'judgement': 'judgement_plus', 'wild_slash': 'wild_slash_plus', 'impulse': 'impulse_plus'
};

export const CARDS = {
    // ── [1] 시작 카드 ──
    strike: {
        id: 'strike', name: '타격', icon: '👊🏻', cost: 1, type: 'ATTACK', desc: '피해 9', rarity: 'common',
        effect(gs) { gs.dealDamage(9); }
    },
    strike_plus: {
        id: 'strike_plus', name: '타격+', icon: '👊🏻', cost: 1, type: 'ATTACK', desc: '피해 13. 잔향 5 충전', rarity: 'common', upgraded: true,
        effect(gs) { gs.dealDamage(13); gs.addEcho(5); }
    },
    defend: {
        id: 'defend', name: '수비', icon: '🛡️', cost: 1, type: 'SKILL', desc: '방어막 7', rarity: 'common',
        effect(gs) { gs.addShield(7, { name: '수비', type: 'card' }); }
    },
    defend_plus: {
        id: 'defend_plus', name: '수비+', icon: '🛡️', cost: 1, type: 'SKILL', desc: '방어막 10', rarity: 'common', upgraded: true,
        effect(gs) { gs.addShield(10, { name: '수비+', type: 'card' }); }
    },

    // ── [2] 공통/일반 카드 ──
    echo_strike: {
        id: 'echo_strike', name: '잔향 타격', icon: '💥', cost: 2, type: 'ATTACK', desc: '피해 14. 잔향 20 충전', rarity: 'uncommon',
        effect(gs) { gs.dealDamage(14); gs.addEcho(20); }
    },
    echo_strike_plus: {
        id: 'echo_strike_plus', name: '잔향 타격+', icon: '💥', cost: 1, type: 'ATTACK', desc: '피해 15. 잔향 25 충전', rarity: 'uncommon', upgraded: true,
        effect(gs) { gs.dealDamage(15); gs.addEcho(25); }
    },
    heavy_blow: {
        id: 'heavy_blow', name: '중격', icon: '🔨', cost: 3, type: 'ATTACK', desc: '피해 18. 기절 1턴 부여', rarity: 'rare',
        effect(gs) { gs.dealDamage(18); gs.applyEnemyStatus('stunned', 1); }
    },
    heavy_blow_plus: {
        id: 'heavy_blow_plus', name: '중격+', icon: '🔨', cost: 2, type: 'ATTACK', desc: '피해 26. 기절 1턴 부여', rarity: 'rare', upgraded: true,
        effect(gs) { gs.dealDamage(26); gs.applyEnemyStatus('stunned', 1); }
    },
    echo_wave: {
        id: 'echo_wave', name: '잔향파', icon: '🌊', cost: 2, type: 'ATTACK', desc: '모든 적에게 피해 11', rarity: 'uncommon',
        effect(gs) { gs.dealDamageAll(11); }
    },
    echo_wave_plus: {
        id: 'echo_wave_plus', name: '잔향파+', icon: '🌊', cost: 1, type: 'ATTACK', desc: '모든 적에게 피해 14', rarity: 'uncommon', upgraded: true,
        effect(gs) { gs.dealDamageAll(14); }
    },
    resonance: {
        id: 'resonance', name: '공명', icon: '⚡', cost: 1, type: 'SKILL', desc: '잔향 20 충전', rarity: 'uncommon',
        effect(gs) { gs.addEcho(20); }
    },
    resonance_plus: {
        id: 'resonance_plus', name: '공명+', icon: '⚡', cost: 0, type: 'SKILL', desc: '잔향 30 충전', rarity: 'uncommon', upgraded: true,
        effect(gs) { gs.addEcho(30); }
    },
    soul_rend: {
        id: 'soul_rend', name: '영혼 강탈', icon: '💀', cost: 3, type: 'ATTACK', desc: '피해 26. 체력 5 회복', rarity: 'uncommon',
        effect(gs) { gs.dealDamage(26); gs.heal(5, { name: '영혼 강탈', type: 'card' }); }
    },
    soul_rend_plus: {
        id: 'soul_rend_plus', name: '영혼 강탈+', icon: '💀', cost: 2, type: 'ATTACK', desc: '피해 28. 체력 6 회복', rarity: 'uncommon', upgraded: true,
        effect(gs) { gs.dealDamage(28); gs.heal(6, { name: '영혼 강탈+', type: 'card' }); }
    },
    echo_shield: {
        id: 'echo_shield', name: '잔향 방벽', icon: '🔵', cost: 2, type: 'SKILL', desc: '방어막 (잔향 ÷ 5)', rarity: 'uncommon',
        effect(gs) { gs.addShield(Math.floor(gs.player.echo / 5), { name: '잔향 방벽', type: 'card' }); }
    },
    echo_shield_plus: {
        id: 'echo_shield_plus', name: '잔향 방벽+', icon: '🔵', cost: 1, type: 'SKILL', desc: '방어막 (잔향 ÷ 4). 잔향 10 충전', rarity: 'uncommon', upgraded: true,
        effect(gs) { gs.addShield(Math.floor(gs.player.echo / 4), { name: '잔향 방벽+', type: 'card' }); gs.addEcho(10, { name: '잔향 방벽+', type: 'card' }); }
    },

    // ── [2.1] 희귀 및 특수 카드 (Rare & Special) ──
    echo_burst: {
        id: 'echo_burst', name: '공명 폭발', icon: '🌟', cost: 3, type: 'POWER', desc: '공명 폭발 발동 [즉시]', rarity: 'rare',
        effect(gs) { gs.triggerResonanceBurst(); }
    },
    echo_burst_plus: {
        id: 'echo_burst_plus', name: '공명 폭발+', icon: '🌟', cost: 2, type: 'POWER', desc: '공명 폭발 발동 [즉시]', rarity: 'rare', upgraded: true,
        effect(gs) { gs.triggerResonanceBurst(); }
    },
    void_blade: {
        id: 'void_blade', name: '공허의 도검', icon: '🌀', cost: 1, type: 'ATTACK', desc: '피해 30 [소진]', rarity: 'rare', exhaust: true,
        effect(gs) { gs.dealDamage(30); }
    },
    void_blade_plus: {
        id: 'void_blade_plus', name: '공허의 도검+', icon: '🌀', cost: 1, type: 'ATTACK', desc: '피해 40. 잔향 20 충전 [소진]', rarity: 'rare', upgraded: true, exhaust: true,
        effect(gs) { gs.dealDamage(40); gs.addEcho(20); }
    },
    soul_armor: {
        id: 'soul_armor', name: '영혼 방어구', icon: '💠', cost: 2, type: 'SKILL', desc: '방어막 15 (3턴 동안 매 턴 잔향 10 충전)', rarity: 'rare',
        effect(gs) { gs.addShield(15, { name: '영혼 방어구', type: 'card' }); gs.addBuff('soul_armor', 3, { echoRegen: 10 }); }
    },
    soul_armor_plus: {
        id: 'soul_armor_plus', name: '영혼 방어구+', icon: '💠', cost: 1, type: 'SKILL', desc: '방어막 18 (3턴 동안 매 턴 잔향 12 충전)', rarity: 'rare', upgraded: true,
        effect(gs) { gs.addShield(18, { name: '영혼 방어구+', type: 'card' }); gs.addBuff('soul_armor', 3, { echoRegen: 12 }); }
    },
    soul_harvest: {
        id: 'soul_harvest', name: '영혼 수확', icon: '💫', cost: 2, type: 'ATTACK', desc: '피해 20 (처치 시 체력 8 회복)', rarity: 'uncommon',
        effect(gs) {
            const targetIdx = gs._selectedTarget ?? gs.combat.enemies.findIndex(e => e.hp > 0);
            const enemy = gs.combat.enemies[targetIdx];
            gs.dealDamage(20, targetIdx);
            if (enemy && enemy.hp <= 0) {
                gs.heal(8, { name: '영혼 수확', type: 'card' });
            }
        }
    },
    soul_harvest_plus: {
        id: 'soul_harvest_plus', name: '영혼 수확+', icon: '💫', cost: 1, type: 'ATTACK', desc: '피해 25 (처치 시 체력 10 회복)', rarity: 'uncommon', upgraded: true,
        effect(gs) {
            const targetIdx = gs._selectedTarget ?? gs.combat.enemies.findIndex(e => e.hp > 0);
            const enemy = gs.combat.enemies[targetIdx];
            gs.dealDamage(25, targetIdx);
            if (enemy && enemy.hp <= 0) {
                gs.heal(10, { name: '영혼 수확+', type: 'card' });
            }
        }
    },
    echo_overload: {
        id: 'echo_overload', name: '잔향 과부하', icon: '⚡', cost: 2, type: 'SKILL', desc: '체력 20 소모. 잔향 100 충전. 에너지 2 획득 [소진]', rarity: 'rare', exhaust: true,
        effect(gs) { gs.addEcho(100); gs.player.energy += 2; gs.player.hp = Math.max(1, gs.player.hp - 20); gs.addLog('⚡ 잔향 과부하! HP-20', 'damage'); gs.markDirty('hud'); }
    },
    echo_overload_plus: {
        id: 'echo_overload_plus', name: '잔향 과부하+', icon: '⚡', cost: 1, type: 'SKILL', desc: '체력 20 소모. 잔향 100 충전. 에너지 3 획득 [소진]', rarity: 'rare', upgraded: true, exhaust: true,
        effect(gs) { gs.addEcho(100); gs.player.energy += 2; gs.player.hp = Math.max(1, gs.player.hp - 20); gs.addLog('⚡ 잔향 과부하+! HP-20', 'damage'); gs.markDirty('hud'); }
    },
    desperate_strike: {
        id: 'desperate_strike', name: '결사의 일격', icon: '☠️', cost: 1, type: 'ATTACK', desc: '피해 잃은 체력 비례 (최대 40)', rarity: 'uncommon',
        effect(gs) { const d = Math.floor((1 - gs.player.hp / gs.player.maxHp) * 40) + 5; gs.dealDamage(d); }
    },
    desperate_strike_plus: {
        id: 'desperate_strike_plus', name: '결사의 일격+', icon: '☠️', cost: 0, type: 'ATTACK', desc: '피해 잃은 체력 비례 (최대 50)', rarity: 'uncommon', upgraded: true,
        effect(gs) { const d = Math.floor((1 - gs.player.hp / gs.player.maxHp) * 50) + 8; gs.dealDamage(d); }
    },
    reverberation: {
        id: 'reverberation', name: '반향', icon: '🔊', cost: 2, type: 'ATTACK', desc: '피해 연쇄 수치 × 8 (최대 40)', rarity: 'uncommon',
        effect(gs) { gs.dealDamage(Math.min(40, (gs.player.echoChain || 1) * 8)); }
    },
    reverberation_plus: {
        id: 'reverberation_plus', name: '반향+', icon: '🔊', cost: 2, type: 'ATTACK', desc: '피해 연쇄 수치 × 12 (최대 60)', rarity: 'uncommon', upgraded: true,
        effect(gs) { gs.dealDamage(Math.min(60, (gs.player.echoChain || 1) * 12)); }
    },
    sanctuary: {
        id: 'sanctuary', name: '성역', icon: '🏛️', cost: 3, type: 'SKILL', desc: '방어막 15. 면역 1턴', rarity: 'rare',
        effect(gs) { gs.addShield(15, { name: '성역', type: 'card' }); gs.addBuff('immune', 1, {}); }
    },
    sanctuary_plus: {
        id: 'sanctuary_plus', name: '성역+', icon: '🏛️', cost: 3, type: 'SKILL', desc: '방어막 20. 면역 1턴', rarity: 'rare', upgraded: true,
        effect(gs) { gs.addShield(20, { name: '성역+', type: 'card' }); gs.addBuff('immune', 1, {}); }
    },
    dark_pact: {
        id: 'dark_pact', name: '어둠의 계약', icon: '📜', cost: 0, type: 'SKILL', desc: '체력 5 소모. 카드 1장 드로우', rarity: 'uncommon',
        effect(gs) { gs.player.hp = Math.max(1, gs.player.hp - 5); gs.drawCards(1); gs.markDirty('hud'); }
    },
    dark_pact_plus: {
        id: 'dark_pact_plus', name: '어둠의 계약+', icon: '📜', cost: 0, type: 'SKILL', desc: '체력 5 소모. 카드 2장 드로우', rarity: 'uncommon', upgraded: true,
        effect(gs) { gs.player.hp = Math.max(1, gs.player.hp - 5); gs.drawCards(2); gs.markDirty('hud'); }
    },
    quick_step: {
        id: 'quick_step', name: '잔영 이동', icon: '💨', cost: 0, type: 'SKILL', desc: '방어막 4. 잔향 10 충전', rarity: 'common',
        effect(gs) { gs.addShield(4, { name: '잔영 이동', type: 'card' }); gs.addEcho(10, { name: '잔영 이동', type: 'card' }); }
    },
    quick_step_plus: {
        id: 'quick_step_plus', name: '잔영 이동+', icon: '💨', cost: 0, type: 'SKILL', desc: '방어막 6. 잔향 20 충전', rarity: 'common', upgraded: true,
        effect(gs) { gs.addShield(6, { name: '잔영 이동+', type: 'card' }); gs.addEcho(20, { name: '잔영 이동+', type: 'card' }); }
    },
    surge: {
        id: 'surge', name: '쇄도', icon: '⚡', cost: 0, type: 'SKILL', desc: '에너지 1 획득', rarity: 'uncommon',
        effect(gs) { gs.player.energy += 1; gs.markDirty('hud'); }
    },
    surge_plus: {
        id: 'surge_plus', name: '쇄도+', icon: '⚡', cost: 0, type: 'SKILL', desc: '카드 1장 드로우. 에너지 1 획득', rarity: 'uncommon', upgraded: true,
        effect(gs) { gs.player.energy += 1; gs.drawCards(1); gs.markDirty('hud'); }
    },
    overcharge: {
        id: 'overcharge', name: '과충전', icon: '🔋', cost: 2, type: 'SKILL', desc: '체력 5 소모. 에너지 4 획득. 잔향 30 충전', rarity: 'rare',
        effect(gs) { gs.player.energy += 4; gs.player.hp = Math.max(1, gs.player.hp - 5); gs.addEcho(30); gs.addLog('🔋 과충전! 에너지 +4', 'echo'); gs.markDirty('hud'); }
    },
    overcharge_plus: {
        id: 'overcharge_plus', name: '과충전+', icon: '🔋', cost: 1, type: 'SKILL', desc: '체력 5 소모. 에너지 4 획득. 잔향 40 충전', rarity: 'rare', upgraded: true,
        effect(gs) { gs.player.energy += 4; gs.player.hp = Math.max(1, gs.player.hp - 5); gs.addEcho(40); gs.addLog('🔋 과충전+! 에너지 +4', 'echo'); gs.markDirty('hud'); }
    },
    void_tap: {
        id: 'void_tap', name: '공허 흡수', icon: '🌀', cost: 1, type: 'SKILL', desc: '피해 사용된 에너지 × 6', rarity: 'rare',
        effect(gs) { const spent = gs.player.maxEnergy - gs.player.energy; const dmg = (spent + 1) * 6; gs.dealDamage(dmg); gs.addLog(`🌀 허공 탭: ${dmg} 피해!`, 'echo'); }
    },
    void_tap_plus: {
        id: 'void_tap_plus', name: '공허 흡수+', icon: '🌀', cost: 0, type: 'SKILL', desc: '피해 사용된 에너지 × 8', rarity: 'rare', upgraded: true,
        effect(gs) { const spent = gs.player.maxEnergy - gs.player.energy; const dmg = (spent + 1) * 8; gs.dealDamage(dmg); gs.addLog(`🌀 허공 탭+: ${dmg} 피해!`, 'echo'); }
    },
    energy_siphon: {
        id: 'energy_siphon', name: '에너지 사이펀', icon: '🔵', cost: 0, type: 'ATTACK', desc: '피해 12. 에너지 1 소모 [소진]', rarity: 'uncommon', exhaust: true,
        effect(gs) { if (gs.player.energy > 0) { gs.player.energy--; gs.dealDamage(12); gs.addLog('🔵 에너지 사이펀: 에너지 1 → 12 피해', 'echo'); } else { gs.addLog('🔵 에너지 사이펀: 에너지 없음!', 'damage'); } gs.markDirty('hud'); }
    },
    energy_siphon_plus: {
        id: 'energy_siphon_plus', name: '에너지 사이펀+', icon: '🔵', cost: 0, type: 'ATTACK', desc: '피해 18. 에너지 1 소모 [소진]', rarity: 'uncommon', upgraded: true, exhaust: true,
        effect(gs) { if (gs.player.energy > 0) { gs.player.energy--; gs.dealDamage(18); gs.addLog('🔵 에너지 사이펀+: 에너지 1 → 18 피해', 'echo'); } else { gs.addLog('🔵 에너지 사이펀+: 에너지 없음!', 'damage'); } gs.markDirty('hud'); }
    },
    flame_slash: {
        id: 'flame_slash', name: '화염 베기', icon: '🔥', cost: 1, type: 'ATTACK', desc: '피해 8. 화염 1턴 부여', rarity: 'common',
        effect(gs) { gs.dealDamage(8); gs.applyEnemyStatus('burning', 1); }
    },
    flame_slash_plus: {
        id: 'flame_slash_plus', name: '화염 베기+', icon: '🔥', cost: 1, type: 'ATTACK', desc: '피해 12. 화염 1턴 부여', rarity: 'common', upgraded: true,
        effect(gs) { gs.dealDamage(12); gs.applyEnemyStatus('burning', 1); }
    },
    ember_wave: {
        id: 'ember_wave', name: '불꽃 파동', icon: '🌊', cost: 2, type: 'ATTACK', desc: '모든 적에게 피해 8. 화염 1턴 부여', rarity: 'uncommon',
        effect(gs) {
            gs.dealDamageAll(8); gs.combat.enemies.forEach((_, i) => { if (gs.combat.enemies[i].hp > 0) gs.applyEnemyStatus('burning', 1, i); });
        }
    },
    ember_wave_plus: {
        id: 'ember_wave_plus', name: '불꽃 파동+', icon: '🌊', cost: 2, type: 'ATTACK', desc: '모든 적에게 피해 11. 화염 2턴 부여', rarity: 'uncommon', upgraded: true,
        effect(gs) {
            gs.dealDamageAll(11); gs.combat.enemies.forEach((_, i) => { if (gs.combat.enemies[i].hp > 0) gs.applyEnemyStatus('burning', 2, i); });
        }
    },
    echo_reflect: {
        id: 'echo_reflect', name: '잔향 반향', icon: '🔊', cost: 1, type: 'SKILL', desc: '방어막 8. 반사 획득 (피해 받을 시 적에게 반사)', rarity: 'rare',
        effect(gs) { gs.addShield(8); gs.addBuff('mirror', 1, { reflect: true }); }
    },
    echo_reflect_plus: {
        id: 'echo_reflect_plus', name: '잔향 반향+', icon: '🔊', cost: 0, type: 'SKILL', desc: '방어막 10. 반사 획득 (피해 받을 시 적에게 반사)', rarity: 'rare', upgraded: true,
        effect(gs) { gs.addShield(10); gs.addBuff('mirror', 1, { reflect: true }); }
    },
    chain_reaction: {
        id: 'chain_reaction', name: '연쇄 반응', icon: '⛓️', cost: 2, type: 'ATTACK', desc: '피해 연쇄 수치 × 5 (연쇄 유지)', rarity: 'rare',
        effect(gs) { const chain = Math.max(1, gs.player.echoChain); gs.dealDamage(chain * 5, null, true); }
    },
    chain_reaction_plus: {
        id: 'chain_reaction_plus', name: '연쇄 반응+', icon: '⛓️', cost: 1, type: 'ATTACK', desc: '피해 연쇄 수치 × 7 (연쇄 유지)', rarity: 'rare', upgraded: true,
        effect(gs) { const chain = Math.max(1, gs.player.echoChain); gs.dealDamage(chain * 7, null, true); }
    },
    revival_echo: {
        id: 'revival_echo', name: '소생의 잔향', icon: '💠', cost: 3, type: 'SKILL', desc: '체력 15 회복. 소모 더미 카드 2장 회수 [소진]', rarity: 'rare', exhaust: true,
        effect(gs) { gs.heal(15, { name: '소생의 잔향', type: 'card' }); const rev = []; for (let i = 0; i < 2 && gs.player.graveyard.length > 0; i++) { const c = gs.player.graveyard.pop(); gs.player.hand.push(c); rev.push(CARDS[c]?.name || c); } gs.addLog(`💠 소생 잔향: ${rev.join(', ')} 회수!`, 'echo'); gs.markDirty('hand'); }
    },
    revival_echo_plus: {
        id: 'revival_echo_plus', name: '소생의 잔향+', icon: '💠', cost: 2, type: 'SKILL', desc: '체력 20 회복. 소모 더미 카드 2장 회수 [소진]', rarity: 'rare', upgraded: true, exhaust: true,
        effect(gs) { gs.heal(20, { name: '소생의 잔향+', type: 'card' }); const rev = []; for (let i = 0; i < 2 && gs.player.graveyard.length > 0; i++) { const c = gs.player.graveyard.pop(); gs.player.hand.push(c); rev.push(CARDS[c]?.name || c); } gs.addLog(`💠 소생 잔향+: ${rev.join(', ')} 회수!`, 'echo'); gs.markDirty('hand'); }
    },
    echo_tide: {
        id: 'echo_tide', name: '잔향의 조류', icon: '🌀', cost: 2, type: 'SKILL', desc: '이번 턴 모든 카드 비용 -1. 잔향 10 충전', rarity: 'uncommon',
        effect(gs) { gs.player.costDiscount = (gs.player.costDiscount || 0) + 1; gs.addEcho(10); gs.addLog('🌀 잔향의 조류: 이번 턴 전 카드 비용 -1!', 'echo'); gs.markDirty('hand'); gs.markDirty('hud'); }
    },
    echo_tide_plus: {
        id: 'echo_tide_plus', name: '잔향의 조류+', icon: '🌀', cost: 1, type: 'SKILL', desc: '이번 턴 모든 카드 비용 -1. 잔향 20 충전', rarity: 'uncommon', upgraded: true,
        effect(gs) { gs.player.costDiscount = (gs.player.costDiscount || 0) + 1; gs.addEcho(20); gs.addLog('🌀 잔향의 조류+: 이번 턴 전 카드 비용 -1!', 'echo'); gs.markDirty('hand'); gs.markDirty('hud'); }
    },
    void_surge: {
        id: 'void_surge', name: '공허의 쇄도', icon: '⚡', cost: 1, type: 'SKILL', desc: '이번 턴 모든 카드 비용 -1', rarity: 'rare',
        effect(gs) { gs.player.costDiscount = (gs.player.costDiscount || 0) + 1; gs.addLog('⚡ 공허의 쇄도: 이번 턴 전 카드 비용 -1!', 'echo'); gs.markDirty('hand'); gs.markDirty('hud'); }
    },
    void_surge_plus: {
        id: 'void_surge_plus', name: '공허의 쇄도+', icon: '⚡', cost: 0, type: 'SKILL', desc: '이번 턴 모든 카드 비용 -1', rarity: 'rare', upgraded: true,
        effect(gs) { gs.player.costDiscount = (gs.player.costDiscount || 0) + 1; gs.addLog('⚡ 공허의 쇄도: 이번 턴 전 카드 비용 -1!', 'echo'); gs.markDirty('hand'); gs.markDirty('hud'); }
    },
    // ── [3] 잔향검사 (Swordsman) ──
    foot_step: {
        id: 'foot_step', name: '발도', icon: '💨', cost: 1, type: 'ATTACK', desc: '피해 3. 카드 1장 드로우', rarity: 'uncommon',
        effect(gs) { gs.dealDamage(3); gs.drawCards(1); }
    },
    foot_step_plus: {
        id: 'foot_step_plus', name: '발도+', icon: '💨', cost: 1, type: 'ATTACK', desc: '피해 5. 카드 2장 드로우', rarity: 'uncommon', upgraded: true,
        effect(gs) { gs.dealDamage(5); gs.drawCards(2); }
    },
    twin_strike: {
        id: 'twin_strike', name: '쌍검격', icon: '⚔️', cost: 1, type: 'ATTACK', desc: '피해 6 × 2', rarity: 'uncommon',
        effect(gs) { gs.dealDamage(6, 0, true); gs.dealDamage(6); }
    },
    twin_strike_plus: {
        id: 'twin_strike_plus', name: '쌍검격+', icon: '⚔️', cost: 1, type: 'ATTACK', desc: '피해 8 × 2', rarity: 'uncommon', upgraded: true,
        effect(gs) { gs.dealDamage(8, 0, true); gs.dealDamage(8); }
    },
    acceleration: {
        id: 'acceleration', name: '가속', icon: '👟', cost: 0, type: 'SKILL', desc: '이번 턴 피해 +6 (가속)', rarity: 'common',
        effect(gs) { gs.addBuff('acceleration', 1, { dmgBonus: 6 }); }
    },
    acceleration_plus: {
        id: 'acceleration_plus', name: '가속+', icon: '👟', cost: 0, type: 'SKILL', desc: '이번 턴 피해 +8. 잔향 10 충전 (가속)', rarity: 'common', upgraded: true,
        effect(gs) { gs.addBuff('acceleration', 1, { dmgBonus: 8 }); gs.addEcho(10); }
    },
    charge: {
        id: 'charge', name: '돌진', icon: '⚡', cost: 1, type: 'ATTACK', desc: '피해 9. 가속 수치만큼 추가', rarity: 'common',
        effect(gs) { const a = gs.getBuff('acceleration'); gs.dealDamage(9 + (a ? a.dmgBonus : 0)); }
    },
    charge_plus: {
        id: 'charge_plus', name: '돌진+', icon: '⚡', cost: 1, type: 'ATTACK', desc: '피해 12. 가속 수치만큼 추가', rarity: 'common', upgraded: true,
        effect(gs) { const a = gs.getBuff('acceleration'); gs.dealDamage(12 + (a ? a.dmgBonus : 0)); }
    },
    afterimage: {
        id: 'afterimage', name: '잔영', icon: '👥', cost: 1, type: 'SKILL', desc: '방어막 4. 가속 수치만큼 추가', rarity: 'uncommon',
        effect(gs) { const a = gs.getBuff('acceleration'); gs.addShield(4 + (a ? a.dmgBonus : 0)); }
    },
    afterimage_plus: {
        id: 'afterimage_plus', name: '잔영+', icon: '👥', cost: 0, type: 'SKILL', desc: '방어막 5. 가속 수치만큼 추가', rarity: 'uncommon', upgraded: true,
        effect(gs) { const a = gs.getBuff('acceleration'); gs.addShield(5 + (a ? a.dmgBonus : 0)); }
    },
    blade_dance: {
        id: 'blade_dance', name: '검무', icon: '⚔️', cost: 1, type: 'ATTACK', desc: '피해 4 × 3 (가속 상태 잔향 10 충전)', rarity: 'rare',
        effect(gs) {
            const accel = gs.getBuff('acceleration');
            const bonus = accel ? accel.dmgBonus : 0;
            for (let i = 0; i < 3; i++) {
                gs.dealDamage(4 + bonus, null, i < 2);
            }
            if (accel) gs.addEcho(10);
        }
    },
    blade_dance_plus: {
        id: 'blade_dance_plus', name: '검무+', icon: '⚔️', cost: 1, type: 'ATTACK', desc: '피해 6 × 3 (가속 상태 잔향 15 충전)', rarity: 'rare', upgraded: true,
        effect(gs) {
            const accel = gs.getBuff('acceleration');
            const bonus = accel ? accel.dmgBonus : 0;
            for (let i = 0; i < 3; i++) {
                gs.dealDamage(6 + bonus, null, i < 2);
            }
            if (accel) gs.addEcho(15);
        }
    },
    echo_dance: {
        id: 'echo_dance', name: '잔향의 춤', icon: '💃', cost: 3, type: 'ATTACK', desc: '피해 6 × 4. 타격마다 잔향 6 충전', rarity: 'rare',
        effect(gs) { for (let i = 0; i < 3; i++) { gs.dealDamage(6, null, true); gs.addEcho(6); } gs.dealDamage(6, null); gs.addEcho(6); }
    },
    echo_dance_plus: {
        id: 'echo_dance_plus', name: '잔향의 춤+', icon: '💃', cost: 2, type: 'ATTACK', desc: '피해 7 × 4. 타격마다 잔향 8 충전', rarity: 'rare', upgraded: true,
        effect(gs) { for (let i = 0; i < 3; i++) { gs.dealDamage(7, null, true); gs.addEcho(8); } gs.dealDamage(7, null); gs.addEcho(8); }
    },
    phantom_blade: {
        id: 'phantom_blade', name: '환영 검', icon: '🌀', cost: 2, type: 'ATTACK', desc: '피해 9 × 2. 두 번째 타격 치명타', rarity: 'uncommon',
        effect(gs) { gs.dealDamage(9); gs.addBuff('vanish', 1, {}); gs.dealDamage(9); }
    },
    phantom_blade_plus: {
        id: 'phantom_blade_plus', name: '환영 검+', icon: '🌀', cost: 2, type: 'ATTACK', desc: '피해 12 × 2. 두 번째 타격 치명타', rarity: 'uncommon', upgraded: true,
        effect(gs) { gs.dealDamage(12); gs.addBuff('vanish', 1, {}); gs.dealDamage(12); }
    },
    vibrations_end: {
        id: 'vibrations_end', name: '진동의 끝', icon: '🎸', cost: 1, type: 'ATTACK', desc: '피해 5. 가속 5당 1회 추가 공격', rarity: 'rare',
        effect(gs) {
            const acc = gs.getBuff('acceleration');
            const hits = 1 + Math.floor((acc ? acc.dmgBonus : 0) / 5);
            for (let i = 0; i < hits; i++) {
                gs.dealDamage(5, null, i < hits - 1);
            }
        }
    },
    vibrations_end_plus: {
        id: 'vibrations_end_plus', name: '진동의 끝+', icon: '🎸', cost: 1, type: 'ATTACK', desc: '피해 7. 가속 4당 1회 추가 공격', rarity: 'rare', upgraded: true,
        effect(gs) {
            const acc = gs.getBuff('acceleration');
            const hits = 1 + Math.floor((acc ? acc.dmgBonus : 0) / 4);
            for (let i = 0; i < hits; i++) {
                gs.dealDamage(7, null, i < hits - 1);
            }
        }
    },
    // ── [4] 메아리술사 (Mage) ──
    foresight: {
        id: 'foresight', name: '예지', icon: '👁️', cost: 0, type: 'SKILL', desc: '에너지 1 획득', rarity: 'common',
        effect(gs) { gs.player.energy += 1; gs.markDirty('hud'); }
    },
    foresight_plus: {
        id: 'foresight_plus', name: '예지+', icon: '👁️', cost: 0, type: 'SKILL', desc: '에너지 1 획득. 잔향 10 충전', rarity: 'common', upgraded: true,
        effect(gs) { gs.player.energy += 1; gs.markDirty('hud'); gs.addEcho(10); }
    },
    time_echo: {
        id: 'time_echo', name: '시간의 잔향', icon: '⏳', cost: 1, type: 'SKILL', desc: '최근 사용한 카드 1장 회수', rarity: 'uncommon',
        effect(gs) {
            if (gs.player.graveyard.length > 0) { const c = gs.player.graveyard.pop(); gs.player.hand.push(c); gs.addLog(`⏳ ${CARDS[c]?.name} 회수!`, 'echo'); }
        }
    },
    time_echo_plus: {
        id: 'time_echo_plus', name: '시간의 잔향+', icon: '⏳', cost: 0, type: 'SKILL', desc: '카드 1장 드로우. 최근 사용한 카드 1장 회수', rarity: 'uncommon', upgraded: true,
        effect(gs) { if (gs.player.graveyard.length > 0) { const c = gs.player.graveyard.pop(); gs.player.hand.push(c); gs.addLog(`⏳ ${CARDS[c]?.name} 회수!`, 'echo'); } gs.drawCards(1); }
    },
    void_mirror: {
        id: 'void_mirror', name: '공허의 거울', icon: '🪞', cost: 2, type: 'ATTACK', desc: '반사 획득 (다음 공격 적에게 반사)', rarity: 'uncommon',
        effect(gs) { gs.addBuff('mirror', 1, { reflect: true }); gs.addLog('🪞 반사 준비', 'echo'); }
    },
    void_mirror_plus: {
        id: 'void_mirror_plus', name: '공허의 거울+', icon: '🪞', cost: 1, type: 'ATTACK', desc: '반사 획득 (다음 공격 적에게 반사). 잔향 10 충전', rarity: 'uncommon', upgraded: true,
        effect(gs) { gs.addBuff('mirror', 1, { reflect: true }); gs.addEcho(10); gs.addLog('🪞 반사 준비+', 'echo'); }
    },
    prediction: {
        id: 'prediction', name: '예언', icon: '🔮', cost: 1, type: 'SKILL', desc: '카드 2장 드로우. 잔향 15 충전', rarity: 'uncommon',
        effect(gs) { if (gs.combat.active) gs.drawCards(2); gs.addEcho(15); }
    },
    prediction_plus: {
        id: 'prediction_plus', name: '예언+', icon: '🔮', cost: 1, type: 'SKILL', desc: '카드 3장 드로우. 잔향 20 충전', rarity: 'uncommon', upgraded: true,
        effect(gs) { if (gs.combat.active) gs.drawCards(3); gs.addEcho(20); }
    },
    temporal_echo: {
        id: 'temporal_echo', name: '기시감', icon: '⏳', cost: 2, type: 'SKILL', desc: '최근 사용한 카드 1장 회수', rarity: 'uncommon',
        effect(gs) {
            if (gs.player.graveyard.length > 0) {
                const lastCardId = gs.player.graveyard[gs.player.graveyard.length - 1];
                gs.player.hand.push(lastCardId);
                gs.addLog(`⏳ 기시감: ${CARDS[lastCardId]?.name}를 메아리칩니다!`, 'echo');
                gs.markDirty('hand');
            }
        }
    },
    temporal_echo_plus: {
        id: 'temporal_echo_plus', name: '기시감+', icon: '⏳', cost: 1, type: 'SKILL', desc: '최근 사용한 카드 1장 회수 (비용 0)', rarity: 'uncommon', upgraded: true,
        effect(gs) {
            if (gs.player.graveyard.length > 0) {
                const lastCardId = gs.player.graveyard[gs.player.graveyard.length - 1];
                gs.player.hand.push(lastCardId);
                if (!gs.player._temporaryDiscounts) gs.player._temporaryDiscounts = {};
                gs.player._temporaryDiscounts[gs.player.hand.length - 1] = 99; // 99는 무료를 의미하는 내부 코드라고 가정
                gs.addLog(`⏳ 기시감 +: ${CARDS[lastCardId]?.name}를 0코스트로 메아리칩니다!`, 'echo');
                gs.markDirty('hand');
            }
        }
    },
    arcane_storm: {
        id: 'arcane_storm', name: '비전 폭풍', icon: '🌩️', cost: 3, type: 'ATTACK', desc: '모든 적에게 피해 16. 연쇄 +2', rarity: 'rare',
        effect(gs) { gs.dealDamageAll(16); gs.player.echoChain += 2; gs.updateChainDisplay(); }
    },
    arcane_storm_plus: {
        id: 'arcane_storm_plus', name: '비전 폭풍+', icon: '🌩️', cost: 2, type: 'ATTACK', desc: '모든 적에게 피해 20. 연쇄 +3', rarity: 'rare', upgraded: true,
        effect(gs) { gs.dealDamageAll(20); gs.player.echoChain += 3; gs.updateChainDisplay(); }
    },
    time_warp: {
        id: 'time_warp', name: '시간 왜곡', icon: '🌀', cost: 3, type: 'POWER', desc: '매 턴 에너지 1 획득 [지속]', rarity: 'rare',
        effect(gs) { gs.addBuff('time_warp', 99, { energyPerTurn: 1 }); }
    },
    time_warp_plus: {
        id: 'time_warp_plus', name: '시간 왜곡+', icon: '🌀', cost: 2, type: 'POWER', desc: '매 턴 에너지 1 획득 [지속]', rarity: 'rare', upgraded: true,
        effect(gs) { gs.addBuff('time_warp', 99, { energyPerTurn: 1 }); }
    },

    // ── [5] 침묵사냥꾼 (Hunter) ──
    silent_stab: {
        id: 'silent_stab', name: '자상', icon: '🔪', cost: 1, type: 'ATTACK', desc: '피해 7. 독 1턴 부여', rarity: 'uncommon',
        effect(gs) { gs.dealDamage(7); gs.applyEnemyStatus('poisoned', 1); }
    },
    silent_stab_plus: {
        id: 'silent_stab_plus', name: '자상+', icon: '🔪', cost: 0, type: 'ATTACK', desc: '피해 11. 독 2턴 부여', rarity: 'uncommon', upgraded: true,
        effect(gs) { gs.dealDamage(11); gs.applyEnemyStatus('poisoned', 2); }
    },
    vanish: {
        id: 'vanish', name: '은신', icon: '🌑', cost: 1, type: 'SKILL', desc: '은신 (다음 공격 치명타 적중)', rarity: 'common',
        effect(gs) {
            gs.addBuff('vanish', 1, {});
            gs.addLog(LogUtils.formatCardBuff('은신', '다음 공격 크리티컬'), 'buff');
        }
    },
    vanish_plus: {
        id: 'vanish_plus', name: '은신+', icon: '🌑', cost: 0, type: 'SKILL', desc: '은신 (다음 공격 치명타 적중)', rarity: 'common', upgraded: true,
        effect(gs) {
            gs.addBuff('vanish', 1, {});
            gs.addLog(LogUtils.formatCardBuff('은신', '다음 공격 크리티컬)'), 'buff');
        }
    },
    counter: {
        id: 'counter', name: '반격', icon: '🔄', cost: 2, type: 'ATTACK', desc: '피해 적 예고 피해 × 1.5 (최대 30)', rarity: 'common',
        effect(gs) { gs.dealDamage(Math.min(30, Math.floor(gs.getEnemyIntent() * 1.5))); }
    },
    counter_plus: {
        id: 'counter_plus', name: '반격+', icon: '🔄', cost: 1, type: 'ATTACK', desc: '피해 적 예고 피해 × 2 (최대 40)', rarity: 'common', upgraded: true,
        effect(gs) { gs.dealDamage(Math.min(40, Math.floor(gs.getEnemyIntent() * 2))); }
    },
    death_mark: {
        id: 'death_mark', name: '처형 표식', icon: '💢', cost: 1, type: 'ATTACK', desc: '처형 표식 3턴 부여 (3턴 후 피해 30 폭발)', rarity: 'uncommon',
        effect(gs) { gs.applyEnemyStatus('marked', 3); gs.addLog('💢 처형 표식!', 'echo'); }
    },
    death_mark_plus: {
        id: 'death_mark_plus', name: '처형 표식+', icon: '💢', cost: 0, type: 'ATTACK', desc: '처형 표식 2턴 부여 (2턴 후 피해 30 폭발)', rarity: 'uncommon', upgraded: true,
        effect(gs) { gs.applyEnemyStatus('marked', 2); gs.addLog('💢 처형 표식!', 'echo'); }
    },
    shadow_step: {
        id: 'shadow_step', name: '그림자 도약', icon: '🌑', cost: 1, type: 'SKILL', desc: '방어막 5. 다음 공격 피해 +8', rarity: 'uncommon',
        effect(gs) {
            gs.addShield(5);
            gs.addBuff('shadow_atk', 1, { dmgBonus: 8 });
            gs.addLog(LogUtils.formatCardBuff('그림자 도약', '다음 공격 +8'), 'buff');
        }
    },
    shadow_step_plus: {
        id: 'shadow_step_plus', name: '그림자 도약+', icon: '🌑', cost: 0, type: 'SKILL', desc: '방어막 8. 다음 공격 피해 +10', rarity: 'uncommon', upgraded: true,
        effect(gs) {
            gs.addShield(8);
            gs.addBuff('shadow_atk', 1, { dmgBonus: 10 });
            gs.addLog(LogUtils.formatCardBuff('그림자 도약+', '다음 공격 +10'), 'buff');
        }
    },
    poison_blade: {
        id: 'poison_blade', name: '독침 검', icon: '🐍', cost: 1, type: 'ATTACK', desc: '독 3턴 부여', rarity: 'uncommon',
        effect(gs) { gs.applyEnemyStatus('poisoned', 3); }
    },
    poison_blade_plus: {
        id: 'poison_blade_plus', name: '독침 검+', icon: '🐍', cost: 0, type: 'ATTACK', desc: '독 4턴 부여', rarity: 'uncommon', upgraded: true,
        effect(gs) { gs.applyEnemyStatus('poisoned', 4); }
    },
    phantom_step: {
        id: 'phantom_step', name: '환영 보폭', icon: '💨', cost: 2, type: 'SKILL', desc: '카드 1장 드로우. 회피 1 획득', rarity: 'uncommon',
        effect(gs) {
            gs.drawCards(1);
            gs.addBuff('dodge', 1, {});
            gs.addLog(LogUtils.formatCardBuff('환영 보폭', '회피 +1'), 'buff');
        }
    },
    phantom_step_plus: {
        id: 'phantom_step_plus', name: '환영 보폭+', icon: '💨', cost: 2, type: 'SKILL', desc: '카드 2장 드로우. 회피 1 획득', rarity: 'uncommon', upgraded: true,
        effect(gs) {
            gs.drawCards(2);
            gs.addBuff('dodge', 1, {});
            gs.addLog(LogUtils.formatCardBuff('환영 보폭+', '회피 +1'), 'buff');
        }
    },
    silent_strike: {
        id: 'silent_strike', name: '심장 정지', icon: '🗡️', cost: 1, type: 'ATTACK', desc: '피해 7. 모든 독 피해 즉시 부여 및 해제', rarity: 'uncommon',
        effect(gs) {
            const targetIdx = Number.isInteger(gs._selectedTarget)
                ? gs._selectedTarget
                : gs.combat.enemies.findIndex(e => e.hp > 0);
            const enemy = gs.combat.enemies[targetIdx];
            if (!enemy) return;
            const poison = enemy.statusEffects?.poisoned || 0;
            const duration = enemy.statusEffects?.poisonDuration || 0;
            const totalPoisonDmg = poison * 5 * duration;

            gs.dealDamage(7 + totalPoisonDmg, targetIdx);

            if (poison > 0) {
                delete enemy.statusEffects.poisoned;
                delete enemy.statusEffects.poisonDuration;
                gs.addLog(LogUtils.formatEcho(`심장 정지: ${totalPoisonDmg} 독 피해를 단숨에 입힘!`), 'damage');
            }
        }
    },
    silent_strike_plus: {
        id: 'silent_strike_plus', name: '심장 정지+', icon: '🗡️', cost: 1, type: 'ATTACK', desc: '피해 10. 모든 독 피해 즉시 부여 및 해제', rarity: 'uncommon', upgraded: true,
        effect(gs) {
            const targetIdx = Number.isInteger(gs._selectedTarget)
                ? gs._selectedTarget
                : gs.combat.enemies.findIndex(e => e.hp > 0);
            const enemy = gs.combat.enemies[targetIdx];
            if (!enemy) return;
            const poison = enemy.statusEffects?.poisoned || 0;
            const duration = enemy.statusEffects?.poisonDuration || 0;
            const totalPoisonDmg = poison * 5 * duration;

            gs.dealDamage(10 + totalPoisonDmg, targetIdx);

            if (poison > 0) {
                delete enemy.statusEffects.poisoned;
                delete enemy.statusEffects.poisonDuration;
                gs.addLog(LogUtils.formatEcho(`심장 정지 +: ${totalPoisonDmg} 독 피해를 단숨에 입힘!`), 'damage');
            }
        }
    },

    // ── [2.3] 신규 메커니즘 (New Mechanics) ──
    focus: {
        id: 'focus', name: '집중', icon: '🎯', cost: 0, type: 'SKILL', desc: '다음 공격 치명타 적중', rarity: 'common',
        effect(gs) { gs.addBuff('focus', 1, {}); gs.addLog(LogUtils.formatCardBuff('집중', '다음 공격 치명타'), 'buff'); }
    },
    focus_plus: {
        id: 'focus_plus', name: '집중+', icon: '🎯', cost: 0, type: 'SKILL', desc: '카드 1장 드로우. 다음 공격 치명타 적중', rarity: 'common', upgraded: true,
        effect(gs) { gs.addBuff('focus', 1, {}); gs.drawCards(1); gs.addLog(LogUtils.formatCardBuff('집중+', '다음 공격 치명타'), 'buff'); }
    },
    combat_frenzy: {
        id: 'combat_frenzy', name: '전투 광란', icon: '🔥', cost: 2, type: 'SKILL', desc: '이번 턴 모든 공격 치명타 적중', rarity: 'uncommon',
        effect(gs) { gs.addBuff('critical_turn', 1, {}); gs.addLog(LogUtils.formatCardBuff('전체 치명타', '이번 턴 모든 공격 치명타'), 'buff'); }
    },
    combat_frenzy_plus: {
        id: 'combat_frenzy_plus', name: '전투 광란+', icon: '🔥', cost: 1, type: 'SKILL', desc: '이번 턴 모든 공격 치명타 적중', rarity: 'uncommon', upgraded: true,
        effect(gs) { gs.addBuff('critical_turn', 1, {}); gs.addLog(LogUtils.formatCardBuff('전체 치명타+', '이번 턴 모든 공격 치명타'), 'buff'); }
    },
    vampiric_touch: {
        id: 'vampiric_touch', name: '흡혈의 손길', icon: '🧛', cost: 1, type: 'SKILL', desc: '가한 피해량의 30% 회복 (다음 2턴) [소진]', rarity: 'rare', exhaust: true,
        effect(gs) { gs.addBuff('lifesteal', 2, { percent: 30 }); gs.addLog(LogUtils.formatCardBuff('흡혈', '피해량 30% 회복'), 'buff'); }
    },
    vampiric_touch_plus: {
        id: 'vampiric_touch_plus', name: '흡혈의 손길+', icon: '🧛', cost: 1, type: 'SKILL', desc: '가한 피해량의 40% 회복 (다음 3턴) [소진]', rarity: 'rare', upgraded: true, exhaust: true,
        effect(gs) { gs.addBuff('lifesteal', 3, { percent: 40 }); gs.addLog(LogUtils.formatCardBuff('흡혈+', '피해량 40% 회복'), 'buff'); }
    },
    spike_shield: {
        id: 'spike_shield', name: '가시 방패', icon: '🦔', cost: 2, type: 'SKILL', desc: '피해 반사 및 무효화 (이번 턴) [소진]', rarity: 'rare', exhaust: true,
        effect(gs) { gs.addBuff('spike_shield', 1, {}); gs.addLog(LogUtils.formatCardBuff('가시 방패', '피해 반사'), 'buff'); }
    },
    spike_shield_plus: {
        id: 'spike_shield_plus', name: '가시 방패+', icon: '🦔', cost: 1, type: 'SKILL', desc: '피해 반사 및 무효화 (이번 턴) [소진]', rarity: 'rare', upgraded: true, exhaust: true,
        effect(gs) { gs.addBuff('spike_shield', 1, {}); gs.addLog(LogUtils.formatCardBuff('가시 방패+', '피해 반사'), 'buff'); }
    },

    // ── [2.2] 유틸리티 및 에너지 (Utility & Energy) ──
    resonance_flow: {
        id: 'resonance_flow', name: '공명의 흐름', icon: '🎵', cost: 1, type: 'SKILL', desc: '잔향 5 충전 (손패 1장당)', rarity: 'uncommon',
        effect(gs) { const n = gs.player.hand.length; gs.addEcho(n * 5); gs.addLog(`🎵 공명의 흐름: 손패 ${n} 장 → Echo + ${n * 5} !`, 'echo'); }
    },
    resonance_flow_plus: {
        id: 'resonance_flow_plus', name: '공명의 흐름+', icon: '🎵', cost: 0, type: 'SKILL', desc: '잔향 8 충전 (손패 1장당)', rarity: 'uncommon', upgraded: true,
        effect(gs) { const n = gs.player.hand.length; gs.addEcho(n * 8); gs.addLog(`🎵 공명의 흐름 +: 손패 ${n} 장 → Echo + ${n * 8} !`, 'echo'); }
    },
    echo_cascade: {
        id: 'echo_cascade', name: '잔향의 폭포', icon: '💧', cost: 2, type: 'SKILL', desc: '카드 1장 드로우 (비용 0) [소진]', rarity: 'rare', exhaust: true,
        effect(gs) {
            const before = gs.player.hand.length;
            gs.drawCards(1);
            const newCardIds = gs.player.hand.slice(before);
            if (newCardIds.length > 0) {
                const cardId = newCardIds[0];
                if (!gs.player._cascadeCards) gs.player._cascadeCards = new Map();
                gs.player._cascadeCards.set(gs.player.hand.length - 1, cardId);
                gs.addLog(`💧 잔향의 폭포: ${CARDS[cardId]?.name} 드로우, 비용 0!`, 'echo');
            }
            gs.markDirty('hand');
        }
    },
    echo_cascade_plus: {
        id: 'echo_cascade_plus', name: '잔향의 폭포+', icon: '💧', cost: 1, type: 'SKILL', desc: '카드 1장 드로우 (비용 0) [소진]', rarity: 'rare', upgraded: true, exhaust: true,
        effect(gs) {
            const before = gs.player.hand.length;
            gs.drawCards(1);
            const newCardIds = gs.player.hand.slice(before);
            if (newCardIds.length > 0) {
                const cardId = newCardIds[0];
                if (!gs.player._cascadeCards) gs.player._cascadeCards = new Map();
                gs.player._cascadeCards.set(gs.player.hand.length - 1, cardId);
                gs.addLog(`💧 잔향의 폭포 +: ${CARDS[cardId]?.name} 드로우, 비용 0!`, 'echo');
            }
            gs.markDirty('hand');
        }
    },
    tempo_strike: {
        id: 'tempo_strike', name: '박자 강타', icon: '🥁', cost: 2, type: 'ATTACK', desc: '피해 8. 다음 카드 비용 -1', rarity: 'uncommon',
        effect(gs) {
            gs.dealDamage(8);
            gs.player._nextCardDiscount = (gs.player._nextCardDiscount || 0) + 1;
            gs.markDirty('hand');
        }
    },
    tempo_strike_plus: {
        id: 'tempo_strike_plus', name: '박자 강타+', icon: '🥁', cost: 1, type: 'ATTACK', desc: '피해 12. 다음 카드 비용 -1', rarity: 'uncommon', upgraded: true,
        effect(gs) {
            gs.dealDamage(12);
            gs.player._nextCardDiscount = (gs.player._nextCardDiscount || 0) + 1;
            gs.markDirty('hand');
        }
    },
    echo_lull: {
        id: 'echo_lull', name: '잔향의 고요', icon: '🌙', cost: 1, type: 'SKILL', desc: '손패 모든 카드 비용 -2. 에너지 1 소모 [소진]', rarity: 'uncommon', exhaust: true,
        effect(gs) { gs.player.energy = Math.max(0, gs.player.energy - 1); gs.player.costDiscount = (gs.player.costDiscount || 0) + 2; gs.addLog('🌙 잔향의 고요: 에너지 -1, 모든 카드 비용 -2!', 'echo'); gs.markDirty('hand'); gs.markDirty('hud'); }
    },
    echo_lull_plus: {
        id: 'echo_lull_plus', name: '잔향의 고요+', icon: '🌙', cost: 0, type: 'SKILL', desc: '손패 모든 카드 비용 -2. 에너지 1 소모 [소진]', rarity: 'uncommon', upgraded: true, exhaust: true,
        effect(gs) { gs.player.energy = Math.max(0, gs.player.energy - 1); gs.player.costDiscount = (gs.player.costDiscount || 0) + 2; gs.addLog('🌙 잔향의 고요+: 에너지 -1, 모든 카드 비용 -2!', 'echo'); gs.markDirty('hand'); gs.markDirty('hud'); }
    },

    // ── [6] 찬송기사 (Paladin) ──
    holy_strike: {
        id: 'holy_strike', name: '성스러운 강타', icon: '✨', cost: 1, type: 'ATTACK', desc: '피해 8. 체력 2 회복', rarity: 'uncommon',
        effect(gs) { gs.dealDamage(8); gs.heal(2, { name: '성스러운 강타', type: 'card' }); }
    },
    holy_strike_plus: {
        id: 'holy_strike_plus', name: '성스러운 강타+', icon: '✨', cost: 1, type: 'ATTACK', desc: '피해 11. 체력 4 회복', rarity: 'uncommon', upgraded: true,
        effect(gs) { gs.dealDamage(11); gs.heal(4, { name: '성스러운 강타+', type: 'card' }); }
    },
    divine_grace: {
        id: 'divine_grace', name: '신의 은총', icon: '🙏', cost: 1, type: 'SKILL', desc: '방어막 6. 잔향 15 충전', rarity: 'uncommon',
        effect(gs) { gs.addShield(6, { name: '신의 은총', type: 'card' }); gs.addEcho(15, { name: '신의 은총', type: 'card' }); }
    },
    divine_grace_plus: {
        id: 'divine_grace_plus', name: '신의 은총+', icon: '🙏', cost: 0, type: 'SKILL', desc: '방어막 8. 잔향 20 충전', rarity: 'uncommon', upgraded: true,
        effect(gs) { gs.addShield(8, { name: '신의 은총+', type: 'card' }); gs.addEcho(20, { name: '신의 은총+', type: 'card' }); }
    },
    brand_of_light: {
        id: 'brand_of_light', name: '빛의 낙인', icon: '🕯️', cost: 1, type: 'SKILL', desc: '낙인 부여 (다음 2턴) (피격 시 체력 2 회복)', rarity: 'uncommon',
        effect(gs) { gs.applyEnemyStatus('branded', 2); }
    },
    brand_of_light_plus: {
        id: 'brand_of_light_plus', name: '빛의 낙인+', icon: '🕯️', cost: 0, type: 'SKILL', desc: '낙인 부여 (다음 3턴) (피격 시 체력 4 회복)', rarity: 'uncommon', upgraded: true,
        effect(gs) { gs.applyEnemyStatus('branded', 3); }
    },
    blessing_of_light: {
        id: 'blessing_of_light', name: '빛의 축복', icon: '☀️', cost: 2, type: 'POWER', desc: '매 턴 체력 3 회복 [지속]', rarity: 'uncommon',
        effect(gs) { gs.addBuff('blessing_of_light', 99, { healPerTurn: 3 }); }
    },
    blessing_of_light_plus: {
        id: 'blessing_of_light_plus', name: '빛의 축복+', icon: '☀️', cost: 1, type: 'POWER', desc: '매 턴 체력 4 회복 [지속]', rarity: 'uncommon', upgraded: true,
        effect(gs) { gs.addBuff('blessing_of_light_plus', 99, { healPerTurn: 4 }); }
    },
    hallowed_ground: {
        id: 'hallowed_ground', name: '성역 지대', icon: '⛪', cost: 2, type: 'SKILL', desc: '방어막 12. 다음 공격 피해 50% 경감', rarity: 'uncommon',
        effect(gs) { gs.addShield(12); gs.addBuff('protection', 1, { dmgReduce: 0.5 }); }
    },
    hallowed_ground_plus: {
        id: 'hallowed_ground_plus', name: '성역 지대+', icon: '⛪', cost: 2, type: 'SKILL', desc: '방어막 16. 다음 공격 피해 70% 경감', rarity: 'uncommon', upgraded: true,
        effect(gs) { gs.addShield(16); gs.addBuff('protection', 1, { dmgReduce: 0.7 }); }
    },
    retribution: {
        id: 'retribution', name: '응징', icon: '⚖️', cost: 1, type: 'ATTACK', desc: '피해 10. 잃은 체력의 10%만큼 추가', rarity: 'rare',
        effect(gs) { const lostTotal = (gs.player._totalHpLost || 0); gs.dealDamage(10 + Math.floor(lostTotal * 0.1)); }
    },
    retribution_plus: {
        id: 'retribution_plus', name: '응징+', icon: '⚖️', cost: 1, type: 'ATTACK', desc: '피해 14. 잃은 체력의 15%만큼 추가', rarity: 'rare', upgraded: true,
        effect(gs) { const lostTotal = (gs.player._totalHpLost || 0); gs.dealDamage(14 + Math.floor(lostTotal * 0.15)); }
    },
    divine_aura: {
        id: 'divine_aura', name: '신성한 오라', icon: '😇', cost: 2, type: 'POWER', desc: '매 턴 종료 시 방어막 5 획득 [지속]', rarity: 'rare',
        effect(gs) { gs.addBuff('divine_aura', 99, { shieldPerTurn: 5 }); }
    },
    divine_aura_plus: {
        id: 'divine_aura_plus', name: '신성한 오라+', icon: '😇', cost: 1, type: 'POWER', desc: '매 턴 종료 시 방어막 7 획득 [지속]', rarity: 'rare', upgraded: true,
        effect(gs) { gs.addBuff('divine_aura', 99, { shieldPerTurn: 7 }); }
    },
    judgement: {
        id: 'judgement', name: '심판', icon: '⚖️', cost: 2, type: 'ATTACK', desc: '피해 15. 디버프 1개당 +6', rarity: 'uncommon',
        effect(gs) {
            const targetIdx = Number.isInteger(gs._selectedTarget)
                ? gs._selectedTarget
                : gs.combat.enemies.findIndex(e => e.hp > 0);
            const enemy = gs.combat.enemies[targetIdx];
            const debuffCount = Object.keys(enemy?.statusEffects || {}).length;
            gs.dealDamage(15 + (debuffCount * 6), targetIdx);
        }
    },
    judgement_plus: {
        id: 'judgement_plus', name: '심판+', icon: '⚖️', cost: 1, type: 'ATTACK', desc: '피해 18. 디버프 1개당 +8', rarity: 'uncommon', upgraded: true,
        effect(gs) {
            const targetIdx = Number.isInteger(gs._selectedTarget)
                ? gs._selectedTarget
                : gs.combat.enemies.findIndex(e => e.hp > 0);
            const enemy = gs.combat.enemies[targetIdx];
            const debuffCount = Object.keys(enemy?.statusEffects || {}).length;
            gs.dealDamage(18 + (debuffCount * 8), targetIdx);
        }
    },

    // ── [7] 파음전사 (Berserker) ──
    blood_fury: {
        id: 'blood_fury', name: '핏빛 분노', icon: '🩸', cost: 1, type: 'ATTACK', desc: '피해 7 (잃은 체력 10당 +3)', rarity: 'uncommon',
        effect(gs) {
            const lostHp = gs.player.maxHp - gs.player.hp;
            const bonus = Math.floor(lostHp / 10) * 3;
            gs.dealDamage(7 + bonus);
        }
    },
    blood_fury_plus: {
        id: 'blood_fury_plus', name: '핏빛 분노+', icon: '🩸', cost: 0, type: 'ATTACK', desc: '피해 10 (잃은 체력 10당 +5)', rarity: 'uncommon', upgraded: true,
        effect(gs) {
            const lostHp = gs.player.maxHp - gs.player.hp;
            const bonus = Math.floor(lostHp / 10) * 5;
            gs.dealDamage(10 + bonus);
        }
    },
    reckless_swing: {
        id: 'reckless_swing', name: '무모한 휘두르기', icon: '🪓', cost: 1, type: 'ATTACK', desc: '체력 3 소모. 피해 12', rarity: 'uncommon',
        effect(gs) {
            gs.player.hp = Math.max(1, gs.player.hp - 3);
            gs.dealDamage(12);
            gs.markDirty?.('hud');
        }
    },
    reckless_swing_plus: {
        id: 'reckless_swing_plus', name: '무모한 휘두르기+', icon: '🪓', cost: 0, type: 'ATTACK', desc: '체력 4 소모. 피해 16', rarity: 'uncommon', upgraded: true,
        effect(gs) {
            gs.player.hp = Math.max(1, gs.player.hp - 4);
            gs.dealDamage(16);
            gs.markDirty?.('hud');
        }
    },
    battle_dance: {
        id: 'battle_dance', name: '죽음의 무도', icon: '💃', cost: 1, type: 'SKILL', desc: '방어막 5. 잃은 체력 5당 +2 추가', rarity: 'uncommon',
        effect(gs) {
            const lostHp = gs.player.maxHp - gs.player.hp;
            const bonus = Math.floor(lostHp / 5) * 2;
            gs.addShield(5 + bonus);
        }
    },
    battle_dance_plus: {
        id: 'battle_dance_plus', name: '죽음의 무도+', icon: '💃', cost: 1, type: 'SKILL', desc: '방어막 8. 잃은 체력 4당 +2 추가', rarity: 'uncommon', upgraded: true,
        effect(gs) {
            const lostHp = gs.player.maxHp - gs.player.hp;
            const bonus = Math.floor(lostHp / 4) * 2;
            gs.addShield(8 + bonus);
        }
    },
    berserk_mode: {
        id: 'berserk_mode', name: '광폭화', icon: '😡', cost: 3, type: 'POWER', desc: '공격할 때마다 피해 +2 [지속]', rarity: 'rare',
        effect(gs) { gs.addBuff('berserk_mode', 99, { atkGrowth: 2 }); }
    },
    berserk_mode_plus: {
        id: 'berserk_mode_plus', name: '광폭화+', icon: '😡', cost: 2, type: 'POWER', desc: '공격할 때마다 피해 +3 [지속]', rarity: 'rare', upgraded: true,
        effect(gs) { gs.addBuff('berserk_mode_plus', 99, { atkGrowth: 3 }); }
    },
    abyssal_thirst: {
        id: 'abyssal_thirst', name: '심연의 목마름', icon: '🍷', cost: 2, type: 'SKILL', desc: '현재 체력 50% 소모. 방어막 획득 (소모량 200%)', rarity: 'rare',
        effect(gs) {
            const cost = Math.floor(gs.player.hp * 0.5);
            gs.player.hp = Math.max(1, gs.player.hp - cost);
            gs.addShield(cost * 2);
            gs.addLog(`🍷 심연의 목마름: HP ${cost} 소모 -> 방어막 ${cost * 2} 획득!`, 'echo');
            gs.markDirty('hud');
        }
    },
    abyssal_thirst_plus: {
        id: 'abyssal_thirst_plus', name: '심연의 목마름+', icon: '🍷', cost: 1, type: 'SKILL', desc: '현재 체력 50% 소모. 방어막 획득 (소모량 300%)', rarity: 'rare', upgraded: true,
        effect(gs) {
            const cost = Math.floor(gs.player.hp * 0.5);
            gs.player.hp = Math.max(1, gs.player.hp - cost);
            gs.addShield(cost * 3);
            gs.addLog(`🍷 심연의 목마름 +: HP ${cost} 소모 -> 방어막 ${cost * 3} 획득!`, 'echo');
            gs.markDirty('hud');
        }
    },
    frenzy_strike: {
        id: 'frenzy_strike', name: '광분 타격', icon: '🪓', cost: 1, type: 'ATTACK', desc: '피해 12. 에너지 1 회복', rarity: 'uncommon',
        effect(gs) { gs.dealDamage(12); gs.player.energy += 1; gs.markDirty('hud'); }
    },
    frenzy_strike_plus: {
        id: 'frenzy_strike_plus', name: '광분 타격+', icon: '🪓', cost: 1, type: 'ATTACK', desc: '피해 16. 카드 1장 드로우. 에너지 1 회복', rarity: 'uncommon', upgraded: true,
        effect(gs) { gs.dealDamage(16); gs.player.energy += 1; gs.drawCards(1); gs.markDirty('hud'); }
    },
    endure: {
        id: 'endure', name: '인내', icon: '🧘', cost: 1, type: 'SKILL', desc: '방어막 10. 다음 턴 공격 피해 +5', rarity: 'uncommon',
        effect(gs) { gs.addShield(10); gs.addBuff('endure_buff', 1, { dmgBonus: 5 }); }
    },
    endure_plus: {
        id: 'endure_plus', name: '인내+', icon: '🧘', cost: 1, type: 'SKILL', desc: '방어막 14. 다음 턴 공격 피해 +8', rarity: 'uncommon', upgraded: true,
        effect(gs) { gs.addShield(14); gs.addBuff('endure_buff', 1, { dmgBonus: 8 }); }
    },
    blood_contract: {
        id: 'blood_contract', name: '피의 계약', icon: '📜', cost: 0, type: 'SKILL', desc: '현재 체력 10% 소모. 카드 2장 드로우. 에너지 1 획득', rarity: 'rare',
        effect(gs) { const cost = Math.floor(gs.player.hp * 0.1); gs.player.hp = Math.max(1, gs.player.hp - cost); gs.drawCards(2); gs.player.energy += 1; gs.markDirty('hud'); }
    },
    blood_contract_plus: {
        id: 'blood_contract_plus', name: '피의 계약+', icon: '📜', cost: 0, type: 'SKILL', desc: '현재 체력 10% 소모. 카드 3장 드로우. 에너지 1 획득', rarity: 'rare', upgraded: true,
        effect(gs) { const cost = Math.floor(gs.player.hp * 0.1); gs.player.hp = Math.max(1, gs.player.hp - cost); gs.drawCards(3); gs.player.energy += 1; gs.markDirty('hud'); }
    },
    wild_slash: {
        id: 'wild_slash', name: '공포의 난도질', icon: '⚔️', cost: 2, type: 'ATTACK', desc: '피해 13. 잔향 15 충전', rarity: 'uncommon',
        effect(gs) { gs.dealDamage(13); gs.addEcho(15); }
    },
    wild_slash_plus: {
        id: 'wild_slash_plus', name: '공포의 난도질+', icon: '⚔️', cost: 1, type: 'ATTACK', desc: '피해 15. 잔향 20 충전', rarity: 'uncommon', upgraded: true,
        effect(gs) { gs.dealDamage(15); gs.addEcho(20); }
    },

    // ── [8] 무음수호자 (Guardian) ──
    iron_defense: {
        id: 'iron_defense', name: '무쇠 방어', icon: '🛡️', cost: 1, type: 'SKILL', desc: '방어막 10. 잔향 5 충전', rarity: 'common',
        effect(gs) { gs.addShield(10, { name: '무쇠 방어', type: 'card' }); gs.addEcho(5, { name: '무쇠 방어', type: 'card' }); }
    },
    iron_defense_plus: {
        id: 'iron_defense_plus', name: '무쇠 방어+', icon: '🛡️', cost: 0, type: 'SKILL', desc: '방어막 14. 잔향 10 충전', rarity: 'common', upgraded: true,
        effect(gs) { gs.addShield(14, { name: '무쇠 방어+', type: 'card' }); gs.addEcho(10, { name: '무쇠 방어+', type: 'card' }); }
    },
    shield_slam: {
        id: 'shield_slam', name: '방패 강타', icon: '🔰', cost: 2, type: 'ATTACK', desc: '피해 현재 방어막 수치', rarity: 'uncommon',
        effect(gs) { gs.dealDamage(gs.player.shield || 0); }
    },
    shield_slam_plus: {
        id: 'shield_slam_plus', name: '방패 강타+', icon: '🔰', cost: 1, type: 'ATTACK', desc: '피해 현재 방어막 수치', rarity: 'uncommon', upgraded: true,
        effect(gs) { gs.dealDamage(gs.player.shield || 0); }
    },
    resonant_shield: {
        id: 'resonant_shield', name: '공진 방패', icon: '🛡️', cost: 1, type: 'ATTACK', desc: '방어막 전부 소모. 피해 현재 방어막의 1.5배', rarity: 'uncommon',
        effect(gs) {
            const shield = gs.player.shield || 0;
            gs.dealDamage(Math.floor(shield * 1.5));
            gs.player.shield = 0;
            gs.markDirty?.('hud');
        }
    },
    resonant_shield_plus: {
        id: 'resonant_shield_plus', name: '공진 방패+', icon: '🛡️', cost: 1, type: 'ATTACK', desc: '방어막 전부 소모. 피해 현재 방어막의 2배', rarity: 'uncommon', upgraded: true,
        effect(gs) {
            const shield = gs.player.shield || 0;
            gs.dealDamage(shield * 2);
            gs.player.shield = 0;
            gs.markDirty?.('hud');
        }
    },
    unbreakable_wall: {
        id: 'unbreakable_wall', name: '불굴의 벽', icon: '🧱', cost: 2, type: 'POWER', desc: '턴 시작 시 방어막 50%만큼 피해 [지속]', rarity: 'rare',
        effect(gs) { gs.addBuff('unbreakable_wall', 99); }
    },
    unbreakable_wall_plus: {
        id: 'unbreakable_wall_plus', name: '불굴의 벽+', icon: '🧱', cost: 1, type: 'POWER', desc: '턴 시작 시 방어막 70%만큼 피해 [지속]', rarity: 'rare', upgraded: true,
        effect(gs) { gs.addBuff('unbreakable_wall_plus', 99); }
    },
    bastion: {
        id: 'bastion', name: '요새화', icon: '🏰', cost: 2, type: 'SKILL', desc: '방어막 15. 기절 면역 1회 획득', rarity: 'uncommon',
        effect(gs) { gs.addShield(15); gs.player.stunImmune = (gs.player.stunImmune || 0) + 1; }
    },
    bastion_plus: {
        id: 'bastion_plus', name: '요새화+', icon: '🏰', cost: 2, type: 'SKILL', desc: '방어막 20. 기절 면역 2회 획득', rarity: 'uncommon', upgraded: true,
        effect(gs) { gs.addShield(20); gs.player.stunImmune = (gs.player.stunImmune || 0) + 2; }
    },
    iron_spikes: {
        id: 'iron_spikes', name: '강철 가시', icon: '⚙️', cost: 1, type: 'POWER', desc: '피격 시 피해 4 반사 [지속]', rarity: 'uncommon',
        effect(gs) { gs.addBuff('thorns', 99, { reflectDmg: 4 }); }
    },
    iron_spikes_plus: {
        id: 'iron_spikes_plus', name: '강철 가시+', icon: '⚙️', cost: 1, type: 'POWER', desc: '피격 시 피해 6 반사 [지속]', rarity: 'uncommon', upgraded: true,
        effect(gs) { gs.addBuff('thorns', 99, { reflectDmg: 6 }); }
    },
    fortify: {
        id: 'fortify', name: '무장', icon: '🛡️', cost: 1, type: 'SKILL', desc: '방어막 20 [소진]', rarity: 'rare', exhaust: true,
        effect(gs) { gs.addShield(20); }
    },
    fortify_plus: {
        id: 'fortify_plus', name: '무장+', icon: '🛡️', cost: 1, type: 'SKILL', desc: '방어막 30 [소진]', rarity: 'rare', upgraded: true, exhaust: true,
        effect(gs) { gs.addShield(30); }
    },
    impulse: {
        id: 'impulse', name: '충격파', icon: '💥', cost: 1, type: 'ATTACK', desc: '피해 8. 방어막 50%만큼 추가', rarity: 'uncommon',
        effect(gs) { const shield = gs.player.shield || 0; gs.dealDamage(8 + Math.floor(shield * 0.5)); }
    },
    impulse_plus: {
        id: 'impulse_plus', name: '충격파+', icon: '💥', cost: 1, type: 'ATTACK', desc: '피해 10. 방어막 70%만큼 추가', rarity: 'uncommon', upgraded: true,
        effect(gs) { const shield = gs.player.shield || 0; gs.dealDamage(10 + Math.floor(shield * 0.7)); }
    },

};
