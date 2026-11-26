-- R12 of agenda (decision 0056): the labels shared by the couple.
-- CreateTable
CREATE TABLE "calendar_label" (
    "id" UUID NOT NULL,
    "couple_id" UUID NOT NULL,
    "owner_id" UUID NOT NULL,
    "name" VARCHAR(30) NOT NULL,
    "color" VARCHAR(20) NOT NULL,
    "version" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "calendar_label_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "calendar_label_couple_id_created_at_idx" ON "calendar_label"("couple_id", "created_at");
