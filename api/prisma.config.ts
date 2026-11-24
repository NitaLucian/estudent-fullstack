// Configurarea Prisma CLI (migrate, generate, seed).
import 'dotenv/config'; // citește DATABASE_URL din fișierul .env
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    // comanda rulată de „npx prisma db seed” și după „npx prisma migrate reset”
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: process.env['DATABASE_URL'],
  },
});
