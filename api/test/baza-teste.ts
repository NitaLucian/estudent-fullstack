// Baza de date a testelor e2e: din variabila TEST_DATABASE_URL (de exemplu în CI)
// sau, local, baza „estudent_teste” din același container PostgreSQL.
export const BAZA_TESTE =
  process.env.TEST_DATABASE_URL ?? 'postgresql://estudent:estudent_dev@localhost:5433/estudent_teste?schema=public';
