const DATA = {
  // 에셋 경로 정의
  assets: {
    avatars: {
      swordsman: 'avatar_swordsman.png',
      mage: 'avatar_mage.png',
      hunter: 'avatar_hunter.png'
    }
  },
  // 카드 강화 시스템: upgradeOf -> 원본카드, 강화 후 suffix '+' 붙은 버전
  upgradeMap: {
    'strike': 'strike_plus', 'defend': 'defend_plus', 'echo_strike': 'echo_strike_plus',
    'quick_step': 'quick_step_plus', 'heavy_blow': 'heavy_blow_plus', 'echo_wave': 'echo_wave_plus',
    'resonance': 'resonance_plus', 'soul_rend': 'soul_rend_plus', 'twin_strike': 'twin_strike_plus',
    'echo_shield': 'echo_shield_plus', 'momentum': 'momentum_plus', 'foresight': 'foresight_plus',
    'silent_stab': 'silent_stab_plus', 'vanish': 'vanish_plus',
    'surge': 'surge_plus',
    'flame_slash': 'ember_wave',
    'echo_tide': 'void_surge',
    'tempo_strike': 'echo_cascade',
  },
  cards: {
    // 공통 기본
    strike: {
      id: 'strike', name: '강타', icon: '⚔️', cost: 1, type: 'ATTACK', desc: '8 피해', rarity: 'common',
      effect(gs) { gs.dealDamage(8); AudioEngine.playChain(gs.player.echoChain); }
    },
    strike_plus: {
      id: 'strike_plus', name: '강타+', icon: '⚔️', cost: 1, type: 'ATTACK', desc: '13 피해, Echo +5', rarity: 'common', upgraded: true,
      effect(gs) { gs.dealDamage(13); gs.addEcho(5); AudioEngine.playChain(gs.player.echoChain); }
    },
    defend: {
      id: 'defend', name: '방어', icon: '🛡️', cost: 1, type: 'SKILL', desc: '방어막 6 획득', rarity: 'common',
      effect(gs) { gs.addShield(6); }
    },
    defend_plus: {
      id: 'defend_plus', name: '방어+', icon: '🛡️', cost: 1, type: 'SKILL', desc: '방어막 10 획득', rarity: 'common', upgraded: true,
      effect(gs) { gs.addShield(10); }
    },
    echo_strike: {
      id: 'echo_strike', name: '잔향 강타', icon: '💥', cost: 2, type: 'ATTACK', desc: '12 피해, Echo +20', rarity: 'common',
      effect(gs) { gs.dealDamage(12); gs.addEcho(20); }
    },
    echo_strike_plus: {
      id: 'echo_strike_plus', name: '잔향 강타+', icon: '💥', cost: 1, type: 'ATTACK', desc: '15 피해, Echo +30', rarity: 'common', upgraded: true,
      effect(gs) { gs.dealDamage(15); gs.addEcho(30); }
    },
    quick_step: {
      id: 'quick_step', name: '잔영 이동', icon: '💨', cost: 0, type: 'SKILL', desc: '방어막 3, Echo +10', rarity: 'common',
      effect(gs) { gs.addShield(3); gs.addEcho(10); }
    },
    quick_step_plus: {
      id: 'quick_step_plus', name: '잔영 이동+', icon: '💨', cost: 0, type: 'SKILL', desc: '방어막 6, Echo +20, 1장 드로우', rarity: 'common', upgraded: true,
      effect(gs) { gs.addShield(6); gs.addEcho(20); gs.drawCards(1); }
    },
    heavy_blow: {
      id: 'heavy_blow', name: '중격', icon: '🔨', cost: 2, type: 'ATTACK', desc: '18 피해 + 기절 1턴', rarity: 'common',
      effect(gs) { gs.dealDamage(18); gs.applyEnemyStatus('stunned', 1); }
    },
    heavy_blow_plus: {
      id: 'heavy_blow_plus', name: '중격+', icon: '🔨', cost: 2, type: 'ATTACK', desc: '26 피해 + 기절 2턴', rarity: 'common', upgraded: true,
      effect(gs) { gs.dealDamage(26); gs.applyEnemyStatus('stunned', 2); }
    },
    echo_wave: {
      id: 'echo_wave', name: '잔향파', icon: '🌊', cost: 2, type: 'ATTACK', desc: '전체 적에게 8 피해', rarity: 'uncommon',
      effect(gs) { gs.dealDamageAll(8); }
    },
    echo_wave_plus: {
      id: 'echo_wave_plus', name: '잔향파+', icon: '🌊', cost: 2, type: 'ATTACK', desc: '전체 14 피해, Echo +15', rarity: 'uncommon', upgraded: true,
      effect(gs) { gs.dealDamageAll(14); gs.addEcho(15); }
    },
    resonance: {
      id: 'resonance', name: '공명', icon: '⚡', cost: 1, type: 'SKILL', desc: 'Echo 40 충전', rarity: 'uncommon',
      effect(gs) { gs.addEcho(40); }
    },
    resonance_plus: {
      id: 'resonance_plus', name: '공명+', icon: '⚡', cost: 0, type: 'SKILL', desc: 'Echo 50 충전', rarity: 'uncommon', upgraded: true,
      effect(gs) { gs.addEcho(50); }
    },
    soul_rend: {
      id: 'soul_rend', name: '영혼 강탈', icon: '💀', cost: 3, type: 'ATTACK', desc: '24 피해 + 체력 4 흡수', rarity: 'uncommon',
      effect(gs) { gs.dealDamage(24); gs.heal(4); }
    },
    soul_rend_plus: {
      id: 'soul_rend_plus', name: '영혼 강탈+', icon: '💀', cost: 2, type: 'ATTACK', desc: '30 피해 + 체력 8 흡수', rarity: 'uncommon', upgraded: true,
      effect(gs) { gs.dealDamage(30); gs.heal(8); }
    },
    twin_strike: {
      id: 'twin_strike', name: '쌍검격', icon: '⚔️', cost: 1, type: 'ATTACK', desc: '6 피해 × 2회', rarity: 'uncommon',
      effect(gs) { gs.dealDamage(6, 0, true); gs.dealDamage(6); }
    },
    twin_strike_plus: {
      id: 'twin_strike_plus', name: '쌍검격+', icon: '⚔️', cost: 1, type: 'ATTACK', desc: '9 피해 × 2회', rarity: 'uncommon', upgraded: true,
      effect(gs) { gs.dealDamage(9, 0, true); gs.dealDamage(9); }
    },
    echo_shield: {
      id: 'echo_shield', name: '잔향 방벽', icon: '🔵', cost: 2, type: 'SKILL', desc: '방어막 (Echo/5)', rarity: 'uncommon',
      effect(gs) { gs.addShield(Math.floor(gs.player.echo / 5)); }
    },
    echo_shield_plus: {
      id: 'echo_shield_plus', name: '잔향 방벽+', icon: '🔵', cost: 1, type: 'SKILL', desc: '방어막 (Echo/4), Echo +10', rarity: 'uncommon', upgraded: true,
      effect(gs) { gs.addShield(Math.floor(gs.player.echo / 4)); gs.addEcho(10); }
    },
    // 잔향검사
    momentum: {
      id: 'momentum', name: '가속', icon: '🌪️', cost: 0, type: 'SKILL', desc: '이 턴 피해 +4', rarity: 'common',
      effect(gs) { gs.addBuff('momentum', 1, { dmgBonus: 4 }); }
    },
    momentum_plus: {
      id: 'momentum_plus', name: '가속+', icon: '🌪️', cost: 0, type: 'SKILL', desc: '이 턴 피해 +8, Echo +10', rarity: 'common', upgraded: true,
      effect(gs) { gs.addBuff('momentum', 1, { dmgBonus: 8 }); gs.addEcho(10); }
    },
    charge: {
      id: 'charge', name: '돌진', icon: '⚡', cost: 1, type: 'ATTACK', desc: '모멘텀 × 6 피해', rarity: 'common',
      effect(gs) { const m = gs.getBuff('momentum'); gs.dealDamage(6 + (m ? m.dmgBonus : 0)); }
    },
    afterimage: {
      id: 'afterimage', name: '잔영', icon: '👥', cost: 1, type: 'SKILL', desc: '모멘텀 수만큼 방어막', rarity: 'uncommon',
      effect(gs) { const m = gs.getBuff('momentum'); gs.addShield(4 + (m ? m.dmgBonus : 0)); }
    },
    phantom_blade: {
      id: 'phantom_blade', name: '환영 검', icon: '🌀', cost: 2, type: 'ATTACK', desc: '10 피해 × 2 (2번째 치명타)', rarity: 'uncommon',
      effect(gs) { gs.dealDamage(10); gs.addBuff('vanish', 1, {}); gs.dealDamage(10); }
    },
    echo_dance: {
      id: 'echo_dance', name: '잔향의 춤', icon: '💃', cost: 3, type: 'ATTACK', desc: '6 피해 × 4, 회당 Echo +8', rarity: 'rare',
      image: 'card_echo_dance.png',
      effect(gs) { for (let i = 0; i < 3; i++) { gs.dealDamage(6, 0, true); gs.addEcho(8); } gs.dealDamage(6); gs.addEcho(8); }
    },
    // 메아리술사
    foresight: {
      id: 'foresight', name: '예지', icon: '👁️', cost: 1, type: 'SKILL', desc: '다음 적 행동 약화 50%', rarity: 'common',
      effect(gs) { gs.applyEnemyStatus('weakened', 1); }
    },
    foresight_plus: {
      id: 'foresight_plus', name: '예지+', icon: '👁️', cost: 0, type: 'SKILL', desc: '약화 50%, Echo +10', rarity: 'common', upgraded: true,
      effect(gs) { gs.applyEnemyStatus('weakened', 1); gs.addEcho(10); }
    },
    counter: {
      id: 'counter', name: '반격', icon: '🔄', cost: 2, type: 'ATTACK', desc: '예측 피해 × 2 반사', rarity: 'common',
      effect(gs) { gs.dealDamage(gs.getEnemyIntent() * 2 || 14); }
    },
    time_echo: {
      id: 'time_echo', name: '시간 메아리', icon: '⏳', cost: 2, type: 'SKILL', desc: '최근 사용 카드 회수', rarity: 'uncommon',
      effect(gs) { if (gs.player.graveyard.length > 0) { const c = gs.player.graveyard.pop(); gs.player.hand.push(c); gs.addLog(`⏳ ${DATA.cards[c]?.name} 회수!`, 'echo'); } }
    },
    void_mirror: {
      id: 'void_mirror', name: '허공 거울', icon: '🪞', cost: 2, type: 'ATTACK', desc: '다음 적 공격 반사', rarity: 'uncommon',
      effect(gs) { gs.addBuff('mirror', 1, { reflect: true }); gs.addLog('🪞 반사 준비', 'echo'); }
    },
    arcane_storm: {
      id: 'arcane_storm', name: '비전 폭풍', icon: '🌩️', cost: 3, type: 'ATTACK', desc: '전체 14 피해, Chain +2', rarity: 'rare',
      image: 'card_arcane_storm.png',
      effect(gs) { gs.dealDamageAll(14); gs.player.echoChain += 2; gs.updateChainDisplay(); }
    },
    prediction: {
      id: 'prediction', name: '예언', icon: '🔭', cost: 0, type: 'SKILL', desc: '2장 드로우, Echo +15', rarity: 'common',
      effect(gs) { if (gs.combat.active) gs.drawCards(2); gs.addEcho(15); }
    },
    // 침묵사냥꾼
    silent_stab: {
      id: 'silent_stab', name: '침묵 자상', icon: '🗡️', cost: 0, type: 'ATTACK', desc: '6 피해, 침묵 +1', rarity: 'common',
      effect(gs) { gs.dealDamage(6); gs.addSilence(1); }
    },
    vanish: {
      id: 'vanish', name: '은신', icon: '🌑', cost: 1, type: 'SKILL', desc: '다음 공격 크리티컬', rarity: 'common',
      effect(gs) { gs.addBuff('vanish', 1, {}); }
    },
    death_mark: {
      id: 'death_mark', name: '처형 표식', icon: '💢', cost: 1, type: 'ATTACK', desc: '8 피해, 표식 3턴 (폭발 30)', rarity: 'uncommon',
      effect(gs) { gs.dealDamage(8); gs.applyEnemyStatus('marked', 3); gs.addLog('💢 처형 표식!', 'echo'); }
    },
    shadow_step: {
      id: 'shadow_step', name: '그림자 도약', icon: '🌑', cost: 0, type: 'SKILL', desc: '침묵 -2, 방어막 5, 다음 공격 +8', rarity: 'uncommon',
      effect(gs) { gs.player.silenceGauge = Math.max(0, (gs.player.silenceGauge || 0) - 2); gs.addShield(5); gs.addBuff('shadow_atk', 1, { dmgBonus: 8 }); }
    },
    poison_blade: {
      id: 'poison_blade', name: '독침 검', icon: '🐍', cost: 1, type: 'ATTACK', desc: '7 피해 + 독 3턴', rarity: 'uncommon',
      effect(gs) { gs.dealDamage(7); gs.applyEnemyStatus('poisoned', 3); }
    },
    // 레어/파워
    echo_burst_card: {
      id: 'echo_burst_card', name: 'Echo Burst', icon: '🌟', cost: 3, type: 'POWER', desc: 'Resonance Burst 즉시 발동', rarity: 'rare',
      effect(gs) { gs.triggerResonanceBurst(); }
    },
    void_blade: {
      id: 'void_blade', name: '허공 도검', icon: '🌀', cost: 2, type: 'ATTACK', desc: '30 피해, 소진', rarity: 'rare', exhaust: true,
      image: 'card_void_blade.png',
      effect(gs) { gs.dealDamage(30); }
    },
    soul_armor: {
      id: 'soul_armor', name: '영혼 방어구', icon: '💠', cost: 2, type: 'SKILL', desc: '방어막 15, 3턴간 Echo +10/턴', rarity: 'rare',
      effect(gs) { gs.addShield(15); gs.addBuff('soul_armor', 3, { echoRegen: 10 }); }
    },
    soul_harvest: {
      id: 'soul_harvest', name: '영혼 수확', icon: '💫', cost: 2, type: 'ATTACK', desc: '20 피해, 처치 시 HP +8', rarity: 'uncommon',
      effect(gs) { gs.dealDamage(20); }
    },
    echo_overload: {
      id: 'echo_overload', name: 'Echo 과부하', icon: '⚡', cost: 1, type: 'SKILL', desc: 'Echo 100 충전, HP -12', rarity: 'rare',
      image: 'echo_overload.png',
      effect(gs) { gs.player.echo = 100; gs.player.hp = Math.max(1, gs.player.hp - 12); gs.addLog('⚡ Echo 과부하! HP-12', 'damage'); updateUI(); }
    },
    desperate_strike: {
      id: 'desperate_strike', name: '결사의 일격', icon: '☠️', cost: 1, type: 'ATTACK', desc: '체력 비례 피해 (최대 50)', rarity: 'uncommon',
      effect(gs) { const d = Math.floor((1 - gs.player.hp / gs.player.maxHp) * 50) + 5; gs.dealDamage(d); }
    },
    reverberation: {
      id: 'reverberation', name: '반향', icon: '🔊', cost: 2, type: 'ATTACK', desc: 'Chain × 8 피해', rarity: 'uncommon',
      effect(gs) { gs.dealDamage((gs.player.echoChain || 1) * 8); }
    },
    sanctuary: {
      id: 'sanctuary', name: '성역', icon: '🏛️', cost: 3, type: 'SKILL', desc: '방어막 20 + 2턴 면역', rarity: 'rare',
      image: 'card_sanctuary.png',
      effect(gs) { gs.addShield(20); gs.addBuff('immune', 2, {}); gs.addLog('🏛️ 성역! 2턴 면역', 'echo'); }
    },
    dark_pact: {
      id: 'dark_pact', name: '어둠의 계약', icon: '📜', cost: 1, type: 'SKILL', desc: 'HP -10, 카드 3장 드로우', rarity: 'uncommon',
      effect(gs) { gs.player.hp = Math.max(1, gs.player.hp - 10); gs.drawCards(3); updateUI(); }
    },
    // ── 에너지 관련 카드 ──
    surge: {
      id: 'surge', name: '서지', icon: '⚡', cost: 0, type: 'SKILL', desc: '에너지 +2 (이번 턴)', rarity: 'uncommon',
      effect(gs) { gs.player.energy = Math.min(gs.player.maxEnergy + 2, gs.player.energy + 2); gs.addLog('⚡ 서지: 에너지 +2!', 'echo'); updateUI(); }
    },
    surge_plus: {
      id: 'surge_plus', name: '서지+', icon: '⚡', cost: 0, type: 'SKILL', desc: '에너지 +3, 1장 드로우', rarity: 'uncommon', upgraded: true,
      effect(gs) { gs.player.energy = Math.min(gs.player.maxEnergy + 3, gs.player.energy + 3); gs.drawCards(1); gs.addLog('⚡ 서지+: 에너지 +3!', 'echo'); updateUI(); }
    },
    overcharge: {
      id: 'overcharge', name: '과충전', icon: '🔋', cost: 2, type: 'SKILL', desc: '에너지 +4, HP -6, Echo +30', rarity: 'rare',
      effect(gs) { gs.player.energy = Math.min(gs.player.maxEnergy + 4, gs.player.energy + 4); gs.player.hp = Math.max(1, gs.player.hp - 6); gs.addEcho(30); gs.addLog('🔋 과충전! 에너지 +4', 'echo'); updateUI(); }
    },
    void_tap: {
      id: 'void_tap', name: '허공 탭', icon: '🌀', cost: 1, type: 'SKILL', desc: '에너지 소진 후 피해 (소진 에너지 × 6)', rarity: 'rare',
      effect(gs) { const spent = gs.player.maxEnergy - gs.player.energy; const dmg = (spent + 1) * 6; gs.dealDamage(dmg); gs.addLog(`🌀 허공 탭: ${dmg} 피해!`, 'echo'); }
    },
    energy_siphon: {
      id: 'energy_siphon', name: '에너지 사이펀', icon: '🔵', cost: 0, type: 'ATTACK', desc: '에너지 1 소비 → 피해 12, 에너지 회복 없음', rarity: 'uncommon', exhaust: true,
      effect(gs) { if (gs.player.energy > 0) { gs.player.energy--; gs.dealDamage(12); gs.addLog('🔵 에너지 사이펀: 에너지 1 → 12 피해', 'echo'); } else { gs.addLog('🔵 에너지 사이펀: 에너지 없음!', 'damage'); } updateUI(); }
    },
    // ── 새 카드: 화염 / 전략 계열 ──
    flame_slash: {
      id: 'flame_slash', name: '화염 검격', icon: '🔥', cost: 1, type: 'ATTACK', desc: '7 피해 + 화염 2턴', rarity: 'uncommon',
      effect(gs) { gs.dealDamage(7); gs.applyEnemyStatus('burning', 2); gs.addLog('🔥 화염 검격!', 'echo'); }
    },
    ember_wave: {
      id: 'ember_wave', name: '불꽃 파동', icon: '🌊', cost: 2, type: 'ATTACK', desc: '전체 5 피해 + 화염 1턴', rarity: 'uncommon',
      effect(gs) { gs.dealDamageAll(5); gs.combat.enemies.forEach((_, i) => { if (gs.combat.enemies[i].hp > 0) gs.applyEnemyStatus('burning', 1, i); }); gs.addLog('🌊 불꽃 파동!', 'echo'); }
    },
    echo_reflect: {
      id: 'echo_reflect', name: '잔향 반향', icon: '🔊', cost: 1, type: 'SKILL', desc: '방어막 8 + 이번 턴 피해 받으면 반사', rarity: 'rare',
      effect(gs) { gs.addShield(8); gs.addBuff('mirror', 1, { reflect: true }); gs.addLog('🔊 잔향 반향! 반사 준비', 'echo'); }
    },
    chain_reaction: {
      id: 'chain_reaction', name: '연쇄 반응', icon: '⛓️', cost: 2, type: 'ATTACK', desc: '체인 × 5 피해, 체인 리셋 안 됨', rarity: 'rare',
      effect(gs) { const chain = Math.max(1, gs.player.echoChain); gs.dealDamage(chain * 5, null, true); gs.addLog(`⛓️ 연쇄 반응: 체인 ${chain} × 5 = ${chain * 5}!`, 'echo'); }
    },
    revival_echo: {
      id: 'revival_echo', name: '소생 잔향', icon: '💠', cost: 3, type: 'SKILL', desc: 'HP 15 회복 + 무덤에서 카드 2장 회수', rarity: 'rare', exhaust: true,
      effect(gs) { gs.heal(15); const rev = []; for (let i = 0; i < 2 && gs.player.graveyard.length > 0; i++) { const c = gs.player.graveyard.pop(); gs.player.hand.push(c); rev.push(DATA.cards[c]?.name || c); } gs.addLog(`💠 소생 잔향: ${rev.join(', ')} 회수!`, 'echo'); renderCombatCards(); }
    },

    // ── 에너지 할인 카드 (처분 모드 대체 컨셉) ──
    // 카드를 버리는 대신, 이번 턴 모든 카드 비용을 줄여 다양한 콤보를 유도
    echo_tide: {
      id: 'echo_tide', name: '잔향의 조류', icon: '🌀', cost: 0, type: 'SKILL', desc: '전체 카드 비용 -1, Echo +10', rarity: 'uncommon',
      effect(gs) { gs.player.costDiscount = (gs.player.costDiscount || 0) + 1; gs.addEcho(10); gs.addLog('🌀 잔향의 조류: 이번 턴 전 카드 비용 -1!', 'echo'); renderCombatCards(); updateUI(); }
    },
    void_surge: {
      id: 'void_surge', name: '허공 급류', icon: '⚡', cost: 1, type: 'SKILL', desc: '이번 턴 모든 카드 비용 -2 (최소 0)', rarity: 'rare',
      effect(gs) { gs.player.costDiscount = (gs.player.costDiscount || 0) + 2; gs.addLog('⚡ 허공 급류: 이번 턴 전 카드 비용 -2!', 'echo'); renderCombatCards(); updateUI(); }
    },
    resonance_flow: {
      id: 'resonance_flow', name: '공명 흐름', icon: '🎵', cost: 0, type: 'SKILL', desc: '손패 카드 수만큼 Echo 충전 (장당 +8)', rarity: 'uncommon',
      effect(gs) { const n = gs.player.hand.length; gs.addEcho(n * 8); gs.addLog(`🎵 공명 흐름: 손패 ${n}장 → Echo +${n * 8}!`, 'echo'); }
    },
    echo_cascade: {
      id: 'echo_cascade', name: '잔향 폭포', icon: '💧', cost: 2, type: 'SKILL', desc: '2장 드로우, 드로우한 카드 비용 0', rarity: 'rare',
      effect(gs) { const before = gs.player.hand.length; gs.drawCards(2); const newCards = gs.player.hand.slice(before); gs.player._cascadeCards = new Set(newCards); gs.player.costDiscount = (gs.player.costDiscount || 0) + 0; newCards.forEach(c => {/* mark for free */ }); gs.player.zeroCost = false; gs.addLog('💧 잔향 폭포: 카드 2장 드로우, 새 카드 무료!', 'echo'); gs.player.hand.slice(before).forEach(() => { }); renderCombatCards(); }
    },
    tempo_strike: {
      id: 'tempo_strike', name: '박자 강타', icon: '🥁', cost: 1, type: 'ATTACK', desc: '10 피해, 다음 카드 비용 -1', rarity: 'common',
      effect(gs) { gs.dealDamage(10); gs.player.costDiscount = (gs.player.costDiscount || 0) + 1; gs.addLog('🥁 박자 강타: 다음 카드 비용 -1!', 'echo'); renderCombatCards(); }
    },
    echo_lull: {
      id: 'echo_lull', name: '잔향의 고요', icon: '🌙', cost: 0, type: 'SKILL', desc: '에너지 -1, 손패 전체 비용 -2 이번 턴', rarity: 'uncommon',
      effect(gs) { gs.player.energy = Math.max(0, gs.player.energy - 1); gs.player.costDiscount = (gs.player.costDiscount || 0) + 2; gs.addLog('🌙 잔향의 고요: 에너지 -1, 모든 카드 비용 -2!', 'echo'); renderCombatCards(); updateUI(); }
    },
  },

  items: {
    // ══════════════ COMMON (회색) ══════════════
    void_compass: {
      id: 'void_compass', name: '허공 나침반', icon: '🧭', rarity: 'common',
      desc: '전투 시작 시 카드 1장 추가 드로우',
      image: 'relic_void_compass.png',
      passive(gs, trigger) { if (trigger === Trigger.COMBAT_START) { gs.drawCards(1); gs.addLog('🧭 허공 나침반: 드로우 +1', 'echo'); } }
    },
    void_shard: {
      id: 'void_shard', name: '허공 파편', icon: '🔷', rarity: 'common',
      desc: '전투 종료 시 Echo +20',
      image: 'relic_void_shard.png',
      passive(gs, trigger) { if (trigger === Trigger.COMBAT_END) { gs.addEcho(20); gs.addLog('🔷 허공 파편: Echo +20', 'echo'); } }
    },
    cracked_amulet: {
      id: 'cracked_amulet', name: '균열 부적', icon: '📿', rarity: 'common',
      desc: '턴 시작 시 HP 2 회복',
      passive(gs, trigger) { if (trigger === Trigger.TURN_START) { gs.heal(2); gs.addLog('📿 균열 부적: HP +2', 'heal'); } }
    },
    worn_pouch: {
      id: 'worn_pouch', name: '낡은 주머니', icon: '👜', rarity: 'common',
      desc: '전투 시작 시 골드 +5',
      passive(gs, trigger) { if (trigger === Trigger.COMBAT_START) { gs.addGold(5); gs.addLog('👜 낡은 주머니: 골드 +5', 'echo'); } }
    },
    dull_blade: {
      id: 'dull_blade', name: '무딘 검', icon: '🔪', rarity: 'common',
      desc: '카드 사용 시 10% 확률로 Echo +10',
      passive(gs, trigger) { if (trigger === Trigger.CARD_PLAY && Math.random() < 0.1) { gs.addEcho(10); gs.addLog('🔪 무딘 검: 행운의 Echo +10', 'echo'); } }
    },
    travelers_map: {
      id: 'travelers_map', name: '여행자 지도', icon: '🗺️', rarity: 'common',
      desc: '층 이동 시 HP 3 회복',
      image: 'relic_travelers_map.png',
      passive(gs, trigger) { if (trigger === Trigger.FLOOR_START) { gs.heal(3); } }
    },
    // ══════════════ UNCOMMON (파랑) ══════════════
    blood_gem: {
      id: 'blood_gem', name: '혈정', icon: '🔴', rarity: 'uncommon',
      desc: '피해 받을 때 Echo +15',
      image: 'relic_blood_gem.png',
      passive(gs, trigger, data) { if (trigger === Trigger.DAMAGE_TAKEN && data > 0) { gs.addEcho(15); gs.addLog('🔴 혈정: Echo +15', 'echo'); } }
    },
    phantom_cloak: {
      id: 'phantom_cloak', name: '환영 망토', icon: '🧥', rarity: 'uncommon',
      desc: '턴 시작 시 방어막 +4',
      image: 'relic_phantom_cloak.png',
      passive(gs, trigger) { if (trigger === Trigger.TURN_START) { gs.addShield(4); gs.addLog('🧥 환영 망토: 방어막 +4', 'system'); } }
    },
    cursed_tome: {
      id: 'cursed_tome', name: '저주받은 서', icon: '📕', rarity: 'uncommon',
      desc: '카드 사용 시 Echo +5, HP -2',
      image: 'relic_cursed_tome.png',
      passive(gs, trigger) { if (trigger === Trigger.CARD_PLAY) { gs.addEcho(5); gs.player.hp = Math.max(1, gs.player.hp - 2); updateUI(); } }
    },
    ancient_rune: {
      id: 'ancient_rune', name: '고대 룬석', icon: '🗿', rarity: 'uncommon',
      desc: '보스전 시작 시 최대 HP +20%',
      image: 'relic_ancient_rune.png',
      passive(gs, trigger) { if (trigger === Trigger.BOSS_START) { gs.player.maxHp = Math.floor(gs.player.maxHp * 1.2); gs.player.hp = Math.min(gs.player.hp + 20, gs.player.maxHp); gs.addLog('🗿 고대 룬석: 능력치 강화!', 'echo'); updateUI(); } }
    },
    echo_chain_ring: {
      id: 'echo_chain_ring', name: '연쇄 반지', icon: '🔗', rarity: 'uncommon',
      desc: 'Chain 2 이상이면 공격 피해 +5',
      passive(gs, trigger, data) { if (trigger === Trigger.DEAL_DAMAGE && gs.player.echoChain >= 2) return (data || 0) + 5; }
    },
    bone_charm: {
      id: 'bone_charm', name: '뼈 부적', icon: '🦴', rarity: 'uncommon',
      desc: '적 처치 시 HP 5 회복',
      passive(gs, trigger) { if (trigger === Trigger.ENEMY_KILL) { gs.heal(5); gs.addLog('🦴 뼈 부적: HP +5', 'heal'); } }
    },
    poison_vial: {
      id: 'poison_vial', name: '독 약병', icon: '🧪', rarity: 'uncommon',
      desc: '전투 시작 시 모든 적에게 독 2스택',
      passive(gs, trigger) { if (trigger === Trigger.COMBAT_START) { gs.combat.enemies.forEach((_, i) => gs.applyEnemyStatus('poisoned', 2, i)); gs.addLog('🧪 독 약병: 전체 독 부여!', 'echo'); } }
    },
    shadow_mask: {
      id: 'shadow_mask', name: '그림자 가면', icon: '🎭', rarity: 'uncommon',
      desc: '카드 3장 연속 사용 시 방어막 +8',
      image: 'relic_shadow_mask.png',
      passive(gs, trigger) { if (trigger === Trigger.CARD_PLAY) { gs._maskCount = (gs._maskCount || 0) + 1; if (gs._maskCount >= 3) { gs.addShield(8); gs._maskCount = 0; gs.addLog('🎭 그림자 가면: 방어막 +8', 'echo'); } } }
    },
    // ══════════════ RARE (금색) ══════════════
    resonance_stone: {
      id: 'resonance_stone', name: '공명석', icon: '💎', rarity: 'rare',
      desc: 'Echo Chain 3+ 시 카드 소각 방지',
      passive(gs, trigger) { if (trigger === Trigger.CARD_DISCARD && gs.player.echoChain >= 3) gs.addLog('💎 공명석: 카드 보호!', 'echo'); }
    },
    silence_ring: {
      id: 'silence_ring', name: '침묵의 반지', icon: '💍', rarity: 'rare',
      desc: '체력 30% 미만 시 카드 비용 0',
      passive(gs, trigger) { if (trigger === Trigger.TURN_START) { const low = gs.player.hp < gs.player.maxHp * CONSTANTS.PLAYER.LOW_HP_RATIO; gs.player.zeroCost = low; if (low) gs.addLog('💍 침묵의 반지: 비용 0!', 'echo'); } }
    },
    echo_amplifier: {
      id: 'echo_amplifier', name: 'Echo 증폭기', icon: '📡', rarity: 'rare',
      desc: 'Echo Chain 피해 +30%',
      passive(gs, trigger, data) { if (trigger === Trigger.CHAIN_DMG) return Math.floor(data * 1.3); }
    },
    temporal_lens: {
      id: 'temporal_lens', name: '시간의 렌즈', icon: '🔍', rarity: 'rare',
      desc: '매 3턴마다 카드 1장 무료',
      passive(gs, trigger) {
        if (trigger === Trigger.TURN_START) {
          gs._temporalTurn = (gs._temporalTurn || 0) + 1;
          if (gs._temporalTurn % 3 === 0) {
            gs.player._freeCardUses = (gs.player._freeCardUses || 0) + 1;
            gs.addLog('🔍 시간의 렌즈: 무료 카드 1회!', 'echo');
          }
        }
      }
    },
    echo_mirror: {
      id: 'echo_mirror', name: '잔향 거울', icon: '🪞', rarity: 'rare',
      desc: 'Resonance Burst 시 피해 2배',
      passive(gs, trigger, data) { if (trigger === Trigger.RESONANCE_BURST) return Math.floor((data || 0) * 2); }
    },
    void_crystal: {
      id: 'void_crystal', name: '허공 수정', icon: '💠', rarity: 'rare',
      desc: '피해 받을 때 15% 확률로 완전 무효',
      passive(gs, trigger, data) { if (trigger === Trigger.DAMAGE_TAKEN && data > 0 && Math.random() < 0.15) { gs.addLog('💠 허공 수정: 피해 무효!', 'echo'); return true; } }
    },
    bloodsoaked_robe: {
      id: 'bloodsoaked_robe', name: '피 묻은 로브', icon: '🩸', rarity: 'rare',
      desc: 'HP 50% 미만 시 모든 피해 +30%',
      passive(gs, trigger, data) {
        if (trigger === Trigger.DEAL_DAMAGE && gs.player.hp < gs.player.maxHp * CONSTANTS.PLAYER.MID_HP_RATIO) {
          return Math.floor((data || 0) * 1.3);
        }
      }
    },
    echo_gauntlet: {
      id: 'echo_gauntlet', name: '잔향 건틀릿', icon: '🥊', rarity: 'rare',
      desc: 'Chain 5 달성 시 즉시 적 기절 1턴',
      passive(gs, trigger) {
        if (trigger === Trigger.CARD_PLAY && gs.player.echoChain >= CONSTANTS.COMBAT.CHAIN_BURST_THRESHOLD) {
          const aliveIdx = gs.combat.enemies.findIndex(e => e.hp > 0);
          if (aliveIdx >= 0) {
            gs.applyEnemyStatus('stunned', 1, aliveIdx);
            gs.addLog('🥊 잔향 건틀릿: 기절!', 'echo');
            gs.player.echoChain = 0;
          }
        }
      }
    },
    war_drum: {
      id: 'war_drum', name: '전쟁 북', icon: '🥁', rarity: 'rare',
      desc: '전투 시작 시 에너지 +1 (해당 전투만)',
      passive(gs, trigger) {
        if (trigger === Trigger.COMBAT_START) {
          gs.player.energy += 1;
          gs.player.maxEnergy += 1;
          gs._warDrumActive = true;
          gs.addLog('🥁 전쟁 북: 에너지 +1!', 'echo');
          updateUI();
        }
        if (trigger === Trigger.COMBAT_END && gs._warDrumActive) {
          gs.player.maxEnergy = Math.max(1, gs.player.maxEnergy - 1);
          gs._warDrumActive = false;
        }
      }
    },
    // ── 에너지 증감 유물 ──
    energy_core: {
      id: 'energy_core', name: '에너지 핵', icon: '⚡', rarity: 'uncommon',
      desc: '매 전투 영구적으로 최대 에너지 +1 (최대 5)',
      passive(gs, trigger) {
        if (trigger === Trigger.COMBAT_START && !gs._energyCoreUsed) {
          if (gs.player.maxEnergy < CONSTANTS.PLAYER.MAX_ENERGY_CAP) {
            gs.player.maxEnergy++;
            gs.player.energy = gs.player.maxEnergy;
            gs._energyCoreUsed = true;
            gs.addLog('⚡ 에너지 핵: 최대 에너지 +1!', 'echo');
            updateUI();
          }
        }
      }
    },
    echo_battery: {
      id: 'echo_battery', name: '잔향 전지', icon: '🔋', rarity: 'common',
      desc: '카드를 버릴 때 에너지 +1 (턴당 1회)',
      passive(gs, trigger) {
        if (trigger === Trigger.CARD_DISCARD && !gs._batteryUsedTurn) { gs.player.energy = Math.min(gs.player.maxEnergy, gs.player.energy + 1); gs._batteryUsedTurn = true; gs.addLog('🔋 잔향 전지: 에너지 +1!', 'echo'); updateUI(); }
        if (trigger === Trigger.TURN_START) gs._batteryUsedTurn = false;
      }
    },
    cursed_capacitor: {
      id: 'cursed_capacitor', name: '저주받은 축전기', icon: '🌩️', rarity: 'uncommon',
      desc: '턴 시작 에너지 +2, 하지만 HP -4',
      passive(gs, trigger) { if (trigger === Trigger.TURN_START) { gs.player.energy = Math.min(gs.player.maxEnergy + 2, gs.player.energy + 2); gs.player.hp = Math.max(1, gs.player.hp - 4); gs.addLog('🌩️ 저주받은 축전기: 에너지 +2 / HP -4', 'echo'); updateUI(); } }
    },
    void_battery: {
      id: 'void_battery', name: '허공 전지', icon: '🔌', rarity: 'rare',
      desc: 'Echo 50 이상 시 매 턴 에너지 +1 추가',
      passive(gs, trigger) { if (trigger === Trigger.TURN_START && gs.player.echo >= 50) { gs.player.energy = Math.min(gs.player.maxEnergy + 1, gs.player.energy + 1); gs.addLog('🔌 허공 전지: Echo 충전 에너지 +1!', 'echo'); updateUI(); } }
    },
    surge_crystal: {
      id: 'surge_crystal', name: '서지 수정', icon: '💫', rarity: 'legendary',
      desc: '에너지 초과 사용 없음 + 최대 에너지 +1 영구',
      passive(gs, trigger) { if (trigger === Trigger.COMBAT_START && !gs._surgeGranted) { gs.player.maxEnergy++; gs.player.energy = gs.player.maxEnergy; gs._surgeGranted = true; gs.addLog('💫 서지 수정: 최대 에너지 +1 영구!', 'echo'); updateUI(); } }
    },
    // ══════════════ SET ITEMS — 조각 세트 (2/3개 효과) ══════════════
    // [세트 A] 심연의 삼위일체 — void_eye + void_fang + void_crown
    void_eye: {
      id: 'void_eye', name: '허공의 눈', icon: '🌑', rarity: 'uncommon',
      desc: '적 공격 후 15% 확률로 약화 부여 [세트:심연]',
      image: 'relic_void_eye.png',
      passive(gs, trigger) { if (trigger === Trigger.CARD_PLAY && Math.random() < 0.15) { const idx = gs.combat.enemies.findIndex(e => e.hp > 0); if (idx >= 0) { gs.applyEnemyStatus('weakened', 1, idx); gs.addLog('🌑 허공의 눈: 약화!', 'echo'); } } }
    },
    void_fang: {
      id: 'void_fang', name: '허공의 송곳니', icon: '🦷', rarity: 'uncommon',
      desc: '공격 카드 사용 시 Echo +8 [세트:심연]',
      passive(gs, trigger, data) { if (trigger === Trigger.CARD_PLAY && data && DATA.cards[data.cardId]?.type === 'ATTACK') { gs.addEcho(8); gs.addLog('🦷 허공의 송곳니: Echo +8', 'echo'); } }
    },
    void_crown: {
      id: 'void_crown', name: '허공의 왕관', icon: '👁️', rarity: 'rare',
      desc: '체력 40% 이하일 때 카드 비용 -1 [세트:심연]',
      passive(gs, trigger) { if (trigger === Trigger.TURN_START) { const low = gs.player.hp < gs.player.maxHp * CONSTANTS.PLAYER.HIGH_HP_RATIO; if (low && !gs._crownActive) { gs.player.costDiscount = (gs.player.costDiscount || 0) + 1; gs._crownActive = true; gs.addLog('👁️ 허공의 왕관: 비용 -1!', 'echo'); } else if (!low && gs._crownActive) { gs.player.costDiscount = Math.max(0, (gs.player.costDiscount || 0) - 1); gs._crownActive = false; } } }
    },
    // [세트 B] 잔향의 삼각 — echo_pendant + echo_bracer + echo_sigil
    echo_pendant: {
      id: 'echo_pendant', name: '잔향 펜던트', icon: '💜', rarity: 'uncommon',
      desc: '턴 시작 시 Echo +12 [세트:잔향]',
      passive(gs, trigger) { if (trigger === Trigger.TURN_START) { gs.addEcho(12); gs.addLog('💜 잔향 펜던트: Echo +12', 'echo'); } }
    },
    echo_bracer: {
      id: 'echo_bracer', name: '잔향 팔찌', icon: '🔮', rarity: 'uncommon',
      desc: 'Echo 사용(스킬 발동) 시 HP +4 [세트:잔향]',
      passive(gs, trigger) { if (trigger === Trigger.ECHO_SKILL) { gs.heal(4); gs.addLog('🔮 잔향 팔찌: HP +4', 'heal'); } }
    },
    echo_sigil: {
      id: 'echo_sigil', name: '잔향 각인', icon: '⚜️', rarity: 'rare',
      desc: 'Resonance Burst 시 에너지 +2 [세트:잔향]',
      passive(gs, trigger) { if (trigger === Trigger.RESONANCE_BURST) { gs.player.energy = Math.min(gs.player.maxEnergy + 2, gs.player.energy + 2); updateUI(); gs.addLog('⚜️ 잔향 각인: 에너지 +2!', 'echo'); } }
    },
    // [세트 C] 혈맹의 인장 — blood_seal + blood_oath + blood_crown
    blood_seal: {
      id: 'blood_seal', name: '혈인', icon: '🩸', rarity: 'common',
      desc: '피해 받을 때 방어막 +3 [세트:혈맹]',
      passive(gs, trigger, data) { if (trigger === Trigger.DAMAGE_TAKEN && data > 0) { gs.addShield(3); gs.addLog('🩸 혈인: 방어막 +3', 'system'); } }
    },
    blood_oath: {
      id: 'blood_oath', name: '혈서', icon: '📜', rarity: 'uncommon',
      desc: 'HP 50 이하일 때 공격 +6 [세트:혈맹]',
      passive(gs, trigger, data) { if (trigger === Trigger.DEAL_DAMAGE && gs.player.hp <= 50) return (data || 0) + 6; }
    },
    blood_crown: {
      id: 'blood_crown', name: '혈관', icon: '💉', rarity: 'rare',
      desc: '적 처치 시 HP 8 & Echo 20 회복 [세트:혈맹]',
      passive(gs, trigger) { if (trigger === Trigger.ENEMY_KILL) { gs.heal(8); gs.addEcho(20); gs.addLog('💉 혈관: HP+8 Echo+20', 'heal'); } }
    },

    // ══════════════ LEGENDARY (보라/무지개) ══════════════
    echo_heart: {
      id: 'echo_heart', name: '잔향의 심장', icon: '❤️‍🔥', rarity: 'legendary',
      desc: '사망 시 1회 부활 (HP 50% 복구)',
      image: 'relic_echo_heart.png',
      passive(gs, trigger) { if (trigger === Trigger.PRE_DEATH && !gs._heartUsed) { gs._heartUsed = true; gs.player.hp = Math.floor(gs.player.maxHp * CONSTANTS.PLAYER.MID_HP_RATIO); gs.addLog('❤️‍🔥 잔향의 심장: 부활!', 'heal'); return true; } }
    },
    void_throne: {
      id: 'void_throne', name: '허공의 왕좌', icon: '👑', rarity: 'legendary',
      desc: '매 5번째 카드 사용 시 전체 적 15 피해',
      passive(gs, trigger) { if (trigger === Trigger.CARD_PLAY) { gs._throneCount = (gs._throneCount || 0) + 1; if (gs._throneCount % 5 === 0) { gs.dealDamageAll(15); gs.addLog('👑 허공의 왕좌: 전체 15 피해!', 'echo'); } } }
    },
    echo_genesis: {
      id: 'echo_genesis', name: '잔향의 기원', icon: '🌟', rarity: 'legendary',
      desc: 'Echo 100 달성 시 모든 핸드 카드 무료화',
      passive(gs, trigger) { if (trigger === Trigger.TURN_START && gs.player.echo >= CONSTANTS.ECHO.BURST_THRESHOLD && !gs._genesisUsed) { gs.player._freeCardUses = Math.max(gs.player._freeCardUses || 0, gs.player.hand.length); gs._genesisUsed = true; gs.addLog('🌟 잔향의 기원: 현재 손패 무료!', 'echo'); } if (trigger === Trigger.COMBAT_END) gs._genesisUsed = false; }
    },
    abyss_codex: {
      id: 'abyss_codex', name: '심연의 비전서', icon: '📖', rarity: 'legendary',
      desc: '전투 시작 시 덱에서 랜덤 희귀 카드 1장 드로우',
      image: 'relic_abyss_codex.png',
      passive(gs, trigger) { if (trigger === Trigger.COMBAT_START) { const rares = gs.player.deck.filter(id => DATA.cards[id]?.rarity === 'rare'); if (rares.length > 0) { const c = rares[Math.floor(Math.random() * rares.length)]; const idx = gs.player.deck.indexOf(c); gs.player.deck.splice(idx, 1); gs.player.hand.push(c); gs.addLog(`📖 심연의 비전서: ${DATA.cards[c]?.name} 드로우!`, 'echo'); } } }
    },
  },

  enemies: {
    // 잔향의 숲
    shadow_wolf: {
      id: 'shadow_wolf', name: '그림자 늑대', icon: '🐺', image: 'enemy_shadow_wolf.png', hp: 35, maxHp: 35, atk: 8, region: 0, xp: 20, gold: 8,
      ai(turn) {
        if (turn % 3 === 0) return { type: 'howl', intent: '포효 (공격 강화)', dmg: 0, effect: 'self_atk_up' };
        if (turn % 2 === 0) return { type: 'dodge', intent: '회피 준비', dmg: 0, effect: 'dodge' };
        return { type: 'bite', intent: `물기 ${this.atk}`, dmg: this.atk };
      }
    },
    forest_wraith: {
      id: 'forest_wraith', name: '숲의 원령', icon: '👻', image: 'enemy_forest_wraith.png', hp: 28, maxHp: 28, atk: 10, region: 0, xp: 25, gold: 10,
      ai(turn) {
        if (turn % 4 === 0) return { type: 'curse', intent: '저주 (약화)', dmg: 6, effect: 'weaken' };
        if (turn % 3 === 0) return { type: 'phase', intent: '위상 이동', dmg: 0, effect: 'dodge' };
        return { type: 'drain', intent: `생명력 흡수 ${this.atk}`, dmg: this.atk, effect: 'lifesteal' };
      }
    },
    fallen_knight: {
      id: 'fallen_knight', name: '타락한 기사', icon: '⚔️', image: 'enemy_fallen_knight.png', hp: 55, maxHp: 55, atk: 12, region: 0, xp: 35, gold: 15,
      ai(turn) {
        if (turn % 3 === 0) return { type: 'guard', intent: '방패 방어 (방어막 8)', dmg: 0, effect: 'self_shield' };
        if (turn % 5 === 0) return { type: 'charge', intent: `돌진 ${this.atk + 8}`, dmg: this.atk + 8 };
        return { type: 'slash', intent: `베기 ${this.atk}`, dmg: this.atk };
      }
    },
    // 침묵의 도시
    silent_sentinel: {
      id: 'silent_sentinel', name: '침묵 파수꾼', icon: '🗿', image: 'enemy_silent_sentinel.png', hp: 60, maxHp: 60, atk: 14, region: 1, xp: 40, gold: 18,
      ai(turn) {
        if (turn % 2 === 0) return { type: 'silence', intent: '침묵 강요 (+3소음)', dmg: 5, effect: 'add_noise' };
        return { type: 'strike', intent: `철권 ${this.atk}`, dmg: this.atk };
      }
    },
    // 기억의 미궁
    memory_specter: {
      id: 'memory_specter', name: '기억의 환령', icon: '👁️', image: 'enemy_specter.png', hp: 45, maxHp: 45, atk: 12, region: 2, xp: 35, gold: 14,
      ai(turn) {
        if (turn % 5 === 0) return { type: 'memory_steal', intent: '기억 훔치기 (카드 소각)', dmg: 0, effect: 'exhaust_card' };
        if (turn % 4 === 0) return { type: 'energy_drain', intent: `에너지 흡수 (에너지 -1) ${this.atk}`, dmg: this.atk, effect: 'drain_energy' };
        if (turn % 3 === 0) return { type: 'phase', intent: '위상 이동', dmg: 0, effect: 'dodge' };
        return { type: 'claw', intent: `정신 공격 ${this.atk}`, dmg: this.atk, effect: 'confusion' };
      }
    },
    nightmare_hound: {
      id: 'nightmare_hound', name: '악몽의 사냥개', icon: '🐕', image: 'enemy_nightmare_hound.png', hp: 38, maxHp: 38, atk: 11, region: 2, xp: 30, gold: 12,
      ai(turn) {
        if (turn % 4 === 0) return { type: 'howl', intent: '공포의 포효 (에너지-1)', dmg: 6, effect: 'drain_energy' };
        if (turn % 2 === 0) return { type: 'pounce', intent: `덮치기 ${this.atk + 4}`, dmg: this.atk + 4 };
        return { type: 'bite', intent: `물기 ${this.atk}`, dmg: this.atk };
      }
    },
    // 신의 무덤
    divine_remnant: {
      id: 'divine_remnant', name: '신의 잔재', icon: '⚡', image: 'enemy_divine_remnant.png', hp: 70, maxHp: 70, atk: 15, region: 3, xp: 50, gold: 22,
      ai(turn) {
        if (turn % 5 === 0) return { type: 'energy_smite', intent: `신성 심판 ${this.atk * 2} (에너지 -1)`, dmg: this.atk * 2, effect: 'drain_energy' };
        if (turn % 4 === 0) return { type: 'smite', intent: `신성 심판 ${this.atk * 2}`, dmg: this.atk * 2 };
        if (turn % 3 === 0) return { type: 'barrier', intent: '신성 방어막 15', dmg: 0, effect: 'self_shield_15' };
        return { type: 'strike', intent: `천벌 ${this.atk}`, dmg: this.atk };
      }
    },
    // 에코의 핵심
    echo_devourer: {
      id: 'echo_devourer', name: 'Echo 포식자', icon: '🌑', image: 'enemy_echo_devourer.png', hp: 80, maxHp: 80, atk: 18, region: 4, xp: 60, gold: 30,
      ai(turn) {
        if (turn % 3 === 0) return { type: 'devour', intent: `Echo 흡수 ${this.atk + 5}`, dmg: this.atk + 5, effect: 'drain_echo' };
        if (turn % 5 === 0) return { type: 'void_burst', intent: `허공 폭발 ${this.atk * 1.5 | 0}`, dmg: this.atk * 1.5 | 0 };
        return { type: 'claw', intent: `허공 발톱 ${this.atk}`, dmg: this.atk };
      }
    },
    // ── 잔향의 숲 추가 몬스터 ──
    moss_golem: {
      id: 'moss_golem', name: '이끼 골렘', icon: '🪨', image: 'enemy_moss_golem.png', hp: 50, maxHp: 50, atk: 9, region: 0, xp: 28, gold: 12,
      ai(turn) {
        if (turn % 4 === 0) return { type: 'harden', intent: '굳기 (방어막 12)', dmg: 0, effect: 'self_shield' };
        if (turn % 3 === 0) return { type: 'slam', intent: `대지 강타 ${this.atk + 5}`, dmg: this.atk + 5 };
        return { type: 'strike', intent: `주먹질 ${this.atk}`, dmg: this.atk };
      }
    },
    echo_bat: {
      id: 'echo_bat', name: '잔향 박쥐', icon: '🦇', image: 'enemy_echo_bat.png', hp: 20, maxHp: 20, atk: 7, region: 0, xp: 18, gold: 7,
      ai(turn) {
        if (turn % 3 === 0) return { type: 'screech', intent: '음파 공격 (약화)', dmg: 5, effect: 'weaken' };
        if (turn % 2 === 0) return { type: 'dive', intent: `급강하 ${this.atk + 3}`, dmg: this.atk + 3 };
        return { type: 'bite', intent: `물기 ${this.atk}`, dmg: this.atk };
      }
    },
    // ── 잔향의 숲 정예 ──
    elite_dire_wolf: {
      id: 'elite_dire_wolf', name: '【정예】대형 흑랑', icon: '🐺', image: 'enemy_elite_dire_wolf.png', hp: 85, maxHp: 85, atk: 14, region: 0, xp: 65, gold: 35, isElite: true,
      ai(turn) {
        if (turn === 1) return { type: 'pack_call', intent: '무리 소환 (공격력+4)', dmg: 0, effect: 'self_atk_up_4' };
        if (turn % 4 === 0) return { type: 'frenzy', intent: `광란 ${this.atk + 10}`, dmg: this.atk + 10 };
        if (turn % 2 === 0) return { type: 'howl', intent: '포효 (약화+출혈)', dmg: 6, effect: 'weaken' };
        return { type: 'maul', intent: `할퀴기 ${this.atk}`, dmg: this.atk };
      }
    },
    elite_ancient_tree: {
      id: 'elite_ancient_tree', name: '【정예】고목 수호자', icon: '🌳', image: 'enemy_elite_ancient_tree.png', hp: 110, maxHp: 110, atk: 11, region: 0, xp: 75, gold: 40, isElite: true,
      ai(turn) {
        if (turn % 5 === 0) return { type: 'spore', intent: '독 포자 (독3)', dmg: 8, effect: 'poison_3' };
        if (turn % 3 === 0) return { type: 'root', intent: '뿌리 속박 (에너지-1)', dmg: 10, effect: 'drain_energy' };
        if (turn % 4 === 0) return { type: 'regen', intent: '생명력 재생 (+15HP)', dmg: 0, effect: 'self_heal_15' };
        return { type: 'branch', intent: `나뭇가지 ${this.atk}`, dmg: this.atk };
      }
    },
    // ── 침묵의 도시 추가 몬스터 ──
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
    // ── 침묵의 도시 정예 ──
    elite_silence_herald: {
      id: 'elite_silence_herald', name: '【정예】침묵 사도', icon: '🗿', image: 'enemy_elite_silence_herald.png', hp: 95, maxHp: 95, atk: 16, region: 1, xp: 70, gold: 38, isElite: true,
      ai(turn) {
        if (turn === 1) return { type: 'seal', intent: '봉인 (카드 소각)', dmg: 0, effect: 'exhaust_card' };
        if (turn % 3 === 0) return { type: 'noise_crush', intent: `소음 격쇄 ${this.atk + 8} (+5소음)`, dmg: this.atk + 8, effect: 'add_noise_5' };
        if (turn % 2 === 0) return { type: 'strike', intent: `침묵의 검 ${this.atk + 4}`, dmg: this.atk + 4 };
        return { type: 'bash', intent: `강타 ${this.atk}`, dmg: this.atk };
      }
    },
    // ── 기억의 미궁 추가 몬스터 ──
    phantom_soldier: {
      id: 'phantom_soldier', name: '환영 병사', icon: '👤', image: 'enemy_phantom_soldier.png', hp: 40, maxHp: 40, atk: 11, region: 2, xp: 32, gold: 13,
      ai(turn) {
        if (turn % 4 === 0) return { type: 'clone', intent: '분열 (방어막10)', dmg: 0, effect: 'self_shield' };
        if (turn % 2 === 0) return { type: 'phase', intent: '위상 이동', dmg: 0, effect: 'dodge' };
        return { type: 'slash', intent: `환영 검 ${this.atk}`, dmg: this.atk };
      }
    },
    // ── 기억의 미궁 정예 ──
    elite_memory_lich: {
      id: 'elite_memory_lich', name: '【정예】기억 리치', icon: '💀', image: 'enemy_elite_memory_lich.png', hp: 100, maxHp: 100, atk: 15, region: 2, xp: 72, gold: 42, isElite: true,
      ai(turn) {
        if (turn === 1) return { type: 'memory_curse', intent: '기억 저주 (에너지-2)', dmg: 5, effect: 'drain_energy_2' };
        if (turn % 4 === 0) return { type: 'drain_cards', intent: '카드 흡수 (소각2)', dmg: 8, effect: 'exhaust_card' };
        if (turn % 3 === 0) return { type: 'mind_blast', intent: `정신 폭발 ${this.atk + 10}`, dmg: this.atk + 10 };
        return { type: 'strike', intent: `사령 강타 ${this.atk}`, dmg: this.atk };
      }
    },
    // ── 신의 무덤 추가 몬스터 ──
    cursed_paladin: {
      id: 'cursed_paladin', name: '저주받은 기사단', icon: '⚔️', image: 'enemy_cursed_paladin.png', hp: 75, maxHp: 75, atk: 14, region: 3, xp: 48, gold: 22,
      ai(turn) {
        if (turn % 4 === 0) return { type: 'holy_smite', intent: `성스러운 심판 ${this.atk * 2}`, dmg: this.atk * 2 };
        if (turn % 3 === 0) return { type: 'barrier', intent: '신성 방어막 12', dmg: 0, effect: 'self_shield' };
        return { type: 'slash', intent: `성검 ${this.atk}`, dmg: this.atk };
      }
    },
    // ── 신의 무덤 정예 ──
    elite_fallen_deity: {
      id: 'elite_fallen_deity', name: '【정예】타락신', icon: '👼', image: 'enemy_elite_fallen_deity.png', hp: 130, maxHp: 130, atk: 18, region: 3, xp: 90, gold: 55, isElite: true,
      ai(turn) {
        if (turn === 1) return { type: 'curse_all', intent: '전체 저주 (전 디버프)', dmg: 0, effect: 'mass_debuff' };
        if (turn % 3 === 0) return { type: 'divine_strike', intent: `신성 참격 ${this.atk + 12}`, dmg: this.atk + 12 };
        if (turn % 4 === 0) return { type: 'reckoning', intent: `심판 ${this.atk + 8} (약화)`, dmg: this.atk + 8, effect: 'weaken' };
        return { type: 'smite', intent: `천벌 ${this.atk}`, dmg: this.atk };
      }
    },
    // ── 에코의 핵심 추가 몬스터 ──
    void_remnant: {
      id: 'void_remnant', name: '허공의 잔재', icon: '🌌', image: 'enemy_void_remnant.png', hp: 55, maxHp: 55, atk: 16, region: 4, xp: 52, gold: 26,
      ai(turn) {
        if (turn % 3 === 0) return { type: 'void_drain', intent: `허공 흡수 ${this.atk + 4} (Echo드레인)`, dmg: this.atk + 4, effect: 'drain_echo' };
        if (turn % 4 === 0) return { type: 'collapse', intent: `붕괴 ${this.atk + 8}`, dmg: this.atk + 8 };
        return { type: 'claw', intent: `허공 발톱 ${this.atk}`, dmg: this.atk };
      }
    },
    // ── 에코의 핵심 정예 ──
    elite_echo_colossus: {
      id: 'elite_echo_colossus', name: '【정예】잔향 거신', icon: '🌟', image: 'enemy_elite_echo_colossus.png', hp: 160, maxHp: 160, atk: 20, region: 4, xp: 120, gold: 70, isElite: true,
      ai(turn) {
        if (turn === 1) return { type: 'echo_suppress', intent: 'Echo 억제 (Max Echo -20)', dmg: 0, effect: 'drain_echo' };
        if (turn % 3 === 0) return { type: 'colossal_slam', intent: `거신 강타 ${this.atk + 15}`, dmg: this.atk + 15 };
        if (turn % 4 === 0) return { type: 'void_aura', intent: '허공 오라 (에너지-1)', dmg: 10, effect: 'drain_energy' };
        return { type: 'strike', intent: `거신 격 ${this.atk}`, dmg: this.atk };
      }
    },
    // 보스들
    ancient_echo: {
      id: 'ancient_echo', name: '태고의 잔향', icon: '🌑', image: 'enemy_ancient_echo.png', hp: 180, maxHp: 180, atk: 16, region: 0, xp: 120, gold: 50, isBoss: true, phase: 1,
      ai(turn) {
        if (this.hp < this.maxHp * 0.5 && this.phase === 1) { this.phase = 2; AudioEngine.playBossPhase(); return { type: 'phase_shift', intent: '⚠️ 위상 전환!', dmg: 0, effect: 'phase_shift' }; }
        if (this.phase === 2) {
          if (turn % 3 === 0) return { type: 'void_burst', intent: `허공 폭발 ${this.atk + 10}`, dmg: this.atk + 10 };
          return { type: 'echo_drain', intent: `잔향 흡수 ${this.atk + 5}`, dmg: this.atk + 5, effect: 'drain_echo' };
        }
        if (turn % 4 === 0) return { type: 'resonance_curse', intent: '잔향 저주', dmg: 8, effect: 'curse' };
        return { type: 'echo_slash', intent: `잔향 참격 ${this.atk}`, dmg: this.atk };
      }
    },
    // 침묵의 도시 전용 보스 — 소음 게이지를 극도로 자극
    silent_tyrant: {
      id: 'silent_tyrant', name: '침묵의 폭군', icon: '🗣️', image: 'enemy_silent_tyrant.png', hp: 200, maxHp: 200, atk: 17, region: 1, xp: 130, gold: 55, isBoss: true, phase: 1,
      ai(turn) {
        if (this.hp < this.maxHp * 0.55 && this.phase === 1) { this.phase = 2; AudioEngine.playBossPhase(); return { type: 'phase2', intent: '⚠️ 절대 침묵!', dmg: 0, effect: 'phase_shift' }; }
        if (this.phase === 2) {
          if (turn % 2 === 0) return { type: 'noise_burst', intent: `소음 폭발 ${this.atk + 12} (+5소음)`, dmg: this.atk + 12, effect: 'add_noise_5' };
          return { type: 'silence_crush', intent: `침묵 격쇄 ${this.atk + 6}`, dmg: this.atk + 6, effect: 'add_noise' };
        }
        if (turn % 3 === 0) return { type: 'summon_noise', intent: '소음 파동 (+3소음)', dmg: 8, effect: 'add_noise' };
        return { type: 'strike', intent: `철권 ${this.atk}`, dmg: this.atk };
      }
    },
    // 신의 무덤 전용 보스 — 디버프 폭격
    divine_tyrant: {
      id: 'divine_tyrant', name: '신의 심판관', icon: '⚖️', image: 'enemy_divine_tyrant.png', hp: 240, maxHp: 240, atk: 19, region: 3, xp: 160, gold: 75, isBoss: true, phase: 1,
      ai(turn) {
        if (this.hp < this.maxHp * 0.6 && this.phase === 1) { this.phase = 2; AudioEngine.playBossPhase(); return { type: 'divine_wrath', intent: '⚠️ 신성 분노!', dmg: 0, effect: 'phase_shift' }; }
        if (this.hp < this.maxHp * 0.3 && this.phase === 2) { this.phase = 3; AudioEngine.playBossPhase(); return { type: 'final_judgement', intent: '⚠️ 최후의 심판!', dmg: 0, effect: 'phase_shift' }; }
        if (this.phase === 3) {
          if (turn % 2 === 0) return { type: 'mass_debuff', intent: `신성 심판 ${this.atk + 18} (전체 디버프)`, dmg: this.atk + 18, effect: 'mass_debuff' };
          return { type: 'holy_crush', intent: `성스러운 격쇄 ${this.atk + 10}`, dmg: this.atk + 10 };
        }
        if (this.phase === 2) {
          if (turn % 3 === 0) return { type: 'smite_all', intent: `천벌 ${this.atk + 8} (약화)`, dmg: this.atk + 8, effect: 'weaken' };
          return { type: 'barrier', intent: '신성 방어막 20', dmg: 0, effect: 'self_shield_20' };
        }
        if (turn % 4 === 0) return { type: 'curse', intent: `저주 (디버프) ${this.atk + 4}`, dmg: this.atk + 4, effect: 'curse' };
        return { type: 'smite', intent: `천벌 ${this.atk}`, dmg: this.atk };
      }
    },
    memory_sovereign: {
      id: 'memory_sovereign', name: '기억의 군주', icon: '👑', image: 'enemy_memory_sovereign.png', hp: 220, maxHp: 220, atk: 18, region: 2, xp: 150, gold: 70, isBoss: true, phase: 1,
      ai(turn) {
        if (this.hp < this.maxHp * 0.66 && this.phase === 1) { this.phase = 2; AudioEngine.playBossPhase(); return { type: 'phase2', intent: '⚠️ 기억의 각성!', dmg: 0, effect: 'phase_shift' }; }
        if (this.hp < this.maxHp * 0.33 && this.phase === 2) { this.phase = 3; AudioEngine.playBossPhase(); return { type: 'phase3', intent: '⚠️ 완전 각성!', dmg: 0, effect: 'phase_shift' }; }
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
    // 히든 보스 — worldMemory 조건부 (상인 구출 + 스토리 5개 이상)
    echo_origin: {
      id: 'echo_origin', name: '잔향의 근원', icon: '🌟', image: 'enemy_echo_origin.png', hp: 320, maxHp: 320, atk: 22, region: 4, xp: 300, gold: 150, isBoss: true, isHidden: true, phase: 1,
      ai(turn) {
        if (this.hp < this.maxHp * 0.7 && this.phase === 1) { this.phase = 2; AudioEngine.playBossPhase(); return { type: 'awaken', intent: '⚠️ 근원 각성!', dmg: 0, effect: 'phase_shift' }; }
        if (this.hp < this.maxHp * 0.4 && this.phase === 2) { this.phase = 3; AudioEngine.playBossPhase(); return { type: 'transcend', intent: '⚠️ 근원 초월!', dmg: 0, effect: 'phase_shift' }; }
        if (this.phase === 3) {
          if (turn % 2 === 0) return { type: 'origin_blast', intent: `근원 폭발 ${this.atk + 20}`, dmg: this.atk + 20 };
          return { type: 'echo_erase', intent: 'Echo 완전 소거', dmg: this.atk, effect: 'nullify_echo' };
        }
        if (this.phase === 2) {
          if (turn % 3 === 0) return { type: 'memory_wipe', intent: `기억 소거 ${this.atk + 10}`, dmg: this.atk + 10, effect: 'exhaust_card' };
          return { type: 'resonance', intent: `공명 ${this.atk + 6} (드레인)`, dmg: this.atk + 6, effect: 'drain_echo' };
        }
        if (turn % 4 === 0) return { type: 'loop_crush', intent: `루프 압박 ${this.atk + 8}`, dmg: this.atk + 8 };
        return { type: 'echo_strike', intent: `잔향 격 ${this.atk}`, dmg: this.atk };
      }
    },
    // 에코의 핵심 최종 보스
    void_herald: {
      id: 'void_herald', name: '허공의 사도', icon: '🌌', image: 'enemy_void_herald.png', hp: 280, maxHp: 280, atk: 20, region: 4, xp: 200, gold: 100, isBoss: true, phase: 1,
      ai(turn) {
        if (this.hp < this.maxHp * 0.5 && this.phase === 1) { this.phase = 2; AudioEngine.playBossPhase(); return { type: 'transcend', intent: '⚠️ 허공 초월!', dmg: 0, effect: 'phase_shift' }; }
        if (this.phase === 2) {
          if (turn % 2 === 0) return { type: 'void_collapse', intent: `허공 붕괴 ${this.atk + 12}`, dmg: this.atk + 12 };
          return { type: 'echo_nullify', intent: 'Echo 무효화', dmg: this.atk, effect: 'nullify_echo' };
        }
        if (turn % 3 === 0) return { type: 'void_pulse', intent: `허공 파동 ${this.atk + 6}`, dmg: this.atk + 6 };
        return { type: 'strike', intent: `허공 강타 ${this.atk}`, dmg: this.atk };
      }
    },
  },

  regions: [
    {
      id: 0, name: '잔향의 숲', rule: '기본 규칙', ruleDesc: '잔향의 힘이 깨어나는 곳', quote: '"기억은 언제나 숲으로 돌아온다."', floors: 4,
      enemies: ['shadow_wolf', 'forest_wraith', 'fallen_knight', 'moss_golem', 'echo_bat'],
      elites: ['elite_dire_wolf', 'elite_ancient_tree'],
      boss: ['ancient_echo']
    },
    {
      id: 1, name: '침묵의 도시', rule: '침묵의 저주', ruleDesc: '소음 게이지가 더 빨리 상승합니다.', quote: '"침묵은 가장 큰 비명이다."', floors: 4,
      enemies: ['silent_sentinel', 'noise_wraith', 'iron_automaton'],
      elites: ['elite_silence_herald'],
      boss: ['silent_tyrant']
    },
    {
      id: 2, name: '기억의 미궁', rule: '망각의 안개', ruleDesc: '매 턴 무작위 카드 1장이 소각됩니다.', quote: '"잊혀진 것들이 이곳에 모인다."', floors: 5,
      enemies: ['memory_specter', 'nightmare_hound', 'phantom_soldier'],
      elites: ['elite_memory_lich'],
      boss: ['memory_sovereign']
    },
    {
      id: 3, name: '신의 무덤', rule: '신성한 심판', ruleDesc: '에너지 회복량이 1 감소합니다.', quote: '"신들은 죽었으나 영광은 남았다."', floors: 5,
      enemies: ['divine_remnant', 'cursed_paladin'],
      elites: ['elite_fallen_deity'],
      boss: ['divine_tyrant']
    },
    {
      id: 4, name: '에코의 핵심', rule: '현실 붕괴', ruleDesc: '매 턴 최대 에코가 5씩 감소합니다.', quote: '"모든 시작이자 끝인 곳."', floors: 3,
      enemies: ['echo_devourer', 'void_remnant'],
      elites: ['elite_echo_colossus'],
      boss: ['void_herald', 'echo_origin']
    }
  ],

  startDecks: {
    swordsman: ['strike', 'strike', 'strike', 'defend', 'defend', 'quick_step', 'heavy_blow', 'momentum', 'charge', 'echo_strike'],
    mage: ['foresight', 'counter', 'echo_wave', 'resonance', 'defend', 'echo_strike', 'soul_rend', 'echo_shield', 'foresight', 'prediction'],
    hunter: ['silent_stab', 'silent_stab', 'silent_stab', 'vanish', 'defend', 'quick_step', 'echo_strike', 'twin_strike', 'silent_stab', 'vanish'],
  },

  events: [
    {
      id: 'wanderer', layer: 1, title: '방랑자의 흔적', eyebrow: 'LAYER 1 · 우발적 이벤트',
      desc: '낡은 여행 가방 하나가 나뭇가지에 걸려 있다.',
      choices: [
        { text: '🎒 가방을 열어본다', effect(gs) { gs.addGold(20); gs.addLog('골드 +20', 'heal'); return '오래된 동전들이 쏟아졌다.'; } },
        { text: '⚔️ 함정일지도 모른다 (무시)', effect(gs) { gs.addEcho(15); gs.addLog('Echo +15', 'echo'); return '조심성이 잔향을 강화했다.'; } },
      ]
    },
    {
      id: 'shrine', layer: 1, title: '잔향의 사당', eyebrow: 'LAYER 1 · 우발적 이벤트',
      desc: '고대 사당 앞에 잔향 에너지가 모여 있다.',
      choices: [
        { text: '❤️ 체력을 제물로 (HP -10 → Echo +50)', effect(gs) { gs.player.hp = Math.max(1, gs.player.hp - 10); gs.addEcho(50); return 'Echo 게이지가 타오른다.'; } },
        { text: '💰 골드를 제물로 (15골드 → HP +20)', effect(gs) { if (gs.player.gold >= 15) { gs.player.gold -= 15; gs.heal(20); return '신성한 치유의 빛이 감쌌다.'; } return '골드가 부족하다.'; } },
        { text: '🚶 통과한다', effect(gs) { return '사당을 지나쳤다.'; } },
      ]
    },
    {
      id: 'merchant_lost', layer: 2, title: '길 잃은 상인', eyebrow: 'LAYER 2 · 연속 이벤트',
      desc: '잔향 에너지에 길을 잃은 상인을 발견했다. 두려움에 떨고 있다.',
      choices: [
        { text: '🤝 상인을 도와준다', effect(gs) { gs.worldMemory.savedMerchant = (gs.worldMemory.savedMerchant || 0) + 1; gs.heal(15); gs.addLog('💚 상인이 치료약을 건넸다', 'heal'); return '상인은 감사하며 치료약을 건넸다.'; } },
        { text: '💰 상인의 물건을 빼앗는다', effect(gs) { gs.addGold(30); gs.worldMemory.stoleFromMerchant = true; gs.addLog('골드 +30 (약탈)', 'damage'); return '30골드를 얻었다. 상인의 눈에서 빛이 사라졌다.'; } },
      ]
    },
    {
      id: 'echo_resonance', layer: 1, title: '잔향 공명', eyebrow: 'LAYER 1 · 우발적 이벤트',
      desc: '공기 중에 강한 에코 에너지가 감지된다.',
      choices: [
        { text: '⚡ 에너지를 흡수한다', effect(gs) { gs.addEcho(60); return 'Echo 게이지가 요동쳤다!'; } },
        { text: '🃏 에너지를 카드로 변환', effect(gs) { const c = gs.getRandomCard('rare'); gs.player.deck.push(c); return `에너지가 카드로 응결: ${DATA.cards[c]?.name}`; } },
      ]
    },
    {
      id: 'forge', layer: 1, title: '잔향의 대장간', eyebrow: 'LAYER 1 · 우발적 이벤트',
      desc: '에코 에너지로 달구어진 대장간이 있다.',
      choices: [
        {
          text: '⚒️ 카드를 강화한다', effect(gs) {
            const upgradable = gs.player.deck.filter(id => DATA.upgradeMap[id]);
            if (!upgradable.length) return '강화 가능한 카드가 없다.';
            const cardId = upgradable[Math.floor(Math.random() * upgradable.length)];
            const upgId = DATA.upgradeMap[cardId];
            const idx = gs.player.deck.indexOf(cardId);
            if (idx >= 0) { gs.player.deck[idx] = upgId; gs.addLog(`✨ ${DATA.cards[cardId]?.name} → ${DATA.cards[upgId]?.name} 강화!`, 'echo'); }
            return `${DATA.cards[cardId]?.name}이(가) 강화되었다.`;
          }
        },
        { text: '🔥 Echo를 충전한다 (Echo +40)', effect(gs) { gs.addEcho(40); return 'Echo가 충전되었다.'; } },
        { text: '🚶 지나친다', effect(gs) { return null; } },
      ]
    },
    {
      id: 'echo_vendor', layer: 1, title: 'Echo 자판기', eyebrow: 'LAYER 1 · 우발적 이벤트',
      desc: '낡은 자판기가 벽에 기대어 있다. "잔향 에너지 교환"이라고 적혀 있다.',
      choices: [
        { text: '💊 체력 회복 (골드 10 → HP 15)', effect(gs) { if (gs.player.gold >= 10) { gs.player.gold -= 10; gs.heal(15); return '체력이 회복됐다.'; } return '골드가 부족하다.'; } },
        { text: '⚡ Echo 구매 (골드 8 → Echo 30)', effect(gs) { if (gs.player.gold >= 8) { gs.player.gold -= 8; gs.addEcho(30); return 'Echo가 충전됐다.'; } return '골드가 부족하다.'; } },
        { text: '🃏 카드 구매 (골드 15 → 랜덤 카드)', effect(gs) { if (gs.player.gold >= 15) { gs.player.gold -= 15; const c = gs.getRandomCard('uncommon'); gs.player.deck.push(c); AudioEngine.playItemGet(); return `${DATA.cards[c]?.name} 카드를 얻었다.`; } return '골드가 부족하다.'; } },
        { text: '🚶 지나친다', effect() { return null; } },
      ]
    },
    {
      id: 'silent_pool', layer: 1, title: '침묵의 웅덩이', eyebrow: 'LAYER 2 · 신비한 이벤트',
      desc: '잔향 에너지가 고인 웅덩이가 빛나고 있다.',
      choices: [
        { text: '🌊 웅덩이를 마신다 (HP -5, 덱에 레어 카드)', effect(gs) { gs.player.hp = Math.max(1, gs.player.hp - 5); const c = gs.getRandomCard('rare'); gs.player.deck.push(c); return `${DATA.cards[c]?.name} 카드를 얻었다. 혀가 타는 듯하다.`; } },
        { text: '🔮 관찰만 한다 (Echo +30)', effect(gs) { gs.addEcho(30); return '잔향 에너지를 흡수했다.'; } },
      ]
    },
    {
      id: 'lost_memory', layer: 2, title: '잃어버린 기억', eyebrow: 'LAYER 2 · 연속 이벤트',
      desc: '흐릿한 기억의 조각이 떠돌고 있다. 집중하면 흡수할 수 있을 것 같다.',
      choices: [
        { text: '🧠 기억을 흡수한다 (골드 +25, Echo +20)', effect(gs) { gs.addGold(25); gs.addEcho(20); return '기억의 파편이 힘으로 변환됐다.'; } },
        { text: '💭 기억을 방류한다 (HP +15)', effect(gs) { gs.heal(15); return '기억은 바람이 되어 사라졌다. 마음이 가벼워졌다.'; } },
      ]
    },
    {
      id: 'void_crack', layer: 2, title: '허공의 균열', eyebrow: 'LAYER 2 · 위험한 이벤트',
      desc: '공간이 갈라져 있다. 저쪽에는 무언가가 있는 것 같다.',
      choices: [
        { text: '🌀 균열을 통과한다 (HP -20, 아이템 1개)', effect(gs) { gs.player.hp = Math.max(1, gs.player.hp - 20); const items = Object.keys(DATA.items); const item = items[Math.floor(Math.random() * items.length)]; gs.player.items.push(item); AudioEngine.playItemGet(); showItemToast(DATA.items[item]); return `${DATA.items[item].name}을 얻었다. 몸이 떨린다.`; } },
        { text: '🚶 위험하다, 돌아간다', effect(gs) { return '안전한 길을 선택했다.'; } },
      ]
    },
  ],

  storyFragments: [
    { id: 1, run: 1, title: '첫 번째 잔향', text: '"눈을 뜬다. 검이 익숙하다. 하지만 이 장소는... 처음인 것 같기도, 아닌 것 같기도 하다."' },
    { id: 2, run: 2, title: '기억하는 자들', text: '"타락한 기사가 나를 알아보았다. \'또 왔군\'. 그는 이미 내 이름을 알고 있었다."' },
    { id: 3, run: 3, title: '막으려 했던 것', text: '"대침묵 이전, 나는 신들의 전쟁을 막으려 했다. 그 방법이 — 더 많은 희생을 요구했다."' },
    { id: 4, run: 4, title: '속삭이는 잔향', text: '"잔향 에너지가 속삭인다: 충분한 기억이 쌓이면, 루프를 끊을 수 있다고. 하지만 그게 진정한 끝인가?"' },
    { id: 5, run: 5, title: '두 가지 선택', text: '"상인의 눈빛 — 내가 도왔을 때와 빼앗았을 때. 세계는 두 선택 모두 기억한다."' },
    { id: 6, run: 6, title: '자초한 루프', text: '"신의 무덤에서 발견한 비문: \'잔향자여, 루프를 만든 것은 너다. 대침묵을 막기 위해 시간을 되감은 것은.\'"' },
    { id: 7, run: 7, title: '진실의 대가', text: '"에코의 핵심에 도달하면 모든 것이 보인다고 한다. 하지만 진실을 알게 되면, 계속 싸울 이유가 있는가?"' },
    { id: 8, run: 8, title: '잊혀진 이름', text: '"나는 기억한다 — 처음 루프를 시작할 때, 나는 누군가를 구하려 했다. 그 이름을 아직 기억하지 못한다."' },
    { id: 9, run: 9, title: '세계의 의지', text: '"기억이 돌아왔다. 구하려 했던 것은 사람이 아니었다. 세계 그 자체였다. 하지만 세계는 — 구원받기를 원하는가?"' },
    { id: 10, run: 10, title: '최후의 선택', text: '"충분히 이해했다. 이제 선택의 시간이다. 루프를 계속할 것인가, 아니면 진짜 끝을 받아들일 것인가."' },
  ],

  deathQuotes: [
    '"이 죽음도 기억이 된다."',
    '"다음엔... 다르게 선택하겠다."',
    '"잔향은 사라지지 않는다. 형태가 바뀔 뿐."',
    '"무엇이 옳은가. 아직 알 수 없다."',
    '"세계는 내 선택을 기억한다."',
    '"두려움이 없다. 이미 수백 번 죽었으니."',
    '"다시, 처음부터."',
    '"루프는 끝나지 않는다. 아직은."',
  ],
};

// ────────────────────────────────────────
// DIFFICULTY SCALER
// ────────────────────────────────────────
const DifficultyScaler = {
  getMultiplier(runCount, region, floor) {
    const run = runCount !== undefined ? runCount : GS.meta.runCount;
    const regAbs = region !== undefined ? region : GS.currentRegion;
    const reg = (typeof getBaseRegionIndex === 'function') ? getBaseRegionIndex(regAbs) : regAbs;
    const flr = floor !== undefined ? floor : GS.currentFloor;
    const base = 1 + (run - 1) * 0.05 + reg * 0.10 + flr * 0.03;
    if (typeof RunRules !== 'undefined' && RunRules?.getEnemyScaleMultiplier) {
      return base * RunRules.getEnemyScaleMultiplier(GS, regAbs);
    }
    return base;
  },
  scaleEnemy(enemy, runCount, region, floor) {
    const m = this.getMultiplier(runCount, region, floor);
    return {
      ...enemy,
      hp: Math.ceil(enemy.hp * m), maxHp: Math.ceil(enemy.maxHp * m),
      atk: Math.ceil(enemy.atk * m), xp: Math.ceil(enemy.xp * m),
      gold: Math.max(1, Math.ceil((enemy.gold || 0) * (1 + (((GS?.runConfig?.ascension || 0) * 0.02))))),
    };
  },
};

// ────────────────────────────────────────
// GAME STATE — 단일 중앙 상태
// ────────────────────────────────────────
// ────────────────────────────────────────
// SET BONUS SYSTEM — 유물 세트 효과
// ────────────────────────────────────────
const SetBonusSystem = {
  sets: {
    void_set: {
      name: '심연의 삼위일체',
      items: ['void_eye', 'void_fang', 'void_crown'],
      bonuses: {
        2: { label: '심연의 각성 — Echo 게이지 최대 +20%', apply(gs) { if (!gs._voidSet2) { gs._voidSet2 = true; gs.player.maxEcho = Math.floor(gs.player.maxEcho * 1.2); } } },
        3: { label: '심연의 완성 — 모든 피해 +15% + 턴 시작 Echo +15', apply(gs) { gs._voidSet3 = true; } },
      }
    },
    echo_set: {
      name: '잔향의 삼각',
      items: ['echo_pendant', 'echo_bracer', 'echo_sigil'],
      bonuses: {
        2: { label: '잔향의 공명 — Resonance Burst 게이지 -20 (80에서 발동)', apply(gs) { gs._echoSet2 = true; } },
        3: { label: '잔향의 완성 — 매 턴 자동 Echo +20 추가', apply(gs) { gs._echoSet3 = true; } },
      }
    },
    blood_set: {
      name: '혈맹의 인장',
      items: ['blood_seal', 'blood_oath', 'blood_crown'],
      bonuses: {
        2: { label: '혈맹의 결의 — HP 최대치 +20', apply(gs) { if (!gs._bloodSet2) { gs._bloodSet2 = true; gs.player.maxHp += 20; gs.player.hp += 20; } } },
        3: { label: '혈맹의 완성 — 피해 받을 때 20% 확률 완전 무효', apply(gs) { gs._bloodSet3 = true; } },
      }
    },
  },

  getActiveSets(gs) {
    const owned = new Set(gs.player.items);
    const active = [];
    for (const [key, set] of Object.entries(this.sets)) {
      const count = set.items.filter(id => owned.has(id)).length;
      if (count >= 2) {
        active.push({ key, name: set.name, count, bonus: set.bonuses[Math.min(count, 3)] });
      }
    }
    return active;
  },

  applyPassiveBonuses(gs) {
    const owned = new Set(gs.player.items);
    for (const [key, set] of Object.entries(this.sets)) {
      const count = set.items.filter(id => owned.has(id)).length;
      if (count >= 2 && set.bonuses[2]) set.bonuses[2].apply(gs);
      if (count >= 3 && set.bonuses[3]) set.bonuses[3].apply(gs);
    }
  },

  triggerSetBonuses(gs, trigger, data) {
    const owned = new Set(gs.player.items);

    // 심연 3세트: 피해 +15%
    if (gs._voidSet3 && trigger === 'deal_damage' && data) return Math.floor(data * 1.15);
    // 심연 3세트: 턴 시작 Echo +15
    if (owned.has('void_eye') && owned.has('void_fang') && owned.has('void_crown')) {
      if (trigger === 'turn_start') { gs.addEcho(15); }
    }

    // 잔향 2세트: Burst 게이지 감소 (80에서 발동)
    // 잔향 3세트: 매 턴 Echo +20 추가
    if (gs._echoSet3 && trigger === 'turn_start') { gs.addEcho(20); }

    // 혈맹 3세트: 20% 피해 무효
    if (gs._bloodSet3 && trigger === 'damage_taken' && data > 0 && Math.random() < 0.2) {
      gs.addLog('💉 혈맹의 완성: 피해 무효!', 'echo');
      return true;
    }
  },
};

