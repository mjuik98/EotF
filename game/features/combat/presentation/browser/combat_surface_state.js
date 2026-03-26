function setDatasetBooleanState(element, key, active) {
  if (!element?.dataset || !key) return;
  element.dataset[key] = active ? 'true' : 'false';
}

function readDatasetBooleanState(element, key, fallback = false) {
  if (!element?.dataset || !key) return fallback;
  const value = element.dataset[key];
  if (value === 'true') return true;
  if (value === 'false') return false;
  return fallback;
}

function setDatasetValue(element, key, value) {
  if (!element?.dataset || !key) return;
  if (value === undefined || value === null || value === '') {
    delete element.dataset[key];
    return;
  }
  element.dataset[key] = String(value);
}

function readDatasetValue(element, key, fallback = '') {
  if (!element?.dataset || !key) return fallback;
  const value = element.dataset[key];
  return value === undefined ? fallback : value;
}

export {
  setDatasetBooleanState,
};

export function createCombatSurfaceStateController({ element } = {}) {
  return {
    isOpen() {
      return readDatasetBooleanState(element, 'open', false);
    },

    isPinned() {
      return readDatasetBooleanState(element, 'pinned', false);
    },

    getBoolean(key, fallback = false) {
      return readDatasetBooleanState(element, key, fallback);
    },

    getValue(key, fallback = '') {
      return readDatasetValue(element, key, fallback);
    },

    setBoolean(key, active) {
      setDatasetBooleanState(element, key, active);
      return active;
    },

    setValue(key, value) {
      setDatasetValue(element, key, value);
      return value;
    },

    setOpen(open, { pinned = false } = {}) {
      setDatasetBooleanState(element, 'open', open);
      setDatasetBooleanState(element, 'pinned', open && pinned);
      return open;
    },

    open({ pinned = false, values = {}, flags = {} } = {}) {
      this.setOpen(true, { pinned });
      Object.entries(values).forEach(([key, value]) => this.setValue(key, value));
      Object.entries(flags).forEach(([key, value]) => this.setBoolean(key, value));
      return true;
    },

    close({ clearKeys = [], clearFlags = [] } = {}) {
      this.setOpen(false, { pinned: false });
      clearKeys.forEach((key) => this.setValue(key, ''));
      clearFlags.forEach((key) => this.setBoolean(key, false));
      return false;
    },
  };
}
