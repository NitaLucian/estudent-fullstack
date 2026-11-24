-- CreateEnum
CREATE TYPE "scop_token" AS ENUM ('SETARE', 'RESETARE');

-- CreateTable
CREATE TABLE "tokenuri_parola" (
    "id" SERIAL NOT NULL,
    "utilizator_id" INTEGER NOT NULL,
    "token_hash" TEXT NOT NULL,
    "scop" "scop_token" NOT NULL,
    "expira_la" TIMESTAMPTZ(3) NOT NULL,
    "folosit_la" TIMESTAMPTZ(3),
    "creat_la" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tokenuri_parola_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tokenuri_parola_token_hash_key" ON "tokenuri_parola"("token_hash");

-- CreateIndex
CREATE INDEX "tokenuri_parola_utilizator_id_idx" ON "tokenuri_parola"("utilizator_id");

-- AddForeignKey
ALTER TABLE "tokenuri_parola" ADD CONSTRAINT "tokenuri_parola_utilizator_id_fkey" FOREIGN KEY ("utilizator_id") REFERENCES "utilizatori"("id") ON DELETE CASCADE ON UPDATE CASCADE;
