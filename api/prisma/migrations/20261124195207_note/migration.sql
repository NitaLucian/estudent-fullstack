-- CreateTable
CREATE TABLE "note" (
    "id" SERIAL NOT NULL,
    "inscriere_id" INTEGER NOT NULL,
    "disciplina_id" INTEGER NOT NULL,
    "valoare" SMALLINT NOT NULL,
    "data" DATE NOT NULL,
    "modificat_de_id" INTEGER,
    "modificat_la" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "istoric_note" (
    "id" SERIAL NOT NULL,
    "inscriere_id" INTEGER NOT NULL,
    "disciplina_id" INTEGER NOT NULL,
    "valoare_veche" SMALLINT,
    "valoare_noua" SMALLINT,
    "utilizator_id" INTEGER NOT NULL,
    "la" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "istoric_note_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "note_disciplina_id_idx" ON "note"("disciplina_id");

-- CreateIndex
CREATE UNIQUE INDEX "note_inscriere_id_disciplina_id_key" ON "note"("inscriere_id", "disciplina_id");

-- CreateIndex
CREATE INDEX "istoric_note_inscriere_id_disciplina_id_idx" ON "istoric_note"("inscriere_id", "disciplina_id");

-- AddForeignKey
ALTER TABLE "note" ADD CONSTRAINT "note_inscriere_id_fkey" FOREIGN KEY ("inscriere_id") REFERENCES "inscrieri"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "note" ADD CONSTRAINT "note_disciplina_id_fkey" FOREIGN KEY ("disciplina_id") REFERENCES "discipline"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "note" ADD CONSTRAINT "note_modificat_de_id_fkey" FOREIGN KEY ("modificat_de_id") REFERENCES "utilizatori"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "istoric_note" ADD CONSTRAINT "istoric_note_utilizator_id_fkey" FOREIGN KEY ("utilizator_id") REFERENCES "utilizatori"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Adăugat de mână: nota este un număr întreg între 1 și 10
ALTER TABLE "note" ADD CONSTRAINT "note_valoare_check" CHECK ("valoare" BETWEEN 1 AND 10);
ALTER TABLE "istoric_note" ADD CONSTRAINT "istoric_note_valori_check" CHECK ("valoare_veche" BETWEEN 1 AND 10 AND "valoare_noua" BETWEEN 1 AND 10 OR "valoare_veche" IS NULL OR "valoare_noua" IS NULL);
