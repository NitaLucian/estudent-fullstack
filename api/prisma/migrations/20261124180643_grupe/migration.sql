-- CreateTable
CREATE TABLE "grupe" (
    "id" SERIAL NOT NULL,
    "cod" VARCHAR(15) NOT NULL,
    "an" SMALLINT NOT NULL,
    "specializare_id" INTEGER NOT NULL,

    CONSTRAINT "grupe_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "grupe_cod_key" ON "grupe"("cod");

-- CreateIndex
CREATE INDEX "grupe_specializare_id_idx" ON "grupe"("specializare_id");

-- AddForeignKey
ALTER TABLE "grupe" ADD CONSTRAINT "grupe_specializare_id_fkey" FOREIGN KEY ("specializare_id") REFERENCES "specializari"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
