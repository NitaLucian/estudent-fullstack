import { defineConfig } from 'vitest/config';
import { BAZA_TESTE } from './test/baza-teste.js';

// Testele e2e: pornesc aplicația întreagă și îi trimit cereri HTTP reale.
export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: './',
    include: ['**/*.e2e-spec.ts'],
    globalSetup: ['./test/pregatire.ts'],
    env: { DATABASE_URL: BAZA_TESTE }, // aplicația din teste folosește baza de test
    testTimeout: 30_000,
    hookTimeout: 120_000, // pornirea aplicației și autentificările din beforeAll
    fileParallelism: false,
  },
});
