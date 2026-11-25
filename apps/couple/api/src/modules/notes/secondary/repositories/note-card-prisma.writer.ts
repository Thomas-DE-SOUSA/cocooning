import type { PrismaService } from '@cocooning/couple-prisma/nest';
import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import {
    NoteException,
    type NoteCardSnapshot,
} from '@cocooning/couple-server-business-logic/notes';
import { toNoteCardState } from '../mappers';

type Transaction = PrismaService['current'];

const FIRST_VERSION = 1;

const json = (value: unknown): string => JSON.stringify(value);

// One statement for every changed card (core.md rule 9), each filtered by its couple and the version read.
// The JSON columns travel as text, cast back to jsonb; a TIMESTAMP ignores the zone of an ISO string.
const updateCards = (
    tx: Transaction,
    snapshots: ReadonlyArray<NoteCardSnapshot>,
): Promise<number> => tx.$executeRaw`
    UPDATE "note_card" AS stored
    SET "status" = changed.status, "query" = changed.query, "fields" = changed.fields::jsonb,
        "candidates" = changed.candidates::jsonb, "sources" = changed.sources::jsonb,
        "searched_at" = changed.searched_at, "requested_by" = changed.requested_by, "claimed_at" = NULL,
        "updated_at" = changed.updated_at, "version" = stored."version" + 1
    FROM unnest(
        ${snapshots.map(({ coupleId }) => coupleId)}::uuid[],
        ${snapshots.map(({ id }) => id)}::uuid[],
        ${snapshots.map(({ version }) => version)}::int[],
        ${snapshots.map(({ status }) => status)}::varchar[],
        ${snapshots.map(({ query }) => query)}::varchar[],
        ${snapshots.map(({ fields }) => json(fields))}::text[],
        ${snapshots.map(({ candidates }) => json(candidates))}::text[],
        ${snapshots.map(({ sources }) => json(sources))}::text[],
        ${snapshots.map(({ searchedAt }) => searchedAt)}::timestamp(3)[],
        ${snapshots.map(({ requestedBy }) => requestedBy)}::uuid[],
        ${snapshots.map(({ metadata }) => metadata.updatedAt)}::timestamp(3)[]
    ) AS changed(couple_id, id, version, status, query, fields, candidates, sources, searched_at, requested_by, updated_at)
    WHERE stored."couple_id" = changed.couple_id AND stored."id" = changed.id AND stored."version" = changed.version`;

const toCreatedRow = (snapshot: NoteCardSnapshot) => ({
    id: snapshot.id,
    coupleId: snapshot.coupleId,
    noteId: snapshot.noteId,
    createdAt: new Date(snapshot.metadata.createdAt),
    version: FIRST_VERSION,
    ...toNoteCardState(snapshot),
});

// Create or update is decided inside the transaction; the database owns the version (concurrency.md rules 4 to 6).
export async function writeNoteCards(
    tx: Transaction,
    snapshots: ReadonlyArray<NoteCardSnapshot>,
): Promise<void> {
    const stored = await tx.noteCard.findMany({
        where: {
            coupleId: { in: snapshots.map(({ coupleId }) => coupleId) },
            id: { in: snapshots.map(({ id }) => id) },
        },
        select: { id: true },
    });
    const storedIds = new Set(stored.map(({ id }) => id));
    const created = snapshots.filter(({ id }) => !storedIds.has(id));
    const updated = snapshots.filter(({ id }) => storedIds.has(id));
    if (created.length > 0) {
        await tx.noteCard.createMany({ data: created.map(toCreatedRow) });
    }
    if (updated.length === 0) return;
    if ((await updateCards(tx, updated)) === updated.length) return;
    throw new NoteException({
        code: NoteExceptionCodeEnum.NOTE_CARD_VERSION_CONFLICT,
        message: 'Note card changed since it was read',
    });
}
