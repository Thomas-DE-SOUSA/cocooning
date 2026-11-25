-- AlterTable
-- R12: the notes written before the folders keep a null folder_id, the root of the space of their visibility.
ALTER TABLE "note" ADD COLUMN     "folder_id" UUID;

-- CreateTable
CREATE TABLE "folder" (
    "id" UUID NOT NULL,
    "couple_id" UUID NOT NULL,
    "owner_id" UUID NOT NULL,
    "space" VARCHAR(20) NOT NULL,
    "parent_folder_id" UUID,
    "name" VARCHAR(60) NOT NULL,
    "version" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "folder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "folder_couple_id_parent_folder_id_idx" ON "folder"("couple_id", "parent_folder_id");

-- AddForeignKey
ALTER TABLE "folder" ADD CONSTRAINT "folder_parent_folder_id_fkey" FOREIGN KEY ("parent_folder_id") REFERENCES "folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "note" ADD CONSTRAINT "note_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
