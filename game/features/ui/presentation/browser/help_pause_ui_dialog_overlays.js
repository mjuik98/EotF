import { getCurrentInputBindings } from './help_pause_keybinding_helpers.js';
import { getInputHelpEntries } from '../../ports/public_input_capabilities.js';
import {
  createActionButton,
  createActionsRow,
  createOverlayShell,
  createTextBlock,
} from './help_pause_modal_frame.js';

export function createMobileWarning(doc, onContinue) {
  const { overlay, panel, body, footer } = createOverlayShell(doc, {
    id: 'mobileWarn',
    overlayClassName: 'hp-overlay-warning',
    panelClassName: 'hp-panel-warning gm-modal-accent-cyan',
    eyebrow: 'MOBILE NOTICE',
    title: 'PC 환경 권장',
  });

  panel.className += ' hp-panel-centered';
  body.className += ' hp-body-centered';
  body.appendChild(createTextBlock(doc, {
    className: 'hp-warning-icon',
    text: '⚠️',
  }));
  body.appendChild(createTextBlock(doc, {
    className: 'hp-body-copy hp-body-copy-compact',
    html: '이 게임은 키보드와 마우스 조작 환경에 최적화되어 있습니다.<br>세로 모드 또는 모바일에서는 일부 UI가 불편할 수 있습니다.',
  }));
  footer.appendChild(createActionButton(doc, {
    id: 'mobileWarningContinueBtn',
    className: 'action-btn-primary hp-action-strong',
    text: '그래도 계속하기',
    onClick: onContinue,
  }));
  return overlay;
}

export function createHelpMenu(doc, deps, onClose) {
  const { overlay, panel, body, footer } = createOverlayShell(doc, {
    id: 'helpMenu',
    overlayClassName: 'hp-overlay-help',
    panelClassName: 'hp-panel-help gm-modal-accent-cyan',
    eyebrow: 'HELP',
    title: '컨트롤 안내',
    subtitle: '현재 키 배치 기준으로 표시됩니다',
  });

  panel.className += ' hp-panel-wide';

  const grid = createTextBlock(doc, {
    className: 'hp-help-grid',
  });

  const keyRows = getInputHelpEntries(getCurrentInputBindings())
    .map((entry) => [entry.keyLabel, entry.description]);

  keyRows.forEach(([keyLabel, description]) => {
    const keyBox = createTextBlock(doc, {
      className: 'hp-kbd-cell',
      text: keyLabel,
    });
    const valBox = createTextBlock(doc, {
      className: 'hp-help-desc',
      text: description,
    });
    grid.append(keyBox, valBox);
  });

  body.appendChild(grid);
  body.appendChild(createTextBlock(doc, {
    className: 'hp-inline-note',
    text: '잔향 등급: 30 = 1단계 | 60 = 2단계 | 100 = 3단계',
  }));
  footer.appendChild(createActionButton(doc, {
    id: 'helpCloseBtn',
    className: 'action-btn-secondary gm-close-btn gm-close-btn-footer',
    html: '닫기<span class="kbd-hint">ESC</span>',
    onClick: onClose,
  }));

  return overlay;
}

export function createAbandonConfirm(doc, onCancel, onConfirm) {
  const { overlay, panel, body, footer } = createOverlayShell(doc, {
    id: 'abandonConfirm',
    overlayClassName: 'hp-overlay-confirm hp-overlay-danger',
    panelClassName: 'hp-panel-confirm gm-modal-accent-ember',
    eyebrow: '경고',
    title: '런을 포기하시겠습니까?',
  });

  panel.className += ' hp-panel-centered';
  body.className += ' hp-body-centered';
  body.appendChild(createTextBlock(doc, {
    className: 'hp-body-copy',
    html: '현재 런의 모든 진행이 초기화됩니다.<br>세계의 기억과 조각은 보존됩니다.',
  }));

  const actions = createActionsRow(doc);
  actions.append(
    createActionButton(doc, {
      id: 'abandonConfirmCancelBtn',
      className: 'action-btn-secondary',
      text: '계속하기',
      onClick: onCancel,
    }),
    createActionButton(doc, {
      id: 'abandonConfirmSubmitBtn',
      className: 'action-btn-end hp-action-strong',
      text: '포기한다',
      onClick: onConfirm,
    }),
  );
  footer.appendChild(actions);
  return overlay;
}

export function createReturnTitleConfirm(doc, onCancel, onConfirm) {
  const { overlay, panel, body, footer } = createOverlayShell(doc, {
    id: 'returnTitleConfirm',
    overlayClassName: 'hp-overlay-confirm',
    panelClassName: 'hp-panel-confirm gm-modal-accent-echo',
    eyebrow: '확인',
    title: '타이틀로 돌아가시겠습니까?',
  });

  panel.className += ' hp-panel-centered';
  body.className += ' hp-body-centered';
  body.appendChild(createTextBlock(doc, {
    className: 'hp-body-copy',
    html: '현재 진행 상황이 저장되고 타이틀로 돌아갑니다.<br>다음에 이어하기로 재개할 수 있습니다.',
  }));

  const actions = createActionsRow(doc);
  actions.append(
    createActionButton(doc, {
      id: 'returnTitleCancelBtn',
      className: 'action-btn-secondary',
      text: '취소',
      onClick: onCancel,
    }),
    createActionButton(doc, {
      id: 'returnTitleSubmitBtn',
      className: 'action-btn-primary hp-action-strong',
      text: '타이틀로 이동',
      onClick: onConfirm,
    }),
  );
  footer.appendChild(actions);
  return overlay;
}

export function createQuitGameConfirm(doc, onCancel, onConfirm) {
  const { overlay, panel, body, footer } = createOverlayShell(doc, {
    id: 'quitGameConfirm',
    overlayClassName: 'hp-overlay-confirm hp-overlay-danger',
    panelClassName: 'hp-panel-confirm hp-panel-quit gm-modal-accent-ember',
    eyebrow: '확인',
    title: '게임을 종료하시겠습니까?',
  });

  panel.className += ' hp-panel-centered';
  body.className += ' hp-body-centered';
  body.appendChild(createTextBlock(doc, {
    className: 'hp-body-copy',
    html: '브라우저에서는 자동 종료가 제한될 수 있습니다.<br>데스크톱 래퍼가 있으면 앱 종료 요청을 우선 시도합니다.',
  }));
  body.appendChild(createTextBlock(doc, {
    id: 'quitGameStatus',
    className: 'hp-body-copy hp-body-copy-compact hp-quit-status',
    text: '',
  }));

  const actions = createActionsRow(doc);
  actions.append(
    createActionButton(doc, {
      id: 'quitGameCancelBtn',
      className: 'action-btn-secondary',
      text: '취소',
      onClick: onCancel,
    }),
    createActionButton(doc, {
      id: 'quitGameSubmitBtn',
      className: 'action-btn-end hp-action-strong',
      text: '종료하기',
      onClick: onConfirm,
    }),
  );
  footer.appendChild(actions);
  return overlay;
}
