export function executeGameBindingRegistrars(modules, fns, registrars) {
  for (const registerBindingGroup of registrars) {
    registerBindingGroup(modules, fns);
  }
}
