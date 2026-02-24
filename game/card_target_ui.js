'use strict';

(function initCardTargetUI(globalObj) {
  let _dragCardId = null;
  let _dragIdx = null;

  function _getDoc(deps) {
    return deps?.doc || document;
  }

  function _getGS(deps) {
    return deps?.gs || globalObj.GS;
  }

  function _getData(deps) {
    return deps?.data || globalObj.DATA;
  }

  const CardTargetUI = {
    handleDragStart(event, cardId, idx, deps = {}) {
      _dragCardId = cardId;
      _dragIdx = idx;

      if (event?.dataTransfer) {
        event.dataTransfer.effectAllowed = 'move';
      }
      if (event?.currentTarget) {
        event.currentTarget.style.opacity = '0.5';
      }

      const doc = _getDoc(deps);
      doc.querySelectorAll('.enemy-card').forEach(el => {
        el.style.outline = '2px dashed rgba(0,255,204,0.4)';
        el.setAttribute('ondragover', 'event.preventDefault();this.style.outline="2px dashed var(--cyan)"');
        el.setAttribute('ondragleave', 'this.style.outline="2px dashed rgba(0,255,204,0.4)"');
        el.setAttribute('ondrop', `handleCardDropOnEnemy(event,${el.id.split('_')[1]})`);
      });
    },

    handleDragEnd(event, deps = {}) {
      if (event?.currentTarget) {
        event.currentTarget.style.opacity = '';
      }
      _dragCardId = null;
      _dragIdx = null;

      const doc = _getDoc(deps);
      doc.querySelectorAll('.enemy-card').forEach(el => {
        el.style.outline = '';
        el.removeAttribute('ondragover');
        el.removeAttribute('ondragleave');
        el.removeAttribute('ondrop');
      });
    },

    handleDropOnEnemy(event, enemyIdx, deps = {}) {
      if (typeof event?.preventDefault === 'function') event.preventDefault();
      if (!_dragCardId || _dragIdx === undefined || _dragIdx === null) return;

      const doc = _getDoc(deps);
      doc.querySelectorAll('.enemy-card').forEach(el => {
        el.style.outline = '';
      });

      const gs = _getGS(deps);
      const data = _getData(deps);
      if (!gs || !data?.cards) return;
      const card = data.cards[_dragCardId];
      if (!card) return;

      gs._dragTarget = enemyIdx;
      gs._selectedTarget = enemyIdx;
      try {
        gs.playCard(_dragCardId, _dragIdx);
      } finally {
        gs._dragTarget = null;
      }
    },

    selectTarget(idx, deps = {}) {
      const gs = _getGS(deps);
      if (!gs?.combat) return;
      if (!gs.combat.active || !gs.combat.playerTurn) return;

      const enemy = gs.combat.enemies[idx];
      if (!enemy || enemy.hp <= 0) return;

      if (gs._selectedTarget === idx) {
        gs._selectedTarget = null;
      } else {
        gs._selectedTarget = idx;
        gs.addLog(`🎯 ${enemy.name} 타겟 지정`, 'system');
      }

      if (typeof deps.renderCombatEnemies === 'function') {
        deps.renderCombatEnemies();
      } else if (typeof globalObj.CombatUI?.renderCombatEnemies === 'function') {
        globalObj.CombatUI.renderCombatEnemies({ gs: gs, data: data });
      }
    },
  };

  globalObj.CardTargetUI = CardTargetUI;
})(window);
