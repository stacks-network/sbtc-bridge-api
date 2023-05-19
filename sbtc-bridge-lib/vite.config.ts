/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    globals: true,
    threads: false,
    watch: false,
    //include: ['**/__tests__/*.{js,tsx,ts}'],
    setupFiles: './tests/setup.ts'
  },
});
