import { playUiClick, playUiFootstep } from '../../../domain/audio/audio_event_helpers.js';

function bindClick(doc, id, handler) {
  doc?.getElementById?.(id)?.addEventListener?.('click', handler);
}

function playFootstep(audio) {
  return playUiFootstep(audio);
}

export function registerRunEntryBindings({
  actions,
  audio,
  doc = null,
  feedbackUI = null,
  mazeSystem = null,
}) {
  const resolvedDoc = doc || (typeof document !== 'undefined' ? document : null);
  if (!resolvedDoc) return;

  bindClick(resolvedDoc, 'mazeMinimapCanvas', (event) => {
    event.stopPropagation?.();
    actions.showFullMap?.();
  });

  const moveMaze = (dx, dy) => {
    audio?.resume?.();
    playFootstep(audio);
    mazeSystem?.move?.(dx, dy);
  };

  bindClick(resolvedDoc, 'mazeMoveUp', () => moveMaze(0, -1));
  bindClick(resolvedDoc, 'mazeMoveLeft', () => moveMaze(-1, 0));
  bindClick(resolvedDoc, 'mazeMoveDown', () => moveMaze(0, 1));
  bindClick(resolvedDoc, 'mazeMoveRight', () => moveMaze(1, 0));

  const echoButton = resolvedDoc.getElementById('useEchoSkillBtn');
  if (echoButton) {
    echoButton.addEventListener('click', () => {
      actions.useEchoSkill?.();
      feedbackUI?.triggerEchoButtonEffect?.('useEchoSkillBtn', { doc: resolvedDoc });
    });
    echoButton.addEventListener('mouseenter', (event) => actions.showEchoSkillTooltip?.(event));
    echoButton.addEventListener('mouseleave', () => actions.hideEchoSkillTooltip?.());
  }

  bindClick(resolvedDoc, 'combatDrawCardBtn', () => {
    actions.drawCard?.();
    feedbackUI?.triggerDrawButtonEffect?.('combatDrawCardBtn', { doc: resolvedDoc });
  });
  bindClick(resolvedDoc, 'endPlayerTurnBtn', () => actions.endPlayerTurn?.());
  bindClick(resolvedDoc, 'showBattleChronicleBtn', () => {
    playUiClick(audio);
    actions.toggleBattleChronicle?.();
  });
  bindClick(resolvedDoc, 'closeBattleChronicleBtn', () => {
    playUiClick(audio);
    actions.closeBattleChronicle?.();
  });

  resolvedDoc.addEventListener('keydown', (event) => {
    if (event.key === 'l' || event.key === 'L') {
      const combatOverlay = resolvedDoc.getElementById('combatOverlay');
      if (combatOverlay?.classList?.contains('active')) {
        actions.toggleBattleChronicle?.();
      }
    }
  });

  bindClick(resolvedDoc, 'rewardSkipInitBtn', () => {
    playUiClick(audio);
    actions.showSkipConfirm?.();
  });
  bindClick(resolvedDoc, 'rewardSkipConfirmBtn', () => {
    playUiClick(audio);
    actions.skipReward?.();
  });
  bindClick(resolvedDoc, 'rewardSkipCancelBtn', () => {
    playUiClick(audio);
    actions.hideSkipConfirm?.();
  });

  resolvedDoc.querySelectorAll?.('.deck-filter-btn')?.forEach?.((button) => {
    button.addEventListener('click', () => {
      playUiClick(audio);
      actions.setDeckFilter?.(button.dataset.filter);
    });
  });
  bindClick(resolvedDoc, 'deckViewCloseBtn', () => {
    playUiClick(audio);
    actions.closeDeckView?.();
  });

  resolvedDoc.querySelectorAll?.('.codex-tab-btn')?.forEach?.((button) => {
    button.addEventListener('click', () => {
      playUiClick(audio);
      actions.setCodexTab?.(button.dataset.tab);
    });
  });
  bindClick(resolvedDoc, 'codexCloseBtn', () => {
    playUiClick(audio);
    actions.closeCodex?.();
  });
}
