-- R26 to R28 of notes (decision 0058): a list is a note with a section, an optional emoji and its unchecked lines.
-- The notes written before the lists are ordinary notes: no section, no emoji, nothing to check. A constant default
-- fills them without rewriting the table (PostgreSQL 11 and later).
ALTER TABLE "note" ADD COLUMN "list_kind" VARCHAR(20),
ADD COLUMN "emoji" VARCHAR(16),
ADD COLUMN "open_item_count" INTEGER NOT NULL DEFAULT 0;
