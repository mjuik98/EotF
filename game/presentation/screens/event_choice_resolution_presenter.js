function showToast(toast, showItemToast) {
  if (!toast || typeof showItemToast !== 'function') return;
  if (toast.options === undefined) {
    showItemToast(toast.payload);
    return;
  }
  showItemToast(toast.payload, toast.options);
}

export function presentEventChoiceResolution({
  doc,
  event,
  gs,
  onFinish,
  onRefreshGoldBar,
  onResolveChoice,
  renderChoices,
  renderContinueChoice,
  showItemToast,
  updateUI,
  viewModel,
} = {}) {
  updateUI?.();
  onRefreshGoldBar?.();

  showToast(viewModel?.acquiredCardToast, showItemToast);
  showToast(viewModel?.acquiredItemToast, showItemToast);

  if (viewModel?.isItemShop) {
    return;
  }

  if (viewModel?.finishImmediately) {
    onFinish?.();
    return;
  }

  const descEl = doc?.getElementById?.('eventDesc');
  if (descEl) descEl.textContent = viewModel?.resultText || '';

  showToast(viewModel?.upgradeToast, showItemToast);

  if (viewModel?.rerenderChoices) {
    renderChoices?.(event, doc, gs, onResolveChoice);
    onRefreshGoldBar?.();
    return;
  }

  if (viewModel?.continueChoice) {
    renderContinueChoice?.(doc, () => onFinish?.());
  }
}
