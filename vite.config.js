import { defineConfig } from 'vite';

function getManualChunk(id) {
  const normalized = id.replace(/\\/g, '/');

  if (normalized.includes('/node_modules/')) return 'vendor';

  if (normalized.endsWith('/data/cards.js')) return 'data-cards';
  if (normalized.endsWith('/data/enemies.js')) return 'data-enemies';
  if (normalized.includes('/game/ui/map/')) return 'ui-map';
  if (
    normalized.includes('/game/features/event/presentation/browser/')
    || normalized.includes('/game/presentation/screens/event_')
    || normalized.includes('/game/ui/screens/event_')
  ) return 'ui-event';
  if (
    normalized.includes('/game/ui/combat/')
    || normalized.includes('/game/ui/cards/')
    || normalized.includes('/game/ui/hud/')
    || normalized.includes('/game/features/combat/presentation/browser/')
    || normalized.includes('/game/presentation/combat/')
  ) return 'ui-combat';
  if (
    normalized.includes('/game/features/reward/presentation/browser/')
    || normalized.includes('/game/presentation/screens/reward_')
    || normalized.includes('/game/ui/screens/reward_')
  ) return 'ui-reward';
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
