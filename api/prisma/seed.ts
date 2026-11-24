// Datele inițiale (seed) ale bazei de date. Rulare: npx prisma db seed
// Scriptul poate fi rulat de oricâte ori: upsert actualizează ce există și adaugă ce lipsește.
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';
import {
  AN_INCEPUT,
  faraDiacritice, generator, grupePeAn, numeFamilie, prenumeBaieti, prenumeFete, specializari,
} from './date-seed.js';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const STUDENTI_PE_GRUPA = 8;

async function seedSpecializari() {
  for (const s of specializari) {
    await prisma.specializare.upsert({
      where: { cod: s.cod },
      update: { denumire: s.denumire },
      create: s,
    });
  }
  console.log(`Seed: ${specializari.length} specializări.`);
}

// Codul grupei: specializarea + anul + numărul grupei, de ex. CTI-1102
async function seedGrupe() {
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
  console.log(`Seed: ${nrGrupe} grupe.`);
}

// Câte STUDENTI_PE_GRUPA studenți în fiecare grupă, cu nume alese „la întâmplare”,
// dar mereu aceleași (generator cu sămânță fixă).
async function seedStudenti() {
  const aleator = generator(2027);
  const alege = <T>(lista: T[]): T => lista[Math.floor(aleator() * lista.length)];
  const emailuri = new Set<string>();
  const grupe = await prisma.grupa.findMany({ orderBy: { cod: 'asc' } });

  let nr = 0;
  for (const grupa of grupe) {
    for (let i = 0; i < STUDENTI_PE_GRUPA; i++) {
      nr++;
      const fata = aleator() < 0.45;
      const prenume = alege(fata ? prenumeFete : prenumeBaieti);
      const nume = alege(numeFamilie);
      // adresă unică: prenume.nume, iar la a doua apariție prenume.nume2 ...
      const baza = `${faraDiacritice(prenume)}.${faraDiacritice(nume)}`;
      let email = `${baza}@student.estudent.ro`;
      for (let k = 2; emailuri.has(email); k++) email = `${baza}${k}@student.estudent.ro`;
      emailuri.add(email);
      // anul nașterii, față de anul universitar curent: în anul 1 studenții au 18–19 ani, în anul 4 au 21–22
      const anNastere = AN_INCEPUT - 17 - grupa.an - Math.floor(aleator() * 2);
      const dataNasterii = new Date(Date.UTC(anNastere, Math.floor(aleator() * 12), 1 + Math.floor(aleator() * 28)));
      const nrMatricol = `M${String(nr).padStart(5, '0')}`;

      await prisma.student.upsert({
        where: { nrMatricol },
        update: { nume, prenume, email, dataNasterii, grupaId: grupa.id },
        create: { nrMatricol, nume, prenume, email, dataNasterii, grupaId: grupa.id },
      });
    }
  }
  console.log(`Seed: ${nr} studenți.`);
}

async function main() {
  await seedSpecializari();
  await seedGrupe();
  await seedStudenti();
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
