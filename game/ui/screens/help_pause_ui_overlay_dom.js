export function appendTextNode(doc, parent, tagName, textContent, styleText) {
  const el = doc.createElement(tagName);
  if (styleText) el.style.cssText = styleText;
  el.textContent = textContent;
  parent.appendChild(el);
  return el;
}
