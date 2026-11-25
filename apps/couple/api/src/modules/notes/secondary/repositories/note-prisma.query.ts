import type { Prisma } from '@cocooning/couple-prisma/client';
import type { PrismaService } from '@cocooning/couple-prisma/nest';
import {
    type NoteSpaceCounts,
    spaceOfVisibility,
} from '@cocooning/couple-server-business-logic/notes';
import { NoteVisibilityEnum } from '@cocooning/couple-shared-kernel/enums';
import {
    toCountsByFolder,
    toNoteSpaceCounts,
    toNoteVisibility,
} from '../mappers';

type Transaction = PrismaService['current'];

// R4: the shared notes of the couple and the partner's own private notes, in the query (core-backend.md rule 12).
export const notesVisibleTo = (
    coupleId: string,
    userId: string,
): Prisma.NoteWhereInput => ({
    coupleId,
    OR: [{ visibility: NoteVisibilityEnum.SHARED }, { ownerId: userId }],
});

export async function countNotesByFolder(
    tx: Transaction,
    coupleId: string,
    userId: string,
    folderIds: string[],
): Promise<ReadonlyMap<string, number>> {
    const groups = await tx.note.groupBy({
        by: ['folderId'],
        where: {
            ...notesVisibleTo(coupleId, userId),
            folderId: { in: folderIds },
        },
        _count: { _all: true },
    });
    return toCountsByFolder(
        groups.map((group) => ({
            key: group.folderId,
            count: group._count._all,
        })),
    );
}

// R11: a space counts the notes of its visibility.
export async function countNotesBySpace(
    tx: Transaction,
    coupleId: string,
    userId: string,
): Promise<NoteSpaceCounts> {
    const groups = await tx.note.groupBy({
        by: ['visibility'],
        where: notesVisibleTo(coupleId, userId),
        _count: { _all: true },
    });
    return toNoteSpaceCounts(
        groups.map((group) => ({
            key: spaceOfVisibility(toNoteVisibility(group.visibility)),
            count: group._count._all,
        })),
    );
}
