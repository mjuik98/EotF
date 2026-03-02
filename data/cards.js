/**
 * cards.js — 카드 데이터, 업그레이드 맵, 에셋 경로
 */
import { LogUtils } from '../game/utils/log_utils.js';
import { AudioEngine } from '../engine/audio.js';

export const ASSETS = {
    avatars: {
        swordsman: '🗡️',
        mage: '🪄',
        hunter: '🏹',
        paladin: '⚜️',
        berserker: '🪓',
        guardian: '🛡️'
    }
};

export const UPGRADE_MAP = {
    'strike': 'strike_plus', 'defend': 'defend_plus', 'echo_strike': 'echo_strike_plus',
    'quick_step': 'quick_step_plus', 'heavy_blow': 'heavy_blow_plus', 'echo_wave': 'echo_wave_plus',
    'resonance': 'resonance_plus', 'soul_rend': 'soul_rend_plus', 'twin_strike': 'twin_strike_plus',
    'echo_shield': 'echo_shield_plus', 'acceleration': 'acceleration_plus', 'foresight': 'foresight_plus',
    'silent_stab': 'silent_stab_plus', 'vanish': 'vanish_plus',
    'surge': 'surge_plus',
    'flame_slash': 'ember_wave',
    'echo_tide': 'echo_tide_plus',
    'tempo_strike': 'tempo_strike_plus',
    'holy_strike': 'holy_strike_plus',
    'blood_fury': 'blood_fury_plus',
    'iron_defense': 'iron_defense_plus',
    'abyssal_thirst': 'abyssal_thirst_plus',
    'echo_barrier': 'echo_barrier_plus',
    'vibrations_end': 'vibrations_end_plus',
    'temporal_echo': 'temporal_echo_plus',
    'silent_strike': 'silent_strike_plus',
    'brand_of_light': 'brand_of_light_plus',
    'resonant_shield': 'resonant_shield_plus'
};

export const CARDS = {
    // 공통 기본
    strike: {
        id: 'strike', name: '타격', icon: '👊🏻', cost: 1, type: 'ATTACK', desc: '피해 9.', rarity: 'common',
        image: 'card_strike.png',
        effect(gs) { gs.dealDamage(9); AudioEngine.playChain(gs.player.echoChain); }
    },
    strike_plus: {
        id: 'strike_plus', name: '타격+', icon: '👊🏻', cost: 1, type: 'ATTACK', desc: '피해 13. 잔향 5 충전.', rarity: 'common', upgraded: true,
        image: 'card_strike.png',
        effect(gs) { gs.dealDamage(13); gs.addEcho(5); AudioEngine.playChain(gs.player.echoChain); }
    },
    defend: {
        id: 'defend', name: '수비', icon: '🛡️', cost: 1, type: 'SKILL', desc: '방어막 7.', rarity: 'common',
        image: 'card_defend_standard.png',
        effect(gs) { gs.addShield(7, { name: '수비', type: 'card' }); }
    },
    defend_plus: {
        id: 'defend_plus', name: '수비+', icon: '🛡️', cost: 1, type: 'SKILL', desc: '방어막 10.', rarity: 'common', upgraded: true,
        image: 'card_defend_plus.png',
        effect(gs) { gs.addShield(10, { name: '수비+', type: 'card' }); }
    },
    echo_strike: {
        id: 'echo_strike', name: '잔향 타격', icon: '💥', cost: 2, type: 'ATTACK', desc: '피해 14. 잔향 20 충전.', rarity: 'uncommon',
        image: 'card_echo_strike.png',
        effect(gs) { gs.dealDamage(14); gs.addEcho(20); }
    },
    echo_strike_plus: {
        id: 'echo_strike_plus', name: '잔향 타격+', icon: '💥', cost: 1, type: 'ATTACK', desc: '피해 15. 잔향 25 충전.', rarity: 'common', upgraded: true,
        image: 'card_echo_strike.png',
        effect(gs) { gs.dealDamage(15); gs.addEcho(25); }
    },
    quick_step: {
        id: 'quick_step', name: '잔영 이동', icon: '💨', cost: 0, type: 'SKILL', desc: '방어막 4. 잔향 15 충전.', rarity: 'common',
        image: 'card_quick_step.png',
        effect(gs) { gs.addShield(4, { name: '잔영 이동', type: 'card' }); gs.addEcho(15, { name: '잔영 이동', type: 'card' }); }
    },
    quick_step_plus: {
        id: 'quick_step_plus', name: '잔영 이동+', icon: '💨', cost: 0, type: 'SKILL', desc: '방어막 6. 잔향 20 충전.', rarity: 'common', upgraded: true,
        image: 'card_quick_step.png',
        effect(gs) { gs.addShield(6, { name: '잔영 이동+', type: 'card' }); gs.addEcho(20, { name: '잔영 이동+', type: 'card' }); }
    },
    heavy_blow: {
        id: 'heavy_blow', name: '중격', icon: '🔨', cost: 3, type: 'ATTACK', desc: '피해 18. 기절 1턴 부여.', rarity: 'common',
        image: 'card_heavy_blow.png',
        effect(gs) { gs.dealDamage(18); gs.applyEnemyStatus('stunned', 1); }
    },
    heavy_blow_plus: {
        id: 'heavy_blow_plus', name: '중격+', icon: '🔨', cost: 2, type: 'ATTACK', desc: '피해 26. 기절 1턴 부여.', rarity: 'common', upgraded: true,
        image: 'card_heavy_blow.png',
        effect(gs) { gs.dealDamage(26); gs.applyEnemyStatus('stunned', 1); }
    },
    echo_wave: {
        id: 'echo_wave', name: '잔향파', icon: '🌊', cost: 2, type: 'ATTACK', desc: '모든 적에게 피해 11.', rarity: 'uncommon',
        image: 'card_echo_wave.png',
        effect(gs) { gs.dealDamageAll(11); }
    },
    echo_wave_plus: {
        id: 'echo_wave_plus', name: '잔향파+', icon: '🌊', cost: 1, type: 'ATTACK', desc: '모든 적에게 피해 14.', rarity: 'uncommon', upgraded: true,
        image: 'card_echo_wave.png',
        effect(gs) { gs.dealDamageAll(14); }
    },
    resonance: {
        id: 'resonance', name: '공명', icon: '⚡', cost: 1, type: 'SKILL', desc: '잔향 20 충전.', rarity: 'uncommon',
        image: 'card_resonance.png',
        effect(gs) { gs.addEcho(20); }
    },
    resonance_plus: {
        id: 'resonance_plus', name: '공명+', icon: '⚡', cost: 0, type: 'SKILL', desc: '잔향 30 충전.', rarity: 'uncommon', upgraded: true,
        image: 'card_resonance.png',
        effect(gs) { gs.addEcho(30); }
    },
    soul_rend: {
        id: 'soul_rend', name: '영혼 강탈', icon: '💀', cost: 3, type: 'ATTACK', desc: '피해 26. 체력 5 회복.', rarity: 'uncommon',
        image: 'card_soul_rend.png',
        effect(gs) { gs.dealDamage(26); gs.heal(5, { name: '영혼 강탈', type: 'card' }); }
    },
    soul_rend_plus: {
        id: 'soul_rend_plus', name: '영혼 강탈+', icon: '💀', cost: 2, type: 'ATTACK', desc: '피해 28. 체력 6 회복.', rarity: 'uncommon', upgraded: true,
        image: 'card_soul_rend.png',
        effect(gs) { gs.dealDamage(28); gs.heal(6, { name: '영혼 강탈+', type: 'card' }); }
    },
    twin_strike: {
        id: 'twin_strike', name: '쌍검격', icon: '⚔️', cost: 1, type: 'ATTACK', desc: '피해 6 × 2.', rarity: 'uncommon',
        image: 'card_twin_strike.png',
        effect(gs) { gs.dealDamage(6, 0, true); gs.dealDamage(6); }
    },
    twin_strike_plus: {
        id: 'twin_strike_plus', name: '쌍검격+', icon: '⚔️', cost: 1, type: 'ATTACK', desc: '피해 8 × 2.', rarity: 'uncommon', upgraded: true,
        image: 'card_twin_strike.png',
        effect(gs) { gs.dealDamage(9, 0, true); gs.dealDamage(9); }
    },
    echo_shield: {
        id: 'echo_shield', name: '잔향 방벽', icon: '🔵', cost: 2, type: 'SKILL', desc: '방어막 (잔향 ÷ 5).', rarity: 'uncommon',
        image: 'card_echo_shield.png',
        effect(gs) { gs.addShield(Math.floor(gs.player.echo / 5), { name: '잔향 방벽', type: 'card' }); }
    },
    echo_shield_plus: {
        id: 'echo_shield_plus', name: '잔향 방벽+', icon: '🔵', cost: 1, type: 'SKILL', desc: '방어막 (잔향 ÷ 4). 잔향 10 충전.', rarity: 'uncommon', upgraded: true,
        image: 'card_echo_shield.png',
        effect(gs) { gs.addShield(Math.floor(gs.player.echo / 4), { name: '잔향 방벽+', type: 'card' }); gs.addEcho(10, { name: '잔향 방벽+', type: 'card' }); }
    },
    // 잔향검사
    acceleration: {
        id: 'acceleration', name: '가속', icon: '👟', cost: 0, type: 'SKILL', desc: '이번 턴 피해 +6. (가속)', rarity: 'common',
        image: 'card_acceleration.png',
        effect(gs) { gs.addBuff('acceleration', 1, { dmgBonus: 6 }); }
    },
    acceleration_plus: {
        id: 'acceleration_plus', name: '가속+', icon: '👟', cost: 0, type: 'SKILL', desc: '이번 턴 피해 +8. 잔향 10 충전. (가속)', rarity: 'common', upgraded: true,
        image: 'card_acceleration_plus.png',
        effect(gs) { gs.addBuff('acceleration', 1, { dmgBonus: 8 }); gs.addEcho(10); }
    },
    charge: {
        id: 'charge', name: '돌진', icon: '⚡', cost: 1, type: 'ATTACK', desc: '피해 9. 가속 수치만큼 추가 피해.', rarity: 'common',
        image: 'card_charge.png',
        effect(gs) { const a = gs.getBuff('acceleration'); gs.dealDamage(9 + (a ? a.dmgBonus : 0)); }
    },
    afterimage: {
        id: 'afterimage', name: '잔영', icon: '👥', cost: 1, type: 'SKILL', desc: '방어막 4. 가속 수치만큼 추가 방어막.', rarity: 'uncommon',
        image: 'card_afterimage.png',
        effect(gs) { const a = gs.getBuff('acceleration'); gs.addShield(4 + (a ? a.dmgBonus : 0)); }
    },
    phantom_blade: {
        id: 'phantom_blade', name: '환영 검', icon: '🌀', cost: 2, type: 'ATTACK', desc: '피해 9 × 2. 두 번째 타격은 치명타.', rarity: 'uncommon',
        image: 'card_phantom_blade.png',
        effect(gs) { gs.dealDamage(9); gs.addBuff('vanish', 1, {}); gs.dealDamage(9); }
    },
    echo_dance: {
        id: 'echo_dance', name: '잔향의 춤', icon: '💃', cost: 3, type: 'ATTACK', desc: '피해 6 × 4. 타격마다 잔향 6 충전.', rarity: 'rare',
        image: 'card_echo_dance.png',
        effect(gs) { for (let i = 0; i < 3; i++) { gs.dealDamage(6, null, true); gs.addEcho(8); } gs.dealDamage(6, null); gs.addEcho(8); }
    },
    blade_dance: {
        id: 'blade_dance', name: '검무', icon: '⚔️', cost: 1, type: 'ATTACK', desc: '피해 4 × 3. (가속 상태: 잔향 10 충전.)', rarity: 'uncommon',
        image: 'card_blade_dance.png',
        effect(gs) {
            // 다단 히트 도중 버프가 소모되는 것을 방지하기 위해 '총 데미지'를 한 번에 계산하거나, 
            // DamageSystem을 수정하여 다단 히트임을 명시해야 함. 
            // 여기서는 단순하게 3번의 타격을 각각 DamageSystem이 아닌 직접 호출하거나 
            // DamageSystem의 dealDamage에서 버프 소모 시점을 체크하도록 DamageSystem을 고쳐야 함.
            // 일단은 카드 쪽에서 보너스를 미리 계산해서 넘기는 방식으로 해결.
            const accel = gs.getBuff('acceleration');
            const bonus = accel ? accel.dmgBonus : 0;
            for (let i = 0; i < 3; i++) {
                gs.dealDamage(4 + bonus, null, i < 2);
            }
            if (accel) gs.addEcho(10);
        }
    },
    vibrations_end: {
        id: 'vibrations_end', name: '진동의 끝', icon: '🎸', cost: 1, type: 'ATTACK', desc: '피해 5. 공명 10당 1회 추가 공격.', rarity: 'rare',
        image: 'card_vibrations_end.png',
        effect(gs) {
            const res = gs.getBuff('resonance');
            const hits = 1 + Math.floor((res ? res.dmgBonus : 0) / 10);
            for (let i = 0; i < hits; i++) {
                gs.dealDamage(5, null, i < hits - 1);
            }
        }
    },
    vibrations_end_plus: {
        id: 'vibrations_end_plus', name: '진동의 끝+', icon: '🎸', cost: 1, type: 'ATTACK', desc: '피해 7. 공명 8당 1회 추가 공격.', rarity: 'rare', upgraded: true,
        image: 'card_vibrations_end.png',
        effect(gs) {
            const res = gs.getBuff('resonance');
            const hits = 1 + Math.floor((res ? res.dmgBonus : 0) / 8);
            for (let i = 0; i < hits; i++) {
                gs.dealDamage(7, null, i < hits - 1);
            }
        }
    },
    // 메아리술사
    foresight: {
        id: 'foresight', name: '예지', icon: '👁️', cost: 0, type: 'SKILL', desc: '약화 부여. 잔향 5 충전.', rarity: 'common',
        image: 'card_foresight.png',
        effect(gs) { gs.addEcho(5); gs.applyEnemyStatus('weakened', 1); }
    },
    foresight_plus: {
        id: 'foresight_plus', name: '예지+', icon: '👁️', cost: 0, type: 'SKILL', desc: '약화 부여. 잔향 10 충전.', rarity: 'common', upgraded: true,
        image: 'card_foresight.png',
        effect(gs) { gs.applyEnemyStatus('weakened', 1); gs.addEcho(10); }
    },
    counter: {
        id: 'counter', name: '반격', icon: '🔄', cost: 2, type: 'ATTACK', desc: '적 예고 피해 × 1.5만큼 피해. (최대 30)', rarity: 'common',
        image: 'card_counter.png',
        effect(gs) { gs.dealDamage(Math.min(30, Math.floor(gs.getEnemyIntent() * 1.5))); }
    },
    time_echo: {
        id: 'time_echo', name: '시간의 잔향', icon: '⏳', cost: 1, type: 'SKILL', desc: '소모 더미 최근 카드 1장 회수.', rarity: 'uncommon',
        image: 'card_time_echo.png',
        effect(gs) { if (gs.player.graveyard.length > 0) { const c = gs.player.graveyard.pop(); gs.player.hand.push(c); gs.addLog(`⏳ ${CARDS[c]?.name} 회수!`, 'echo'); } }
    },
    void_mirror: {
        id: 'void_mirror', name: '공허의 거울', icon: '🪞', cost: 2, type: 'ATTACK', desc: '반사 획득. 다음 공격을 적에게 돌려준다.', rarity: 'uncommon',
        image: 'card_void_mirror.png',
        effect(gs) { gs.addBuff('mirror', 1, { reflect: true }); gs.addLog('🪞 반사 준비', 'echo'); }
    },
    arcane_storm: {
        id: 'arcane_storm', name: '비전 폭풍', icon: '🌩️', cost: 3, type: 'ATTACK', desc: '모든 적에게 피해 16. 연쇄 +2.', rarity: 'rare',
        image: 'card_arcane_storm.png',
        effect(gs) { gs.dealDamageAll(16); gs.player.echoChain += 2; gs.updateChainDisplay(); }
    },
    prediction: {
        id: 'prediction', name: '예언', icon: '🔭', cost: 1, type: 'SKILL', desc: '카드 2장 드로우. 잔향 15 충전.', rarity: 'uncommon',
        image: 'card_prediction.png',
        effect(gs) { if (gs.combat.active) gs.drawCards(2); gs.addEcho(15); }
    },
    time_warp: {
        id: 'time_warp', name: '시간 왜곡', icon: '🌀', cost: 3, type: 'POWER', desc: '【지속】 매 턴: 에너지 1 획득.', rarity: 'rare',
        image: 'card_time_warp.png',
        effect(gs) { gs.addBuff('time_warp', 99, { energyPerTurn: 1 }); }
    },
    temporal_echo: {
        id: 'temporal_echo', name: '기시감', icon: '⏳', cost: 2, type: 'SKILL', desc: '가장 최근에 사용한 카드를 가져옵니다.', rarity: 'uncommon',
        image: 'card_temporal_echo.png',
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
        id: 'temporal_echo_plus', name: '기시감+', icon: '⏳', cost: 1, type: 'SKILL', desc: '가장 최근에 사용한 카드를 가져오고 비용을 0으로 만듭니다.', rarity: 'uncommon', upgraded: true,
        image: 'card_temporal_echo.png',
        effect(gs) {
            if (gs.player.graveyard.length > 0) {
                const lastCardId = gs.player.graveyard[gs.player.graveyard.length - 1];
                gs.player.hand.push(lastCardId);
                if (!gs.player._temporaryDiscounts) gs.player._temporaryDiscounts = {};
                gs.player._temporaryDiscounts[gs.player.hand.length - 1] = 99; // 99는 무료를 의미하는 내부 코드라고 가정
                gs.addLog(`⏳ 기시감+: ${CARDS[lastCardId]?.name}를 0코스트로 메아리칩니다!`, 'echo');
                gs.markDirty('hand');
            }
        }
    },
    // 침묵사냥꾼
    silent_stab: {
        id: 'silent_stab', name: '자상', icon: '🔪', cost: 1, type: 'ATTACK', desc: '피해를 7 입히고 독(2)을 부여합니다.', rarity: 'common',
        image: 'card_silent_stab.png',
        effect(gs) { gs.dealDamage(7); gs.applyEnemyStatus('poisoned', 2, targetIdx); }
    },
    silent_stab_plus: {
        id: 'silent_stab_plus', name: '자상+', icon: '🔪', cost: 0, type: 'ATTACK', desc: '피해를 11 입히고 독(3)을 부여합니다.', rarity: 'common', upgraded: true,
        image: 'card_silent_stab_plus.png',
        effect(gs) { gs.dealDamage(11); gs.applyEnemyStatus('poisoned', 3, targetIdx); }
    },
    vanish: {
        id: 'vanish', name: '은신', icon: '🌑', cost: 1, type: 'SKILL', desc: '은신. (다음 공격이 치명타로 적중.)', rarity: 'common',
        image: 'card_vanish.png',
        effect(gs) {
            gs.addBuff('vanish', 1, {});
            gs.addLog(LogUtils.formatCardBuff('은신', '다음 공격 크리티컬'), 'buff');
        }
    },
    vanish_plus: {
        id: 'vanish_plus', name: '은신+', icon: '🌑', cost: 0, type: 'SKILL', desc: '은신 2턴. (다음 공격이 치명타로 적중.)', rarity: 'common', upgraded: true,
        image: 'card_vanish_plus.png',
        effect(gs) {
            gs.addBuff('vanish', 2, {});
            gs.addLog(LogUtils.formatCardBuff('은신+', '다음 공격 크리티컬 (2턴)'), 'buff');
        }
    },
    death_mark: {
        id: 'death_mark', name: '처형 표식', icon: '💢', cost: 1, type: 'ATTACK', desc: '처형 표식 3턴 부여. (3턴 후 피해 30 폭발)', rarity: 'uncommon',
        image: 'card_death_mark.png',
        effect(gs) { gs.applyEnemyStatus('marked', 3); gs.addLog('💢 처형 표식!', 'echo'); }
    },
    death_mark_plus: {
        id: 'death_mark_plus', name: '처형 표식+', icon: '💢', cost: 0, type: 'ATTACK', desc: '처형 표식 2턴 부여. (2턴 후 피해 30 폭발)', rarity: 'uncommon', upgraded: true,
        image: 'card_death_mark_plus.png',
        effect(gs) { gs.applyEnemyStatus('marked', 2); gs.addLog('💢 처형 표식!', 'echo'); }
    },
    shadow_step: {
        id: 'shadow_step', name: '그림자 도약', icon: '🌑', cost: 1, type: 'SKILL', desc: '방어막 5. 다음 공격 피해 +8.', rarity: 'uncommon',
        image: 'card_shadow_step.png',
        effect(gs) {
            gs.addShield(5);
            gs.addBuff('shadow_atk', 1, { dmgBonus: 8 });
            gs.addLog(LogUtils.formatCardBuff('그림자 도약', '다음 공격 +8'), 'buff');
        }
    },
    shadow_step_plus: {
        id: 'shadow_step_plus', name: '그림자 도약+', icon: '🌑', cost: 0, type: 'SKILL', desc: '방어막 8. 다음 공격 피해 +10.', rarity: 'uncommon', upgraded: true,
        image: 'card_shadow_step_plus.png',
        effect(gs) {
            gs.addShield(8);
            gs.addBuff('shadow_atk', 1, { dmgBonus: 10 });
            gs.addLog(LogUtils.formatCardBuff('그림자 도약+', '다음 공격 +10'), 'buff');
        }
    },
    poison_blade: {
        id: 'poison_blade', name: '독침 검', icon: '🐍', cost: 1, type: 'ATTACK', desc: '피해 7. 독 3턴 부여.', rarity: 'uncommon',
        image: 'card_poison_blade.png',
        effect(gs) { gs.dealDamage(7); gs.applyEnemyStatus('poisoned', 3); }
    },
    poison_blade_plus: {
        id: 'poison_blade_plus', name: '독침 검+', icon: '🐍', cost: 0, type: 'ATTACK', desc: '피해 10. 독 4턴 부여.', rarity: 'uncommon', upgraded: true,
        image: 'card_poison_blade_plus.png',
        effect(gs) { gs.dealDamage(10); gs.applyEnemyStatus('poisoned', 4); }
    },
    phantom_step: {
        id: 'phantom_step', name: '환영 보폭', icon: '💨', cost: 1, type: 'SKILL', desc: '방어막 10. 회피 1 획득.', rarity: 'uncommon',
        image: 'card_phantom_step.png',
        effect(gs) {
            gs.addShield(10);
            gs.addBuff('dodge', 1, {});
            gs.addLog(LogUtils.formatCardBuff('환영 보폭', '회피 +1'), 'buff');
        }
    },
    phantom_step_plus: {
        id: 'phantom_step_plus', name: '환영 보폭+', icon: '💨', cost: 0, type: 'SKILL', desc: '방어막 12. 회피 1 획득.', rarity: 'uncommon', upgraded: true,
        image: 'card_phantom_step_plus.png',
        effect(gs) {
            gs.addShield(12);
            gs.addBuff('dodge', 1, {});
            gs.addLog(LogUtils.formatCardBuff('환영 보폭+', '회피 +1'), 'buff');
        }
    },
    silent_strike: {
        id: 'silent_strike', name: '심장 정지', icon: '🗡️', cost: 1, type: 'ATTACK', desc: '피해 7. 적의 [독] 수치 × 4만큼 추가 피해.', rarity: 'uncommon',
        image: 'card_silent_strike.png',
        effect(gs) {
            const enemy = gs.combat.enemies[gs._selectedTarget || 0];
            const poison = enemy?.statusEffects?.poisoned || 0;
            gs.dealDamage(7 + (poison * 4));
        }
    },
    silent_strike_plus: {
        id: 'silent_strike_plus', name: '심장 정지+', icon: '🗡️', cost: 1, type: 'ATTACK', desc: '피해 10. 적의 [독] 수치 × 6만큼 추가 피해.', rarity: 'uncommon', upgraded: true,
        image: 'card_silent_strike.png',
        effect(gs) {
            const enemy = gs.combat.enemies[gs._selectedTarget || 0];
            const poison = enemy?.statusEffects?.poisoned || 0;
            gs.dealDamage(10 + (poison * 6));
        }
    },
    // 레어/파워
    echo_burst_card: {
        id: 'echo_burst_card', name: '잔향 폭발', icon: '🌟', cost: 3, type: 'POWER', desc: '【즉시】 잔향 폭발 발동.', rarity: 'rare',
        image: 'card_echo_burst.png',
        effect(gs) { gs.triggerResonanceBurst(); }
    },
    void_blade: {
        id: 'void_blade', name: '공허의 도검', icon: '🌀', cost: 2, type: 'ATTACK', desc: '피해 30. 【소진】', rarity: 'rare', exhaust: true,
        image: 'card_void_blade.png',
        effect(gs) { gs.dealDamage(30); }
    },
    soul_armor: {
        id: 'soul_armor', name: '영혼 방어구', icon: '💠', cost: 2, type: 'SKILL', desc: '방어막 15. (3턴 동안 매 턴: 잔향 10 충전.)', rarity: 'rare',
        image: 'card_soul_armor.png',
        effect(gs) { gs.addShield(15, { name: '영혼 방어구', type: 'card' }); gs.addBuff('soul_armor', 3, { echoRegen: 10 }); }
    },
    soul_harvest: {
        id: 'soul_harvest', name: '영혼 수확', icon: '💫', cost: 2, type: 'ATTACK', desc: '피해 20. (처치 시: 체력 8 회복.)', rarity: 'uncommon',
        image: 'card_soul_harvest.png',
        effect(gs) { gs.dealDamage(20); }
    },
    echo_overload: {
        id: 'echo_overload', name: '잔향 과부하', icon: '⚡', cost: 2, type: 'SKILL', desc: '잔향 100 충전. 체력 15 소모.', rarity: 'rare',
        image: 'card_echo_overload.png',
        effect(gs) { gs.player.echo = 100; gs.player.hp = Math.max(1, gs.player.hp - 15); gs.addLog('⚡ Echo 과부하! HP-15', 'damage'); gs.markDirty('hud'); }
    },
    desperate_strike: {
        id: 'desperate_strike', name: '결사의 일격', icon: '☠️', cost: 1, type: 'ATTACK', desc: '잃은 체력에 비례한 피해. (최대 40)', rarity: 'uncommon',
        image: 'card_desperate_strike.png',
        effect(gs) { const d = Math.floor((1 - gs.player.hp / gs.player.maxHp) * 40) + 5; gs.dealDamage(d); }
    },
    reverberation: {
        id: 'reverberation', name: '반향', icon: '🔊', cost: 2, type: 'ATTACK', desc: '연쇄 수치 × 8 피해. (최대 40)', rarity: 'uncommon',
        image: 'card_reverberation.png',
        effect(gs) { gs.dealDamage(Math.min(40, (gs.player.echoChain || 1) * 8)); }
    },
    sanctuary: {
        id: 'sanctuary', name: '성역', icon: '🏛️', cost: 3, type: 'SKILL', desc: '방어막 15. 면역 2턴.', rarity: 'rare',
        image: 'card_sanctuary.png',
        effect(gs) { gs.addShield(15, { name: '성역', type: 'card' }); gs.addBuff('immune', 2, {}); }
    },
    dark_pact: {
        id: 'dark_pact', name: '어둠의 계약', icon: '📜', cost: 0, type: 'SKILL', desc: '체력 5 소모. 카드 2장 드로우.', rarity: 'uncommon',
        image: 'card_dark_pact.png',
        effect(gs) { gs.player.hp = Math.max(1, gs.player.hp - 5); gs.drawCards(2); gs.markDirty('hud'); }
    },
    // ── 에너지 관련 카드 ──
    surge: {
        id: 'surge', name: '쇄도', icon: '⚡', cost: 0, type: 'SKILL', desc: '에너지 2 획득.', rarity: 'uncommon',
        image: 'card_surge.png',
        effect(gs) { gs.player.energy += 2; gs.addLog('⚡ 서지: 에너지 +2!', 'echo'); gs.markDirty('hud'); }
    },
    surge_plus: {
        id: 'surge_plus', name: '쇄도+', icon: '⚡', cost: 0, type: 'SKILL', desc: '에너지 3 획득. 카드 1장 드로우.', rarity: 'uncommon', upgraded: true,
        image: 'card_surge_plus.png',
        effect(gs) { gs.player.energy += 3; gs.drawCards(1); gs.addLog('⚡ 서지+: 에너지 +3!', 'echo'); gs.markDirty('hud'); }
    },
    overcharge: {
        id: 'overcharge', name: '과충전', icon: '🔋', cost: 2, type: 'SKILL', desc: '에너지 4 획득. 체력 6 소모. 잔향 30 충전.', rarity: 'rare',
        image: 'card_overcharge.png',
        effect(gs) { gs.player.energy += 4; gs.player.hp = Math.max(1, gs.player.hp - 6); gs.addEcho(30); gs.addLog('🔋 과충전! 에너지 +4', 'echo'); gs.markDirty('hud'); }
    },
    void_tap: {
        id: 'void_tap', name: '공허 흡수', icon: '🌀', cost: 1, type: 'SKILL', desc: '사용된 에너지 × 6 피해.', rarity: 'rare',
        image: 'card_void_tap.png',
        effect(gs) { const spent = gs.player.maxEnergy - gs.player.energy; const dmg = (spent + 1) * 6; gs.dealDamage(dmg); gs.addLog(`🌀 허공 탭: ${dmg} 피해!`, 'echo'); }
    },
    energy_siphon: {
        id: 'energy_siphon', name: '에너지 사이펀', icon: '🔵', cost: 0, type: 'ATTACK', desc: '에너지 1 소모 → 피해 12. 【소진】', rarity: 'uncommon', exhaust: true,
        image: 'card_energy_siphon.png',
        effect(gs) { if (gs.player.energy > 0) { gs.player.energy--; gs.dealDamage(12); gs.addLog('🔵 에너지 사이펀: 에너지 1 → 12 피해', 'echo'); } else { gs.addLog('🔵 에너지 사이펀: 에너지 없음!', 'damage'); } gs.markDirty('hud'); }
    },
    // ── 새 카드: 화염 / 전략 계열 ──
    flame_slash: {
        id: 'flame_slash', name: '화염 검격', icon: '🔥', cost: 1, type: 'ATTACK', desc: '피해 7. 화염 2턴 부여.', rarity: 'uncommon',
        image: 'card_flame_slash.png',
        effect(gs) { gs.dealDamage(7); gs.applyEnemyStatus('burning', 2); gs.addLog('🔥 화염 검격!', 'echo'); }
    },
    ember_wave: {
        id: 'ember_wave', name: '불꽃 파동', icon: '🌊', cost: 2, type: 'ATTACK', desc: '모든 적에게 피해 8. 화염 1턴 부여.', rarity: 'uncommon',
        image: 'card_flame_slash.png',
        effect(gs) { gs.dealDamageAll(8); gs.combat.enemies.forEach((_, i) => { if (gs.combat.enemies[i].hp > 0) gs.applyEnemyStatus('burning', 1, i); }); gs.addLog('🌊 불꽃 파동!', 'echo'); }
    },
    echo_reflect: {
        id: 'echo_reflect', name: '잔향 반향', icon: '🔊', cost: 1, type: 'SKILL', desc: '방어막 8. 반사 획득. (피해 받을 시 적에게 반사)', rarity: 'rare',
        image: 'card_echo_reflect.png',
        effect(gs) { gs.addShield(8); gs.addBuff('mirror', 1, { reflect: true }); gs.addLog('🔊 잔향 반향! 반사 준비', 'echo'); }
    },
    chain_reaction: {
        id: 'chain_reaction', name: '연쇄 반응', icon: '⛓️', cost: 2, type: 'ATTACK', desc: '연쇄 수치 × 5 피해. (연쇄 유지)', rarity: 'rare',
        image: 'card_chain_reaction.png',
        effect(gs) { const chain = Math.max(1, gs.player.echoChain); gs.dealDamage(chain * 5, null, true); gs.addLog(`⛓️ 연쇄 반응: 체인 ${chain} × 5 = ${chain * 5}!`, 'echo'); }
    },
    revival_echo: {
        id: 'revival_echo', name: '소생의 잔향', icon: '💠', cost: 3, type: 'SKILL', desc: '체력 15 회복. 소모 더미 카드 2장 회수. 【소진】', rarity: 'rare', exhaust: true,
        image: 'card_revival_echo.png',
        effect(gs) { gs.heal(15, { name: '소생의 잔향', type: 'card' }); const rev = []; for (let i = 0; i < 2 && gs.player.graveyard.length > 0; i++) { const c = gs.player.graveyard.pop(); gs.player.hand.push(c); rev.push(CARDS[c]?.name || c); } gs.addLog(`💠 소생 잔향: ${rev.join(', ')} 회수!`, 'echo'); gs.markDirty('hand'); }
    },

    // ── 에너지 할인 카드 ──
    echo_tide: {
        id: 'echo_tide', name: '잔향의 조류', icon: '🌀', cost: 2, type: 'SKILL', desc: '이번 턴 모든 카드 비용 -1. 잔향 10 충전.', rarity: 'uncommon',
        image: 'card_echo_tide.png',
        effect(gs) { gs.player.costDiscount = (gs.player.costDiscount || 0) + 1; gs.addEcho(10); gs.addLog('🌀 잔향의 조류: 이번 턴 전 카드 비용 -1!', 'echo'); gs.markDirty('hand'); gs.markDirty('hud'); }
    },
    echo_tide_plus: {
        id: 'echo_tide_plus', name: '잔향의 조류+', icon: '🌀', cost: 1, type: 'SKILL', desc: '이번 턴 모든 카드 비용 -1. 잔향 20 충전.', rarity: 'uncommon', upgraded: true,
        image: 'card_echo_tide_plus.png',
        effect(gs) { gs.player.costDiscount = (gs.player.costDiscount || 0) + 1; gs.addEcho(20); gs.addLog('🌀 잔향의 조류+: 이번 턴 전 카드 비용 -1!', 'echo'); gs.markDirty('hand'); gs.markDirty('hud'); }
    },
    void_surge: {
        id: 'void_surge', name: '공허의 쇄도', icon: '⚡', cost: 1, type: 'SKILL', desc: '이번 턴 모든 카드 비용 -1.', rarity: 'rare',
        image: 'card_void_surge.png',
        effect(gs) { gs.player.costDiscount = (gs.player.costDiscount || 0) + 1; gs.addLog('⚡ 공허의 쇄도: 이번 턴 전 카드 비용 -1!', 'echo'); gs.markDirty('hand'); gs.markDirty('hud'); }
    },
    void_surge_plus: {
        id: 'void_surge_plus', name: '공허의 쇄도+', icon: '⚡', cost: 0, type: 'SKILL', desc: '이번 턴 모든 카드 비용 -1.', rarity: 'rare', upgraded: true,
        image: 'card_void_surge_plus.png',
        effect(gs) { gs.player.costDiscount = (gs.player.costDiscount || 0) + 1; gs.addLog('⚡ 공허의 쇄도: 이번 턴 전 카드 비용 -1!', 'echo'); gs.markDirty('hand'); gs.markDirty('hud'); }
    },
    resonance_flow: {
        id: 'resonance_flow', name: '공명의 흐름', icon: '🎵', cost: 1, type: 'SKILL', desc: '손패 카드 1장당 잔향 5 충전.', rarity: 'uncommon',
        image: 'card_resonance_flow.png',
        effect(gs) { const n = gs.player.hand.length; gs.addEcho(n * 5); gs.addLog(`🎵 공명의 흐름: 손패 ${n}장 → Echo +${n * 5}!`, 'echo'); }
    },
    resonance_flow_plus: {
        id: 'resonance_flow_plus', name: '공명의 흐름+', icon: '🎵', cost: 0, type: 'SKILL', desc: '손패 카드 1장당 잔향 8 충전.', rarity: 'uncommon', upgraded: true,
        image: 'card_resonance_flow_plus.png',
        effect(gs) { const n = gs.player.hand.length; gs.addEcho(n * 8); gs.addLog(`🎵 공명의 흐름+: 손패 ${n}장 → Echo +${n * 8}!`, 'echo'); }
    },
    echo_cascade: {
        id: 'echo_cascade', name: '잔향의 폭포', icon: '💧', cost: 2, type: 'SKILL', desc: '카드 1장 드로우. 해당 카드 비용 0. 【소진】', rarity: 'rare',
        image: 'card_echo_cascade.png',
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
    tempo_strike: {
        id: 'tempo_strike', name: '박자 강타', icon: '🥁', cost: 2, type: 'ATTACK', desc: '피해 8. 다음 카드 비용 -1.', rarity: 'common',
        image: 'card_tempo_strike.png',
        effect(gs) {
            gs.dealDamage(8);
            gs.player._nextCardDiscount = (gs.player._nextCardDiscount || 0) + 1;
            gs.addLog('🥁 박자 강타: 다음 카드 비용 -1!', 'echo');
            gs.markDirty('hand');
        }
    },
    tempo_strike_plus: {
        id: 'tempo_strike_plus', name: '박자 강타+', icon: '🥁', cost: 1, type: 'ATTACK', desc: '피해 12. 다음 카드 비용 -1.', rarity: 'common', upgraded: true,
        image: 'card_tempo_strike_plus.png',
        effect(gs) {
            gs.dealDamage(12);
            gs.player._nextCardDiscount = (gs.player._nextCardDiscount || 0) + 1;
            gs.addLog('🥁 박자 강타+: 다음 카드 비용 -1!', 'echo');
            gs.markDirty('hand');
        }
    },
    echo_lull: {
        id: 'echo_lull', name: '잔향의 고요', icon: '🌙', cost: 1, type: 'SKILL', desc: '에너지 1 소모. 손패 모든 카드 비용 -2.', rarity: 'uncommon',
        image: 'card_echo_lull.png',
        effect(gs) { gs.player.energy = Math.max(0, gs.player.energy - 1); gs.player.costDiscount = (gs.player.costDiscount || 0) + 2; gs.addLog('🌙 잔향의 고요: 에너지 -1, 모든 카드 비용 -2!', 'echo'); gs.markDirty('hand'); gs.markDirty('hud'); }
    },
    echo_lull_plus: {
        id: 'echo_lull_plus', name: '잔향의 고요+', icon: '🌙', cost: 0, type: 'SKILL', desc: '에너지 1 소모. 손패 모든 카드 비용 -2.', rarity: 'uncommon', upgraded: true,
        image: 'card_echo_lull_plus.png',
        effect(gs) { gs.player.energy = Math.max(0, gs.player.energy - 1); gs.player.costDiscount = (gs.player.costDiscount || 0) + 2; gs.addLog('🌙 잔향의 고요+: 에너지 -1, 모든 카드 비용 -2!', 'echo'); gs.markDirty('hand'); gs.markDirty('hud'); }
    },

    // ── 찬송기사 (Paladin) ──
    holy_strike: {
        id: 'holy_strike', name: '성스러운 강타', icon: '✨', cost: 1, type: 'ATTACK', desc: '피해 8. 체력 2 회복.', rarity: 'common',
        image: 'card_holy_strike.png',
        effect(gs) { gs.dealDamage(8); gs.heal(2, { name: '성스러운 강타', type: 'card' }); }
    },
    holy_strike_plus: {
        id: 'holy_strike_plus', name: '성스러운 강타+', icon: '✨', cost: 1, type: 'ATTACK', desc: '피해 11. 체력 4 회복.', rarity: 'common', upgraded: true,
        image: 'card_holy_strike_plus.png',
        effect(gs) { gs.dealDamage(11); gs.heal(4, { name: '성스러운 강타+', type: 'card' }); }
    },
    divine_grace: {
        id: 'divine_grace', name: '신의 은총', icon: '🙏', cost: 1, type: 'SKILL', desc: '방어막 6. 잔향 15 충전.', rarity: 'common',
        image: 'card_divine_grace.png',
        effect(gs) { gs.addShield(6, { name: '신의 은총', type: 'card' }); gs.addEcho(15, { name: '신의 은총', type: 'card' }); }
    },
    divine_grace_plus: {
        id: 'divine_grace_plus', name: '신의 은총+', icon: '🙏', cost: 0, type: 'SKILL', desc: '방어막 8. 잔향 20 충전.', rarity: 'common', upgraded: true,
        image: 'card_divine_grace_plus.png',
        effect(gs) { gs.addShield(8, { name: '신의 은총+', type: 'card' }); gs.addEcho(20, { name: '신의 은총+', type: 'card' }); }
    },
    blessing_of_light: {
        id: 'blessing_of_light', name: '빛의 축복', icon: '☀️', cost: 2, type: 'POWER', desc: '【지속】 매 턴: 체력 3 회복.', rarity: 'uncommon',
        image: 'card_blessing_of_light.png',
        effect(gs) { gs.addBuff('blessing_of_light', 99, { healPerTurn: 3 }); }
    },
    blessing_of_light_plus: {
        id: 'blessing_of_light_plus', name: '빛의 축복+', icon: '☀️', cost: 1, type: 'POWER', desc: '【지속】 매 턴: 체력 4 회복.', rarity: 'uncommon', upgraded: true,
        image: 'card_blessing_of_light_plus.png',
        effect(gs) { gs.addBuff('blessing_of_light_plus', 99, { healPerTurn: 4 }); }
    },
    brand_of_light: {
        id: 'brand_of_light', name: '빛의 낙인', icon: '🕯️', cost: 1, type: 'SKILL', desc: '적에게 2턴간 [낙인] 부여. (피격 시 플레이어 체력 2 회복)', rarity: 'uncommon',
        image: 'card_brand_of_light.png',
        effect(gs) { gs.applyEnemyStatus('branded', 2); }
    },
    brand_of_light_plus: {
        id: 'brand_of_light_plus', name: '빛의 낙인+', icon: '🕯️', cost: 0, type: 'SKILL', desc: '적에게 3턴간 [낙인] 부여. (피격 시 플레이어 체력 4 회복)', rarity: 'uncommon', upgraded: true,
        image: 'card_brand_of_light.png',
        effect(gs) { gs.applyEnemyStatus('branded', 3); }
    },
    // ── 파음전사 (Berserker) ──
    blood_fury: {
        id: 'blood_fury', name: '핏빛 분노', icon: '🩸', cost: 1, type: 'ATTACK', desc: '피해 7. (잃은 체력 10마다 피해 +3.)', rarity: 'common',
        image: 'card_blood_fury.png',
        effect(gs) {
            const lostHp = gs.player.maxHp - gs.player.hp;
            const bonus = Math.floor(lostHp / 10) * 3;
            gs.dealDamage(7 + bonus);
        }
    },
    blood_fury_plus: {
        id: 'blood_fury_plus', name: '핏빛 분노+', icon: '🩸', cost: 0, type: 'ATTACK', desc: '피해 10. (잃은 체력 10마다 피해 +5.)', rarity: 'common', upgraded: true,
        image: 'card_blood_fury_plus.png',
        effect(gs) {
            const lostHp = gs.player.maxHp - gs.player.hp;
            const bonus = Math.floor(lostHp / 10) * 5;
            gs.dealDamage(10 + bonus);
        }
    },
    reckless_swing: {
        id: 'reckless_swing', name: '무모한 휘두르기', icon: '🪓', cost: 1, type: 'ATTACK', desc: '피해 12. 체력 3 소모.', rarity: 'common',
        image: 'card_reckless_swing.png',
        effect(gs) {
            gs.player.hp = Math.max(1, gs.player.hp - 3);
            gs.dealDamage(12);
            gs.markDirty?.('hud');
        }
    },
    reckless_swing_plus: {
        id: 'reckless_swing_plus', name: '무모한 휘두르기+', icon: '🪓', cost: 0, type: 'ATTACK', desc: '피해 16. 체력 4 소모.', rarity: 'common', upgraded: true,
        image: 'card_reckless_swing_plus.png',
        effect(gs) {
            gs.player.hp = Math.max(1, gs.player.hp - 4);
            gs.dealDamage(16);
            gs.markDirty?.('hud');
        }
    },
    berserk_mode: {
        id: 'berserk_mode', name: '광폭화', icon: '😡', cost: 3, type: 'POWER', desc: '【지속】 공격할 때마다 피해 +2.', rarity: 'rare',
        image: 'card_berserk_mode.png',
        effect(gs) { gs.addBuff('berserk_mode', 99, { atkGrowth: 2 }); }
    },
    berserk_mode_plus: {
        id: 'berserk_mode_plus', name: '광폭화+', icon: '😡', cost: 2, type: 'POWER', desc: '【지속】 공격할 때마다 피해 +3.', rarity: 'rare', upgraded: true,
        image: 'card_berserk_mode_plus.png',
        effect(gs) { gs.addBuff('berserk_mode_plus', 99, { atkGrowth: 3 }); }
    },
    abyssal_thirst: {
        id: 'abyssal_thirst', name: '심연의 목마름', icon: '🍷', cost: 2, type: 'SKILL', desc: '현재 체력의 50% 소모. 소모량의 200%만큼 보호막 획득.', rarity: 'rare',
        image: 'card_abyssal_thirst.png',
        effect(gs) {
            const cost = Math.floor(gs.player.hp * 0.5);
            gs.player.hp = Math.max(1, gs.player.hp - cost);
            gs.addShield(cost * 2);
            gs.addLog(`🍷 심연의 목마름: HP ${cost} 소모 -> 방어막 ${cost * 2} 획득!`, 'echo');
            gs.markDirty('hud');
        }
    },
    abyssal_thirst_plus: {
        id: 'abyssal_thirst_plus', name: '심연의 목마름+', icon: '🍷', cost: 1, type: 'SKILL', desc: '현재 체력의 50% 소모. 소모량의 300%만큼 보호막 획득.', rarity: 'rare', upgraded: true,
        image: 'card_abyssal_thirst.png',
        effect(gs) {
            const cost = Math.floor(gs.player.hp * 0.5);
            gs.player.hp = Math.max(1, gs.player.hp - cost);
            gs.addShield(cost * 3);
            gs.addLog(`🍷 심연의 목마름+: HP ${cost} 소모 -> 방어막 ${cost * 3} 획득!`, 'echo');
            gs.markDirty('hud');
        }
    },
    echo_barrier: {
        id: 'echo_barrier', name: '죽음의 무도', icon: '💃', cost: 1, type: 'SKILL', desc: '방어막 5. 잃은 체력 5당 방어막 +2 추가.', rarity: 'uncommon',
        image: 'card_echo_barrier.png',
        effect(gs) {
            const lostHp = gs.player.maxHp - gs.player.hp;
            const bonus = Math.floor(lostHp / 5) * 2;
            gs.addShield(5 + bonus);
        }
    },
    echo_barrier_plus: {
        id: 'echo_barrier_plus', name: '죽음의 무도+', icon: '💃', cost: 1, type: 'SKILL', desc: '방어막 8. 잃은 체력 4당 방어막 +2 추가.', rarity: 'uncommon', upgraded: true,
        image: 'card_echo_barrier.png',
        effect(gs) {
            const lostHp = gs.player.maxHp - gs.player.hp;
            const bonus = Math.floor(lostHp / 4) * 2;
            gs.addShield(8 + bonus);
        }
    },
    // ── 무음수호자 (Guardian) ──
    iron_defense: {
        id: 'iron_defense', name: '무쇠 방어', icon: '🛡️', cost: 1, type: 'SKILL', desc: '방어막 10. 잔향 10 충전.', rarity: 'common',
        image: 'card_iron_defense.png',
        effect(gs) { gs.addShield(10, { name: '무쇠 방어', type: 'card' }); gs.addEcho(10, { name: '무쇠 방어', type: 'card' }); }
    },
    iron_defense_plus: {
        id: 'iron_defense_plus', name: '무쇠 방어+', icon: '🛡️', cost: 0, type: 'SKILL', desc: '방어막 14. 잔향 20 충전.', rarity: 'common', upgraded: true,
        image: 'card_iron_defense_plus.png',
        effect(gs) { gs.addShield(14, { name: '무쇠 방어+', type: 'card' }); gs.addEcho(20, { name: '무쇠 방어+', type: 'card' }); }
    },
    shield_slam: {
        id: 'shield_slam', name: '방패 가격', icon: '💥', cost: 1, type: 'ATTACK', desc: '현재 방어막만큼 피해.', rarity: 'uncommon',
        image: 'card_shield_slam.png',
        effect(gs) { gs.dealDamage(gs.player.shield || 0); }
    },
    shield_slam_plus: {
        id: 'shield_slam_plus', name: '방패 가격+', icon: '💥', cost: 0, type: 'ATTACK', desc: '현재 방어막만큼 피해.', rarity: 'uncommon', upgraded: true,
        image: 'card_shield_slam_plus.png',
        effect(gs) { gs.dealDamage(gs.player.shield || 0); }
    },
    unbreakable_wall: {
        id: 'unbreakable_wall', name: '불굴의 벽', icon: '🧱', cost: 2, type: 'POWER', desc: '\u3010\uC9C0\uC18D\u3011 \uD134 \uC2DC\uC791 \uC2DC \uBC29\uC5B4\uB9C9\uC758 50%\uB9CC\uD07C \uBB34\uC791\uC704 \uC801\uC5D0\uAC8C \uD53C\uD574\uB97C \uC785\uD799\uB2C8\uB2E4. (\uC911\uCCA9 \uC2DC \uBC1C\uB3D9 \uD69F\uC218 +1)', rarity: 'rare',
        image: 'card_unbreakable_wall.png',
        effect(gs) { gs.addBuff('unbreakable_wall', 99); }
    },
    unbreakable_wall_plus: {
        id: 'unbreakable_wall_plus', name: '불굴의 벽+', icon: '🧱', cost: 1, type: 'POWER', desc: '\u3010\uC9C0\uC18D\u3011 \uD134 \uC2DC\uC791 \uC2DC \uBC29\uC5B4\uB9C9\uC758 70%\uB9CC\uD07C \uBB34\uC791\uC704 \uC801\uC5D0\uAC8C \uD53C\uD574\uB97C \uC785\uD799\uB2C8\uB2E4. (\uC911\uCCA9 \uC2DC \uBC1C\uB3D9 \uD69F\uC218 +1)', rarity: 'rare', upgraded: true,
        image: 'card_unbreakable_wall_plus.png',
        effect(gs) { gs.addBuff('unbreakable_wall_plus', 99); }
    },
    resonant_shield: {
        id: 'resonant_shield', name: '공진 방패', icon: '🛡️', cost: 1, type: 'ATTACK', desc: '현재 방어막의 1.5배 피해.', rarity: 'uncommon',
        image: 'card_resonant_shield.png',
        effect(gs) {
            const shield = gs.player.shield || 0;
            gs.dealDamage(Math.floor(shield * 1.5));
        }
    },
    resonant_shield_plus: {
        id: 'resonant_shield_plus', name: '공진 방패+', icon: '🛡️', cost: 1, type: 'ATTACK', desc: '현재 방어막의 2배 피해.', rarity: 'uncommon', upgraded: true,
        image: 'card_resonant_shield.png',
        effect(gs) {
            const shield = gs.player.shield || 0;
            gs.dealDamage(shield * 2);
        }
    }
};
