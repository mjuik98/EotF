export function executeLegacySurfaceRegistration({ modules, payload }) {
  modules.GAME.init(...payload.initArgs);
  modules.exposeGlobals(payload.globals);
}
