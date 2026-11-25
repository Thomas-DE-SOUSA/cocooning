import { Prisma } from '@cocooning/couple-prisma/client';
import type { PrismaService } from '@cocooning/couple-prisma/nest';
import type {
    FolderPathItem,
    NoteSpaceCounts,
} from '@cocooning/couple-server-business-logic/notes';
import { NoteSpaceEnum } from '@cocooning/couple-shared-kernel/enums';
import { toCountsByFolder, toFolderSpace, toNoteSpaceCounts } from '../mappers';

type Transaction = PrismaService['current'];

type FolderPathRow = {
    readonly id: string;
    readonly name: string;
};

// R14: the folders of « Partagé » and the partner's own « Privé », in the query (core-backend.md rule 12).
export const foldersVisibleTo = (
    coupleId: string,
    userId: string,
): Prisma.FolderWhereInput => ({
    coupleId,
    OR: [{ space: NoteSpaceEnum.SHARED }, { ownerId: userId }],
});

// One recursive query from the folder up to the root, read back root first; CYCLE stops on corrupted data.
// deleted_at is written at every level: the soft-delete extension does not reach raw SQL (adapters.md rule 8).
export async function readFolderPath(
    tx: Transaction,
    coupleId: string,
    folderId: string,
): Promise<ReadonlyArray<FolderPathItem>> {
    const rows = await tx.$queryRaw<FolderPathRow[]>(Prisma.sql`
        WITH RECURSIVE "path" AS (
            SELECT "id", "parent_folder_id", "name", 0 AS "depth" FROM "folder"
            WHERE "couple_id" = ${coupleId}::uuid AND "id" = ${folderId}::uuid AND "deleted_at" IS NULL
            UNION ALL
            SELECT "parent"."id", "parent"."parent_folder_id", "parent"."name", "path"."depth" + 1
            FROM "folder" AS "parent" JOIN "path" ON "parent"."id" = "path"."parent_folder_id"
            WHERE "parent"."couple_id" = ${coupleId}::uuid AND "parent"."deleted_at" IS NULL
        ) CYCLE "id" SET "is_cycle" USING "visited"
        SELECT "id", "name" FROM "path" WHERE NOT "is_cycle" ORDER BY "depth" DESC`);
    return rows.map(({ id, name }) => ({ folderId: id, name }));
}

export async function countChildFolders(
    tx: Transaction,
    coupleId: string,
    userId: string,
    folderIds: string[],
): Promise<ReadonlyMap<string, number>> {
    const groups = await tx.folder.groupBy({
        by: ['parentFolderId'],
        where: {
            ...foldersVisibleTo(coupleId, userId),
            parentFolderId: { in: folderIds },
        },
        _count: { _all: true },
    });
    return toCountsByFolder(
        groups.map((group) => ({
            key: group.parentFolderId,
            count: group._count._all,
        })),
    );
}

export async function countFoldersBySpace(
    tx: Transaction,
    coupleId: string,
    userId: string,
): Promise<NoteSpaceCounts> {
    const groups = await tx.folder.groupBy({
        by: ['space'],
        where: foldersVisibleTo(coupleId, userId),
        _count: { _all: true },
    });
    return toNoteSpaceCounts(
        groups.map((group) => ({
            key: toFolderSpace(group.space),
            count: group._count._all,
        })),
    );
}
