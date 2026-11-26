-- CreateIndex
-- An index on the filled calendar_event table: built concurrently, alone in its migration so that no transaction wraps it (prisma.md, migrations).
CREATE INDEX CONCURRENTLY "calendar_event_couple_id_label_id_idx" ON "calendar_event"("couple_id", "label_id");
