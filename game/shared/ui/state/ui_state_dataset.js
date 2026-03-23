export function setDatasetBooleanState(element, key, active) {
  if (!element?.dataset || !key) return;
  element.dataset[key] = active ? 'true' : 'false';
}

export function readDatasetBooleanState(element, key, fallback = false) {
  if (!element?.dataset || !key) return fallback;
  const value = element.dataset[key];
  if (value === 'true') return true;
  if (value === 'false') return false;
  return fallback;
}

export function setDatasetValue(element, key, value) {
  if (!element?.dataset || !key) return;
  if (value === undefined || value === null || value === '') {
    delete element.dataset[key];
    return;
  }
  element.dataset[key] = String(value);
}

export function readDatasetValue(element, key, fallback = '') {
  if (!element?.dataset || !key) return fallback;
  const value = element.dataset[key];
  return value === undefined ? fallback : value;
}
