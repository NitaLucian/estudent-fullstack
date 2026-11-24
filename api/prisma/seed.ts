// Datele inițiale (seed) ale bazei de date. Rulare: npx prisma db seed
// Scriptul poate fi rulat de oricâte ori: upsert actualizează ce există și adaugă ce lipsește.
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import * as argon2 from 'argon2';
import { PrismaClient } from '../src/generated/prisma/client.js';
import {
  AN_INCEPUT, anCurent, anTrecut,
  aniStudiu, aniUniversitari, CREDITE, faraDiacritice, generator, grupePeAn, numeFamilie,
  planInvatamant, prenumeBaieti, prenumeFete, profesori, specializari,
} from './date-seed.js';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const STUDENTI_PE_GRUPA = 8;

// Parola tuturor conturilor de test. DOAR pentru dezvoltare: o bază de date reală
// nu primește niciodată conturi cu parole cunoscute.
const PAROLA_DEMO = 'eStudent2027!';

async function seedSpecializari() {
  for (const s of specializari) {
    await prisma.specializare.upsert({ where: { cod: s.cod }, update: { denumire: s.denumire }, create: s });
  }
  console.log(`Seed: ${specializari.length} specializări.`);
}

async function seedAniStudiu() {
  for (const a of aniStudiu) {
    await prisma.anStudiu.upsert({ where: { numar: a.numar }, update: { denumire: a.denumire }, create: a });
  }
}

async function seedAniUniversitari() {
  for (const a of aniUniversitari) {
    await prisma.anUniversitar.upsert({ where: { cod: a.cod }, update: a, create: a });
  }
  // o bază populată într-un an anterior are alt an marcat curent: rămâne curent doar anul calculat acum
  await prisma.anUniversitar.updateMany({ where: { cod: { not: anCurent.cod } }, data: { curent: false } });
  console.log(`Seed: ${aniUniversitari.length} ani universitari.`);
}

// Codul grupei: specializarea + anul + numărul grupei, de ex. CTI-1102
async function seedGrupe() {
  let nrGrupe = 0;
  for (const [codSpec, numere] of Object.entries(grupePeAn)) {
    const spec = await prisma.specializare.findUniqueOrThrow({ where: { cod: codSpec } });
    for (let an = 1; an <= numere.length; an++) {
      const anStudiu = await prisma.anStudiu.findUniqueOrThrow({ where: { numar: an } });
      for (let nr = 1; nr <= numere[an - 1]; nr++) {
        const cod = `${codSpec}-${an}1${String(nr).padStart(2, '0')}`;
        await prisma.grupa.upsert({
          where: { cod },
          update: { anStudiuId: anStudiu.id, specializareId: spec.id },
          create: { cod, anStudiuId: anStudiu.id, specializareId: spec.id },
        });
        nrGrupe++;
      }
    }
  }
  console.log(`Seed: ${nrGrupe} grupe.`);
}

// Câte STUDENTI_PE_GRUPA studenți în fiecare grupă, cu nume alese „la întâmplare”,
// dar mereu aceleași (generator cu sămânță fixă). Fiecare student este înscris în grupa lui
// în anul curent și, dacă nu este în anul I, într-o grupă din anul anterior în anul universitar trecut.
async function seedStudenti() {
  const aleator = generator(2027);
  const alege = <T>(lista: T[]): T => lista[Math.floor(aleator() * lista.length)];
  const emailuri = new Set<string>();
  const curent = await prisma.anUniversitar.findFirstOrThrow({ where: { curent: true } });
  const trecut = await prisma.anUniversitar.findUniqueOrThrow({ where: { cod: anTrecut.cod } });
  const grupe = await prisma.grupa.findMany({ include: { anStudiu: true }, orderBy: { cod: 'asc' } });

  let nr = 0;
  let nrInscrieri = 0;
  for (const grupa of grupe) {
    const an = grupa.anStudiu.numar;
    // grupa din anul anterior: aceeași specializare, anul an-1, același număr (sau prima grupă)
    const anterioare = grupe.filter((g) => g.specializareId === grupa.specializareId && g.anStudiu.numar === an - 1);
    const grupaAnterioara = anterioare.find((g) => g.cod.slice(-2) === grupa.cod.slice(-2)) ?? anterioare[0];

    for (let i = 0; i < STUDENTI_PE_GRUPA; i++) {
      nr++;
      const fata = aleator() < 0.45;
      const prenume = alege(fata ? prenumeFete : prenumeBaieti);
      const nume = alege(numeFamilie);
      const baza = `${faraDiacritice(prenume)}.${faraDiacritice(nume)}`;
      let email = `${baza}@student.estudent.ro`;
      for (let k = 2; emailuri.has(email); k++) email = `${baza}${k}@student.estudent.ro`;
      emailuri.add(email);
      // anul nașterii, față de anul universitar curent: în anul 1 studenții au 18–19 ani, în anul 4 au 21–22
      const anNastere = AN_INCEPUT - 17 - an - Math.floor(aleator() * 2);
      const dataNasterii = new Date(Date.UTC(anNastere, Math.floor(aleator() * 12), 1 + Math.floor(aleator() * 28)));
      const nrMatricol = `M${String(nr).padStart(5, '0')}`;

      const student = await prisma.student.upsert({
        where: { nrMatricol },
        update: { nume, prenume, email, dataNasterii },
        create: { nrMatricol, nume, prenume, email, dataNasterii },
      });
      const inscrieri = [{ grupaId: grupa.id, anUniversitarId: curent.id }];
      if (grupaAnterioara) inscrieri.push({ grupaId: grupaAnterioara.id, anUniversitarId: trecut.id });
      for (const ins of inscrieri) {
        await prisma.inscriere.upsert({
          where: { studentId_anUniversitarId: { studentId: student.id, anUniversitarId: ins.anUniversitarId } },
          update: { grupaId: ins.grupaId },
          create: { studentId: student.id, ...ins },
        });
        nrInscrieri++;
      }
    }
  }
  console.log(`Seed: ${nr} studenți, ${nrInscrieri} înscrieri.`);
}

// Disciplinele: pentru fiecare specializare, an și semestru, cele 5 discipline din plan.
// Codul: specializarea, litera D, anul, semestrul și poziția, de ex. CTI-D213
async function seedDiscipline() {
  let n = 0;
  for (const s of specializari) {
    const spec = await prisma.specializare.findUniqueOrThrow({ where: { cod: s.cod } });
    for (let an = 1; an <= 4; an++) {
      const anStudiu = await prisma.anStudiu.findUniqueOrThrow({ where: { numar: an } });
      for (let sem = 1; sem <= 2; sem++) {
        const denumiri = planInvatamant[an - 1][sem - 1];
        for (let i = 0; i < denumiri.length; i++) {
          const cod = `${s.cod}-D${an}${sem}${i + 1}`;
          const date = { denumire: denumiri[i], credite: CREDITE[i], semestru: sem, specializareId: spec.id, anStudiuId: anStudiu.id };
          await prisma.disciplina.upsert({ where: { cod }, update: date, create: { cod, ...date } });
          n++;
        }
      }
    }
  }
  console.log(`Seed: ${n} discipline.`);
}

async function seedProfesori() {
  for (const p of profesori) {
    const email = `${faraDiacritice(p.prenume)}.${faraDiacritice(p.nume)}@estudent.ro`;
    await prisma.profesor.upsert({ where: { email }, update: p, create: { ...p, email } });
  }
  console.log(`Seed: ${profesori.length} profesori.`);
}

// Fiecare disciplină are un profesor, în fiecare an universitar.
async function seedPredari() {
  const discipline = await prisma.disciplina.findMany({ orderBy: { cod: 'asc' } });
  const toti = await prisma.profesor.findMany({ orderBy: { email: 'asc' } });
  const ani = await prisma.anUniversitar.findMany();
  let n = 0;
  for (const an of ani) {
    for (let i = 0; i < discipline.length; i++) {
      const profesor = toti[(i * 7) % toti.length]; // pas 7: profesori diferiți la discipline vecine
      const cheie = { profesorId: profesor.id, disciplinaId: discipline[i].id, anUniversitarId: an.id };
      await prisma.predare.upsert({
        where: { profesorId_disciplinaId_anUniversitarId: cheie },
        update: {},
        create: cheie,
      });
      n++;
    }
  }
  console.log(`Seed: ${n} predări.`);
}

// Conturile de acces: un administrator, câte un cont pentru fiecare profesor și student.
// Hash-ul se calculează o singură dată și se refolosește (argon2 este lent intenționat:
// ~0,1 s pe parolă). Conturile reale primesc fiecare propriul hash, cu propria „sare”.
async function seedUtilizatori() {
  const parolaHash = await argon2.hash(PAROLA_DEMO);
  const conturi: { email: string; rol: 'ADMIN' | 'PROFESOR' | 'STUDENT'; profesorId?: number; studentId?: number }[] = [
    { email: 'admin@estudent.ro', rol: 'ADMIN' },
  ];
  for (const p of await prisma.profesor.findMany()) conturi.push({ email: p.email, rol: 'PROFESOR', profesorId: p.id });
  for (const s of await prisma.student.findMany()) conturi.push({ email: s.email, rol: 'STUDENT', studentId: s.id });

  for (const c of conturi) {
    // la rularea repetată nu schimbăm parola unui cont existent
    await prisma.utilizator.upsert({ where: { email: c.email }, update: {}, create: { ...c, parolaHash } });
  }
  console.log(`Seed: ${conturi.length} conturi (parola de test: vezi PAROLA_DEMO în seed.ts).`);
}

async function main() {
  await seedSpecializari();
  await seedAniStudiu();
  await seedAniUniversitari();
  await seedGrupe();
  await seedStudenti();
  await seedDiscipline();
  await seedProfesori();
  await seedPredari();
  await seedUtilizatori();
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
