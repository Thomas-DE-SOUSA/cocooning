-- AlterTable
ALTER TABLE "instant_photo" ADD COLUMN     "is_late" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "photo_prompt_id" UUID;

-- CreateTable
CREATE TABLE "photo_prompt" (
    "id" UUID NOT NULL,
    "couple_id" UUID NOT NULL,
    "day" DATE NOT NULL,
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "issued_at" TIMESTAMP(3),
    "version" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "photo_prompt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "photo_prompt_couple_id_day_key" ON "photo_prompt"("couple_id", "day");

-- R8: one live photo of the day per partner and per prompt; a withdrawn one no longer counts. Written by hand: Prisma does not model a partial index.
CREATE UNIQUE INDEX "instant_photo_couple_id_photo_prompt_id_owner_id_key" ON "instant_photo"("couple_id", "photo_prompt_id", "owner_id") WHERE "deleted_at" IS NULL;
