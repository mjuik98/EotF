/**
 * turn_manager.js — 전투 턴 비즈니스 로직 (순수 Model)
 *
 * DOM/window 접근 없이 게임 상태(gs)만 변경합니다.
 * UI 업데이트는 호출측(combat_turn_ui.js)이 반환값/콜백으로 처리합니다.
 */
import { LogUtils } from '../utils/log_utils.js';
import { Actions } from '../core/state_actions.js';
import { ENEMY_TURN_BUFFS, TURN_START_DEBUFFS } from './turn_manager_helpers.js';
import { resolveActiveRegionId } from '../domain/run/region_service.js';
import { DATA } from '../../data/game_data.js';
import { endPlayerTurnPolicy } from '../domain/combat/turn/end_player_turn_policy.js';
import { handleEnemyEffectLogic } from '../domain/combat/turn/enemy_effect_resolver.js';
import { normalizeInfiniteStack, isInfiniteStackBuff } from '../domain/combat/turn/infinite_stack_buffs.js';
import { startPlayerTurnPolicy } from '../domain/combat/turn/start_player_turn_policy.js';

// ═══════════════════════════════════════
//  TurnManager (순수 로직)
// ═══════════════════════════════════════
export const TurnManager = {

    /**
     * 플레이어 턴 종료 로직 (상태만 변경)
     * @returns {{ skippableCards: number }} 사용 가능했던 카드 수
     */
    endPlayerTurnLogic(gs, data, { canPlayFn, shuffleArrayFn } = {}) {
        return endPlayerTurnPolicy(gs, data, { canPlayFn, shuffleArrayFn });
    },

    /**
     * 단일 적의 공격 데미지 처리 (상태 변경)
     * @returns {{ reflected: boolean, enemyDied: boolean, dmgDealt: number }}
     */
    processEnemyAttack(gs, enemy, index, action) {
        gs.combat._currentAttackerIdx = index;
        const hitCount = action.multi || 1;
        gs.addLog?.(LogUtils.formatSystem(`${enemy.name}의 행동: ${action.intent}`), 'damage');

        const results = [];
        for (let h = 0; h < hitCount; h++) {
            if (!gs.combat.active || gs.player.hp <= 0) break;

            let dmg = action.dmg;
            let weakened = false;
            if (enemy.statusEffects?.weakened > 0) {
                dmg = Math.floor(dmg * 0.5);
                weakened = true;
                gs.addLog?.(`💫 ${enemy.name}: 약화 (피해 감소)`, 'echo');
            }

            let reflected = false;
            let enemyDied = false;

            if (gs.player.buffs?.dodge) {
                gs.addLog?.(LogUtils.formatSystem('💨 회피: 공격을 피했습니다!'), 'system');
                const buff = gs.player.buffs.dodge;
                if (buff.stacks > 1) buff.stacks--;
                else delete gs.player.buffs.dodge;
                continue;
            }

            const mirrorBuff = gs.player.buffs?.mirror;
            const spikeShieldBuff = gs.player.buffs?.spike_shield;
            if (mirrorBuff || spikeShieldBuff) {
                const hpBefore = enemy.hp;
                enemy.hp = Math.max(0, enemy.hp - dmg);
                const dealt = Math.max(0, hpBefore - enemy.hp);
                if (dealt > 0 && gs.stats) gs.stats.damageDealt = (gs.stats.damageDealt || 0) + dealt;
                gs.addLog?.(LogUtils.formatAttack('반사막', enemy.name, dmg), 'echo');
                if (mirrorBuff) {
                    if (Number.isFinite(mirrorBuff.stacks) && mirrorBuff.stacks > 1) mirrorBuff.stacks--;
                    else delete gs.player.buffs.mirror;
                }
                reflected = true;
                if (enemy.hp <= 0) {
                    gs.onEnemyDeath?.(enemy, index);
                    enemyDied = true;
                }
            } else {
                gs.takeDamage?.(dmg, { name: enemy.name, type: 'enemy' });
            }

            results.push({ dmg, reflected, enemyDied, weakened, hitIndex: h });
            if (enemyDied) break;
        }

        return results;
    },

    /**
     * 적 상태효과 틱 처리 (독, 화염, 표식, 파멸 등)
     * @returns {Array<{ index, type, dmg, enemyDied }>} UI가 표시할 이벤트 목록
     */
    processEnemyStatusTicks(gs) {
        if (!gs?.combat?.enemies) return [];

        const events = [];

        gs.combat.enemies.forEach((enemy, index) => {
            if (!enemy.statusEffects || enemy.hp <= 0) return;
            const se = enemy.statusEffects;

            if (se.poisoned > 0) {
                let dmg = se.poisoned * 5;
                if (typeof gs.triggerItems === 'function') {
                    const scaled = gs.triggerItems('poison_damage', { amount: dmg, targetIdx: index });
                    if (typeof scaled === 'number' && Number.isFinite(scaled)) {
                        dmg = Math.max(0, Math.floor(scaled));
                    } else if (scaled && typeof scaled.amount === 'number') {
                        dmg = Math.max(0, Math.floor(scaled.amount));
                    }
                }
                const hpBefore = enemy.hp;
                enemy.hp = Math.max(0, enemy.hp - dmg);
                const dealt = Math.max(0, hpBefore - enemy.hp);
                if (dealt > 0 && gs.stats) gs.stats.damageDealt = (gs.stats.damageDealt || 0) + dealt;
                gs.addLog?.(LogUtils.formatAttack('독', enemy.name, dmg), 'damage');

                let enemyDied = false;
                if (enemy.hp <= 0) {
                    gs.onEnemyDeath?.(enemy, index);
                    enemyDied = true;
                }

                // 지속시간 감소
                if (!enemyDied) {
                    se.poisonDuration = (se.poisonDuration || 1) - 1;
                    if (se.poisonDuration <= 0) {
                        delete se.poisoned;
                        delete se.poisonDuration;
                    }
                }

                events.push({ index, type: 'poison', dmg, enemyDied, color: '#44ff88' });
                if (enemyDied) return;
            }

            if (se.burning > 0) {
                const dmg = 5;
                const hpBefore = enemy.hp;
                enemy.hp = Math.max(0, enemy.hp - dmg);
                const dealt = Math.max(0, hpBefore - enemy.hp);
                if (dealt > 0 && gs.stats) gs.stats.damageDealt = (gs.stats.damageDealt || 0) + dealt;
                gs.addLog?.(LogUtils.formatAttack('화염', enemy.name, dmg), 'damage');
                se.burning--;
                if (se.burning <= 0) delete se.burning;
                let enemyDied = false;
                if (enemy.hp <= 0) {
                    gs.onEnemyDeath?.(enemy, index);
                    enemyDied = true;
                }
                events.push({ index, type: 'burning', dmg, enemyDied, color: '#ff8844' });
                if (enemyDied) return;
            }

            if (se.abyss_regen > 0) {
                const heal = Math.max(0, Math.floor(Number(se.abyss_regen) || 0));
                if (heal > 0) {
                    enemy.hp = Math.min(enemy.maxHp || enemy.hp, (enemy.hp || 0) + heal);
                    gs.addLog?.(LogUtils.formatHeal(enemy.name, heal), 'heal');
                }
            }

            if (se.marked !== undefined) {
                se.marked--;
                if (se.marked <= 0) {
                    const dmg = 30;
                    const hpBefore = enemy.hp;
                    enemy.hp = Math.max(0, enemy.hp - dmg);
                    const dealt = Math.max(0, hpBefore - enemy.hp);
                    if (dealt > 0 && gs.stats) gs.stats.damageDealt = (gs.stats.damageDealt || 0) + dealt;
                    gs.addLog?.(LogUtils.formatAttack('표식', enemy.name, dmg), 'echo');
                    delete se.marked;
                    let enemyDied = false;
                    if (enemy.hp <= 0) {
                        gs.onEnemyDeath?.(enemy, index);
                        enemyDied = true;
                    }
                    events.push({ index, type: 'marked_explode', dmg, enemyDied, color: '#ff2255' });
                    if (enemyDied) return;
                }
            }

            if (se.immune > 0) {
                se.immune--;
                if (se.immune <= 0) delete se.immune;
            }

            if (se.doom !== undefined) {
                se.doom--;
                if (se.doom <= 0) {
                    const dmg = 40;
                    gs.takeDamage?.(dmg, { name: '파멸', type: 'enemy' });
                    delete se.doom;
                    events.push({ index, type: 'doom_explode', dmg, enemyDied: false, color: '#ff00ff' });
                } else {
                    gs.addLog?.(`☠️ ${enemy.name}: 파멸 카운트다운 ${se.doom}`, 'system');
                }
            }
        });

        return events;
    },

    /**
     * 플레이어 상태이상 턴 시작 틱 처리
     * @returns {{ alive: boolean, actions: string[] }}
     */
    processPlayerStatusTicks(gs, { shuffleArrayFn } = {}) {
        if (!gs?.combat?.active || !gs?.player?.buffs) return { alive: true, actions: [] };

        const buffs = gs.player.buffs;
        const actions = [];

        const decStack = (id) => {
            const buff = buffs[id];
            if (!buff || !Number.isFinite(buff.stacks)) return;
            buff.stacks--;
            if (buff.stacks <= 0) delete buffs[id];
        };

        if ((buffs.burning?.stacks || 0) > 0) {
            gs.takeDamage(5, { name: '화염', type: 'enemy' });
            decStack('burning');
            if (!gs.combat.active || gs.player.hp <= 0) return { alive: false, actions };
        }

        if ((buffs.poisoned?.stacks || 0) > 0) {
            const poisonDmg = Math.max(0, Number(buffs.poisoned.stacks || 0)) * 5;
            gs.takeDamage(poisonDmg, { name: '독', type: 'enemy' });

            // 플레이어 독 지속시간 처리
            buffs.poisoned.poisonDuration = (buffs.poisoned.poisonDuration || 1) - 1;
            if (buffs.poisoned.poisonDuration <= 0) {
                delete buffs.poisoned;
            }
            if (!gs.combat.active || gs.player.hp <= 0) return { alive: false, actions };
        }

        if ((buffs.slowed?.stacks || 0) > 0) {
            gs.player.energy = Math.max(0, gs.player.energy - 1);
            gs.addLog?.(LogUtils.formatStatChange('플레이어', '에너지', -1, false), 'damage');
            decStack('slowed');
        }

        if ((buffs.confusion?.stacks || 0) > 0) {
            if (gs.player.hand.length > 1 && shuffleArrayFn) {
                shuffleArrayFn(gs.player.hand);
                gs.addLog?.(LogUtils.formatAura('혼란: 손패가 뒤섞였다'), 'damage');
                actions.push('renderCombatCards');
            }
            decStack('confusion');
        }

        actions.push('updateStatusDisplay', 'updateUI');
        return { alive: true, actions };
    },

    /**
     * 보스 페이즈 전환 상태 변경
     * @returns {{ phase: number, buffsPurged: boolean }}
     */
    handleBossPhaseShiftLogic(gs, enemy) {
        if (!gs || !enemy) return null;

        if (!enemy.statusEffects) enemy.statusEffects = {};
        enemy.statusEffects.immune = Math.max(enemy.statusEffects.immune || 0, 1);
        gs.addLog?.(LogUtils.formatStatus(enemy.name, '무적', 1), 'echo');

        enemy.phase = (enemy.phase || 1) + 1;

        let buffsPurged = false;
        if (enemy.phase === 2) {
            gs.addLog?.(LogUtils.formatSystem(`${enemy.name} 2페이즈 각성!`), 'echo');
            const permanentBuffs = {};
            Object.keys(gs.player.buffs).forEach(buffId => {
                const buff = gs.player.buffs[buffId];
                normalizeInfiniteStack(buffId, buff);
                if (isInfiniteStackBuff(buffId, buff)) {
                    permanentBuffs[buffId] = buff;
                }
            });
            gs.player.buffs = permanentBuffs;
            gs.addLog?.(LogUtils.formatSystem('플레이어 모든 버프 해제!'), 'damage');
            buffsPurged = true;
        } else if (enemy.phase === 3) {
            gs.addLog?.(`💀 ${enemy.name} 최종 페이즈!`, 'damage');
            enemy.atk = Math.floor(enemy.atk * 1.3);
        }

        return { phase: enemy.phase, buffsPurged };
    },

    /**
     * 적 이펙트 디스패치 (이펙트 실행 후 필요한 UI 액션 반환)
     * @returns {{ uiAction?: string, value?: any } | undefined}
     */
    handleEnemyEffect(effect, gs, enemy, { regionId, data } = {}) {
        return handleEnemyEffectLogic(effect, gs, enemy, { regionId, data });
    },

    /**
     * 적 턴 → 플레이어 턴 전환 시 상태 초기화
     */
    startPlayerTurnLogic(gs) {
        return startPlayerTurnPolicy(gs);
    },

    /**
     * 적의 기절 상태 처리
     * @returns {boolean} 기절 상태여서 행동을 건너뛸지 여부
     */
    processEnemyStun(enemy) {
        if (enemy.statusEffects?.stunned > 0) {
            enemy.statusEffects.stunned--;
            if (enemy.statusEffects.stunned <= 0) delete enemy.statusEffects.stunned;

            if (enemy.statusEffects?.weakened > 0) {
                enemy.statusEffects.weakened--;
                if (enemy.statusEffects.weakened <= 0) delete enemy.statusEffects.weakened;
            }
            return true; // stunned, skip action
        }
        return false;
    },

    /**
     * 적 AI에서 행동 결정
     */
    getEnemyAction(enemy, turn) {
        try {
            return enemy.ai(turn);
        } catch {
            return { type: 'strike', intent: `공격 ${enemy.atk}`, dmg: enemy.atk };
        }
    },

    /**
     * 적 약화 스택 감소 (턴당 1회)
     */
    decayEnemyWeaken(enemy) {
        if (enemy.statusEffects?.weakened > 0) {
            enemy.statusEffects.weakened--;
            if (enemy.statusEffects.weakened <= 0) delete enemy.statusEffects.weakened;
        }
    },
};
