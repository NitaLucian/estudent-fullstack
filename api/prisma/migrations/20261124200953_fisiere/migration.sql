-- AlterTable
ALTER TABLE "studenti" ADD COLUMN     "fotografie_cheie" TEXT;

-- CreateTable
CREATE TABLE "documente" (
    "id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "nume" VARCHAR(200) NOT NULL,
    "cheie" VARCHAR(300) NOT NULL,
    "tip" VARCHAR(100) NOT NULL,
    "marime" INTEGER NOT NULL,
    "incarcat_de_id" INTEGER,
    "incarcat_la" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documente_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "documente_cheie_key" ON "documente"("cheie");

-- CreateIndex
CREATE INDEX "documente_student_id_idx" ON "documente"("student_id");

-- AddForeignKey
ALTER TABLE "documente" ADD CONSTRAINT "documente_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "studenti"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documente" ADD CONSTRAINT "documente_incarcat_de_id_fkey" FOREIGN KEY ("incarcat_de_id") REFERENCES "utilizatori"("id") ON DELETE SET NULL ON UPDATE CASCADE;
