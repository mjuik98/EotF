import { playEventResonanceBurst } from '../../ports/public_audio_presentation_capabilities.js';
import { CONSTANTS, Trigger } from '../../ports/public_presentation_support_capabilities.js';

function formatRecentFeedText({ sourceName, outcome = '' } = {}) {
  const normalizedOutcome = typeof outcome === 'string' ? outcome.trim() : '';
  if (!sourceName) return normalizedOutcome;
  return `${sourceName}: ${normalizedOutcome}`;
}

function createRecentFeedMeta(text) {
  return {
    source: { type: 'skill', id: null, name: '잔향 스킬' },
    recentFeed: {
      eligible: true,
      text,
    },
  };
}

function formatRecentFeedStatusOutcome(status, duration) {
  const durationText = `${Math.max(0, Math.floor(Number(duration) || 0))}턴`;
  const statusLabelById = {
    immune: '무적',
    poisoned: '중독',
    vanish: '은신',
    weakened: '약화',
  };
  return `${statusLabelById[status] || status} ${durationText}`;
}

function buildEchoSkillRecentFeedOutcome(skillDef) {
  if (!skillDef || typeof skillDef !== 'object') return '';

  const summaryParts = [];
  if (skillDef.dmg) summaryParts.push(`피해 ${skillDef.dmg}`);
  if (skillDef.aoedmg) summaryParts.push(`전체 피해 ${skillDef.aoedmg}`);
  if (skillDef.shield) summaryParts.push(`방어막 +${skillDef.shield}`);
  if (skillDef.weaken) summaryParts.push(formatRecentFeedStatusOutcome('weakened', skillDef.weaken));
  if (skillDef.poison) summaryParts.push(formatRecentFeedStatusOutcome('poisoned', skillDef.poison));
  if (skillDef.draw) summaryParts.push(`카드 ${skillDef.draw}장 드로우`);
  if (skillDef.echo) summaryParts.push(`잔향 +${skillDef.echo}`);
  if (skillDef.heal) summaryParts.push(`${skillDef.heal} 회복`);
  if (skillDef.immune) summaryParts.push(formatRecentFeedStatusOutcome('immune', skillDef.immune));
  if (skillDef.vanish) summaryParts.push(formatRecentFeedStatusOutcome('vanish', skillDef.vanish));
  if (skillDef.atkGrowth) summaryParts.push(`공격력 +${skillDef.atkGrowth}`);
  if (skillDef.maxHpGrowth) summaryParts.push(`최대 체력 +${skillDef.maxHpGrowth}`);

  return summaryParts.join(' / ');
}

export function resolveEchoSkillTier(echoVal, constants = CONSTANTS) {
  if (echoVal >= constants.ECHO.SKILL_COST_HIGH) {
    return { tier: 3, cost: constants.ECHO.SKILL_COST_HIGH };
  }
  if (echoVal >= constants.ECHO.SKILL_COST_MID) {
    return { tier: 2, cost: constants.ECHO.SKILL_COST_MID };
  }
  if (echoVal >= constants.ECHO.SKILL_COST_LOW) {
    return { tier: 1, cost: constants.ECHO.SKILL_COST_LOW };
  }
  return null;
}

export function applyEchoSkillEffect(gs, skillDef, deps = {}) {
  if (!gs || !skillDef) return;
  if (skillDef.dmg) {
    if (typeof deps.applyEnemyDamage === 'function') {
      deps.applyEnemyDamage(skillDef.dmg, null, true, null, deps);
    }
  }
  if (skillDef.aoedmg) {
    if (typeof deps.applyEnemyAreaDamage === 'function') {
      deps.applyEnemyAreaDamage(skillDef.aoedmg, deps);
    }
  }
  if (skillDef.shield) {
    if (typeof gs.addShield === 'function') gs.addShield(skillDef.shield);
    else if (typeof gs.dispatch === 'function') gs.dispatch('player:shield', { amount: skillDef.shield });
  }
  if (skillDef.weaken) gs.applyEnemyStatus('weakened', skillDef.weaken);
  if (skillDef.draw) {
    if (typeof deps.drawCardsState === 'function') deps.drawCardsState(gs, skillDef.draw);
    else gs.drawCards?.(skillDef.draw);
  }
  if (skillDef.echo) gs.addEcho(skillDef.echo);
  if (skillDef.vanish) gs.addBuff('vanish', skillDef.vanish, {});
  if (skillDef.heal) gs.heal(skillDef.heal);
  if (skillDef.atkGrowth) gs.addBuff('echo_berserk', 99, { atkGrowth: skillDef.atkGrowth });
  if (skillDef.maxHpGrowth) gs.increaseMaxHp(skillDef.maxHpGrowth);
  if (skillDef.immune) gs.addBuff('immune', skillDef.immune, {});
  const recentFeedOutcome = buildEchoSkillRecentFeedOutcome(skillDef);
  gs.addLog?.(skillDef.log, 'echo', createRecentFeedMeta(formatRecentFeedText({
    sourceName: '잔향 스킬',
    outcome: recentFeedOutcome || skillDef.log,
  })));
}

export function flashEchoSkillButton(deps = {}) {
  const doc = deps.doc || document;
  const echoBtn = doc.getElementById('useEchoSkillBtn');
  if (!echoBtn) return false;

  echoBtn.style.transition = 'opacity 0.2s, background 0.2s';
  echoBtn.style.background = 'linear-gradient(135deg,rgba(0,255,204,0.2),rgba(123,47,255,0.2))';
  setTimeout(() => {
    echoBtn.style.background = '';
  }, 800);
  return true;
}

export function useEchoSkillRuntime(deps = {}) {
  const gs = deps.gs;
  if (!gs?.player) return false;
  if (!gs.combat?.active || !gs.combat.playerTurn) return false;

  const tierInfo = resolveEchoSkillTier(gs.player.echo, deps.constants || CONSTANTS);
  if (!tierInfo) {
    gs.addLog?.('⚠️ 잔향 게이지 부족! (30 필요)', 'damage');
    return false;
  }

  gs.drainEcho(tierInfo.cost);
  gs.triggerItems?.(Trigger.ECHO_SKILL, { cost: tierInfo.cost });

  const constants = deps.constants || CONSTANTS;
  const skillDef = constants.ECHO_SKILLS[gs.player.class]?.[tierInfo.tier];
  applyEchoSkillEffect(gs, skillDef, deps);

  deps.showEchoBurstOverlay?.();
  playEventResonanceBurst(deps.audioEngine);
  deps.renderCombatEnemies?.();
  deps.renderCombatCards?.();
  flashEchoSkillButton(deps);
  return true;
}
