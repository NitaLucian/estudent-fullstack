-- Migrare editată de mână: grupa studentului nu mai este o coloană a tabelului studenti,
-- ci o înscriere într-un an universitar. Înscrierile actuale se păstrează: le copiem
-- în anul universitar curent înainte să ștergem coloana studenti.grupa_id.

-- 1. Anii universitari
CREATE TABLE "ani_universitari" (
    "id" SERIAL NOT NULL,
    "cod" VARCHAR(9) NOT NULL,
    "data_inceput" DATE NOT NULL,
    "data_sfarsit" DATE NOT NULL,
    "curent" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ani_universitari_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ani_universitari_cod_key" ON "ani_universitari"("cod");
ALTER TABLE "ani_universitari" ADD CONSTRAINT "ani_universitari_perioada_check" CHECK ("data_sfarsit" > "data_inceput");

-- Anul curent se calculează din data aplicării migrării. Anul universitar începe la 1 octombrie,
-- deci scădem 9 luni din data de azi și păstrăm anul: noiembrie 2028 -> 2028, martie 2029 -> 2028.
INSERT INTO "ani_universitari" ("cod", "data_inceput", "data_sfarsit", "curent")
SELECT a || '-' || (a + 1), make_date(a, 10, 1), make_date(a + 1, 9, 30), true
FROM (SELECT EXTRACT(YEAR FROM CURRENT_DATE - INTERVAL '9 months')::int AS a) AS anul;

-- 2. Înscrierile (tabelul de legătură student–grupă–an universitar)
CREATE TABLE "inscrieri" (
    "id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "grupa_id" INTEGER NOT NULL,
    "an_universitar_id" INTEGER NOT NULL,

    CONSTRAINT "inscrieri_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "inscrieri_grupa_id_idx" ON "inscrieri"("grupa_id");
CREATE INDEX "inscrieri_an_universitar_id_idx" ON "inscrieri"("an_universitar_id");
CREATE UNIQUE INDEX "inscrieri_student_id_an_universitar_id_key" ON "inscrieri"("student_id", "an_universitar_id");

-- 3. Copiem grupa actuală a fiecărui student într-o înscriere în anul curent
INSERT INTO "inscrieri" ("student_id", "grupa_id", "an_universitar_id")
SELECT s."id", s."grupa_id", (SELECT "id" FROM "ani_universitari" WHERE "curent")
FROM "studenti" AS s
WHERE s."grupa_id" IS NOT NULL;

-- 4. Coloana veche nu mai este necesară
ALTER TABLE "studenti" DROP CONSTRAINT "studenti_grupa_id_fkey";
DROP INDEX "studenti_grupa_id_idx";
ALTER TABLE "studenti" DROP COLUMN "grupa_id";

-- 5. Cheile străine ale înscrierilor
ALTER TABLE "inscrieri" ADD CONSTRAINT "inscrieri_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "studenti"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "inscrieri" ADD CONSTRAINT "inscrieri_grupa_id_fkey" FOREIGN KEY ("grupa_id") REFERENCES "grupe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "inscrieri" ADD CONSTRAINT "inscrieri_an_universitar_id_fkey" FOREIGN KEY ("an_universitar_id") REFERENCES "ani_universitari"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
