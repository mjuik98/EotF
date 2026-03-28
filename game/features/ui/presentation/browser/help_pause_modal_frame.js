function joinClasses(tokens = []) {
  return tokens.filter(Boolean).join(' ');
}

function assignClasses(node, ...tokens) {
  node.className = joinClasses(tokens);
  return node;
}

export function createOverlayShell(doc, {
  id,
  overlayClassName,
  panelClassName,
  eyebrow = '',
  title = '',
  subtitle = '',
} = {}) {
  const overlay = assignClasses(doc.createElement('div'), 'hp-overlay', overlayClassName);
  if (id) overlay.id = id;

  const panel = assignClasses(doc.createElement('div'), 'hp-panel', 'gm-modal-panel', panelClassName);
  overlay.appendChild(panel);

  const header = assignClasses(doc.createElement('div'), 'hp-header', 'gm-modal-header');
  const headerMain = assignClasses(doc.createElement('div'), 'hp-header-main', 'gm-modal-header-main');

  if (eyebrow) {
    const eyebrowEl = assignClasses(doc.createElement('div'), 'hp-eyebrow', 'gm-modal-eyebrow');
    eyebrowEl.textContent = eyebrow;
    headerMain.appendChild(eyebrowEl);
  }

  if (title) {
    const titleEl = assignClasses(doc.createElement('div'), 'hp-title', 'gm-modal-title');
    titleEl.textContent = title;
    headerMain.appendChild(titleEl);
  }

  if (subtitle) {
    const subtitleEl = assignClasses(doc.createElement('div'), 'hp-subtitle', 'gm-modal-subtitle');
    subtitleEl.textContent = subtitle;
    headerMain.appendChild(subtitleEl);
  }

  header.appendChild(headerMain);
  panel.appendChild(header);

  const body = assignClasses(doc.createElement('div'), 'hp-body', 'gm-modal-body');
  panel.appendChild(body);

  const footer = assignClasses(doc.createElement('div'), 'hp-footer', 'gm-modal-footer');
  panel.appendChild(footer);

  return { overlay, panel, header, body, footer };
}

export function createActionButton(doc, {
  id = '',
  className = '',
  text = '',
  html = '',
  onClick = null,
} = {}) {
  const button = assignClasses(doc.createElement('button'), 'action-btn', className);
  if (id) button.id = id;
  if (html) button.innerHTML = html;
  else button.textContent = text;
  button.onclick = onClick;
  return button;
}

export function createActionsRow(doc, className = '') {
  return assignClasses(doc.createElement('div'), 'hp-actions', className);
}

export function createTextBlock(doc, {
  tagName = 'div',
  className = '',
  text = '',
  html = '',
  id = '',
} = {}) {
  const node = assignClasses(doc.createElement(tagName), className);
  if (id) node.id = id;
  if (html) node.innerHTML = html;
  else node.textContent = text;
  return node;
}
