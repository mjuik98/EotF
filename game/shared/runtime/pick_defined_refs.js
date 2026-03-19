export function pickDefinedRefs(refs, keys = []) {
  return keys.reduce((acc, key) => {
    if (refs[key] !== undefined) acc[key] = refs[key];
    return acc;
  }, {});
}
