import type { PrismaService } from '@cocooning/couple-prisma/nest';
import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import {
    type FolderSnapshot,
    NoteException,
} from '@cocooning/couple-server-business-logic/notes';
import { toFolderState } from '../mappers';

type Transaction = PrismaService['current'];

const FIRST_VERSION = 1;

// Create or update is decided inside the transaction; the database owns the version (concurrency.md rules 4 to 6).
export async function writeFolder(
    tx: Transaction,
    snapshot: FolderSnapshot,
): Promise<void> {
    const stored = await tx.folder.findFirst({
        where: { coupleId: snapshot.coupleId, id: snapshot.id },
        select: { version: true },
    });
    if (stored === null) {
        await tx.folder.create({
            data: {
                id: snapshot.id,
                coupleId: snapshot.coupleId,
                ownerId: snapshot.ownerId,
                space: snapshot.space,
                createdAt: new Date(snapshot.metadata.createdAt),
                version: FIRST_VERSION,
                ...toFolderState(snapshot),
            },
        });
        return;
    }
    const { count } = await tx.folder.updateMany({
        where: {
            coupleId: snapshot.coupleId,
            id: snapshot.id,
            version: snapshot.version,
        },
        data: { ...toFolderState(snapshot), version: { increment: 1 } },
    });
    if (count === 0) {
        throw new NoteException({
            code: NoteExceptionCodeEnum.FOLDER_VERSION_CONFLICT,
            message: 'Folder changed since it was read',
        });
    }
}

// R16: one statement for the sub-folders, one for the notes; the versions rise, so a stale save of a moved row conflicts.
export async function moveFolderContentUp(
    tx: Transaction,
    coupleId: string,
    folderId: string,
    parentFolderId: string | null,
): Promise<void> {
    await tx.folder.updateMany({
        where: { coupleId, parentFolderId: folderId },
        data: { parentFolderId, version: { increment: 1 } },
    });
    await tx.note.updateMany({
        where: { coupleId, folderId },
        data: { folderId: parentFolderId, version: { increment: 1 } },
    });
}
