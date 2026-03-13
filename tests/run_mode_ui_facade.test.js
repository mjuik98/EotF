import { describe, expect, it, vi } from 'vitest';

vi.mock('../game/ui/run/run_mode_ui_runtime.js', () => ({
  refreshRunModeUI: vi.fn(),
  selectPresetSlotRuntime: vi.fn(),
  savePresetRuntime: vi.fn(),
  closePresetDialogRuntime: vi.fn(),
  confirmPresetSaveRuntime: vi.fn(),
  loadPresetRuntime: vi.fn(),
  deletePresetRuntime: vi.fn(),
  openRunSettingsModal: vi.fn(),
  closeRunSettingsModal: vi.fn(),
}));
vi.mock('../game/features/run/presentation/browser/run_mode_ui_runtime.js', () => ({
  refreshRunModeUI: vi.fn(),
  selectPresetSlotRuntime: vi.fn(),
  savePresetRuntime: vi.fn(),
  closePresetDialogRuntime: vi.fn(),
  confirmPresetSaveRuntime: vi.fn(),
  loadPresetRuntime: vi.fn(),
  deletePresetRuntime: vi.fn(),
  openRunSettingsModal: vi.fn(),
  closeRunSettingsModal: vi.fn(),
}));

describe('RunModeUI facade', () => {
  it('delegates preset and modal actions to runtime helpers', async () => {
    const { RunModeUI } = await import('../game/ui/run/run_mode_ui.js');
    const runtime = await import('../game/features/run/presentation/browser/run_mode_ui_runtime.js');
    const deps = { marker: true };

    RunModeUI.refresh(deps);
    RunModeUI.selectPresetSlot(2, deps);
    RunModeUI.savePreset(1, deps);
    RunModeUI.closePresetDialog(deps);
    RunModeUI.confirmPresetSave(deps);
    RunModeUI.loadPreset(3, deps);
    RunModeUI.deletePreset(0, deps);
    RunModeUI.openSettings(deps);
    RunModeUI.closeSettings(deps);

    expect(runtime.refreshRunModeUI).toHaveBeenCalledWith(RunModeUI, deps);
    expect(runtime.selectPresetSlotRuntime).toHaveBeenCalledWith(RunModeUI, 2, deps);
    expect(runtime.savePresetRuntime).toHaveBeenCalledWith(RunModeUI, 1, deps);
    expect(runtime.closePresetDialogRuntime).toHaveBeenCalledWith(RunModeUI, deps);
    expect(runtime.confirmPresetSaveRuntime).toHaveBeenCalledWith(RunModeUI, deps);
    expect(runtime.loadPresetRuntime).toHaveBeenCalledWith(RunModeUI, 3, deps);
    expect(runtime.deletePresetRuntime).toHaveBeenCalledWith(RunModeUI, 0, deps);
    expect(runtime.openRunSettingsModal).toHaveBeenCalledWith(RunModeUI, deps);
    expect(runtime.closeRunSettingsModal).toHaveBeenCalledWith(RunModeUI, deps);
  });
});
