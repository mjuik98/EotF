import { DescriptionUtils } from '../../utils/description_utils.js';
import { CardCostUtils } from '../../utils/card_cost_utils.js';
import { calcSelectedPreview, enemyHpColor, selectedPreviewText } from './combat_render_helpers.js';
import { StatusTooltipUI } from './status_tooltip_builder.js';
import { DEBUFF_STATUS_KEYS } from '../../../data/status_key_data.js';


const INTENT_DESCRIPTIONS = {
  attack: { type: '공격', desc: '플레이어에게 피해를 줍니다.' },
  heavy: { type: '강공격', desc: '단일 대상에게 큰 피해를 줍니다.' },
  double: { type: '연속 공격', desc: '여러 번 피해를 줍니다.' },
  aoe: { type: '광역 공격', desc: '모든 대상에게 피해를 줍니다.' },
  guard: { type: '방어', desc: '방어막을 얻습니다.' },
  barrier: { type: '방벽', desc: '강력한 방벽을 생성합니다.' },
  shield: { type: '보호막', desc: '방어막으로 피해를 줄입니다.' },
  curse: { type: '저주', desc: '플레이어에게 해로운 효과를 부여합니다.' },
  poison: { type: '중독', desc: '턴 시작 시 독 스택 × 5 피해를 줍니다.' },
  weaken: { type: '약화', desc: '공격력을 감소시킵니다.' },
  debuff: { type: '약화 효과', desc: '해로운 상태이상을 부여합니다.' },
  stun: { type: '기절', desc: '다음 행동을 건너뜁니다.' },
  mark: { type: '표식', desc: '추가 피해를 받도록 표식을 남깁니다.' },
  burning: { type: '화상', desc: '지속적인 화상 피해를 줍니다.' },
  heal: { type: '치유', desc: '체력을 회복합니다.' },
  life: { type: '흡혈', desc: '피해를 주고 체력을 회복합니다.' },
  drain: { type: '흡수', desc: '플레이어의 자원을 흡수합니다.' },
  summon: { type: '소환', desc: '추가 적을 소환합니다.' },
  enrage: { type: '격노', desc: '다음 공격력이 증가합니다.' },
};

export const ENEMY_STATUS_KR = {
  stunned: '기절',
  weakened: '약화',
  poisoned: '독',
  marked: '표식',
  branded: '낙인',
  mirror: '반사',
  immune: '무적',
  slowed: '감속',
  burning: '화상',
  abyss_regen: '심연 재생',
  draw_block: '드로우 간섭',
  doom: '파멸',
  cursed: '저주',
  dodge: '회피',
  thorns: '가시',
};

export const ENEMY_STATUS_DESC = {
  stunned: { icon: '⏸', desc: '다음 행동을 건너뜁니다.' },
  weakened: { icon: '🪶', desc: '가하는 피해가 감소합니다.' },
  poisoned: { icon: '☠', desc: '턴 시작 시 독 스택 × 5 피해를 입습니다.' },
  marked: { icon: '🎯', desc: '표식이 터질 때 추가 피해를 입습니다.' },
  branded: { icon: '🕯', desc: '이 적을 공격하면 공격자가 체력을 회복합니다.' },
  mirror: { icon: '🪞', desc: '받는 피해를 반사합니다.' },
  immune: { icon: '🛡', desc: '받는 피해를 무시합니다.' },
  slowed: { icon: '🐢', desc: '행동이 지연됩니다.' },
  burning: { icon: '🔥', desc: '매 턴 화상 피해를 입습니다.' },
  abyss_regen: { icon: '💚', desc: '턴 시작마다 체력을 회복합니다.' },
  draw_block: { icon: '🕳️', desc: '플레이어의 턴 시작 드로우 수를 1 감소시킵니다.' },
  doom: { icon: '☠️', desc: '카운트다운이 끝나면 플레이어에게 큰 피해를 줍니다.' },
  cursed: { icon: '🕸', desc: '저주 페널티를 받습니다.' },
  dodge: { icon: '💨', desc: '다음 공격을 회피합니다.' },
  thorns: { icon: '🌵', desc: '근접 공격자에게 피해를 반사합니다.' },
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
  const t = String(intent.type || '').toLowerCase();
  if (t === 'stunned' || t === 'stun') return '⏸';
  if (t.includes('dodge') || t.includes('phase')) return '💨';
  if (t.includes('guard') || t.includes('barrier') || t.includes('shield')) return '🛡';
  if (t.includes('howl') || t.includes('roar')) return '🐺';
  if (t.includes('heal') || t.includes('life')) return '💚';
  if (t.includes('curse') || t.includes('poison') || t.includes('debuff')) return '☠';
  if (t.includes('drain') || t.includes('steal')) return '🩸';
  if (intent.dmg > 0) {
    if (intent.dmg >= 20) return '💥';
    if (intent.dmg >= 12) return '⚔';
    return '🗡';
  }
  return '❓';
}

function _formatIntentLabel(intent) {
  if (typeof intent?.intent === 'function') {
    return '의도 파악 불가';
  }
  let text = String(intent?.intent || '?');
  if (intent?.dmg > 0) {
    if (/^\d+$/.test(text.trim())) return '공격';
    const dmgPattern = new RegExp(`\\s+${intent.dmg}$`);
    if (dmgPattern.test(text)) {
      text = text.replace(dmgPattern, '').trim();
    }
  }

  text = text.replace(/damage/gi, '').trim();
  return DescriptionUtils.highlight(text);
}

function _resolveIntentDescription(intent) {
  const text = `${intent?.type || ''} ${intent?.intent || ''}`.toLowerCase();
  for (const [key, info] of Object.entries(INTENT_DESCRIPTIONS)) {
    if (text.includes(key)) return info;
  }
  if ((intent?.dmg || 0) > 0) return INTENT_DESCRIPTIONS.attack;
  const rawLabel = String(intent?.intent || intent?.type || '의도')
    .replace(/<[^>]*>/g, '')
    .trim();
  return { type: rawLabel || '의도', desc: '적의 다음 행동 정보입니다.' };
}

function _enemyHpColor(pct) {
  return enemyHpColor(pct);
}

function _renderEnemyStatuses(statusEffects, doc) {
  const statusEntries = statusEffects ? Object.entries(statusEffects) : [];
  const fragment = doc.createDocumentFragment();

  statusEntries.forEach(([s, d]) => {
    if (s === 'poisonDuration') return; // 내부 변수는 배지로 표시하지 않음

    const kr = ENEMY_STATUS_KR[s] || s;
    const icon = ENEMY_STATUS_DESC[s]?.icon || '🪶';
    const col = DEBUFF_STATUS_KEYS.includes(s)
      ? '#ff6688'
      : '#88ccff';

    // 독은 별도의 poisonDuration 변수를 사용
    let displayDuration = d;
    if (s === 'poisoned' && statusEffects.poisonDuration !== undefined) {
      displayDuration = statusEffects.poisonDuration;
    }

    const durationText = displayDuration > 1 ? `(${displayDuration})` : '';

    const badge = doc.createElement('span');
    badge.className = 'enemy-status-badge';
    badge.style.cssText = `font-size:9px;background:rgba(255,255,255,0.05);border-radius:3px;padding:1px 4px;color:${col};cursor:help;`;
    badge.textContent = `${icon} ${kr}${durationText}`;

    // 툴팁 호출 시 전체 statusEffects 전달 고려 (독의 경우 duration 정보가 필요하므로)
    badge.addEventListener('mouseenter', (e) => CombatUI.showEnemyStatusTooltip(e, s, d, {
      doc,
      poisonDuration: statusEffects.poisonDuration
    }));
    badge.addEventListener('mouseleave', () => CombatUI.hideEnemyStatusTooltip({ doc }));

    fragment.appendChild(badge);
    fragment.appendChild(doc.createTextNode(' '));
  });

  return fragment;
}

export function resolveEnemyStatusTooltipMetrics(_statusKey, statusValue) {
  const value = Number(statusValue);
  if (!Number.isFinite(value) || value <= 0) {
    return { duration: '-', stacks: '-' };
  }

  const normalized = Math.floor(value);
  const duration = normalized >= 99 ? '무한' : `${normalized}턴`;
  return {
    duration,
    stacks: String(normalized),
  };
}

function _syncFloatingTooltipAnchors(doc) {
  const statusTip = doc.getElementById('enemyStatusTooltip');
  if (statusTip?.classList.contains('visible') && !doc.querySelector('.enemy-status-badge:hover')) {
    clearTimeout(_enemyStatusTipTimer);
    statusTip.classList.remove('visible');
  }

  const intentTip = doc.getElementById('intentTooltip');
  if (intentTip?.classList.contains('visible') && !doc.querySelector('.enemy-intent:hover')) {
    clearTimeout(_intentTipTimer);
    intentTip.classList.remove('visible');
  }
}
function _calcSelectedPreview(gs, data, enemy) {
  return calcSelectedPreview(gs, data, enemy, CardCostUtils);
}

function _renderSelectedPreviewHtml(preview, card, doc) {
  if (!preview) return;
  const cls = preview.netDmg > preview.enemyShield ? 'enemy-dmg-preview hp-hit' : 'enemy-dmg-preview shield-only';
  const previewDiv = doc.createElement('div');
  previewDiv.className = cls;
  previewDiv.textContent = preview.enemyShield > 0
    ? `예상 피해 ${preview.netDmg} (방어막 ${preview.enemyShield})`
    : `예상 총 피해 ${preview.netDmg}`;
  card.appendChild(previewDiv);
}

function _renderSelectedPreviewText(preview) {
  return selectedPreviewText(preview);
}

export const CombatUI = {
  showEnemyStatusTooltip(event, statusKey, statusValueOrDeps = null, deps = {}) {
    const statusValue = typeof statusValueOrDeps === 'number' ? statusValueOrDeps : null;
    const resolvedDeps = (statusValueOrDeps && typeof statusValueOrDeps === 'object')
      ? statusValueOrDeps
      : deps;

    const doc = resolvedDeps?.doc ?? globalThis.document;
    const win = resolvedDeps?.win ?? globalThis.window ?? globalThis;

    const statusMeta = ENEMY_STATUS_DESC[statusKey];
    if (!statusMeta) return;

    // ENEMY_STATUS_DESC 를 StatusTooltipUI 가 기대하는 infoKR 포맷으로 변환
    const infoKR = {
      icon: statusMeta.icon,
      name: ENEMY_STATUS_KR[statusKey] ?? statusKey,
      buff: !DEBUFF_STATUS_KEYS.includes(statusKey),
      desc: statusMeta.desc,
    };

    // [개선 5] 적 상태이상은 항상 '적 부여'
    const source = {
      type: 'enemy',
      label: '적 부여',
      name: '전투 중 부여됨',
      color: infoKR.buff ? '#88ccff' : '#ff6688',
    };

    StatusTooltipUI.show(event, statusKey, infoKR, statusValue, {
      rawValue: statusValue,
      source,
      doc,
      win,
      poisonDuration: resolvedDeps.poisonDuration // 추가 정보 전달
    });
  },

  hideEnemyStatusTooltip(deps = {}) {
    const doc = deps?.doc ?? globalThis.document;
    StatusTooltipUI.hide({ doc });
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
    if (enemy.statusEffects?.stunned > 0) {
      intent = { type: 'stunned', intent: '기절', dmg: 0, effect: 'stunned' };
    } else {
      try { intent = enemy.ai(gs.combat.turn); } catch (e) { intent = { intent: '?', dmg: 0 }; }
    }

    // ?꾪닾 泥???turn === 0): ?꾩쭅 ?됰룞???놁쑝誘濡??쒖떆 李⑤떒 (?쇰컲?곸쑝濡?1遺???쒖옉)
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
    type.textContent = '-- ' + String(descInfo.type || '') + ' --';

    const desc = doc.createElement('div');
    desc.className = 'itt-desc';
    desc.innerHTML = DescriptionUtils.highlight(descInfo.desc);

    el.append(title, type, desc);

    if (intent.dmg > 0) {
      const dmg = doc.createElement('div');
      dmg.className = 'itt-dmg';
      dmg.textContent = '예상 피해: ' + String(intent.dmg);
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

  cleanupAllTooltips(deps = {}) {
    const doc = _getDoc(deps);
    // ?곹깭?댁긽 ?댄똻 利됱떆 ?④?
    clearTimeout(_enemyStatusTipTimer);
    doc.getElementById('enemyStatusTooltip')?.classList.remove('visible');
    // ?섎룄 ?댄똻 利됱떆 ?④?
    clearTimeout(_intentTipTimer);
    doc.getElementById('intentTooltip')?.classList.remove('visible');
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
    // ?곹깭 ?댁긽 蹂寃??쒖뿉???꾩껜 ?뚮뜑留??섑뻾
    const needsFullRender = deps.forceFullRender || existing.length !== expectedCount || existing.length === 0;

    if (needsFullRender) {
      this.cleanupAllTooltips({ doc, win: _getWin(deps) });
      zone.textContent = '';
      gs.combat.enemies.forEach((e, i) => {
        if (!e || !e.ai) return;

        const hpPct = Math.max(0, (e.hp / e.maxHp) * 100);
        let intent;
        if (e.statusEffects?.stunned > 0) {
          intent = { type: 'stunned', intent: '기절', dmg: 0, effect: 'stunned' };
        } else {
          try { intent = e.ai(gs.combat.turn); } catch (err) { intent = { intent: '?', dmg: 0 }; }
        }

        const isSelected = gs._selectedTarget === i && e.hp > 0;

        const card = doc.createElement('div');
        card.id = `enemy_${i}`;
        card.className = `enemy-card${e.hp <= 0 ? ' dead' : ''}${isSelected ? ' selected-target' : ''}${e.isBoss ? ' boss' : ''}`;

        const deadStyle = e.hp <= 0 ? 'opacity:0.3;filter:grayscale(1);pointer-events:none;' : '';
        const selStyle = isSelected ? 'outline:2px solid var(--cyan);box-shadow:0 0 18px rgba(0,255,204,0.45);' : '';
        card.style.cssText = `${deadStyle}${selStyle}cursor:${e.hp > 0 ? 'pointer' : 'default'};`;

        if (e.hp > 0) {
          card.addEventListener('click', () => {
            const handler = deps.selectTarget || window[selectTargetHandlerName];
            if (typeof handler === 'function') handler(i);
          });
        }

        if (isSelected) {
          const targetLabel = doc.createElement('div');
          targetLabel.className = 'target-label-anim';
          const v = doc.createElement('span'); v.textContent = '▶';
          const t = doc.createElement('span'); t.textContent = 'TARGET';
          targetLabel.append(v, t);
          card.appendChild(targetLabel);
        }

        const sprite = doc.createElement('div');
        sprite.id = `enemy_sprite_${i}`;
        sprite.className = 'enemy-sprite';
        const spriteIcon = doc.createElement('span');
        spriteIcon.style.fontSize = '64px';
        spriteIcon.textContent = e.icon || '❓';
        sprite.appendChild(spriteIcon);
        card.appendChild(sprite);

        const name = doc.createElement('div');
        name.className = 'enemy-name';
        name.textContent = e.name;
        if (e.isBoss) {
          const phase = doc.createElement('span');
          phase.style.color = 'var(--gold)';
          phase.textContent = ` · P${e.phase || 1}`;
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
        hpText.textContent = `${e.hp} / ${e.maxHp}${e.shield ? ` (방어막 ${e.shield})` : ''}`;
        card.appendChild(hpText);

        const intentEl = doc.createElement('div');
        intentEl.id = `enemy_intent_${i}`;
        intentEl.className = 'enemy-intent';

        let intentIcon = _getIntentIcon(intent);
        let intentLabel = _formatIntentLabel(intent);
        let intentDmgVal = intent.dmg;

        if (gs.combat.turn <= 0) {
          intentIcon = '❓';
          intentLabel = '의도 없음';
          intentDmgVal = 0;
        }

        const iconSpan = doc.createElement('span'); iconSpan.textContent = intentIcon;
        const labelSpan = doc.createElement('span');
        // HTML 태그가 포함되어 있을 수 있으므로 innerHTML 사용하되, description_utils의 highlight 등을 고려
        labelSpan.innerHTML = intentIcon + ' ' + intentLabel;
        intentEl.append(labelSpan);
        if (intentDmgVal > 0) {
          const dmgDiv = doc.createElement('div');
          dmgDiv.className = 'enemy-intent-dmg';
          dmgDiv.textContent = intentDmgVal;
          intentEl.appendChild(dmgDiv);
        }

        intentEl.onmouseenter = ev => this.showIntentTooltip(ev, i, deps);
        intentEl.onmouseleave = () => this.hideIntentTooltip(deps);
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
        if (txt) txt.textContent = `${e.hp} / ${e.maxHp}${e.shield ? ` (방어막 ${e.shield})` : ''}`;

        if (intentEl) {
          let intent;
          if (e.statusEffects?.stunned > 0) {
            intent = { type: 'stunned', intent: '기절', dmg: 0, effect: 'stunned' };
          } else {
            try { intent = e.ai(gs.combat.turn); } catch (err) { intent = { intent: '?', dmg: 0 }; }
          }
          let intentIcon = _getIntentIcon(intent);
          let intentLabel = _formatIntentLabel(intent);

          intentEl.innerHTML = '';
          const iconSpan = doc.createElement('span');
          iconSpan.className = 'enemy-intent-icon';
          iconSpan.textContent = intentIcon;

          const labelSpan = doc.createElement('span');
          labelSpan.className = 'enemy-intent-label';
          labelSpan.innerHTML = intentLabel;

          const dmgDiv = doc.createElement('div');
          dmgDiv.className = 'enemy-intent-dmg';
          if (intent.dmg > 0) {
            dmgDiv.textContent = intent.dmg;
          }

          intentEl.append(iconSpan, labelSpan, dmgDiv);
          intentEl.onmouseenter = ev => this.showIntentTooltip(ev, i, deps);
          intentEl.onmouseleave = () => this.hideIntentTooltip(deps);
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

          // ?寃??쇰꺼 愿由?(?대룞)
          let labelEl = card.querySelector('.target-label-anim');
          if (isSel) {
            if (!labelEl) {
              labelEl = doc.createElement('div');
              labelEl.className = 'target-label-anim';

              const v = doc.createElement('span');
              v.textContent = '▶';
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

    _syncFloatingTooltipAnchors(doc);
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
    if (txt) txt.textContent = `${enemy.hp} / ${enemy.maxHp}${enemy.shield ? ` (방어막 ${enemy.shield})` : ''}`;
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
