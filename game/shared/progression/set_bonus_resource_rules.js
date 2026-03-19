import { changePlayerEnergyState, setPlayerHpState } from '../state/player_state_commands.js';

export function applySetBonusResourceRules(gs, counts, normalizedTrigger, data) {
  if (counts.void_set >= 3) {
    if (normalizedTrigger === 'deal_damage' && typeof data === 'number') {
      return Math.floor(data * 1.15);
    }
    if (normalizedTrigger === 'turn_start') {
      gs.addEcho?.(15, { name: '심연의 삼위일체 세트(3)', type: 'set' });
    }
  }

  if (counts.echo_set >= 3 && normalizedTrigger === 'turn_start') {
    gs.addEcho?.(20, { name: '반향의 삼각 세트(3)', type: 'set' });
  }

  if (counts.blood_set >= 3 && normalizedTrigger === 'damage_taken' && typeof data === 'number' && data > 0 && Math.random() < 0.2) {
    gs.addLog?.('💉 혈맹의 완성: 피해 무효!', 'echo');
    return true;
  }

  if (counts.storm_set >= 2 && normalizedTrigger === 'card_play') {
    gs.addEcho?.(4, { name: '폭풍의 세 검 세트(2)', type: 'set' });
  }
  if (counts.storm_set >= 3 && normalizedTrigger === 'deal_damage' && (gs.player.echoChain || 0) >= 3 && typeof data === 'number') {
    return Math.floor(data * 1.1);
  }

  if (counts.machine_set >= 2) {
    if (normalizedTrigger === 'card_exhaust' && (gs._machineSet2EnergyUsed || 0) < 4) {
      gs._machineSet2EnergyUsed = (gs._machineSet2EnergyUsed || 0) + 1;
      changePlayerEnergyState(gs, 1);
      gs.addLog?.('⚙️ 기계의 심장 세트(2): 에너지 +1', 'item');
    }
    if (normalizedTrigger === 'turn_start') {
      gs._machineSet3DamageBonus = counts.machine_set >= 3 ? (gs.player.exhausted?.length || 0) * 5 : 0;
    }
  }
  if (counts.machine_set >= 3 && normalizedTrigger === 'deal_damage' && (gs._machineSet3DamageBonus || 0) > 0 && typeof data === 'number') {
    return data + gs._machineSet3DamageBonus;
  }

  if (counts.moon_set >= 2 && normalizedTrigger === 'heal_amount' && typeof data === 'number' && data > 0) {
    gs.addShield?.(2, { name: '달의 신비 세트(2)', type: 'set' });
  }
  if (counts.moon_set >= 3 && normalizedTrigger === 'turn_start' && (gs.player.shield || 0) >= 15) {
    gs.heal?.(3, { name: '달의 신비 세트(3)', type: 'set' });
  }
  if (counts.moon_set >= 5 && normalizedTrigger === 'damage_taken' && typeof data === 'number' && data >= (gs.player.hp || 0) && !gs._moonSetReviveUsed) {
    gs._moonSetReviveUsed = true;
    setPlayerHpState(gs, 20);
    gs.addLog?.('🌙 달의 신비: 치명적 피해 방지 및 체력 회복!', 'echo');
    return true;
  }

  return undefined;
}
