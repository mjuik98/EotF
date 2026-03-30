import {
  createActionButton,
  createActionsRow,
  createOverlayShell,
  createTextBlock,
} from './help_pause_modal_frame.js';

export function createPauseMenu(doc, gs, deps, callbacks) {
  const { overlay, panel, body, footer } = createOverlayShell(doc, {
    id: 'pauseMenu',
    overlayClassName: 'hp-overlay-pause',
    panelClassName: 'hp-panel-pause gm-modal-accent-echo',
    eyebrow: 'PAUSE',
    title: '일시정지',
    subtitle: '전투 흐름과 보조 오버레이를 여기서 정리합니다',
  });

  panel.className += ' hp-panel-tall';
  const mainBtns = createTextBlock(doc, {
    className: 'hp-menu-actions',
  });

  const resBtn = createActionButton(doc, {
    id: 'pauseResumeBtn',
    className: 'action-btn-primary hp-action-strong',
    text: '계속하기',
    onClick: callbacks.onResume,
  });

  const midRow = createActionsRow(doc, 'hp-menu-split');
  const deckBtn = createActionButton(doc, {
    id: 'pauseOpenDeckBtn',
    className: 'action-btn-secondary',
    text: '덱 보기',
    onClick: callbacks.onOpenDeck,
  });
  const codexBtn = createActionButton(doc, {
    id: 'pauseOpenCodexBtn',
    className: 'action-btn-secondary',
    text: '도감',
    onClick: callbacks.onOpenCodex,
  });
  midRow.append(deckBtn, codexBtn);

  const settingsBtn = createActionButton(doc, {
    id: 'pauseOpenSettingsBtn',
    className: 'action-btn-secondary',
    text: '환경 설정',
    onClick: callbacks.onOpenSettings,
  });

  const helpBtn = createActionButton(doc, {
    id: 'pauseOpenHelpBtn',
    className: 'action-btn-secondary hp-action-cyan',
    text: '컨트롤 안내 (?)',
    onClick: callbacks.onOpenHelp,
  });

  const abandonBtn = createActionButton(doc, {
    id: 'pauseAbandonBtn',
    className: 'action-btn-end',
    text: '런 포기하기',
    onClick: callbacks.onAbandon,
  });

  const startBtn = createActionButton(doc, {
    id: 'pauseReturnTitleBtn',
    className: 'hp-action-subtle',
    text: '처음으로',
    onClick: callbacks.onReturnToTitle,
  });

  const quitBtn = createActionButton(doc, {
    id: 'pauseQuitGameBtn',
    className: 'hp-action-subtle hp-action-danger',
    text: '게임 종료',
    onClick: callbacks.onQuitGame,
  });

  mainBtns.append(resBtn, midRow, settingsBtn, helpBtn, abandonBtn, startBtn, quitBtn);
  body.appendChild(mainBtns);

  footer.appendChild(createTextBlock(doc, {
    className: 'hp-menu-meta',
    text: `총 ${gs.meta.runCount}회차 | 지역 ${gs.currentRegion + 1} | ${gs.currentFloor}층 | 스토리 조각 ${gs.meta.storyPieces.length}/10`,
  }));

  return overlay;
}
