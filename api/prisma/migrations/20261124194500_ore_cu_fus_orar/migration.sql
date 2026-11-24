-- Migrare editată de mână: momentele de timp devin TIMESTAMPTZ („timestamp with time zone”).
-- Prisma scrie valorile DateTime în UTC. Într-o coloană TIMESTAMP (fără fus orar) ele apar
-- ca „ore fără fus”, iar PostgreSQL le interpretează în fusul sesiunii (aici Europe/Bucharest):
-- o comparație în SQL cu now() greșește cu 2–3 ore. Cu TIMESTAMPTZ, momentul este neambiguu.
-- USING ... AT TIME ZONE 'UTC' spune cum se interpretează valorile existente: sunt în UTC.

ALTER TABLE "sesiuni_refresh"
  ALTER COLUMN "expira_la"   SET DATA TYPE TIMESTAMPTZ(3) USING "expira_la"   AT TIME ZONE 'UTC',
  ALTER COLUMN "revocata_la" SET DATA TYPE TIMESTAMPTZ(3) USING "revocata_la" AT TIME ZONE 'UTC',
  ALTER COLUMN "creata_la"   SET DATA TYPE TIMESTAMPTZ(3) USING "creata_la"   AT TIME ZONE 'UTC';

ALTER TABLE "utilizatori"
  ALTER COLUMN "creat_la"             SET DATA TYPE TIMESTAMPTZ(3) USING "creat_la"             AT TIME ZONE 'UTC',
  ALTER COLUMN "ultima_autentificare" SET DATA TYPE TIMESTAMPTZ(3) USING "ultima_autentificare" AT TIME ZONE 'UTC';
