import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { PAROLA_DEMO } from '../prisma/date-seed.js';
import { AppModule } from '../src/app.module.js';
import { configureazaAplicatia } from '../src/configurare.js';
import { MesajEmail, ServiciuEmail } from '../src/email/email.js';
import { Stocare } from '../src/stocare/stocare.js';
import { StocareMemorie } from '../src/stocare/stocare-memorie.js';

// Teste end-to-end (e2e): aplicația ÎNTREAGĂ (module, guard-uri, validare, Prisma, PostgreSQL),
// cu cereri HTTP reale trimise de supertest. Doar două piese sunt înlocuite: stocarea S3
// (cu una în memorie) și emailul (cu o funcție care doar adună mesajele) – posibil datorită
// claselor abstracte Stocare și ServiciuEmail.
describe('eStudent API (e2e)', () => {
  let app: NestExpressApplication;
  let stocare: StocareMemorie;
  const emailuri: MesajEmail[] = [];
  const tokenuri: Record<string, string> = {};
  let studentId: number;

  const http = () => request(app.getHttpServer());
  const cuToken = (cine: string) => ({ Authorization: `Bearer ${tokenuri[cine]}` });

  beforeAll(async () => {
    const modul = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(Stocare)
      .useClass(StocareMemorie)
      .overrideProvider(ServiciuEmail)
      .useValue({ trimite: (m: MesajEmail) => Promise.resolve(void emailuri.push(m)) })
      .compile();
    app = modul.createNestApplication<NestExpressApplication>();
    configureazaAplicatia(app);
    await app.init();
    stocare = app.get(Stocare);

    // câte un token pentru fiecare rol
    for (const [cine, email] of [
      ['admin', 'admin@estudent.ro'],
      ['student', 'larisa.marin@student.estudent.ro'],
      ['profesor', 'laura.dobre@estudent.ro'],
    ]) {
      const r = await http().post('/api/auth/login').send({ email, parola: PAROLA_DEMO }).expect(200);
      tokenuri[cine] = r.body.accessToken;
      if (cine === 'student') studentId = r.body.utilizator.studentId;
    }
  });

  afterAll(() => app.close());

  describe('autentificare', () => {
    it('health este public', async () => {
      const r = await http().get('/api/health').expect(200);
      expect(r.body.bazaDeDate).toBe('conectată');
      expect(r.headers['x-ratelimit-limit-implicit']).toBeUndefined(); // ruta nu este limitată
    });

    it('celelalte rute au antetele de securitate și de limitare', async () => {
      const r = await http().post('/api/auth/refresh').expect(401);
      expect(r.headers['x-content-type-options']).toBe('nosniff');
      expect(r.headers['x-ratelimit-limit-implicit']).toBe('300');
    });

    it('rutele protejate cer token (401)', () => http().get('/api/specializari').expect(401));

    it('o parolă greșită primește 401 cu mesaj neutru', async () => {
      const r = await http().post('/api/auth/login').send({ email: 'admin@estudent.ro', parola: 'gresita' }).expect(401);
      expect(r.body.message).toBe('Email sau parolă greșită');
    });

    it('login-ul pune refresh token-ul într-un cookie httpOnly', async () => {
      const r = await http().post('/api/auth/login').send({ email: 'admin@estudent.ro', parola: PAROLA_DEMO }).expect(200);
      expect(String(r.headers['set-cookie'])).toMatch(/refresh=.*HttpOnly.*SameSite=Strict/);
    });
  });

  describe('autorizare', () => {
    it('studentul își vede propria fișă', () => http().get(`/api/studenti/${studentId}`).set(cuToken('student')).expect(200));

    it('studentul NU vede fișa altui student (IDOR → 403)', () =>
      http().get(`/api/studenti/${studentId + 1}`).set(cuToken('student')).expect(403));

    it('studentul nu poate modifica structura facultății (403)', () =>
      http().post('/api/specializari').set(cuToken('student')).send({ cod: 'X1', denumire: 'Test' }).expect(403));

    it('profesorul nu vede catalogul unei discipline pe care nu o predă', async () => {
      const r = await http().get('/api/discipline').set(cuToken('profesor')).expect(200);
      const strain = r.body.find((d: { predari: { profesor: { email?: string; nume: string } }[] }) =>
        d.predari.every((p) => p.profesor.nume !== 'Dobre'),
      );
      await http().get(`/api/note/catalog/${strain.id}`).set(cuToken('profesor')).expect(403);
    });
  });

  describe('validare și erori', () => {
    const cod = `T${Date.now() % 100000}`; // un cod unic la fiecare rulare

    it('creează, refuză dublura (409) și șterge o specializare', async () => {
      const r = await http().post('/api/specializari').set(cuToken('admin')).send({ cod, denumire: 'Specializare de test' }).expect(201);
      await http().post('/api/specializari').set(cuToken('admin')).send({ cod, denumire: 'Dublură' }).expect(409);
      await http().delete(`/api/specializari/${r.body.id}`).set(cuToken('admin')).expect(204);
    });

    it('datele invalide primesc 400 cu mesajele de validare', async () => {
      const r = await http().post('/api/specializari').set(cuToken('admin')).send({ cod: 'mic', denumire: 'A' }).expect(400);
      expect(r.body.message).toContain('Denumirea are între 3 și 100 de caractere');
    });

    it('câmpurile necunoscute sunt respinse (mass assignment)', () =>
      http().post('/api/specializari').set(cuToken('admin')).send({ cod: 'OK1', denumire: 'Test', id: 1 }).expect(400));
  });

  describe('servicii cloud (înlocuite în teste)', () => {
    it('fotografia ajunge în stocare', async () => {
      const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3]);
      await http()
        .post(`/api/studenti/${studentId}/fotografie`)
        .set(cuToken('student'))
        .attach('fisier', png, 'poza.png')
        .expect(204);
      expect([...stocare.fisiere.keys()].some((k) => k.startsWith(`studenti/${studentId}/fotografie-`))).toBe(true);
    });

    it('un student nou primește emailul de bun venit', async () => {
      const nr = `E${Date.now() % 1000000}`;
      const email = `test.${nr.toLowerCase()}@student.estudent.ro`;
      await http()
        .post('/api/studenti')
        .set(cuToken('admin'))
        .send({ nrMatricol: nr, nume: 'Test', prenume: 'Automat', email })
        .expect(201);
      // emailul pleacă asincron (eveniment): așteptăm puțin
      await vi.waitFor(() => expect(emailuri.some((m) => m.catre === email && m.subiect === 'Bun venit în eStudent')).toBe(true));
    });
  });

  // ultimul: după el, adresa IP a testelor este blocată un minut la login
  describe('limitarea cererilor', () => {
    it('după prea multe încercări de login răspunde 429', async () => {
      const coduri: number[] = [];
      for (let i = 0; i < 6; i++) {
        const r = await http().post('/api/auth/login').send({ email: 'admin@estudent.ro', parola: 'gresita' });
        coduri.push(r.status);
      }
      expect(coduri).toContain(429);
      expect(coduri.filter((c) => c !== 429).every((c) => c === 401)).toBe(true);
    });
  });
});
