-- CreateTable
CREATE TABLE "studenti" (
    "id" SERIAL NOT NULL,
    "nr_matricol" VARCHAR(12) NOT NULL,
    "nume" VARCHAR(50) NOT NULL,
    "prenume" VARCHAR(50) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "data_nasterii" DATE,
    "grupa_id" INTEGER,

    CONSTRAINT "studenti_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "studenti_nr_matricol_key" ON "studenti"("nr_matricol");

-- CreateIndex
CREATE UNIQUE INDEX "studenti_email_key" ON "studenti"("email");

-- CreateIndex
CREATE INDEX "studenti_grupa_id_idx" ON "studenti"("grupa_id");

-- CreateIndex
CREATE INDEX "studenti_nume_prenume_idx" ON "studenti"("nume", "prenume");

-- AddForeignKey
ALTER TABLE "studenti" ADD CONSTRAINT "studenti_grupa_id_fkey" FOREIGN KEY ("grupa_id") REFERENCES "grupe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
