/**
 * cards.js — 카드 데이터, 업그레이드 맵, 에셋 경로
 */
import { AudioEngine } from '../engine/audio.js';

export const ASSETS = {
    avatars: {
        swordsman: '🗡️',
        mage: '🪄',
        hunter: '🏹',
        paladin: '⚜️',
        berserker: '🪓',
        shielder: '🛡️'
    }
};

export const UPGRADE_MAP = {
    'strike': 'strike_plus', 'defend': 'defend_plus', 'echo_strike': 'echo_strike_plus',
    'quick_step': 'quick_step_plus', 'heavy_blow': 'heavy_blow_plus', 'echo_wave': 'echo_wave_plus',
    'resonance': 'resonance_plus', 'soul_rend': 'soul_rend_plus', 'twin_strike': 'twin_strike_plus',
    'echo_shield': 'echo_shield_plus', 'momentum': 'momentum_plus', 'foresight': 'foresight_plus',
    'silent_stab': 'silent_stab_plus', 'vanish': 'vanish_plus',
    'surge': 'surge_plus',
    'flame_slash': 'ember_wave',
    'echo_tide': 'void_surge',
    'tempo_strike': 'echo_cascade',
    'holy_strike': 'holy_strike_plus',
    'blood_fury': 'blood_fury_plus',
    'iron_defense': 'iron_defense_plus'
};

export const CARDS = {
    // 공통 기본
    strike: {
        id: 'strike', name: '타격', icon: '⚔️', cost: 1, type: 'ATTACK', desc: '피해 9.', rarity: 'common',
        image: 'card_strike.png',
        effect(gs) { gs.dealDamage(9); AudioEngine.playChain(gs.player.echoChain); }
    },
    strike_plus: {
        id: 'strike_plus', name: '타격+', icon: '⚔️', cost: 1, type: 'ATTACK', desc: '피해 13. 잔향 5 충전.', rarity: 'common', upgraded: true,
        image: 'card_strike.png',
        effect(gs) { gs.dealDamage(13); gs.addEcho(5); AudioEngine.playChain(gs.player.echoChain); }
    },
    defend: {
        id: 'defend', name: '수비', icon: '🛡️', cost: 1, type: 'SKILL', desc: '방어도 7.', rarity: 'common',
        image: 'card_defend_standard.png',
        effect(gs) { gs.addShield(7); }
    },
    defend_plus: {
        id: 'defend_plus', name: '수비+', icon: '🛡️', cost: 1, type: 'SKILL', desc: '방어도 10.', rarity: 'common', upgraded: true,
        image: 'card_defend_plus.png',
        effect(gs) { gs.addShield(10); }
    },
    echo_strike: {
        id: 'echo_strike', name: '잔향 타격', icon: '💥', cost: 2, type: 'ATTACK', desc: '피해 14. 잔향 20 충전.', rarity: 'uncommon',
        image: 'card_echo_strike.png',
        effect(gs) { gs.dealDamage(14); gs.addEcho(20); }
    },
    echo_strike_plus: {
        id: 'echo_strike_plus', name: '잔향 타격+', icon: '💥', cost: 1, type: 'ATTACK', desc: '피해 15. 잔향 30 충전.', rarity: 'common', upgraded: true,
        image: 'card_echo_strike.png',
        effect(gs) { gs.dealDamage(15); gs.addEcho(30); }
    },
    quick_step: {
        id: 'quick_step', name: '잔영 이동', icon: '💨', cost: 0, type: 'SKILL', desc: '방어도 4. 잔향 15 충전.', rarity: 'common',
        image: 'card_quick_step.png',
        effect(gs) { gs.addShield(4); gs.addEcho(15); }
    },
    quick_step_plus: {
        id: 'quick_step_plus', name: '잔영 이동+', icon: '💨', cost: 0, type: 'SKILL', desc: '방어도 6. 잔향 20 충전. 카드 1장 뽑기.', rarity: 'common', upgraded: true,
        image: 'card_quick_step.png',
        effect(gs) { gs.addShield(6); gs.addEcho(20); gs.drawCards(1); }
    },
    heavy_blow: {
        id: 'heavy_blow', name: '중격', icon: '🔨', cost: 2, type: 'ATTACK', desc: '피해 18. 기절 1턴을 줍니다.', rarity: 'common',
        image: 'card_heavy_blow.png',
        effect(gs) { gs.dealDamage(18); gs.applyEnemyStatus('stunned', 1); }
    },
    heavy_blow_plus: {
        id: 'heavy_blow_plus', name: '중격+', icon: '🔨', cost: 2, type: 'ATTACK', desc: '피해 26. 기절 1턴을 줍니다.', rarity: 'common', upgraded: true,
        image: 'card_heavy_blow.png',
        effect(gs) { gs.dealDamage(26); gs.applyEnemyStatus('stunned', 1); }
    },
    echo_wave: {
        id: 'echo_wave', name: '잔향파', icon: '🌊', cost: 2, type: 'ATTACK', desc: '모든 적에게 피해 8.', rarity: 'uncommon',
        image: 'card_echo_wave.png',
        effect(gs) { gs.dealDamageAll(8); }
    },
    echo_wave_plus: {
        id: 'echo_wave_plus', name: '잔향파+', icon: '🌊', cost: 2, type: 'ATTACK', desc: '모든 적에게 피해 14. 잔향 15 충전.', rarity: 'uncommon', upgraded: true,
        image: 'card_echo_wave.png',
        effect(gs) { gs.dealDamageAll(14); gs.addEcho(15); }
    },
    resonance: {
        id: 'resonance', name: '공명', icon: '⚡', cost: 1, type: 'SKILL', desc: '잔향 40 충전.', rarity: 'uncommon',
        image: 'card_resonance.png',
        effect(gs) { gs.addEcho(40); }
    },
    resonance_plus: {
        id: 'resonance_plus', name: '공명+', icon: '⚡', cost: 0, type: 'SKILL', desc: '잔향 50 충전.', rarity: 'uncommon', upgraded: true,
        image: 'card_resonance.png',
        effect(gs) { gs.addEcho(50); }
    },
    soul_rend: {
        id: 'soul_rend', name: '영혼 강탈', icon: '💀', cost: 3, type: 'ATTACK', desc: '피해 24. 체력 4를 흡수합니다.', rarity: 'uncommon',
        image: 'card_soul_rend.png',
        effect(gs) { gs.dealDamage(24); gs.heal(4); }
    },
    soul_rend_plus: {
        id: 'soul_rend_plus', name: '영혼 강탈+', icon: '💀', cost: 2, type: 'ATTACK', desc: '피해 30. 체력 8을 흡수합니다.', rarity: 'uncommon', upgraded: true,
        image: 'card_soul_rend.png',
        effect(gs) { gs.dealDamage(30); gs.heal(8); }
    },
    twin_strike: {
        id: 'twin_strike', name: '쌍검격', icon: '⚔️', cost: 1, type: 'ATTACK', desc: '피해 6을 2번 줍니다.', rarity: 'uncommon',
        image: 'card_twin_strike.png',
        effect(gs) { gs.dealDamage(6, 0, true); gs.dealDamage(6); }
    },
    twin_strike_plus: {
        id: 'twin_strike_plus', name: '쌍검격+', icon: '⚔️', cost: 1, type: 'ATTACK', desc: '피해 9을 2번 줍니다.', rarity: 'uncommon', upgraded: true,
        image: 'card_twin_strike.png',
        effect(gs) { gs.dealDamage(9, 0, true); gs.dealDamage(9); }
    },
    echo_shield: {
        id: 'echo_shield', name: '잔향 방벽', icon: '🔵', cost: 2, type: 'SKILL', desc: '방어도 (현재 잔향/5).', rarity: 'uncommon',
        image: 'card_echo_shield.png',
        effect(gs) { gs.addShield(Math.floor(gs.player.echo / 5)); }
    },
    echo_shield_plus: {
        id: 'echo_shield_plus', name: '잔향 방벽+', icon: '🔵', cost: 1, type: 'SKILL', desc: '방어도 (현재 잔향/4). 잔향 10 충전.', rarity: 'uncommon', upgraded: true,
        image: 'card_echo_shield.png',
        effect(gs) { gs.addShield(Math.floor(gs.player.echo / 4)); gs.addEcho(10); }
    },
    // 잔향검사
    momentum: {
        id: 'momentum', name: '가속', icon: '🌪️', cost: 0, type: 'SKILL', desc: '이 턴에 주는 피해가 6 증가합니다.', rarity: 'common',
        image: 'card_momentum.png',
        effect(gs) { gs.addBuff('acceleration', 1, { dmgBonus: 6 }); }
    },
    momentum_plus: {
        id: 'momentum_plus', name: '가속+', icon: '🌪️', cost: 0, type: 'SKILL', desc: '이 턴에 주는 피해가 8 증가합니다. 잔향 10 충전.', rarity: 'common', upgraded: true,
        image: 'card_momentum_plus.png',
        effect(gs) { gs.addBuff('acceleration', 1, { dmgBonus: 8 }); gs.addEcho(10); }
    },
    charge: {
        id: 'charge', name: '돌진', icon: '⚡', cost: 1, type: 'ATTACK', desc: '피해 9. 추가로 가속 수치만큼 피해를 줍니다.', rarity: 'common',
        image: 'card_charge.png',
        effect(gs) { const m = gs.getBuff('momentum'); gs.dealDamage(9 + (m ? m.dmgBonus : 0)); }
    },
    afterimage: {
        id: 'afterimage', name: '잔영', icon: '👥', cost: 1, type: 'SKILL', desc: '방어도 4. 추가로 가속 수치만큼 방어도를 얻습니다.', rarity: 'uncommon',
        image: 'card_afterimage.png',
        effect(gs) { const m = gs.getBuff('momentum'); gs.addShield(4 + (m ? m.dmgBonus : 0)); }
    },
    phantom_blade: {
        id: 'phantom_blade', name: '환영 검', icon: '🌀', cost: 2, type: 'ATTACK', desc: '피해 10을 2번 줍니다. 두 번째 피해는 확정 치명타로 적중합니다.', rarity: 'uncommon',
        image: 'card_phantom_blade.png',
        effect(gs) { gs.dealDamage(10); gs.addBuff('vanish', 1, {}); gs.dealDamage(10); }
    },
    echo_dance: {
        id: 'echo_dance', name: '잔향의 춤', icon: '💃', cost: 3, type: 'ATTACK', desc: '피해 6을 4번 줍니다. 매 공격마다 잔향 8을 충전합니다.', rarity: 'rare',
        image: 'card_echo_dance.png',
        effect(gs) { for (let i = 0; i < 3; i++) { gs.dealDamage(6, null, true); gs.addEcho(8); } gs.dealDamage(6, null); gs.addEcho(8); }
    },
    blade_dance: {
        id: 'blade_dance', name: '검무', icon: '⚔️', cost: 1, type: 'ATTACK', desc: '피해 4를 3번 줍니다. 가속 상태라면 잔향 10을 충전합니다.', rarity: 'uncommon',
        image: 'card_blade_dance.png',
        effect(gs) { for (let i = 0; i < 3; i++) gs.dealDamage(4, null, i < 2); if (gs.getBuff('acceleration')) gs.addEcho(10); }
    },
    // 메아리술사
    foresight: {
        id: 'foresight', name: '예지', icon: '👁️', cost: 0, type: 'SKILL', desc: '적에게 약화 50%를 부여합니다. 잔향 5 충전.', rarity: 'common',
        image: 'card_foresight.png',
        effect(gs) { gs.addEcho(5); gs.applyEnemyStatus('weakened', 1); }
    },
    foresight_plus: {
        id: 'foresight_plus', name: '예지+', icon: '👁️', cost: 0, type: 'SKILL', desc: '적에게 약화 50%를 부여합니다. 잔향 10 충전.', rarity: 'common', upgraded: true,
        image: 'card_foresight.png',
        effect(gs) { gs.applyEnemyStatus('weakened', 1); gs.addEcho(10); }
    },
    counter: {
        id: 'counter', name: '반격', icon: '🔄', cost: 2, type: 'ATTACK', desc: '적의 의도된 피해의 1.5배만큼 피해를 줍니다. (최대 35)', rarity: 'common',
        image: 'card_counter.png',
        effect(gs) { gs.dealDamage(Math.min(35, Math.floor(gs.getEnemyIntent() * 1.5))); }
    },
    time_echo: {
        id: 'time_echo', name: '시간의 잔향', icon: '⏳', cost: 2, type: 'SKILL', desc: '가장 최근에 소모한 카드를 가져옵니다.', rarity: 'uncommon',
        image: 'card_time_echo.png',
        effect(gs) { if (gs.player.graveyard.length > 0) { const c = gs.player.graveyard.pop(); gs.player.hand.push(c); gs.addLog(`⏳ ${CARDS[c]?.name} 회수!`, 'echo'); } }
    },
    void_mirror: {
        id: 'void_mirror', name: '공허의 거울', icon: '🪞', cost: 2, type: 'ATTACK', desc: '적이 다음에 가할 공격을 반사합니다.', rarity: 'uncommon',
        image: 'card_void_mirror.png',
        effect(gs) { gs.addBuff('mirror', 1, { reflect: true }); gs.addLog('🪞 반사 준비', 'echo'); }
    },
    arcane_storm: {
        id: 'arcane_storm', name: '비전 폭풍', icon: '🌩️', cost: 3, type: 'ATTACK', desc: '모든 적에게 피해 14. 연쇄 +2.', rarity: 'rare',
        image: 'card_arcane_storm.png',
        effect(gs) { gs.dealDamageAll(14); gs.player.echoChain += 2; gs.updateChainDisplay(); }
    },
    prediction: {
        id: 'prediction', name: '예언', icon: '🔭', cost: 0, type: 'SKILL', desc: '카드 2장 뽑기. 잔향 15 충전.', rarity: 'uncommon',
        image: 'card_prediction.png',
        effect(gs) { if (gs.combat.active) gs.drawCards(2); gs.addEcho(15); }
    },
    time_warp: {
        id: 'time_warp', name: '시간 왜곡', icon: '🌀', cost: 2, type: 'POWER', desc: '매 턴 시작 시 에너지를 1 추가로 획득합니다.', rarity: 'rare',
        image: 'card_time_warp.png',
        effect(gs) { gs.addBuff('time_warp', 99, { energyPerTurn: 1 }); }
    },
    // 침묵사냥꾼
    silent_stab: {
        id: 'silent_stab', name: '침묵 자상', icon: '🗡️', cost: 0, type: 'ATTACK', desc: '피해 6. 침묵 1을 쌓습니다.', rarity: 'common',
        image: 'card_silent_stab.png',
        effect(gs) { gs.dealDamage(6); gs.addSilence(1, '침묵'); }
    },
    vanish: {
        id: 'vanish', name: '은신', icon: '🌑', cost: 1, type: 'SKILL', desc: '다음 공격이 치명타로 적중합니다.', rarity: 'common',
        image: 'card_vanish.png',
        effect(gs) { gs.addBuff('vanish', 1, {}); }
    },
    death_mark: {
        id: 'death_mark', name: '처형 표식', icon: '💢', cost: 1, type: 'ATTACK', desc: '피해 8. 3턴 동안 지속되는 처형 표식을 부여합니다. (폭발 피해 30)', rarity: 'uncommon',
        image: 'card_death_mark.png',
        effect(gs) { gs.dealDamage(8); gs.applyEnemyStatus('marked', 3); gs.addLog('💢 처형 표식!', 'echo'); }
    },
    shadow_step: {
        id: 'shadow_step', name: '그림자 도약', icon: '🌑', cost: 0, type: 'SKILL', desc: '침묵 수치가 2 감소합니다. 방어도 5. 다음 공격의 피해가 8 증가합니다.', rarity: 'uncommon',
        image: 'card_shadow_step.png',
        effect(gs) { gs.player.silenceGauge = Math.max(0, (gs.player.silenceGauge || 0) - 2); gs.addShield(5); gs.addBuff('shadow_atk', 1, { dmgBonus: 8 }); }
    },
    poison_blade: {
        id: 'poison_blade', name: '독침 검', icon: '🐍', cost: 1, type: 'ATTACK', desc: '피해 7. 적에게 독 3턴을 부여합니다.', rarity: 'uncommon',
        image: 'card_poison_blade.png',
        effect(gs) { gs.dealDamage(7); gs.applyEnemyStatus('poisoned', 3); }
    },
    phantom_step: {
        id: 'phantom_step', name: '환영 보폭', icon: '💨', cost: 1, type: 'SKILL', desc: '방어도 10. 회피 1을 획득합니다.', rarity: 'uncommon',
        image: 'card_phantom_step.png',
        effect(gs) { gs.addShield(10); gs.addBuff('dodge', 1, {}); }
    },
    // 레어/파워
    echo_burst_card: {
        id: 'echo_burst_card', name: '잔향 폭발', icon: '🌟', cost: 3, type: 'POWER', desc: '공명 폭발을 즉시 발동합니다.', rarity: 'rare',
        image: 'card_echo_burst.png',
        effect(gs) { gs.triggerResonanceBurst(); }
    },
    void_blade: {
        id: 'void_blade', name: '공허의 도검', icon: '🌀', cost: 2, type: 'ATTACK', desc: '피해 30. 소멸.', rarity: 'rare', exhaust: true,
        image: 'card_void_blade.png',
        effect(gs) { gs.dealDamage(30); }
    },
    soul_armor: {
        id: 'soul_armor', name: '영혼 방어구', icon: '💠', cost: 2, type: 'SKILL', desc: '방어도 15. 3턴 동안 매 턴 시작 시 잔향을 10 충전합니다.', rarity: 'rare',
        image: 'card_soul_armor.png',
        effect(gs) { gs.addShield(15); gs.addBuff('soul_armor', 3, { echoRegen: 10 }); }
    },
    soul_harvest: {
        id: 'soul_harvest', name: '영혼 수확', icon: '💫', cost: 2, type: 'ATTACK', desc: '피해 20. 이 공격으로 적을 처치하면 회복 8.', rarity: 'uncommon',
        image: 'card_soul_harvest.png',
        effect(gs) { gs.dealDamage(20); }
    },
    echo_overload: {
        id: 'echo_overload', name: '잔향 과부하', icon: '⚡', cost: 2, type: 'SKILL', desc: '잔향을 100까지 즉시 충전합니다. 체력을 15 잃습니다.', rarity: 'rare',
        image: 'card_echo_overload.png',
        effect(gs) { gs.player.echo = 100; gs.player.hp = Math.max(1, gs.player.hp - 15); gs.addLog('⚡ Echo 과부하! HP-15', 'damage'); gs.markDirty('hud'); }
    },
    desperate_strike: {
        id: 'desperate_strike', name: '결사의 일격', icon: '☠️', cost: 1, type: 'ATTACK', desc: '잃은 체력에 비례하여 높은 피해를 줍니다. (최대 40)', rarity: 'uncommon',
        image: 'card_desperate_strike.png',
        effect(gs) { const d = Math.floor((1 - gs.player.hp / gs.player.maxHp) * 40) + 5; gs.dealDamage(d); }
    },
    reverberation: {
        id: 'reverberation', name: '반향', icon: '🔊', cost: 2, type: 'ATTACK', desc: '현재 연쇄 수치의 8배만큼 피해를 줍니다. (최대 40)', rarity: 'uncommon',
        image: 'card_reverberation.png',
        effect(gs) { gs.dealDamage(Math.min(40, (gs.player.echoChain || 1) * 8)); }
    },
    sanctuary: {
        id: 'sanctuary', name: '성역', icon: '🏛️', cost: 3, type: 'SKILL', desc: '방어도 15. 2턴 동안 무적 상태가 됩니다.', rarity: 'rare',
        image: 'card_sanctuary.png',
        effect(gs) { gs.addShield(15); gs.addBuff('immune', 2, {}); gs.addLog('🏛️ 성역! 2턴 면역', 'echo'); }
    },
    dark_pact: {
        id: 'dark_pact', name: '어둠의 계약', icon: '📜', cost: 1, type: 'SKILL', desc: '체력을 8 잃습니다. 카드 2장 뽑기.', rarity: 'uncommon',
        image: 'card_dark_pact.png',
        effect(gs) { gs.player.hp = Math.max(1, gs.player.hp - 8); gs.drawCards(2); gs.markDirty('hud'); }
    },
    // ── 에너지 관련 카드 ──
    surge: {
        id: 'surge', name: '쇄도', icon: '⚡', cost: 0, type: 'SKILL', desc: '이번 턴에 에너지를 2 얻습니다.', rarity: 'uncommon',
        image: 'card_surge.png',
        effect(gs) { gs.player.energy += 2; gs.addLog('⚡ 서지: 에너지 +2!', 'echo'); gs.markDirty('hud'); }
    },
    surge_plus: {
        id: 'surge_plus', name: '쇄도+', icon: '⚡', cost: 0, type: 'SKILL', desc: '이번 턴에 에너지를 3 얻습니다. 카드 1장 뽑기.', rarity: 'uncommon', upgraded: true,
        image: 'card_surge.png',
        effect(gs) { gs.player.energy += 3; gs.drawCards(1); gs.addLog('⚡ 서지+: 에너지 +3!', 'echo'); gs.markDirty('hud'); }
    },
    overcharge: {
        id: 'overcharge', name: '과충전', icon: '🔋', cost: 2, type: 'SKILL', desc: '이번 턴에 에너지를 4 얻습니다. 체력을 6 잃습니다. 잔향 30 충전.', rarity: 'rare',
        image: 'card_overcharge.png',
        effect(gs) { gs.player.energy += 4; gs.player.hp = Math.max(1, gs.player.hp - 6); gs.addEcho(30); gs.addLog('🔋 과충전! 에너지 +4', 'echo'); gs.markDirty('hud'); }
    },
    void_tap: {
        id: 'void_tap', name: '공허 흡수', icon: '🌀', cost: 1, type: 'SKILL', desc: '소모한 에너지 수치의 6배만큼 피해를 줍니다.', rarity: 'rare',
        image: 'card_void_tap.png',
        effect(gs) { const spent = gs.player.maxEnergy - gs.player.energy; const dmg = (spent + 1) * 6; gs.dealDamage(dmg); gs.addLog(`🌀 허공 탭: ${dmg} 피해!`, 'echo'); }
    },
    energy_siphon: {
        id: 'energy_siphon', name: '에너지 사이펀', icon: '🔵', cost: 0, type: 'ATTACK', desc: '에너지를 1 소모하여 피해 12를 줍니다. 소멸.', rarity: 'uncommon', exhaust: true,
        image: 'card_energy_siphon.png',
        effect(gs) { if (gs.player.energy > 0) { gs.player.energy--; gs.dealDamage(12); gs.addLog('🔵 에너지 사이펀: 에너지 1 → 12 피해', 'echo'); } else { gs.addLog('🔵 에너지 사이펀: 에너지 없음!', 'damage'); } gs.markDirty('hud'); }
    },
    // ── 새 카드: 화염 / 전략 계열 ──
    flame_slash: {
        id: 'flame_slash', name: '화염 검격', icon: '🔥', cost: 1, type: 'ATTACK', desc: '피해 7. 적에게 화염 2턴을 부여합니다.', rarity: 'uncommon',
        image: 'card_flame_slash.png',
        effect(gs) { gs.dealDamage(7); gs.applyEnemyStatus('burning', 2); gs.addLog('🔥 화염 검격!', 'echo'); }
    },
    ember_wave: {
        id: 'ember_wave', name: '불꽃 파동', icon: '🌊', cost: 2, type: 'ATTACK', desc: '모든 적에게 피해 8. 화염 1턴을 부여합니다.', rarity: 'uncommon',
        image: 'card_flame_slash.png',
        effect(gs) { gs.dealDamageAll(8); gs.combat.enemies.forEach((_, i) => { if (gs.combat.enemies[i].hp > 0) gs.applyEnemyStatus('burning', 1, i); }); gs.addLog('🌊 불꽃 파동!', 'echo'); }
    },
    echo_reflect: {
        id: 'echo_reflect', name: '잔향 반향', icon: '🔊', cost: 1, type: 'SKILL', desc: '방어도 8. 이번 턴에 피해를 입을 경우 적에게 공격을 반사합니다.', rarity: 'rare',
        image: 'card_echo_reflect.png',
        effect(gs) { gs.addShield(8); gs.addBuff('mirror', 1, { reflect: true }); gs.addLog('🔊 잔향 반향! 반사 준비', 'echo'); }
    },
    chain_reaction: {
        id: 'chain_reaction', name: '연쇄 반응', icon: '⛓️', cost: 2, type: 'ATTACK', desc: '현재 연쇄 수치의 5배만큼 피해를 줍니다. 이 공격은 연쇄를 초기화하지 않습니다.', rarity: 'rare',
        image: 'card_chain_reaction.png',
        effect(gs) { const chain = Math.max(1, gs.player.echoChain); gs.dealDamage(chain * 5, null, true); gs.addLog(`⛓️ 연쇄 반응: 체인 ${chain} × 5 = ${chain * 5}!`, 'echo'); }
    },
    revival_echo: {
        id: 'revival_echo', name: '소생의 잔향', icon: '💠', cost: 3, type: 'SKILL', desc: '회복 15. 소모한 카드 더미에서 카드 2장을 가져옵니다. 소멸.', rarity: 'rare', exhaust: true,
        image: 'card_revival_echo.png',
        effect(gs) { gs.heal(15); const rev = []; for (let i = 0; i < 2 && gs.player.graveyard.length > 0; i++) { const c = gs.player.graveyard.pop(); gs.player.hand.push(c); rev.push(CARDS[c]?.name || c); } gs.addLog(`💠 소생 잔향: ${rev.join(', ')} 회수!`, 'echo'); gs.markDirty('hand'); }
    },

    // ── 에너지 할인 카드 ──
    echo_tide: {
        id: 'echo_tide', name: '잔향의 조류', icon: '🌀', cost: 0, type: 'SKILL', desc: '이번 턴에 모든 카드의 비용이 1 감소합니다. 잔향 10 충전.', rarity: 'uncommon',
        image: 'card_echo_tide.png',
        effect(gs) { gs.player.costDiscount = (gs.player.costDiscount || 0) + 1; gs.addEcho(10); gs.addLog('🌀 잔향의 조류: 이번 턴 전 카드 비용 -1!', 'echo'); gs.markDirty('hand'); gs.markDirty('hud'); }
    },
    void_surge: {
        id: 'void_surge', name: '공허의 쇄도', icon: '⚡', cost: 1, type: 'SKILL', desc: '이번 턴에 모든 카드의 비용이 1 감소합니다. (최소 0)', rarity: 'rare',
        image: 'card_void_surge.png',
        effect(gs) { gs.player.costDiscount = (gs.player.costDiscount || 0) + 1; gs.addLog('⚡ 허공 급류: 이번 턴 전 카드 비용 -1!', 'echo'); gs.markDirty('hand'); gs.markDirty('hud'); }
    },
    resonance_flow: {
        id: 'resonance_flow', name: '공명의 흐름', icon: '🎵', cost: 0, type: 'SKILL', desc: '손패의 카드 수만큼 잔향을 충전합니다. (장당 잔향 8 충전)', rarity: 'uncommon',
        image: 'card_resonance_flow.png',
        effect(gs) { const n = gs.player.hand.length; gs.addEcho(n * 8); gs.addLog(`🎵 공명 흐름: 손패 ${n}장 → Echo +${n * 8}!`, 'echo'); }
    },
    echo_cascade: {
        id: 'echo_cascade', name: '잔향의 폭포', icon: '💧', cost: 2, type: 'SKILL', desc: '카드 1장을 뽑습니다. 그 카드의 비용을 이번 턴 동안 0으로 만듭니다. 소멸.', rarity: 'rare',
        image: 'card_echo_cascade.png',
        effect(gs) {
            const before = gs.player.hand.length;
            gs.drawCards(1);
            const newCardIds = gs.player.hand.slice(before);
            if (newCardIds.length > 0) {
                const cardId = newCardIds[0];
                if (!gs.player._cascadeCards) gs.player._cascadeCards = new Map();
                gs.player._cascadeCards.set(gs.player.hand.length - 1, cardId);
                gs.addLog(`💧 잔향 폭포: ${CARDS[cardId]?.name} 드로우, 비용 0!`, 'echo');
            }
            gs.markDirty('hand');
        }
    },
    tempo_strike: {
        id: 'tempo_strike', name: '박자 강타', icon: ' drum', cost: 1, type: 'ATTACK', desc: '피해 8. 다음에 사용하는 카드의 비용이 1 감소합니다.', rarity: 'common',
        image: 'card_tempo_strike.png',
        effect(gs) {
            gs.dealDamage(8);
            gs.player._nextCardDiscount = (gs.player._nextCardDiscount || 0) + 1;
            gs.addLog('🥁 박자 강타: 다음 카드 비용 -1!', 'echo');
            gs.markDirty('hand');
        }
    },
    echo_lull: {
        id: 'echo_lull', name: '잔향의 고요', icon: '🌙', cost: 0, type: 'SKILL', desc: '에너지를 1 잃습니다. 이번 턴에 손패의 모든 카드 비용이 2 감소합니다.', rarity: 'uncommon',
        image: 'card_echo_lull.png',
        effect(gs) { gs.player.energy = Math.max(0, gs.player.energy - 1); gs.player.costDiscount = (gs.player.costDiscount || 0) + 2; gs.addLog('🌙 잔향의 고요: 에너지 -1, 모든 카드 비용 -2!', 'echo'); gs.markDirty('hand'); gs.markDirty('hud'); }
    },

    // ── 찬송기사 (Paladin) ──
    holy_strike: {
        id: 'holy_strike', name: '성스러운 강타', icon: '✨', cost: 1, type: 'ATTACK', desc: '피해 8. 회복 2.', rarity: 'common',
        effect(gs) { gs.dealDamage(8); gs.heal(2); }
    },
    holy_strike_plus: {
        id: 'holy_strike_plus', name: '성스러운 강타+', icon: '✨', cost: 1, type: 'ATTACK', desc: '피해 11. 회복 4.', rarity: 'common', upgraded: true,
        effect(gs) { gs.dealDamage(11); gs.heal(4); }
    },
    divine_grace: {
        id: 'divine_grace', name: '신의 은총', icon: '🙏', cost: 1, type: 'SKILL', desc: '방어도 6. 잔향 15 충전.', rarity: 'common',
        effect(gs) { gs.addShield(6); gs.addEcho(15); }
    },
    blessing_of_light: {
        id: 'blessing_of_light', name: '빛의 축복', icon: '☀️', cost: 2, type: 'POWER', desc: '매 턴 시작 시 HP 3을 회복합니다.', rarity: 'uncommon',
        effect(gs) { gs.addBuff('blessing_of_light', 99, { healPerTurn: 3 }); }
    },

    // ── 파음전사 (Berserker) ──
    blood_fury: {
        id: 'blood_fury', name: '핏빛 분노', icon: '🩸', cost: 1, type: 'ATTACK', desc: '피해 7. 잃은 체력 10당 피해가 3 증가합니다.', rarity: 'common',
        effect(gs) {
            const lostHp = gs.player.maxHp - gs.player.hp;
            const bonus = Math.floor(lostHp / 10) * 3;
            gs.dealDamage(7 + bonus);
        }
    },
    blood_fury_plus: {
        id: 'blood_fury_plus', name: '핏빛 분노+', icon: '🩸', cost: 1, type: 'ATTACK', desc: '피해 10. 잃은 체력 10당 피해가 5 증가합니다.', rarity: 'common', upgraded: true,
        effect(gs) {
            const lostHp = gs.player.maxHp - gs.player.hp;
            const bonus = Math.floor(lostHp / 10) * 5;
            gs.dealDamage(10 + bonus);
        }
    },
    reckless_swing: {
        id: 'reckless_swing', name: '무모한 휘두르기', icon: '🪓', cost: 1, type: 'ATTACK', desc: '피해 15. 체력을 3 잃습니다.', rarity: 'common',
        effect(gs) {
            gs.player.hp = Math.max(1, gs.player.hp - 3);
            gs.dealDamage(15);
            gs.markDirty?.('hud');
        }
    },
    berserk_mode: {
        id: 'berserk_mode', name: '광폭화', icon: '😡', cost: 3, type: 'POWER', desc: '공격할 때마다 주는 피해가 2 증가합니다.', rarity: 'rare',
        effect(gs) { gs.addBuff('berserk_mode', 99, { atkGrowth: 2 }); }
    },

    // ── 무음수호자 (Shielder) ──
    iron_defense: {
        id: 'iron_defense', name: '무쇠 방어', icon: '🛡️', cost: 1, type: 'SKILL', desc: '방어도 10. 잔향 10 충전.', rarity: 'common',
        effect(gs) { gs.addShield(10); gs.addEcho(10); }
    },
    iron_defense_plus: {
        id: 'iron_defense_plus', name: '무쇠 방어+', icon: '🛡️', cost: 1, type: 'SKILL', desc: '방어도 14. 잔향 20 충전.', rarity: 'common', upgraded: true,
        effect(gs) { gs.addShield(14); gs.addEcho(20); }
    },
    shield_slam: {
        id: 'shield_slam', name: '방패 가격', icon: '💥', cost: 2, type: 'ATTACK', desc: '현재 방어도 수치만큼 피해를 줍니다.', rarity: 'uncommon',
        effect(gs) { gs.dealDamage(gs.player.shield || 0); }
    },
    unbreakable_wall: {
        id: 'unbreakable_wall', name: '불굴의 벽', icon: '🧱', cost: 3, type: 'POWER', desc: '턴 종료 시 방어도가 절반만 감소합니다.', rarity: 'rare',
        effect(gs) { gs.addBuff('unbreakable_wall', 99, {}); }
    },
};
