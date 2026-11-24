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

Toate au aceeași parolă de test, `PAROLA_DEMO` din `api/prisma/seed.ts`. Doar pentru dezvoltare.

## După modificarea modelului (api/prisma/schema.prisma)

    npx prisma migrate dev --name <ce-s-a-schimbat>
    npx prisma generate
    npx prisma db seed

## După modificarea API-ului

Cu backendul pornit, regenerați tipurile frontendului:

    cd web
    npm run api:tipuri
