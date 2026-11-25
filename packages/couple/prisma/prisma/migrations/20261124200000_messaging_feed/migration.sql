-- CreateTable
CREATE TABLE "messaging_event" (
    "id" UUID NOT NULL,
    "couple_id" UUID NOT NULL,
    "aggregate_id" UUID NOT NULL,
    "event_name" VARCHAR(120) NOT NULL,
    "event_data" JSONB NOT NULL,
    "user_id" UUID NOT NULL,
    "occurred_at" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "published_at" TIMESTAMP(3),

    CONSTRAINT "messaging_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flash_message" (
    "id" UUID NOT NULL,
    "couple_id" UUID NOT NULL,
    "owner_id" UUID NOT NULL,
    "text" VARCHAR(140) NOT NULL,
    "version" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "flash_message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "instant_photo" (
    "id" UUID NOT NULL,
    "couple_id" UUID NOT NULL,
    "owner_id" UUID NOT NULL,
    "content_type" VARCHAR(20) NOT NULL,
    "version" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "instant_photo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "messaging_event_published_occurred_at_idx" ON "messaging_event"("published", "occurred_at");

-- CreateIndex
CREATE UNIQUE INDEX "messaging_event_aggregate_id_version_key" ON "messaging_event"("aggregate_id", "version");

-- CreateIndex
CREATE INDEX "flash_message_couple_id_id_idx" ON "flash_message"("couple_id", "id");

-- CreateIndex
CREATE INDEX "instant_photo_couple_id_id_idx" ON "instant_photo"("couple_id", "id");
