import { defineConfig } from 'vite';

function getManualChunk(id) {
  const normalized = id.replace(/\\/g, '/');

  if (normalized.includes('/node_modules/')) return 'vendor';

  if (normalized.endsWith('/data/cards.js')) return 'data-cards';
  if (normalized.endsWith('/data/enemies.js')) return 'data-enemies';
  if (normalized.includes('/game/ui/map/')) return 'ui-map';
  if (
    normalized.includes('/game/features/event/ports/public_event_binding_surface.js')
    || normalized.includes('/game/features/event/app/event_reward_actions.js')
    || normalized.includes('/game/features/event/app/event_actions.js')
    || normalized.includes('/game/features/event/app/reward_actions.js')
    || normalized.includes('/game/features/event/app/reward_navigation_actions.js')
    || normalized.includes('/game/features/event/ports/create_event_reward_ports.js')
    || normalized.includes('/game/features/event/ports/event_ports.js')
    || normalized.includes('/game/features/event/ports/reward_ports.js')
    || normalized.includes('/game/features/event/ports/public_contract_capabilities.js')
    || normalized.includes('/game/features/event/ports/contracts/public_event_contract_capabilities.js')
    || normalized.includes('/game/features/event/ports/contracts/build_event_contracts.js')
    || normalized.includes('/game/features/event/ports/contracts/build_event_flow_contracts.js')
  ) return 'ui-gameplay';
  if (
    normalized.includes('/game/ui/combat/')
    || normalized.includes('/game/ui/cards/')
    || normalized.includes('/game/ui/hud/')
    || normalized.includes('/game/features/combat/')
    || normalized.includes('/game/presentation/combat/')
    || normalized.includes('/game/ui/title/')
    || normalized.includes('/game/features/title/')
    || normalized.includes('/game/presentation/title/')
    || normalized.includes('/game/features/reward/')
    || normalized.includes('/game/presentation/screens/reward_')
    || normalized.includes('/game/ui/screens/reward_')
  ) return 'ui-gameplay';
  if (
    normalized.includes('/game/features/event/')
    || normalized.includes('/game/presentation/screens/event_')
    || normalized.includes('/game/ui/screens/event_')
  ) return 'ui-event';
  if (
    normalized.includes('/game/presentation/screens/ending_')
    || normalized.includes('/game/presentation/screens/story_')
    || normalized.includes('/game/ui/screens/ending_')
    || normalized.includes('/game/ui/screens/story_')
  ) return 'ui-overlays';
  if (normalized.endsWith('/game/ui/screens/settings_ui.js')) return 'ui-settings';
  if (normalized.endsWith('/game/ui/run/run_mode_ui.js')) return 'ui-run-mode';

  return null;
}

export default defineConfig({
  server: {
    port: 8000,
    open: true,
  },
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 650,
    rollupOptions: {
      input: 'index.html',
      output: {
        manualChunks(id) {
          return getManualChunk(id);
        },
      },
    },
  },
  assetsInclude: ['**/*.mp3', '**/*.ogg'],
});
