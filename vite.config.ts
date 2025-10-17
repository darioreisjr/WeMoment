import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // ADICIONADO: Configuração do proxy para o servidor de desenvolvimento
  server: {
    proxy: {
      // Redireciona qualquer requisição que comece com /api para a sua API real
      '/api': {
        target: 'https://apiwemoment.darioreis.dev',
        changeOrigin: true,
        secure: false,
      },
    },
  },

  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});