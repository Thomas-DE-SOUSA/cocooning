import type { PrismaService } from '@cocooning/couple-prisma/nest';

type TestMessage = {
    readonly coupleId: string;
    readonly ownerId: string;
    readonly sentAt: Date;
    readonly deletedAt: Date | null;
};

export type TestFlashMessage = TestMessage & {
    readonly flashMessageId: string;
    readonly text: string;
};

export type TestInstantPhoto = TestMessage & {
    readonly instantPhotoId: string;
    readonly contentType: string;
};

const columnsOf = (message: TestMessage) => ({
    coupleId: message.coupleId,
    ownerId: message.ownerId,
    version: 1,
    createdAt: message.sentAt,
    updatedAt: message.sentAt,
    deletedAt: message.deletedAt,
});

// Rows written as stored, without the domain nor the files: a spec can seed what the API could never write (corrupted data).
export async function createTestFlashMessages(
    prisma: PrismaService,
    flashMessages: ReadonlyArray<TestFlashMessage>,
): Promise<void> {
    await prisma.includingDeleted.flashMessage.createMany({
        data: flashMessages.map((flashMessage) => ({
            id: flashMessage.flashMessageId,
            text: flashMessage.text,
            ...columnsOf(flashMessage),
        })),
    });
}

export async function createTestInstantPhotos(
    prisma: PrismaService,
    instantPhotos: ReadonlyArray<TestInstantPhoto>,
): Promise<void> {
    await prisma.includingDeleted.instantPhoto.createMany({
        data: instantPhotos.map((instantPhoto) => ({
            id: instantPhoto.instantPhotoId,
            contentType: instantPhoto.contentType,
            ...columnsOf(instantPhoto),
        })),
    });
}
