export function createCanvasLifecycleActions(context) {
  const { modules, ports } = context;

  return {
    initTitleCanvas() {
      modules.TitleCanvasUI?.init?.({ doc: ports.doc });
    },

    resizeTitleCanvas() {
      modules.TitleCanvasUI?.resize?.({ doc: ports.doc });
    },

    animateTitle() {
      modules.TitleCanvasUI?.animate?.({ doc: ports.doc });
    },

    initGameCanvas() {
      const refs = modules.GameCanvasSetupUI?.init?.(ports.getCanvasDeps());
      if (refs) modules._canvasRefs = refs;
    },

    resizeGameCanvas() {
      modules.GameCanvasSetupUI?.resize?.();
      modules._canvasRefs = modules.GameCanvasSetupUI?.getRefs?.() || modules._canvasRefs;
    },
  };
}
