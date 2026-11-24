-- CreateTable
CREATE TABLE "specializari" (
    "id" SERIAL NOT NULL,
    "cod" VARCHAR(15) NOT NULL,
    "denumire" VARCHAR(100) NOT NULL,

    CONSTRAINT "specializari_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "specializari_cod_key" ON "specializari"("cod");
