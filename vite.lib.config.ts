import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  publicDir: false,
  build: {
    outDir: 'dist-lib',
    lib: {
      entry: 'src/lib/index.ts',
      formats: ['es'],
      fileName: 'clipframes',
    },
    rollupOptions: {
      external: ['react', 'react/jsx-runtime'],
    },
  },
});
