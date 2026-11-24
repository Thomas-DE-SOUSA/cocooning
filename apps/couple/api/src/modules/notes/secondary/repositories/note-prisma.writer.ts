import type { PrismaService } from '@cocooning/couple-prisma/nest';
import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import {
    NoteException,
    type NoteSnapshot,
} from '@cocooning/couple-server-business-logic/notes';
import { toNoteState } from '../mappers';

type Transaction = PrismaService['current'];

const FIRST_VERSION = 1;

// Create or update is decided inside the transaction; the database owns the version (concurrency.md rules 4 to 6).
export async function writeNote(
    tx: Transaction,
    snapshot: NoteSnapshot,
): Promise<void> {
    const stored = await tx.note.findFirst({
        where: { coupleId: snapshot.coupleId, id: snapshot.id },
        select: { version: true },
    });
    if (stored === null) {
        await tx.note.create({
            data: {
                id: snapshot.id,
                coupleId: snapshot.coupleId,
                ownerId: snapshot.ownerId,
                createdAt: new Date(snapshot.metadata.createdAt),
                version: FIRST_VERSION,
                ...toNoteState(snapshot),
            },
        });
        return;
    }
    const { count } = await tx.note.updateMany({
        where: {
            coupleId: snapshot.coupleId,
            id: snapshot.id,
            version: snapshot.version,
        },
        data: { ...toNoteState(snapshot), version: { increment: 1 } },
    });
    if (count === 0) {
        throw new NoteException({
            code: NoteExceptionCodeEnum.NOTE_VERSION_CONFLICT,
            message: 'Note changed since it was read',
        });
    }
}
