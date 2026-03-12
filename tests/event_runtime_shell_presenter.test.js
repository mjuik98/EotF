import { describe, expect, it, vi } from 'vitest';

vi.mock('../game/features/event/presentation/browser/event_ui_dom.js', () => ({
  renderChoices: vi.fn(),
}));

describe('event_runtime_shell_presenter', () => {
  it('renders the event shell and opens the modal', async () => {
    const { renderEventShellRuntime } = await import('../game/presentation/screens/event_runtime_shell_presenter.js');
    const dom = await import('../game/features/event/presentation/browser/event_ui_dom.js');
    const eventModal = { classList: { add: vi.fn() } };
    const elements = {
      eventEyebrow: { textContent: '' },
      eventTitle: { textContent: '' },
      eventDesc: { textContent: '' },
      eventImageContainer: { style: { display: 'block' } },
      eventModal,
    };
    const doc = {
      getElementById: vi.fn((id) => elements[id] || null),
    };

    renderEventShellRuntime({ title: 'An Event', desc: 'Desc', choices: [] }, {
      doc,
      gs: { player: {} },
      refreshGoldBar: vi.fn(),
      resolveChoice: vi.fn(),
    });

    expect(elements.eventEyebrow.textContent).toBe('LAYER 1 EVENT');
    expect(elements.eventTitle.textContent).toBe('An Event');
    expect(elements.eventDesc.textContent).toBe('Desc');
    expect(elements.eventImageContainer.style.display).toBe('none');
    expect(dom.renderChoices).toHaveBeenCalled();
    expect(eventModal.classList.add).toHaveBeenCalledWith('active');
  });
});
