import { DATA } from '../../../data/game_data.js';

function getClassMeta(classKey, data) {
  return data?.classes?.[classKey] || {};
}

export function buildClassTraitViewModel(classKey, gs, options = {}) {
  const data = options.data || DATA;
  const meta = getClassMeta(classKey, data);

  switch (classKey) {
    case 'swordsman': {
      const resonance = gs?.getBuff?.('resonance');
      const value = resonance ? resonance.dmgBonus || 0 : 0;
      return {
        title: meta.traitTitle || '공명 (Resonance)',
        desc: meta.traitDesc || '카드를 사용할 때마다 공격력이 증가합니다.',
        label: meta.traitName || '공명',
        value: value > 0 ? `+${value} 데미지` : '공명 누적 없음',
        valueColor: value > 0 ? 'var(--danger)' : 'var(--text-dim)',
      };
    }
    case 'mage': {
      const player = gs?.player;
      const progress = Number(player?._mageCastCounter || 0);
      const cycleProgress = progress % 3;
      const remaining = cycleProgress === 0 ? 3 : (3 - cycleProgress);
      const lastTargetId = player?._mageLastDiscountTarget;
      const lastTargetName = lastTargetId
        ? (data?.cards?.[lastTargetId]?.name || lastTargetId)
        : null;
      return {
        title: meta.traitTitle || '메아리 (Echo)',
        desc: meta.traitDesc || '카드를 3번 사용할 때마다 무작위 손패 카드 1장의 비용을 1 감소시킵니다.',
        label: meta.traitName || '메아리',
        value: `발동까지 ${remaining}회 (${progress}/3)`,
        valueColor: 'var(--cyan)',
        subValue: lastTargetName ? `최근 할인: ${lastTargetName}` : '최근 할인: 없음',
      };
    }
    case 'hunter':
      return {
        title: meta.traitTitle || '정적 (Dead Silence)',
        desc: meta.traitDesc || '같은 적을 5번 공격할 때마다 해당 적에게 독 3턴 부여하고, 카드를 1장 드로우합니다.',
        label: meta.traitName || '정적',
        value: '공격 진행 중...',
        valueColor: 'var(--cyan)',
      };
    case 'paladin':
      return {
        title: meta.traitTitle || '성가 (Sacred Hymn)',
        desc: meta.traitDesc || '체력을 회복할 때마다 회복량만큼 무작위 적에게 피해를 입힙니다.',
        label: meta.traitName || '성가',
        value: '회복 시 추가 피해',
        valueColor: 'var(--cyan)',
      };
    case 'berserker': {
      const lostHp = gs ? (gs.player.maxHp - gs.player.hp) : 0;
      const hpBonus = Math.floor(lostHp / 10) * 3;
      const buff = gs?.getBuff?.('berserk_mode');
      const buffPlus = gs?.getBuff?.('berserk_mode_plus');
      const echoBuff = gs?.getBuff?.('echo_berserk');
      const activeBuff = buff || buffPlus;
      const growBonus = activeBuff ? activeBuff.atkGrowth || 0 : 0;
      const echoGrowBonus = echoBuff ? echoBuff.atkGrowth || 0 : 0;
      return {
        title: meta.traitTitle || '불협화음 (Cacophony)',
        desc: meta.traitDesc || '체력이 낮을수록 피해 보너스가 증가합니다. 공격할 때마다 공격력이 영구적으로 추가 성장합니다.',
        label: meta.traitName || '불협화음',
        value: `보너스 +${hpBonus + growBonus + echoGrowBonus}`,
        valueColor: 'var(--danger)',
      };
    }
    case 'guardian':
      return {
        title: meta.traitTitle || '유령 갑주 (Echo Armor)',
        desc: meta.traitDesc || '매 턴 종료 시 방어막의 절반을 유지합니다.',
        label: meta.traitName || '유령 갑주',
        value: '방어막 50% 턴 시작 유지',
        valueColor: 'var(--white)',
      };
    default:
      return null;
  }
}
