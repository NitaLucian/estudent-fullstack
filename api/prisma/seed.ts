// Datele inițiale (seed) ale bazei de date. Rulare: npx prisma db seed
// Scriptul poate fi rulat de oricâte ori: upsert actualizează ce există și adaugă ce lipsește.
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const specializari = [
  { cod: 'CTI', denumire: 'Calculatoare și tehnologia informației' },
  { cod: 'AIA', denumire: 'Automatică și informatică aplicată' },
  { cod: 'IE', denumire: 'Inginerie electrică' },
  { cod: 'EA', denumire: 'Electronică aplicată' },
  { cod: 'IEC', denumire: 'Inginerie economică' },
];

async function main() {
  for (const s of specializari) {
    await prisma.specializare.upsert({
      where: { cod: s.cod },
      update: { denumire: s.denumire },
      create: s,
    });
  }
  console.log(`Seed: ${specializari.length} specializări.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
