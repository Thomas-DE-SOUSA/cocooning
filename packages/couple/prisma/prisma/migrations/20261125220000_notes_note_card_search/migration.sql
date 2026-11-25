-- AlterTable
ALTER TABLE "note_card" ADD COLUMN     "claimed_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "note_card_search" (
    "id" UUID NOT NULL,
    "couple_id" UUID NOT NULL,
    "note_card_id" UUID NOT NULL,
    "searched_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "note_card_search_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "note_card_status_claimed_at_idx" ON "note_card"("status", "claimed_at");

-- CreateIndex
CREATE INDEX "note_card_search_couple_id_searched_at_idx" ON "note_card_search"("couple_id", "searched_at");
