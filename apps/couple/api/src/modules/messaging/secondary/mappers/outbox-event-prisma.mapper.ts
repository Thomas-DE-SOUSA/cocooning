import type { OutboxEvent } from '@cocooning/couple-server-business-logic/messaging';

// A row of note_event, agenda_event or messaging_event, read by raw SQL (adapters.md rule 4).
export type OutboxEventRow = {
    readonly id: string;
    readonly couple_id: string;
    readonly user_id: string;
    readonly event_name: string;
    readonly event_data: unknown;
    readonly occurred_at: Date;
};

const inOccurrenceOrder = (left: OutboxEventRow, right: OutboxEventRow) =>
    left.occurred_at.getTime() - right.occurred_at.getTime() ||
    (left.id < right.id ? -1 : 1);

// The three outboxes merged in occurrence order, cut to the batch: the rows left over wait for the next relay.
export function toOutboxEvents(
    rows: ReadonlyArray<OutboxEventRow>,
    limit: number,
): ReadonlyArray<OutboxEvent> {
    return [...rows]
        .sort(inOccurrenceOrder)
        .slice(0, limit)
        .map((row) => ({
            eventId: row.id,
            coupleId: row.couple_id,
            userId: row.user_id,
            eventName: row.event_name,
            data: row.event_data,
        }));
}
