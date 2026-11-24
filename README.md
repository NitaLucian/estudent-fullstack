# eStudent

Aplicație web pentru evidența studenților: backend NestJS (`api/`), frontend React + Vite (`web/`),
bază de date PostgreSQL în Docker (`docker-compose.yml`).

## Prima pornire

    docker compose up -d          # PostgreSQL (5433), stocarea S3 (8333), emailul de test (8025)

Backend (primul terminal):

    cd api
    cp .env.example .env          # Windows: copy .env.example .env
    npm install                   # rulează și prisma generate
    npx prisma migrate deploy     # creează tabelele
    npx prisma db seed            # datele de test
    npm run start:dev

Frontend (al doilea terminal):

    cd web
    npm install
    npm run dev

- Aplicația: http://localhost:5173
- API: http://localhost:3000/api/health
- Documentația API (Swagger): http://localhost:3000/api/docs
- Emailurile trimise de aplicație (Mailpit): http://localhost:8025

## Conturi de test (create de seed)

- administrator: `admin@estudent.ro`
- profesori: adresele din pagina Profesori (de ex. `mihaela.andrei@estudent.ro`)
- studenți: adresele din pagina Studenți (de ex. `ioana.tudor@student.estudent.ro`)

Toate au aceeași parolă de test, `PAROLA_DEMO` din `api/prisma/date-seed.ts`. Doar pentru dezvoltare.

## După modificarea modelului (api/prisma/schema.prisma)

    npx prisma migrate dev --name <ce-s-a-schimbat>
    npx prisma generate
    npx prisma db seed

## După modificarea API-ului

Cu backendul pornit, regenerați tipurile frontendului:

    cd web
    npm run api:tipuri

## Teste

    cd api
    npm test              # testele unitare (fără bază de date)
    npm run test:e2e      # testele e2e: aplicația întreagă, pe baza separată estudent_teste

La fiecare push, GitHub Actions rulează aceleași verificări (`.github/workflows/ci.yml`).

## Publicare (deploy)

| Componentă | Serviciu (plan gratuit) | Ce primește |
|---|---|---|
| Frontend + proxy `/api` | Cloudflare Pages | `web/dist` și funcția `web/functions/api/[[cale]].ts` |
| Backend | Render (Docker) | imaginea construită din `api/Dockerfile` (`render.yaml`) |
| Baza de date | Neon (PostgreSQL) | migrațiile, aplicate automat la pornirea backendului |
| Fișiere | Cloudflare R2 (S3) | bucket-ul `estudent` |
| Email | Brevo (API HTTP) | cheia API și un expeditor verificat |

Repetiția locală a producției (Docker + wrangler):

    docker build -t estudent-api:1.0.0 ./api
    docker run -d --name estudent-api -p 3102:3000 --env-file api/.env.productie.local estudent-api:1.0.0
    cd web
    cp .dev.vars.example .dev.vars
    npm run cloudflare        # http://localhost:8788
