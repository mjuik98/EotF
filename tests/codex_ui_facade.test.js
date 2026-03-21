import { describe, expect, it, vi } from 'vitest';

vi.mock('../game/features/codex/presentation/browser/codex_ui_runtime.js', () => ({
  bindCodexGlobalKeys: vi.fn(),
  openCodexRuntime: vi.fn(),
  closeCodexRuntime: vi.fn(),
  setCodexTabRuntime: vi.fn(),
  renderCodexContentRuntime: vi.fn(),
}));

describe('CodexUI facade', () => {
  function createDoc() {
    const nodes = new Map();
    return {
      head: {
        children: [],
        appendChild(node) {
          this.children.push(node);
          if (node?.id) nodes.set(node.id, node);
        },
      },
      createElement(tag) {
        return {
          tagName: tag,
          rel: '',
          href: '',
          id: '',
        };
      },
      getElementById(id) {
        return nodes.get(id) || null;
      },
    };
  }

  it('falls back to the global document when injecting the codex stylesheet', async () => {
    const originalDocument = globalThis.document;
    const doc = createDoc();
    globalThis.document = doc;

    const { CodexUI } = await import('../game/ui/screens/codex_ui.js');

    CodexUI.openCodex({ marker: true });

    expect(doc.head.children).toHaveLength(1);
    expect(doc.head.children[0].rel).toBe('stylesheet');
    expect(doc.head.children[0].href).toContain('codex_v3.css');
    expect(doc.head.children[0].href).not.toBe('/css/codex_v3.css');

    globalThis.document = originalDocument;
  });

  it('delegates modal and render actions to the runtime helper', async () => {
    const { CodexUI } = await import('../game/ui/screens/codex_ui.js');
    const runtime = await import('../game/features/codex/presentation/browser/codex_ui_runtime.js');
    const doc = createDoc();
    const deps = { marker: true, doc };

    CodexUI.openCodex(deps);
    CodexUI.closeCodex(deps);
    CodexUI.setCodexTab('items', deps);
    CodexUI.renderCodexContent(deps);

    expect(doc.head.children).toHaveLength(1);
    expect(doc.head.children[0].rel).toBe('stylesheet');
    expect(doc.head.children[0].href).toContain('codex_v3.css');
    expect(doc.head.children[0].href).not.toBe('/css/codex_v3.css');
    expect(runtime.openCodexRuntime).toHaveBeenCalled();
    expect(runtime.closeCodexRuntime).toHaveBeenCalled();
    expect(runtime.setCodexTabRuntime).toHaveBeenCalledWith(expect.any(Object), CodexUI, 'items', deps);
    expect(runtime.renderCodexContentRuntime).toHaveBeenCalledWith(expect.any(Object), CodexUI, deps);
  });
});
