import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? '/stock-tracker/' : '/',
  server: {
    port: 3000,
    open: true
  }
});
