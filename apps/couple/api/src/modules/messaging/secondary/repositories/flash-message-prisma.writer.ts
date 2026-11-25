import type { PrismaService } from '@cocooning/couple-prisma/nest';
import type {
    FlashMessageSnapshot,
    MessagingException,
} from '@cocooning/couple-server-business-logic/messaging';
import { toMessageState } from '../mappers';

type Transaction = PrismaService['current'];

const FIRST_VERSION = 1;

// Create or update is decided inside the transaction; the database owns the version (concurrency.md rules 4 to 6).
export async function writeFlashMessage(
    tx: Transaction,
    snapshot: FlashMessageSnapshot,
    conflict: () => MessagingException,
): Promise<void> {
    const { id, coupleId, ownerId, text, metadata } = snapshot;
    const stored = await tx.flashMessage.findFirst({
        where: { coupleId, id },
        select: { version: true },
    });
    if (stored === null) {
        await tx.flashMessage.create({
            data: {
                id,
                coupleId,
                ownerId,
                text,
                createdAt: new Date(metadata.createdAt),
                version: FIRST_VERSION,
                ...toMessageState(metadata),
            },
        });
        return;
    }
    const { count } = await tx.flashMessage.updateMany({
        where: { coupleId, id, version: snapshot.version },
        data: { ...toMessageState(metadata), version: { increment: 1 } },
    });
    if (count === 0) throw conflict();
}
