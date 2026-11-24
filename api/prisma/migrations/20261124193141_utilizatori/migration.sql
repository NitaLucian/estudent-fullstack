-- CreateEnum
CREATE TYPE "rol" AS ENUM ('ADMIN', 'PROFESOR', 'STUDENT');

-- CreateTable
CREATE TABLE "utilizatori" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "parola_hash" TEXT NOT NULL,
    "rol" "rol" NOT NULL,
    "activ" BOOLEAN NOT NULL DEFAULT true,
    "student_id" INTEGER,
    "profesor_id" INTEGER,
    "creat_la" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultima_autentificare" TIMESTAMP(3),

    CONSTRAINT "utilizatori_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sesiuni_refresh" (
    "id" UUID NOT NULL,
    "utilizator_id" INTEGER NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expira_la" TIMESTAMP(3) NOT NULL,
    "revocata_la" TIMESTAMP(3),
    "creata_la" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sesiuni_refresh_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "utilizatori_email_key" ON "utilizatori"("email");

-- CreateIndex
CREATE UNIQUE INDEX "utilizatori_student_id_key" ON "utilizatori"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "utilizatori_profesor_id_key" ON "utilizatori"("profesor_id");

-- CreateIndex
CREATE UNIQUE INDEX "sesiuni_refresh_token_hash_key" ON "sesiuni_refresh"("token_hash");

-- CreateIndex
CREATE INDEX "sesiuni_refresh_utilizator_id_idx" ON "sesiuni_refresh"("utilizator_id");

-- AddForeignKey
ALTER TABLE "utilizatori" ADD CONSTRAINT "utilizatori_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "studenti"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "utilizatori" ADD CONSTRAINT "utilizatori_profesor_id_fkey" FOREIGN KEY ("profesor_id") REFERENCES "profesori"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sesiuni_refresh" ADD CONSTRAINT "sesiuni_refresh_utilizator_id_fkey" FOREIGN KEY ("utilizator_id") REFERENCES "utilizatori"("id") ON DELETE CASCADE ON UPDATE CASCADE;
