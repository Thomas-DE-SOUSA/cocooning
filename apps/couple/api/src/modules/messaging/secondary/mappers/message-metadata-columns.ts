import type { EntityMetadataSnapshot } from '@cocooning/shared-kernel/domain';

type MessageRowMetadata = {
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly deletedAt: Date | null;
};

export type MessageStateColumns = {
    readonly updatedAt: Date;
    readonly deletedAt: Date | null;
};

export const toMetadataSnapshot = (
    row: MessageRowMetadata,
): EntityMetadataSnapshot => ({
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    deletedAt: row.deletedAt === null ? null : row.deletedAt.toISOString(),
});

// The only columns an update changes: a flash message or a photo is never edited, only withdrawn (R6).
export const toMessageState = ({
    updatedAt,
    deletedAt,
}: EntityMetadataSnapshot): MessageStateColumns => ({
    updatedAt: new Date(updatedAt),
    deletedAt: deletedAt === null ? null : new Date(deletedAt),
});
