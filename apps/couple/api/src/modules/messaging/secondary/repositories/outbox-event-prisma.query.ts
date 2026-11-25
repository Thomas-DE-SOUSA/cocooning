import type { PrismaService } from '@cocooning/couple-prisma/nest';
import type { OutboxEventRow } from '../mappers';

type Transaction = PrismaService['current'];

// One query per outbox: a table name cannot be a parameter, and FOR UPDATE is refused on a UNION.
// Each served by its (published, occurred_at) index; at most `limit` rows from each, merged by the mapper.
export async function claimPendingRows(
    tx: Transaction,
    limit: number,
): Promise<ReadonlyArray<OutboxEventRow>> {
    const notes = await tx.$queryRaw<OutboxEventRow[]>`
        SELECT "id", "couple_id", "user_id", "event_name", "event_data", "occurred_at" FROM "note_event"
        WHERE "published" = false ORDER BY "occurred_at", "id" LIMIT ${limit}::int FOR UPDATE SKIP LOCKED`;
    const agenda = await tx.$queryRaw<OutboxEventRow[]>`
        SELECT "id", "couple_id", "user_id", "event_name", "event_data", "occurred_at" FROM "agenda_event"
        WHERE "published" = false ORDER BY "occurred_at", "id" LIMIT ${limit}::int FOR UPDATE SKIP LOCKED`;
    const messaging = await tx.$queryRaw<OutboxEventRow[]>`
        SELECT "id", "couple_id", "user_id", "event_name", "event_data", "occurred_at" FROM "messaging_event"
        WHERE "published" = false ORDER BY "occurred_at", "id" LIMIT ${limit}::int FOR UPDATE SKIP LOCKED`;
    return [...notes, ...agenda, ...messaging];
}
