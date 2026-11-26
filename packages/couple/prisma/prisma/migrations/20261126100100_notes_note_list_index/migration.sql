-- CreateIndex
-- An index on the filled note table: built concurrently, alone in its migration so that no transaction wraps it (prisma.md, migrations).
CREATE INDEX CONCURRENTLY "note_couple_id_list_kind_updated_at_idx" ON "note"("couple_id", "list_kind", "updated_at" DESC);
