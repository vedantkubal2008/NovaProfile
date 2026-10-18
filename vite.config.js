import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/NovaProfile/',
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true
      }
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        chat: resolve(__dirname, 'chat.html'),
        gallery: resolve(__dirname, 'gallery.html'),
        game: resolve(__dirname, 'game.html')
      }
    }
  }
});
