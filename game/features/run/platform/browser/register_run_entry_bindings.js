import { playUiClick, playUiFootstep } from '../../ports/public_audio_runtime_capabilities.js';
import { bindTooltipTrigger } from '../../../../shared/ui/tooltip/public.js';

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
    const showEchoTooltip = (event) => actions.showEchoSkillTooltip?.({
      ...event,
      currentTarget: event?.currentTarget || echoButton,
      target: event?.target || event?.currentTarget || echoButton,
    });
    const hideEchoTooltip = () => actions.hideEchoSkillTooltip?.();
    echoButton.addEventListener('click', () => {
      actions.useEchoSkill?.();
      feedbackUI?.triggerEchoButtonEffect?.('useEchoSkillBtn', { doc: resolvedDoc });
    });
    bindTooltipTrigger(echoButton, {
      label: echoButton.getAttribute?.('aria-label') || '에코 스킬 설명',
      show: showEchoTooltip,
      hide: hideEchoTooltip,
    });
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

  resolvedDoc.addEventListener('click', (event) => {
    if (event.target?.closest?.('#rewardSkipInitBtn')) {
      playUiClick(audio);
      actions.showSkipConfirm?.();
      return;
    }
    if (event.target?.closest?.('#rewardSkipConfirmBtn')) {
      playUiClick(audio);
      actions.skipReward?.();
      return;
    }
    if (event.target?.closest?.('#rewardSkipCancelBtn')) {
      playUiClick(audio);
      actions.hideSkipConfirm?.();
      return;
    }
    const deckFilterButton = event.target?.closest?.('.deck-filter-btn');
    if (deckFilterButton) {
      playUiClick(audio);
      actions.setDeckFilter?.(deckFilterButton.dataset.filter);
      return;
    }
    if (event.target?.closest?.('#deckViewCloseBtn')) {
      playUiClick(audio);
      actions.closeDeckView?.();
      return;
    }
    if (event.target?.closest?.('#closeBattleChronicleBtn')) {
      playUiClick(audio);
      actions.closeBattleChronicle?.();
    }
  });
}
