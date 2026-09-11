import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    warmup: {
      clientFiles: [
        './src/main.js',
        './src/style.css',
        './src/admin.js',
        './src/admin.css',
        './index.html',
        './developments.html',
        './services.html',
        './ideology.html',
        './admin.html'
      ]
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  optimizeDeps: {
    include: ['lucide']
  },
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
        admin: './admin.html',
        developments: './developments.html',
        services: './services.html',
        ideology: './ideology.html',
      }
    }
  }
});
