// A row of the notes, agenda or messaging outbox as the relay reads it (decision 0021): ids, the name and the data of the event.
export type OutboxEvent = {
    readonly eventId: string;
    readonly coupleId: string;
    readonly userId: string;
    readonly eventName: string;
    readonly data: unknown;
};
