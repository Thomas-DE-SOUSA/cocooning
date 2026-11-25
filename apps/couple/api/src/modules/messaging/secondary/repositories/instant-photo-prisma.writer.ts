import type { PrismaService } from '@cocooning/couple-prisma/nest';
import type {
    InstantPhotoSnapshot,
    MessagingException,
} from '@cocooning/couple-server-business-logic/messaging';
import { toMessageState } from '../mappers';

type Transaction = PrismaService['current'];

const FIRST_VERSION = 1;

// Create or update is decided inside the transaction; the database owns the version (concurrency.md rules 4 to 6).
export async function writeInstantPhoto(
    tx: Transaction,
    snapshot: InstantPhotoSnapshot,
    conflict: () => MessagingException,
): Promise<void> {
    const { id, coupleId, ownerId, contentType, photoPromptId, isLate } =
        snapshot;
    const { metadata } = snapshot;
    const stored = await tx.instantPhoto.findFirst({
        where: { coupleId, id },
        select: { version: true },
    });
    if (stored === null) {
        await tx.instantPhoto.create({
            data: {
                id,
                coupleId,
                ownerId,
                contentType,
                photoPromptId,
                isLate,
                createdAt: new Date(metadata.createdAt),
                version: FIRST_VERSION,
                ...toMessageState(metadata),
            },
        });
        return;
    }
    const { count } = await tx.instantPhoto.updateMany({
        where: { coupleId, id, version: snapshot.version },
        data: { ...toMessageState(metadata), version: { increment: 1 } },
    });
    if (count === 0) throw conflict();
}
