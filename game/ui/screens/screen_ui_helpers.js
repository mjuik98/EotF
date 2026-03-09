export function getDoc(deps) {
  return deps?.doc || document;
}

export function applyActiveScreenState(screen, doc) {
  doc.querySelectorAll('.screen').forEach((el) => el.classList.remove('active'));
  const target = doc.getElementById(`${screen}Screen`);
  if (target) target.classList.add('active');
  return target;
}

export function shouldRemoveFloatingHpPanel(screen) {
  return screen !== 'game' && screen !== 'combat';
}
