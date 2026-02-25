'use strict';

import { AudioEngine } from '../engine/audio.js';
import { Trigger } from './constants/triggers.js';
import { DATA } from '../data/game_data.js';
import { DifficultyScaler } from './difficulty_scaler.js';
import { RunRules } from './run_rules.js';
import { ClassMechanics } from './class_mechanics.js';
import { GS } from './game_state.js';



  function _getDoc(deps) {
    return deps?.doc || document;
  }

  function _isLastBaseRegion(gs, getBaseRegionIndex, getRegionCount) {
    if (!gs) return false;
    if (typeof getBaseRegionIndex !== 'function' || typeof getRegionCount !== 'function') return false;
    return getBaseRegionIndex(gs.currentRegion) === Math.max(0, getRegionCount() - 1);
  }

  function _spawnScaledEnemy(gs, enemyData, difficultyScaler, extra = {}) {
    if (!gs || !enemyData) return;
    const payload = { ...enemyData, statusEffects: {}, ...extra };
    const enemy = difficultyScaler?.scaleEnemy?.(payload) || payload;
    gs.combat.enemies.push(enemy);
  }

  export const CombatStartUI = {
    startCombat(isBoss = false, deps = {}) {
      const gs = deps.gs || GS;
      const data = deps.data || DATA;
      const getRegionData = deps.getRegionData || window.getRegionData;
      const getBaseRegionIndex = deps.getBaseRegionIndex || window.getBaseRegionIndex;
      const getRegionCount = deps.getRegionCount || window.getRegionCount;
      const difficultyScaler = deps.difficultyScaler || DifficultyScaler;
      const audioEngine = deps.audioEngine || AudioEngine;
      const runRules = deps.runRules || RunRules;
      const classMechanics = deps.classMechanics || ClassMechanics;
      if (!gs || !data?.enemies || typeof getRegionData !== 'function') return;

      const region = getRegionData(gs.currentRegion, gs);
      if (!region) return;

      gs.combat.enemies = [];
      gs.combat.turn = 1;
      gs.combat.playerTurn = true;
      gs.combat.log = [];
      gs.player.shield = 0;
      gs.player.echoChain = 0;
      gs.player.energy = gs.player.maxEnergy;
      gs.player.zeroCost = false;
      gs.player.costDiscount = 0;
      gs.player._freeCardUses = 0;
      gs.player._cascadeCards = new Map();
      gs.combat.active = true;
      gs._endCombatScheduled = false;
      gs._endCombatRunning = false;
      gs._selectedTarget = null;
      gs._combatStartDmg = gs.stats.damageDealt;
      gs._combatStartTaken = gs.stats.damageTaken;
      gs._combatStartKills = gs.player.kills;

      if (isBoss) {
        const isHiddenEligible = _isLastBaseRegion(gs, getBaseRegionIndex, getRegionCount) &&
          (gs.worldMemory.savedMerchant || 0) >= 1 &&
          gs.meta.storyPieces.length >= 5;
        let bossKey = region.boss || 'ancient_echo';
        if (isHiddenEligible) {
          bossKey = 'echo_origin';
          if (typeof deps.showWorldMemoryNotice === 'function') {
            setTimeout(() => deps.showWorldMemoryNotice('🌟 세계가 기억한다 — 숨겨진 근원이 깨어났다!'), 600);
          }
        }
        const bossData = data.enemies[bossKey] || data.enemies.ancient_echo;
        _spawnScaledEnemy(gs, bossData, difficultyScaler, { phase: 1 });
        if (gs.meta.codex) gs.meta.codex.enemies.add(bossKey);
        audioEngine?.playBossPhase?.();
        gs.triggerItems?.(Trigger.BOSS_START);
      } else {
        const isEliteNode = gs.currentNode?.type === 'elite';
        if (isEliteNode && region.elites?.length) {
          const eliteKey = region.elites[Math.floor(Math.random() * region.elites.length)];
          if (data.enemies[eliteKey]) {
            _spawnScaledEnemy(gs, data.enemies[eliteKey], difficultyScaler);
            if (gs.meta.codex) gs.meta.codex.enemies.add(eliteKey);
          }
        } else {
          // 진행도에 따른 적 생성 수 동적 조정
          let count = 1;
          const regIdx = typeof getBaseRegionIndex === 'function' ? getBaseRegionIndex(gs.currentRegion) : gs.currentRegion;

          if (gs.currentFloor > 1) {
            if (regIdx === 0) {
              // 1지역: 2층부터 40% 확률로 2명
              count = Math.random() < 0.4 ? 2 : 1;
            } else {
              // 2지역 이상: 50% 확률로 2명, 20% 확률로 3명
              const roll = Math.random();
              if (roll < 0.2) count = 3;
              else if (roll < 0.7) count = 2;
              else count = 1;
            }
          }

          for (let i = 0; i < count; i++) {
            const enemyKey = region.enemies[Math.floor(Math.random() * region.enemies.length)];
            if (!data.enemies[enemyKey]) continue;
            _spawnScaledEnemy(gs, data.enemies[enemyKey], difficultyScaler);
            if (gs.meta.codex) gs.meta.codex.enemies.add(enemyKey);
          }
        }
      }

      if (typeof getBaseRegionIndex === 'function' && getBaseRegionIndex(gs.currentRegion) === 2) {
        const memoryDebuffs = ['weakened', 'burning', 'confusion'];
        const debuff = memoryDebuffs[Math.floor(Math.random() * memoryDebuffs.length)];
        if (Math.random() < 0.5) {
          gs.player.buffs[debuff] = { stacks: 1 };
          gs.addLog?.(`👁️ 왜곡된 기억: ${debuff} 부여!`, 'damage');
        }
      }

      if (typeof getBaseRegionIndex === 'function' && getBaseRegionIndex(gs.currentRegion) === 3) {
        const debuffs = ['weakened', 'slowed', 'burning'];
        const debuff = debuffs[Math.floor(Math.random() * debuffs.length)];
        gs.player.buffs[debuff] = { stacks: 2 };
        gs.addLog?.(`⚠️ 신의 무덤: ${debuff} 부여!`, 'damage');
      }

      if (gs.player.class === 'mage') classMechanics?.mage?.onCombatStart?.(gs);

      runRules?.onCombatStart?.(gs);
      gs.triggerItems?.(Trigger.COMBAT_START);
      gs.drawCards?.(5);

      const doc = _getDoc(deps);
      const zone = doc.getElementById('enemyZone');
      if (zone) zone.innerHTML = '';

      const nodeCardOverlay = doc.getElementById('nodeCardOverlay');
      if (nodeCardOverlay) nodeCardOverlay.style.display = 'none';
      const eventModal = doc.getElementById('eventModal');
      if (eventModal) {
        eventModal.classList.remove('active');
        eventModal.style.display = '';
      }

      const firstAlive = gs.combat.enemies.findIndex(e => e.hp > 0);
      gs._selectedTarget = firstAlive >= 0 ? firstAlive : null;
      if (typeof deps.updateChainUI === 'function') deps.updateChainUI(gs.player.echoChain);

      deps.renderCombatEnemies?.();
      deps.renderCombatCards?.();
      deps.updateCombatLog?.();
      gs.addLog?.('⚔️ 전투 시작!', 'system');
      deps.updateNoiseWidget?.();
      doc.getElementById('combatOverlay')?.classList.add('active');
      if (typeof deps.showTurnBanner === 'function') {
        setTimeout(() => deps.showTurnBanner('player'), 300);
      }
      deps.resetCombatInfoPanel?.();
      deps.refreshCombatInfoPanel?.();
      deps.updateUI?.();
      deps.updateClassSpecialUI?.();
    },
  };
