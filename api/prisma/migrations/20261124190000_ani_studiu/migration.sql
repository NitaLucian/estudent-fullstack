-- Migrare editată de mână: anul de studiu al grupei devine o relație cu tabelul ani_studiu.
-- Varianta generată de Prisma ar fi șters coloana „an” (cu tot cu date) și ar fi adăugat
-- o coloană NOT NULL fără valori, operație care eșuează pe un tabel care are deja rânduri.

-- 1. Tabelul nou, cu anii de studiu
CREATE TABLE "ani_studiu" (
    "id" SERIAL NOT NULL,
    "numar" SMALLINT NOT NULL,
    "denumire" VARCHAR(30) NOT NULL,

    CONSTRAINT "ani_studiu_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ani_studiu_numar_key" ON "ani_studiu"("numar");
-- o regulă pe care schema Prisma nu o poate exprima: constrângerea CHECK
ALTER TABLE "ani_studiu" ADD CONSTRAINT "ani_studiu_numar_check" CHECK ("numar" BETWEEN 1 AND 6);

INSERT INTO "ani_studiu" ("numar", "denumire")
VALUES (1, 'Anul I'), (2, 'Anul II'), (3, 'Anul III'), (4, 'Anul IV');

-- 2. Coloana nouă, deocamdată opțională (NULL)
ALTER TABLE "grupe" ADD COLUMN "an_studiu_id" INTEGER;

-- 3. Completăm coloana nouă pe baza valorii vechi
UPDATE "grupe" AS g
SET "an_studiu_id" = a."id"
FROM "ani_studiu" AS a
WHERE a."numar" = g."an";

-- 4. Abia acum coloana devine obligatorie, iar coloana veche dispare
ALTER TABLE "grupe" ALTER COLUMN "an_studiu_id" SET NOT NULL;
ALTER TABLE "grupe" DROP COLUMN "an";

CREATE INDEX "grupe_an_studiu_id_idx" ON "grupe"("an_studiu_id");
ALTER TABLE "grupe" ADD CONSTRAINT "grupe_an_studiu_id_fkey" FOREIGN KEY ("an_studiu_id") REFERENCES "ani_studiu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
