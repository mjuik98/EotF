import { defineConfig } from 'vite';

export default defineConfig({
    // 개발 서버 설정
    server: {
        port: 3000,
        open: true,
    },

    // 빌드 설정
    build: {
        outDir: 'dist',
        // 에셋 파일 크기 경고 임계값 (KB)
        chunkSizeWarningLimit: 600,
        rollupOptions: {
            input: 'index.html',
        },
    },

    // 에셋 처리
    assetsInclude: ['**/*.png', '**/*.webp', '**/*.mp3', '**/*.ogg'],
});
