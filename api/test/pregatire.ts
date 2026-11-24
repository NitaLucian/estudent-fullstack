import { execSync } from 'node:child_process';
import { BAZA_TESTE } from './baza-teste.js';

// Rulează o singură dată, înaintea tuturor testelor e2e (globalSetup):
// aduce baza de date de test la ultima migrare și pune datele de test.
// Testele folosesc o bază SEPARATĂ: nu strică datele din baza de dezvoltare.
export default function pregatire() {
  const env = { ...process.env, DATABASE_URL: BAZA_TESTE };
  execSync('npx prisma migrate deploy', { env, stdio: 'inherit' });
  execSync('npx prisma db seed', { env, stdio: 'inherit' });
}
