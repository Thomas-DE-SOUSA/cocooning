-- AlterTable
-- R17: every folder written before the smart folders is classic. The default fills the existing rows at once
-- (no rewrite since PostgreSQL 11), then goes: the domain always writes the kind.
ALTER TABLE "folder" ADD COLUMN     "kind" VARCHAR(20) NOT NULL DEFAULT 'CLASSIC',
ADD COLUMN     "subject" VARCHAR(280),
ADD COLUMN     "card_template" JSONB;

ALTER TABLE "folder" ALTER COLUMN "kind" DROP DEFAULT;
