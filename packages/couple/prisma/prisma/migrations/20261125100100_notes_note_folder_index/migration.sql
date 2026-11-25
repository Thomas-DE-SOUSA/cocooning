-- CreateIndex
-- An index on the filled note table: built concurrently, alone in its migration so that no transaction wraps it (prisma.md, migrations).
CREATE INDEX CONCURRENTLY "note_couple_id_folder_id_idx" ON "note"("couple_id", "folder_id");
