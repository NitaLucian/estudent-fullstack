# eStudent

Aplicație web pentru evidența studenților: backend NestJS (`api/`), frontend React + Vite (`web/`),
bază de date PostgreSQL în Docker (`docker-compose.yml`).

## Prima pornire

    docker compose up -d

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

## După modificarea modelului (api/prisma/schema.prisma)

    npx prisma migrate dev --name <ce-s-a-schimbat>
    npx prisma generate
    npx prisma db seed

## După modificarea API-ului

Cu backendul pornit, regenerați tipurile frontendului:

    cd web
    npm run api:tipuri
