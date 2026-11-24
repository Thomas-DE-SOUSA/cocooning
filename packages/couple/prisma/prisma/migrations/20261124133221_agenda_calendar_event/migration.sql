-- CreateTable
CREATE TABLE "calendar_event" (
    "id" UUID NOT NULL,
    "couple_id" UUID NOT NULL,
    "owner_id" UUID NOT NULL,
    "title" VARCHAR(120) NOT NULL,
    "description" VARCHAR(2000),
    "starts_on" DATE NOT NULL,
    "ends_on" DATE,
    "starts_at" VARCHAR(5),
    "ends_at" VARCHAR(5),
    "visibility" VARCHAR(20) NOT NULL,
    "version" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "calendar_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agenda_event" (
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

    CONSTRAINT "agenda_event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "calendar_event_couple_id_starts_on_idx" ON "calendar_event"("couple_id", "starts_on");

-- CreateIndex
CREATE INDEX "agenda_event_published_occurred_at_idx" ON "agenda_event"("published", "occurred_at");

-- CreateIndex
CREATE UNIQUE INDEX "agenda_event_aggregate_id_version_key" ON "agenda_event"("aggregate_id", "version");
