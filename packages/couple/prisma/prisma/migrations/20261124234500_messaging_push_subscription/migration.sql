-- CreateTable
CREATE TABLE "push_subscription" (
    "id" UUID NOT NULL,
    "couple_id" UUID NOT NULL,
    "owner_id" UUID NOT NULL,
    "endpoint" VARCHAR(2048) NOT NULL,
    "p256dh" VARCHAR(128) NOT NULL,
    "auth" VARCHAR(128) NOT NULL,
    "version" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "push_subscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "push_subscription_couple_id_endpoint_key" ON "push_subscription"("couple_id", "endpoint");

-- R10: the outbox relay starts with this migration. The events written before it are history, not news: marked
-- published so that the first relay never rings the phones for every note and calendar event of the past.
-- Written by hand: Prisma does not model data changes. pairing_event is not read by the relay and stays as it is.
UPDATE "note_event" SET "published" = true, "published_at" = (now() AT TIME ZONE 'UTC') WHERE "published" = false;
UPDATE "agenda_event" SET "published" = true, "published_at" = (now() AT TIME ZONE 'UTC') WHERE "published" = false;
UPDATE "messaging_event" SET "published" = true, "published_at" = (now() AT TIME ZONE 'UTC') WHERE "published" = false;
