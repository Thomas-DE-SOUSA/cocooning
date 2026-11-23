import type { PrismaService } from '@cocooning/couple-prisma/nest';

export type TestNote = {
    readonly noteId: string;
    readonly coupleId: string;
    readonly ownerId: string;
    readonly title: string;
    readonly visibility: string;
    readonly updatedAt: Date;
    readonly deletedAt: Date | null;
};

// Rows written as stored, without the domain: a spec can seed what the API could never write (corrupted data).
export async function createTestNotes(
    prisma: PrismaService,
    notes: ReadonlyArray<TestNote>,
): Promise<void> {
    await prisma.includingDeleted.note.createMany({
        data: notes.map((note) => ({
            id: note.noteId,
            coupleId: note.coupleId,
            ownerId: note.ownerId,
            title: note.title,
            visibility: note.visibility,
            version: 1,
            createdAt: note.updatedAt,
            updatedAt: note.updatedAt,
            deletedAt: note.deletedAt,
        })),
    });
}
