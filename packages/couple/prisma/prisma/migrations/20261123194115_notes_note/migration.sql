-- CreateTable
CREATE TABLE "note_event" (
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

    CONSTRAINT "note_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "note" (
    "id" UUID NOT NULL,
    "couple_id" UUID NOT NULL,
    "owner_id" UUID NOT NULL,
    "title" VARCHAR(120) NOT NULL,
    "visibility" VARCHAR(20) NOT NULL,
    "version" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "note_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "note_event_published_occurred_at_idx" ON "note_event"("published", "occurred_at");

-- CreateIndex
CREATE UNIQUE INDEX "note_event_aggregate_id_version_key" ON "note_event"("aggregate_id", "version");

-- CreateIndex
CREATE INDEX "note_couple_id_updated_at_idx" ON "note"("couple_id", "updated_at" DESC);
