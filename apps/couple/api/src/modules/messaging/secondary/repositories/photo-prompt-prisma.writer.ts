import type { PrismaService } from '@cocooning/couple-prisma/nest';
import type {
    MessagingException,
    PhotoPromptSnapshot,
} from '@cocooning/couple-server-business-logic/messaging';
import { toDayColumn } from '../mappers';

type Transaction = PrismaService['current'];

const FIRST_VERSION = 1;

const toCreatedRow = (snapshot: PhotoPromptSnapshot) => ({
    id: snapshot.id,
    coupleId: snapshot.coupleId,
    day: toDayColumn(snapshot.day),
    scheduledAt: new Date(snapshot.scheduledAt),
    issuedAt: snapshot.issuedAt === null ? null : new Date(snapshot.issuedAt),
    version: FIRST_VERSION,
    createdAt: new Date(snapshot.metadata.createdAt),
    updatedAt: new Date(snapshot.metadata.updatedAt),
});

// One statement for every issued prompt (core.md rule 9), each filtered by its couple and the version read.
// A TIMESTAMP column ignores the zone of an ISO string, so the UTC instant lands as stored by Prisma.
const updateIssued = (
    tx: Transaction,
    snapshots: ReadonlyArray<PhotoPromptSnapshot>,
): Promise<number> => tx.$executeRaw`
    UPDATE "photo_prompt" AS stored
    SET "issued_at" = changed.issued_at, "updated_at" = changed.updated_at, "version" = stored."version" + 1
    FROM unnest(
        ${snapshots.map(({ coupleId }) => coupleId)}::uuid[],
        ${snapshots.map(({ id }) => id)}::uuid[],
        ${snapshots.map(({ version }) => version)}::int[],
        ${snapshots.map(({ issuedAt }) => issuedAt)}::timestamp(3)[],
        ${snapshots.map(({ metadata }) => metadata.updatedAt)}::timestamp(3)[]
    ) AS changed(couple_id, id, version, issued_at, updated_at)
    WHERE stored."couple_id" = changed.couple_id AND stored."id" = changed.id AND stored."version" = changed.version`;

// Create or update is decided inside the transaction; the database owns the version (concurrency.md rules 4 to 6).
export async function writePhotoPrompts(
    tx: Transaction,
    snapshots: ReadonlyArray<PhotoPromptSnapshot>,
    conflict: () => MessagingException,
): Promise<void> {
    const stored = await tx.photoPrompt.findMany({
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
        await tx.photoPrompt.createMany({ data: created.map(toCreatedRow) });
    }
    if (updated.length === 0) return;
    if ((await updateIssued(tx, updated)) !== updated.length) throw conflict();
}
