-- Migrare scrisă de mână: un VIEW (o interogare salvată în baza de date, folosită ca un tabel).
-- Pentru fiecare înscriere (student + an universitar): numărul de note, media aritmetică,
-- media ponderată cu creditele, creditele obținute și numărul de restanțe.
-- Schema Prisma nu descrie view-ul; îl citim din backend cu $queryRaw.

CREATE VIEW "v_medii_studenti" AS
SELECT
    i."id"                AS inscriere_id,
    i."student_id"        AS student_id,
    i."an_universitar_id" AS an_universitar_id,
    i."grupa_id"          AS grupa_id,
    g."specializare_id"   AS specializare_id,
    g."an_studiu_id"      AS an_studiu_id,
    COUNT(n."id")::int                                                     AS numar_note,
    ROUND(AVG(n."valoare"), 2)::float8                                     AS medie_aritmetica,
    ROUND(SUM(n."valoare" * d."credite")::numeric
          / NULLIF(SUM(d."credite"), 0), 2)::float8                        AS medie_ponderata,
    COALESCE(SUM(d."credite") FILTER (WHERE n."valoare" >= 5), 0)::int     AS credite_obtinute,
    COUNT(n."id") FILTER (WHERE n."valoare" < 5)::int                      AS restante
FROM "inscrieri" AS i
JOIN "grupe" AS g ON g."id" = i."grupa_id"
LEFT JOIN "note" AS n ON n."inscriere_id" = i."id"
LEFT JOIN "discipline" AS d ON d."id" = n."disciplina_id"
GROUP BY i."id", g."specializare_id", g."an_studiu_id";
