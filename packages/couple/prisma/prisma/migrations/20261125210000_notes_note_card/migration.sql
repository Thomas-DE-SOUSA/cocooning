-- CreateTable
CREATE TABLE "note_card" (
    "id" UUID NOT NULL,
    "couple_id" UUID NOT NULL,
    "note_id" UUID NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "query" VARCHAR(200) NOT NULL,
    "fields" JSONB NOT NULL,
    "candidates" JSONB NOT NULL,
    "sources" JSONB NOT NULL,
    "searched_at" TIMESTAMP(3),
    "requested_by" UUID NOT NULL,
    "version" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "note_card_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "note_card_couple_id_note_id_key" ON "note_card"("couple_id", "note_id");

-- AddForeignKey
ALTER TABLE "note_card" ADD CONSTRAINT "note_card_note_id_fkey" FOREIGN KEY ("note_id") REFERENCES "note"("id") ON DELETE CASCADE ON UPDATE CASCADE;
