import type { PrismaService } from '@cocooning/couple-prisma/nest';

export type TestFolder = {
    readonly folderId: string;
    readonly coupleId: string;
    readonly ownerId: string;
    readonly space: string;
    readonly parentFolderId: string | null;
    readonly name: string;
    readonly updatedAt: Date;
    readonly deletedAt: Date | null;
};

// Rows written as stored, parents before children, without the domain: a spec can seed what the API could never write.
export async function createTestFolders(
    prisma: PrismaService,
    folders: ReadonlyArray<TestFolder>,
): Promise<void> {
    await prisma.includingDeleted.folder.createMany({
        data: folders.map((folder) => ({
            id: folder.folderId,
            coupleId: folder.coupleId,
            ownerId: folder.ownerId,
            space: folder.space,
            parentFolderId: folder.parentFolderId,
            name: folder.name,
            version: 1,
            createdAt: folder.updatedAt,
            updatedAt: folder.updatedAt,
            deletedAt: folder.deletedAt,
        })),
    });
}
