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

// Câte grupe are fiecare specializare în fiecare an de studiu (anii 1–4).
const grupePeAn: Record<string, number[]> = {
  CTI: [3, 3, 2, 2],
  AIA: [2, 2, 2, 1],
  IE: [2, 1, 1, 1],
  EA: [1, 1, 1, 1],
  IEC: [1, 1, 1, 1],
};

async function main() {
  for (const s of specializari) {
    await prisma.specializare.upsert({
      where: { cod: s.cod },
      update: { denumire: s.denumire },
      create: s,
    });
  }

  // Codul grupei: specializarea + anul + numărul grupei, de ex. CTI-1102
  let nrGrupe = 0;
  for (const [codSpec, numere] of Object.entries(grupePeAn)) {
    const spec = await prisma.specializare.findUniqueOrThrow({ where: { cod: codSpec } });
    for (let an = 1; an <= numere.length; an++) {
      for (let nr = 1; nr <= numere[an - 1]; nr++) {
        const cod = `${codSpec}-${an}1${String(nr).padStart(2, '0')}`;
        await prisma.grupa.upsert({
          where: { cod },
          update: { an, specializareId: spec.id },
          create: { cod, an, specializareId: spec.id },
        });
        nrGrupe++;
      }
    }
  }
  console.log(`Seed: ${specializari.length} specializări, ${nrGrupe} grupe.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
