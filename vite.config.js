import { defineConfig } from 'vite';

function getManualChunk(id) {
  const normalized = id.replace(/\\/g, '/');

  if (normalized.includes('/node_modules/')) return 'vendor';

  if (normalized.endsWith('/data/cards.js')) return 'data-cards';
  if (normalized.endsWith('/data/enemies.js')) return 'data-enemies';
  if (normalized.includes('/game/ui/title/')) return 'ui-title';
  if (normalized.includes('/game/ui/map/')) return 'ui-map';
  if (normalized.includes('/game/ui/combat/')) return 'ui-combat';
  if (normalized.includes('/game/ui/screens/event_') || normalized.endsWith('/game/ui/screens/reward_ui.js')) {
    return 'ui-event';
  }
  if (normalized.endsWith('/game/ui/screens/codex_ui.js')) return 'ui-codex';
  if (normalized.endsWith('/game/ui/screens/ending_screen_ui.js')) return 'ui-ending';
  if (normalized.endsWith('/game/ui/screens/story_ui.js')) return 'ui-story';
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
    chunkSizeWarningLimit: 600,
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
