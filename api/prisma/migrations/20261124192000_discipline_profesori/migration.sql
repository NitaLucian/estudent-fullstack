-- CreateEnum
CREATE TYPE "grad_didactic" AS ENUM ('ASISTENT', 'LECTOR', 'CONFERENTIAR', 'PROFESOR');

-- CreateTable
CREATE TABLE "discipline" (
    "id" SERIAL NOT NULL,
    "cod" VARCHAR(20) NOT NULL,
    "denumire" VARCHAR(100) NOT NULL,
    "credite" SMALLINT NOT NULL,
    "semestru" SMALLINT NOT NULL,
    "specializare_id" INTEGER NOT NULL,
    "an_studiu_id" INTEGER NOT NULL,

    CONSTRAINT "discipline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profesori" (
    "id" SERIAL NOT NULL,
    "nume" VARCHAR(50) NOT NULL,
    "prenume" VARCHAR(50) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "grad" "grad_didactic" NOT NULL DEFAULT 'ASISTENT',

    CONSTRAINT "profesori_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "predari" (
    "id" SERIAL NOT NULL,
    "profesor_id" INTEGER NOT NULL,
    "disciplina_id" INTEGER NOT NULL,
    "an_universitar_id" INTEGER NOT NULL,

    CONSTRAINT "predari_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "discipline_cod_key" ON "discipline"("cod");

-- CreateIndex
CREATE INDEX "discipline_specializare_id_an_studiu_id_idx" ON "discipline"("specializare_id", "an_studiu_id");

-- CreateIndex
CREATE UNIQUE INDEX "profesori_email_key" ON "profesori"("email");

-- CreateIndex
CREATE INDEX "predari_disciplina_id_idx" ON "predari"("disciplina_id");

-- CreateIndex
CREATE UNIQUE INDEX "predari_profesor_id_disciplina_id_an_universitar_id_key" ON "predari"("profesor_id", "disciplina_id", "an_universitar_id");

-- AddForeignKey
ALTER TABLE "discipline" ADD CONSTRAINT "discipline_specializare_id_fkey" FOREIGN KEY ("specializare_id") REFERENCES "specializari"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discipline" ADD CONSTRAINT "discipline_an_studiu_id_fkey" FOREIGN KEY ("an_studiu_id") REFERENCES "ani_studiu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "predari" ADD CONSTRAINT "predari_profesor_id_fkey" FOREIGN KEY ("profesor_id") REFERENCES "profesori"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "predari" ADD CONSTRAINT "predari_disciplina_id_fkey" FOREIGN KEY ("disciplina_id") REFERENCES "discipline"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "predari" ADD CONSTRAINT "predari_an_universitar_id_fkey" FOREIGN KEY ("an_universitar_id") REFERENCES "ani_universitari"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Adăugat de mână: reguli pe care schema Prisma nu le poate exprima
ALTER TABLE "discipline" ADD CONSTRAINT "discipline_semestru_check" CHECK ("semestru" IN (1, 2));
ALTER TABLE "discipline" ADD CONSTRAINT "discipline_credite_check" CHECK ("credite" BETWEEN 1 AND 30);
