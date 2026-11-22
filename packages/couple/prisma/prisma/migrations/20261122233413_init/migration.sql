-- CreateTable
CREATE TABLE "couple_partner" (
    "couple_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "couple_partner_pkey" PRIMARY KEY ("couple_id","user_id")
);

-- CreateTable
CREATE TABLE "couple" (
    "id" UUID NOT NULL,
    "pairing_status" VARCHAR(20) NOT NULL,
    "invitation_code" VARCHAR(8),
    "invitation_code_expires_at" TIMESTAMP(3),
    "version" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "couple_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pairing_event" (
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

    CONSTRAINT "pairing_event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "couple_partner_user_id_key" ON "couple_partner"("user_id");

-- CreateIndex
CREATE INDEX "pairing_event_published_occurred_at_idx" ON "pairing_event"("published", "occurred_at");

-- CreateIndex
CREATE UNIQUE INDEX "pairing_event_aggregate_id_version_key" ON "pairing_event"("aggregate_id", "version");

-- AddForeignKey
ALTER TABLE "couple_partner" ADD CONSTRAINT "couple_partner_couple_id_fkey" FOREIGN KEY ("couple_id") REFERENCES "couple"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex (by hand, prisma.md rule 9): an invitation code is unique among live couples (INV-008, decision 0029).
CREATE UNIQUE INDEX "couple_invitation_code_key" ON "couple"("invitation_code") WHERE "deleted_at" IS NULL AND "invitation_code" IS NOT NULL;
