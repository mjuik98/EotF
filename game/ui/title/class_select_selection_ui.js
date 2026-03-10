export function normalizeClassId(raw, classIdOrder = []) {
  if (typeof raw === 'number' && Number.isInteger(raw)) {
    return classIdOrder[raw] || null;
  }

  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim().toLowerCase();
  if (!trimmed) return null;
  if (classIdOrder.includes(trimmed)) return trimmed;

  if (/^\d+$/.test(trimmed)) {
    const idx = Number.parseInt(trimmed, 10);
    return classIdOrder[idx] || null;
  }

  return null;
}

function getDoc(deps) {
  return deps?.doc || document;
}

export function applyClassSelectionState(classId, deps = {}) {
  const doc = getDoc(deps);
  deps.setSelectedClass?.(classId);

  const startBtn = doc.getElementById('startBtn');
  if (startBtn) startBtn.disabled = !classId;

  const hint = doc.getElementById('classSelectHint');
  if (hint) {
    hint.style.opacity = '0';
    hint.style.transform = 'translateY(-8px)';
    hint.style.transition = 'opacity 0.4s,transform 0.4s';
  }

  const classMeta = deps.data?.classes?.[classId];
  const avatarEmoji = classMeta?.emoji || '⚔️';

  const avatarEl = doc.getElementById('playerAvatar');
  if (avatarEl) {
    avatarEl.textContent = avatarEmoji;
    avatarEl.style.fontSize = '24px';
  }

  const largeFallback = doc.getElementById('playerPortraitFallback');
  if (largeFallback) {
    largeFallback.textContent = avatarEmoji;
    largeFallback.style.fontSize = '80px';
    largeFallback.style.display = 'flex';
  }

  if (typeof deps.playClassSelect === 'function' && classId) {
    deps.playClassSelect(classId);
  }
}

export function selectClassButton(btn, deps = {}) {
  if (!btn || btn._selecting) return;

  const normalized = normalizeClassId(btn.dataset?.class, deps.classIdOrder || []);
  if (!normalized) return;

  btn._selecting = true;
  (deps.setTimeoutImpl || globalThis.setTimeout)(() => {
    btn._selecting = false;
  }, 300);

  const doc = getDoc(deps);
  doc.querySelectorAll('.class-btn').forEach((el) => el.classList.remove('selected'));
  btn.classList.add('selected');

  applyClassSelectionState(normalized, deps);

  btn.style.transition = 'transform 0.15s ease';
  btn.style.transform = 'scale(1.04) translateY(-4px)';
  (deps.setTimeoutImpl || globalThis.setTimeout)(() => {
    btn.style.transform = '';
  }, 200);
}

export function selectClassById(classId, deps = {}) {
  const normalized = normalizeClassId(classId, deps.classIdOrder || []);
  if (!normalized) return;

  const doc = getDoc(deps);
  doc.querySelectorAll('.class-btn').forEach((el) => {
    const elClassId = normalizeClassId(el.dataset?.class, deps.classIdOrder || []);
    if (elClassId === normalized) el.classList.add('selected');
    else el.classList.remove('selected');
  });

  applyClassSelectionState(normalized, deps);
}

export function clearClassSelection(deps = {}) {
  deps.setSelectedClass?.(null);
  const doc = getDoc(deps);
  const startBtn = doc.getElementById('startBtn');
  if (startBtn) startBtn.disabled = true;
  doc.querySelectorAll('.class-btn').forEach((el) => el.classList.remove('selected'));
}
