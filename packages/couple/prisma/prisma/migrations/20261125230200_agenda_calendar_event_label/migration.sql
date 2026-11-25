-- R13 of agenda (decision 0056): the label of an event; the events written before the labels have none.
ALTER TABLE "calendar_event" ADD COLUMN "label_id" UUID;

-- AddForeignKey
ALTER TABLE "calendar_event" ADD CONSTRAINT "calendar_event_label_id_fkey" FOREIGN KEY ("label_id") REFERENCES "calendar_label"("id") ON DELETE SET NULL ON UPDATE CASCADE;
