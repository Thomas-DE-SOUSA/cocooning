-- R11 of agenda (decision 0056): who an event is for, relative to its author.
-- Added nullable, filled from the visibility (shared for both, private for its author), then required.
ALTER TABLE "calendar_event" ADD COLUMN "audience" VARCHAR(20);

UPDATE "calendar_event"
SET "audience" = CASE WHEN "visibility" = 'PRIVATE' THEN 'OWNER' ELSE 'BOTH' END;

ALTER TABLE "calendar_event" ALTER COLUMN "audience" SET NOT NULL;
