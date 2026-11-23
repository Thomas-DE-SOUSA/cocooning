-- CreateTable
CREATE TABLE "account" (
    "id" UUID NOT NULL,
    "email_address" VARCHAR(254) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "session_version" INTEGER NOT NULL,
    "version" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateIndex (by hand, prisma.md rule 9): an email address belongs to one live account (R1, INV-002, decision 0032).
CREATE UNIQUE INDEX "account_email_address_key" ON "account"("email_address") WHERE "deleted_at" IS NULL;
