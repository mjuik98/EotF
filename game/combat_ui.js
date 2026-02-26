import { DescriptionUtils } from './description_utils.js';
import { SecurityUtils } from './utils/security.js';


const INTENT_DESCRIPTIONS = {
  attack: { type: '공격', desc: '플레이어에게 직접 피해를 입힙니다.' },
  heavy: { type: '강타', desc: '강력한 단일 피해를 가합니다.' },
  double: { type: '연속공격', desc: '피해를 여러 번 나누어 가합니다.' },
  aoe: { type: '광역공격', desc: '광역 피해를 가합니다. 방어막을 미리 준비하세요.' },
  guard: { type: '방어', desc: '방어막을 쌓아 다음 피해를 줄입니다.' },
  barrier: { type: '결계', desc: '강한 방어 효과를 얻습니다.' },
  shield: { type: '방패', desc: '피해를 줄이는 방어 자세를 취합니다.' },
  curse: { type: '저주', desc: '플레이어에게 불리한 상태를 부여합니다.' },
  poison: { type: '독', desc: '턴마다 독 피해를 입힙니다.' },
  weaken: { type: '약화', desc: '플레이어의 공격 효율을 떨어뜨립니다.' },
  debuff: { type: '디버프', desc: '불리한 상태 이상을 부여합니다.' },
  mark: { type: '표식', desc: '다음 공격 피해가 증가할 수 있습니다.' },
  burning: { type: '화염', desc: '턴마다 화상 피해를 입힙니다.' },
  heal: { type: '회복', desc: '자신의 HP를 회복합니다.' },
  life: { type: '생명력 흡수', desc: '플레이어를 공격하며 자신을 회복합니다.' },
  drain: { type: '흡수', desc: '에너지 또는 Echo를 빼앗을 수 있습니다.' },
  summon: { type: '소환', desc: '추가 적을 소환합니다.' },
  enrage: { type: '격노', desc: '이후 공격이 더 강해집니다.' },
};

const ENEMY_STATUS_KR = {
  stunned: '기절',
  weakened: '약화',
  poisoned: '독',
  marked: '표식',
  mirror: '반사',
  immune: '무적',
  slowed: '감속',
  burning: '화염',
  cursed: '저주',
  dodge: '회피',
};

const ENEMY_STATUS_DESC = {
  stunned: { icon: '⚡', desc: '이번 턴 행동을 할 수 없습니다.' },
  weakened: { icon: '💫', desc: '공격 피해가 50% 감소합니다.' },
  poisoned: { icon: '🐍', desc: '매 턴 3의 독 피해를 받습니다.' },
  marked: { icon: '💢', desc: '3 턴 후 30 피해가 폭발합니다.' },
  mirror: { icon: '🪞', desc: '받는 피해를 적에게 반사합니다.' },
  immune: { icon: '🏛️', desc: '모든 피해를 무효화합니다.' },
  slowed: { icon: '🐢', desc: '행동이 지연됩니다.' },
  burning: { icon: '🔥', desc: '매 턴 5의 화염 피해를 받습니다.' },
  cursed: { icon: '💀', desc: '카드 효과와 회복량이 감소합니다.' },
  dodge: { icon: '💨', desc: '다음 공격을 회피합니다.' },
};

let _intentTipTimer = null;
let _enemyStatusTipTimer = null;

function _getDoc(deps) {
  return deps?.doc || document;
}

function _getWin(deps) {
  return deps?.win || window;
}

function _getIntentIcon(intent) {
  if (!intent) return '❓';
  const t = intent.type || '';
  if (t.includes('dodge') || t.includes('phase')) return '💨';
  if (t.includes('guard') || t.includes('barrier') || t.includes('shield')) return '🛡️';
  if (t.includes('howl') || t.includes('roar')) return '📣';
  if (t.includes('heal') || t.includes('life')) return '💚';
  if (t.includes('curse') || t.includes('poison') || t.includes('debuff')) return '☠️';
  if (t.includes('drain') || t.includes('steal')) return '🌀';
  if (intent.dmg > 0) {
    if (intent.dmg >= 20) return '💥';
    if (intent.dmg >= 12) return '⚔️';
    return '🗡️';
  }
  return '❓';
}

function _formatIntentLabel(intent) {
  let text = String(intent?.intent || '?');
  if (intent?.dmg > 0) {
    // 숫자만 있는 경우(데미지만 있는 경우) 빈 문자열 반환 (아이콘과 큰 데미지 숫자가 대체)
    if (/^\d+$/.test(text.trim())) return '';

    // "공격 20" 형태에서 숫자 제거 (데미지가 하단에 크게 표시되므로)
    const dmgPattern = new RegExp(`\\s+${intent.dmg}$`);
    if (dmgPattern.test(text)) {
      text = text.replace(dmgPattern, '').trim();
    }
  }

  // "피해" 텍스트 중복 제거 (이미 툴팁이나 별도 피해 숫자가 있으므로)
  text = text.replace(/피해/g, '').trim();

  // 유틸리티를 사용하여 키워드 하이라이트 적용 (innerHTML로 사용될 예정)
  return window.DescriptionUtils ? window.DescriptionUtils.highlight(text) : text;
}

function _resolveIntentDescription(intent) {
  const text = `${intent?.type || ''} ${intent?.intent || ''}`.toLowerCase();
  for (const [key, info] of Object.entries(INTENT_DESCRIPTIONS)) {
    if (text.includes(key)) return info;
  }
  if ((intent?.dmg || 0) > 0) return INTENT_DESCRIPTIONS.attack;
  return { type: _formatIntentLabel(intent), desc: '이 적의 다음 행동 패턴입니다.' };
}

function _enemyHpColor(pct) {
  if (pct > 60) return 'linear-gradient(90deg,#cc2244,#ff4466)';
  if (pct > 30) return 'linear-gradient(90deg,#cc5500,#ff8800)';
  return 'linear-gradient(90deg,#8b0000,#ff2200)';
}

function _renderEnemyStatuses(statusEffects, doc) {
  const statusEntries = statusEffects ? Object.entries(statusEffects) : [];
  const fragment = doc.createDocumentFragment();

  statusEntries.forEach(([s, d]) => {
    const kr = ENEMY_STATUS_KR[s] || s;
    const icon = ENEMY_STATUS_DESC[s]?.icon || '💫';
    const col = ['weakened', 'poisoned', 'burning', 'cursed', 'marked'].includes(s) ? '#ff6688' : '#88ccff';
    const duration = d > 1 ? `(${d})` : '';

    const badge = doc.createElement('span');
    badge.className = 'enemy-status-badge';
    badge.style.cssText = `font-size:9px;background:rgba(255,255,255,0.05);border-radius:3px;padding:1px 4px;color:${col};cursor:help;`;
    badge.textContent = `${icon} ${kr}${duration}`;

    badge.addEventListener('mouseenter', (e) => CombatUI.showEnemyStatusTooltip(e, s, { doc }));
    badge.addEventListener('mouseleave', () => CombatUI.hideEnemyStatusTooltip({ doc }));

    fragment.appendChild(badge);
    // Add a space between badges
    fragment.appendChild(doc.createTextNode(' '));
  });

  return fragment;
}

function _calcSelectedPreview(gs, data, enemy) {
  if (!gs?.combat?.playerTurn) return null;
  const atkCards = gs.player.hand.filter(id => {
    const c = data.cards[id];
    if (!c || c.type !== 'ATTACK' || !c.dmg) return false;
    return window.CardCostUtils.canPlay(id, c, gs.player);
  });
  if (!atkCards.length) return null;

  const totalDmg = atkCards.reduce((sum, id) => {
    const c = data.cards[id];
    const momBonus = gs.getBuff('momentum')?.dmgBonus || 0;
    return sum + (c.dmg || 0) + momBonus;
  }, 0);
  const enemyShield = enemy.shield || 0;
  const netDmg = Math.max(0, totalDmg - enemyShield);
  return { netDmg, enemyShield };
}

function _renderSelectedPreviewHtml(preview, card, doc) {
  if (!preview) return;
  const cls = preview.netDmg > preview.enemyShield ? 'enemy-dmg-preview hp-hit' : 'enemy-dmg-preview shield-only';
  const previewDiv = doc.createElement('div');
  previewDiv.className = cls;
  previewDiv.textContent = preview.enemyShield > 0
    ? `⚔ 예상 피해 ${preview.netDmg} (방어막 ${preview.enemyShield})`
    : `⚔ 예상 총 피해 ${preview.netDmg}`;
  card.appendChild(previewDiv);
}

function _renderSelectedPreviewText(preview) {
  if (!preview) return '';
  return preview.enemyShield > 0
    ? `⚔ 예상 피해 ${preview.netDmg} (방어막 ${preview.enemyShield})`
    : `⚔ 예상 총 피해 ${preview.netDmg}`;
}

export const CombatUI = {
  showEnemyStatusTooltip(event, statusKey, deps = {}) {
    const doc = _getDoc(deps);
    const win = _getWin(deps);

    clearTimeout(_enemyStatusTipTimer);

    const status = ENEMY_STATUS_DESC[statusKey];
    if (!status) return;

    let el = doc.getElementById('enemyStatusTooltip');
    if (!el) {
      el = doc.createElement('div');
      el.id = 'enemyStatusTooltip';
      doc.body.appendChild(el);
    }

    el.textContent = '';
    const title = doc.createElement('div');
    title.className = 'est-title';
    title.textContent = `${status.icon} ${ENEMY_STATUS_KR[statusKey] || statusKey}`;

    const desc = doc.createElement('div');
    desc.className = 'est-desc';
    desc.textContent = status.desc;

    el.append(title, desc);

    const rect = event.currentTarget.getBoundingClientRect();
    let x = rect.right + 10;
    let y = rect.top;
    if (x + 200 > win.innerWidth) x = rect.left - 210;
    if (y + 80 > win.innerHeight) y = win.innerHeight - 85;

    el.style.left = `${Math.max(6, x)}px`;
    el.style.top = `${Math.max(6, y)}px`;
    el.classList.add('visible');
  },

  hideEnemyStatusTooltip(deps = {}) {
    const doc = _getDoc(deps);
    _enemyStatusTipTimer = setTimeout(() => {
      doc.getElementById('enemyStatusTooltip')?.classList.remove('visible');
    }, 80);
  },

  showIntentTooltip(event, enemyIdx, deps = {}) {
    const gs = deps.gs;
    if (!gs?.combat?.enemies) return;

    const doc = _getDoc(deps);
    const win = _getWin(deps);

    clearTimeout(_intentTipTimer);
    const idx = Number(enemyIdx);
    if (!Number.isFinite(idx)) return;
    const enemy = gs.combat.enemies[idx];
    if (!enemy?.ai) return;

    let intent;
    try { intent = enemy.ai(gs.combat.turn); } catch (e) { intent = { intent: '?', dmg: 0 }; }

    // 전투 첫 턴(turn === 0): 아직 행동이 없으므로 표시 차단 (일반적으로 1부터 시작)
    if (gs.combat.turn <= 0) return;

    const icon = _getIntentIcon(intent);
    const label = _formatIntentLabel(intent);
    const descInfo = _resolveIntentDescription(intent);

    let el = doc.getElementById('intentTooltip');
    if (!el) {
      el = doc.createElement('div');
      el.id = 'intentTooltip';
      doc.body.appendChild(el);
    }

    el.textContent = '';

    const title = doc.createElement('div');
    title.className = 'itt-title';
    title.innerHTML = `${icon} ${label}`;

    const type = doc.createElement('div');
    type.className = 'itt-type';
    type.textContent = `— ${descInfo.type} —`;

    const desc = doc.createElement('div');
    desc.className = 'itt-desc';
    if (window.DescriptionUtils) {
      desc.innerHTML = window.DescriptionUtils.highlight(descInfo.desc);
    } else {
      desc.textContent = descInfo.desc;
    }

    el.append(title, type, desc);

    if (intent.dmg > 0) {
      const dmg = doc.createElement('div');
      dmg.className = 'itt-dmg';
      dmg.innerHTML = `💢 예상 피해: <strong>${intent.dmg}</strong>`;
      el.appendChild(dmg);
    }

    const rect = event.currentTarget.getBoundingClientRect();
    let x = rect.right + 12;
    let y = rect.top;
    if (x + 240 > win.innerWidth) x = rect.left - 244;
    if (y + 190 > win.innerHeight) y = win.innerHeight - 194;
    y = Math.max(10, y);

    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.classList.add('visible');
  },

  hideIntentTooltip(deps = {}) {
    const doc = _getDoc(deps);
    _intentTipTimer = setTimeout(() => {
      doc.getElementById('intentTooltip')?.classList.remove('visible');
    }, 80);
  },

  renderCombatEnemies(deps = {}) {
    const gs = deps.gs;
    const data = deps.data;
    if (!gs?.combat?.enemies || !data?.cards) return;

    const doc = _getDoc(deps);
    const zone = doc.getElementById('enemyZone');
    if (!zone) return;

    const selectTargetHandlerName = deps.selectTargetHandlerName || 'selectTarget';
    const showIntentTooltipHandlerName = deps.showIntentTooltipHandlerName || 'showIntentTooltip';
    const hideIntentTooltipHandlerName = deps.hideIntentTooltipHandlerName || 'hideIntentTooltip';

    const existing = zone.querySelectorAll('.enemy-card');
    const expectedCount = gs.combat.enemies.length;
    // 상태 이상 변경 시에도 전체 렌더링 수행
    const needsFullRender = deps.forceFullRender || existing.length !== expectedCount || existing.length === 0;

    if (needsFullRender) {
      zone.textContent = '';
      gs.combat.enemies.forEach((e, i) => {
        if (!e || !e.ai) return;

        const hpPct = Math.max(0, (e.hp / e.maxHp) * 100);
        let intent;
        try { intent = e.ai(gs.combat.turn); } catch (err) { intent = { intent: '?', dmg: 0 }; }

        const isSelected = gs._selectedTarget === i && e.hp > 0;

        const card = doc.createElement('div');
        card.id = `enemy_${i}`;
        card.className = `enemy-card${e.hp <= 0 ? ' dead' : ''}${isSelected ? ' selected-target' : ''}${e.isBoss ? ' boss' : ''}`;

        const deadStyle = e.hp <= 0 ? 'opacity:0.3;filter:grayscale(1);pointer-events:none;' : '';
        const selStyle = isSelected ? 'outline:2px solid var(--cyan);box-shadow:0 0 18px rgba(0,255,204,0.45);' : '';
        card.style.cssText = `${deadStyle}${selStyle}cursor:${e.hp > 0 ? 'pointer' : 'default'};`;

        if (e.hp > 0) {
          card.addEventListener('click', () => {
            const handler = window[selectTargetHandlerName];
            if (typeof handler === 'function') handler(i);
          });
        }

        if (isSelected) {
          const targetLabel = doc.createElement('div');
          targetLabel.className = 'target-label-anim';
          const v = doc.createElement('span'); v.textContent = '▼';
          const t = doc.createElement('span'); t.textContent = 'TARGET';
          targetLabel.append(v, t);
          card.appendChild(targetLabel);
        }

        const sprite = doc.createElement('div');
        sprite.id = `enemy_sprite_${i}`;
        sprite.className = 'enemy-sprite';
        const spriteIcon = doc.createElement('span');
        spriteIcon.style.fontSize = '64px';
        spriteIcon.textContent = e.icon || '👾';
        sprite.appendChild(spriteIcon);
        card.appendChild(sprite);

        const name = doc.createElement('div');
        name.className = 'enemy-name';
        name.textContent = e.name;
        if (e.isBoss) {
          const phase = doc.createElement('span');
          phase.style.color = 'var(--gold)';
          phase.textContent = ` ✦ P${e.phase || 1}`;
          name.appendChild(phase);
        }
        card.appendChild(name);

        if (e.isBoss) {
          const phaseBar = doc.createElement('div');
          phaseBar.className = 'boss-phase-bar';
          phaseBar.style.marginBottom = '2px';

          const seg = doc.createElement('div');
          seg.className = 'boss-phase-segment';
          seg.style.cssText = 'left:50%;width:50%;background:rgba(255,100,0,0.2);';

          const fill = doc.createElement('div');
          fill.id = `enemy_hpfill_${i}`;
          fill.className = 'boss-phase-fill';
          fill.style.width = `${hpPct}%`;

          phaseBar.append(seg, fill);
          card.appendChild(phaseBar);

          const phaseDots = doc.createElement('div');
          phaseDots.style.cssText = 'display:flex;gap:4px;justify-content:center;margin-bottom:2px;';
          for (let p = 1; p <= (e.maxPhase || 2); p++) {
            const dot = doc.createElement('div');
            const isActive = p <= (e.phase || 1);
            dot.style.cssText = `width:6px;height:6px;border-radius:50%;background:${isActive ? 'var(--gold)' : 'rgba(255,255,255,0.1)'};box-shadow:${isActive ? '0 0 6px rgba(240,180,41,0.6)' : 'none'};`;
            phaseDots.appendChild(dot);
          }
          card.appendChild(phaseDots);
        } else {
          const hpBar = doc.createElement('div');
          hpBar.className = 'enemy-hp-bar';
          const fill = doc.createElement('div');
          fill.id = `enemy_hpfill_${i}`;
          fill.className = 'enemy-hp-fill';
          fill.style.cssText = `width:${hpPct}%;background:${_enemyHpColor(hpPct)};`;
          hpBar.appendChild(fill);
          card.appendChild(hpBar);
        }

        const hpText = doc.createElement('div');
        hpText.id = `enemy_hptext_${i}`;
        hpText.style.cssText = "font-family:'Share Tech Mono',monospace;font-size:11px;color:var(--text-dim);";
        hpText.textContent = `${e.hp} / ${e.maxHp}${e.shield ? ` 🛡️${e.shield}` : ''}`;
        card.appendChild(hpText);

        const intentEl = doc.createElement('div');
        intentEl.id = `enemy_intent_${i}`;
        intentEl.className = 'enemy-intent';

        let intentIcon = _getIntentIcon(intent);
        let intentLabel = _formatIntentLabel(intent);
        let intentDmgVal = intent.dmg;

        if (gs.combat.turn <= 0) {
          intentIcon = '❓';
          intentLabel = '알 수 없음';
          intentDmgVal = 0;
        }

        const iconSpan = doc.createElement('span'); iconSpan.textContent = intentIcon;
        const labelSpan = doc.createElement('span'); labelSpan.innerHTML = intentIcon + ' ' + intentLabel;
        intentEl.append(labelSpan);
        if (intentDmgVal > 0) {
          const dmgDiv = doc.createElement('div');
          dmgDiv.className = 'enemy-intent-dmg';
          dmgDiv.textContent = intentDmgVal;
          intentEl.appendChild(dmgDiv);
        }

        intentEl.addEventListener('mouseenter', ev => this.showIntentTooltip(ev, i, deps));
        intentEl.addEventListener('mouseleave', () => this.hideIntentTooltip(deps));
        card.appendChild(intentEl);

        const statusCont = doc.createElement('div');
        statusCont.id = `enemy_status_${i}`;
        statusCont.style.cssText = 'display:flex;gap:3px;flex-wrap:wrap;justify-content:center;margin-top:4px;';
        statusCont.appendChild(_renderEnemyStatuses(e.statusEffects, doc));
        card.appendChild(statusCont);

        const preview = isSelected ? _calcSelectedPreview(gs, data, e) : null;
        if (preview) {
          const previewEl = doc.createElement('div');
          previewEl.className = 'enemy-dmg-preview';
          previewEl.textContent = _renderSelectedPreviewText(preview);
          card.appendChild(previewEl);
        }

        zone.appendChild(card);
      });
    } else {
      gs.combat.enemies.forEach((e, i) => {
        if (!e) return;

        const hpPct = Math.max(0, (e.hp / e.maxHp) * 100);
        const fill = doc.getElementById(`enemy_hpfill_${i}`);
        const txt = doc.getElementById(`enemy_hptext_${i}`);
        const intentEl = doc.getElementById(`enemy_intent_${i}`);
        const statusEl = doc.getElementById(`enemy_status_${i}`);
        const card = doc.getElementById(`enemy_${i}`);

        if (fill) {
          fill.style.width = `${hpPct}%`;
          if (!e.isBoss) fill.style.background = _enemyHpColor(hpPct);
        }
        if (txt) txt.textContent = `${e.hp} / ${e.maxHp}${e.shield ? ` 🛡️${e.shield}` : ''}`;

        if (intentEl) {
          let intent;
          try { intent = e.ai(gs.combat.turn); } catch (err) { intent = { intent: '?', dmg: 0 }; }
          let intentIcon = _getIntentIcon(intent);
          let intentLabel = _formatIntentLabel(intent);

          intentEl.textContent = '';
          const iconDiv = doc.createElement('div');
          iconDiv.className = 'enemy-intent-icon';
          iconDiv.textContent = intentIcon;

          const labelDiv = doc.createElement('div');
          labelDiv.className = 'enemy-intent-label';
          labelDiv.textContent = intentLabel;

          const dmgDiv = doc.createElement('div');
          dmgDiv.className = 'enemy-intent-dmg';
          if (intent.dmg > 0) {
            const dmgSpan = doc.createElement('span');
            dmgSpan.style.cssText = 'color:var(--danger);font-size:16px;font-weight:900;';
            dmgSpan.textContent = intent.dmg;
            dmgDiv.appendChild(dmgSpan);
          }

          intentEl.append(iconDiv, labelDiv, dmgDiv);
          intentEl.addEventListener('mouseenter', ev => this.showIntentTooltip(ev, i, deps));
          intentEl.addEventListener('mouseleave', () => this.hideIntentTooltip(deps));
        }

        if (statusEl) {
          statusEl.textContent = '';
          statusEl.appendChild(_renderEnemyStatuses(e.statusEffects, doc));
        }

        if (card && e.hp <= 0) {
          card.style.opacity = '0.3';
          card.style.filter = 'grayscale(1)';
          card.style.pointerEvents = 'none';
          card.style.outline = '';
        }

        if (card && e.hp > 0) {
          const isSel = gs._selectedTarget === i;
          card.classList.toggle('selected-target', isSel);

          // 타겟 라벨 관리 (이동)
          let labelEl = card.querySelector('.target-label-anim');
          if (isSel) {
            if (!labelEl) {
              labelEl = doc.createElement('div');
              labelEl.className = 'target-label-anim';

              const v = doc.createElement('span');
              v.textContent = '▼';
              const t = doc.createElement('span');
              t.textContent = 'TARGET';

              labelEl.append(v, t);
              card.prepend(labelEl);
            }
          } else {
            labelEl?.remove();
            card.style.outline = '';
            card.style.boxShadow = '';
          }

          let previewEl = card.querySelector('.enemy-dmg-preview');
          if (isSel && gs.combat.playerTurn) {
            const preview = _calcSelectedPreview(gs, data, e);
            if (preview) {
              if (!previewEl) {
                previewEl = doc.createElement('div');
                previewEl.className = 'enemy-dmg-preview';
                card.appendChild(previewEl);
              }
              previewEl.textContent = _renderSelectedPreviewText(preview);
            } else {
              previewEl?.remove();
            }
          } else {
            previewEl?.remove();
          }
        }
      });
    }
  },

  updateEnemyHpUI(idx, enemy, deps = {}) {
    if (!enemy) return;
    const doc = _getDoc(deps);
    const hpPct = Math.max(0, (enemy.hp / enemy.maxHp) * 100);
    const fill = doc.getElementById(`enemy_hpfill_${idx}`);
    const txt = doc.getElementById(`enemy_hptext_${idx}`);
    const card = doc.getElementById(`enemy_${idx}`);

    if (fill) {
      fill.style.width = `${hpPct}%`;
      if (!enemy.isBoss) fill.style.background = _enemyHpColor(hpPct);
    }
    if (txt) txt.textContent = `${enemy.hp} / ${enemy.maxHp}${enemy.shield ? ` 🛡️${enemy.shield}` : ''}`;
    if (card && enemy.hp <= 0) {
      card.style.opacity = '0.3';
      card.style.filter = 'grayscale(1)';
      card.style.pointerEvents = 'none';
    }
  },

  // Expose public API for GAME.API
  api: {
    updateCombatUI: (deps) => CombatUI.updateCombatUI(deps),
    showIntentTooltip: (event, idx, deps) => CombatUI.showIntentTooltip(event, idx, deps),
    hideIntentTooltip: (deps) => CombatUI.hideIntentTooltip(deps),
    renderCombatEnemies: (deps) => CombatUI.renderCombatEnemies(deps),
  }
};
