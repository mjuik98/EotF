export function buildBindingDepsRefs({ modules, fns }) {
  return {
    ...modules,
    ...fns,
  };
}
