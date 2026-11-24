# Imaginea Docker a backendului, construită în două etape (multi-stage build):
# 1. „constructie” are tot ce trebuie pentru compilare (TypeScript, Nest CLI ...);
# 2. „productie” primește doar rezultatul: codul compilat și dependențele de producție.
# Imaginea finală e mai mică și nu conține uneltele de dezvoltare.

# baza comună: Node.js 24 pe Debian „slim”, plus OpenSSL (Prisma îl folosește la conectare)
FROM node:24-slim AS baza
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app

FROM baza AS constructie
# întâi doar fișierele care descriu dependențele: dacă nu se schimbă, Docker refolosește
# stratul (layer-ul) cu node_modules din construcția anterioară și „npm ci” nu mai rulează
COPY package.json package-lock.json prisma.config.ts ./
COPY prisma ./prisma
RUN npm ci
# apoi restul codului, compilarea și eliminarea dependențelor de dezvoltare
COPY . .
RUN npm run build && npm prune --omit=dev

FROM baza AS productie
ENV NODE_ENV=production
COPY --from=constructie /app/package.json /app/prisma.config.ts ./
COPY --from=constructie /app/prisma ./prisma
COPY --from=constructie /app/node_modules ./node_modules
COPY --from=constructie /app/dist ./dist
# procesul nu rulează ca root: dacă cineva ar găsi o breșă în aplicație,
# nu ar avea drepturi de administrator în container
USER node
EXPOSE 3000
# platforma de găzduire (sau Docker) verifică periodic că serverul răspunde
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s \
  CMD node -e "fetch('http://localhost:' + (process.env.PORT ?? 3000) + '/api/health').then((r) => process.exit(r.ok ? 0 : 1), () => process.exit(1))"
# la fiecare pornire: întâi migrațiile care lipsesc (dacă nu e niciuna, nu face nimic), apoi serverul
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
