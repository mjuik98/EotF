export function renderEventContinueChoice(doc, onContinue) {
  const choicesEl = doc.getElementById('eventChoices');
  if (!choicesEl) return false;

  choicesEl.textContent = '';
  const continueBtn = doc.createElement('div');
  continueBtn.className = 'event-choice';
  continueBtn.id = 'eventChoiceContinue';
  continueBtn.textContent = '\uACC4\uC18D';
  continueBtn.addEventListener('click', onContinue, { once: true });
  choicesEl.appendChild(continueBtn);
  return true;
}
