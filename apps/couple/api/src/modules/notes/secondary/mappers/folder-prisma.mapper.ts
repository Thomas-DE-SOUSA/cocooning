import type { Folder } from '@cocooning/couple-prisma/client';
import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import {
    type FolderSnapshot,
    NoteException,
} from '@cocooning/couple-server-business-logic/notes';
import { NoteSpaceEnum } from '@cocooning/couple-shared-kernel/enums';
import { parseEnum } from '@cocooning/shared-kernel/utils';

export type FolderRow = Folder;

export type FolderStateColumns = {
    readonly parentFolderId: string | null;
    readonly name: string;
    readonly updatedAt: Date;
    readonly deletedAt: Date | null;
};

export const toFolderSpace = (raw: string) => {
    try {
        return parseEnum(raw, NoteSpaceEnum, 'NoteSpace');
    } catch {
        throw new NoteException({
            code: NoteExceptionCodeEnum.FOLDER_DATA_CORRUPTED,
            message: 'Unknown folder space',
        });
    }
};

export function toFolderSnapshot(raw: FolderRow): FolderSnapshot {
    return {
        id: raw.id,
        coupleId: raw.coupleId,
        ownerId: raw.ownerId,
        space: toFolderSpace(raw.space),
        parentFolderId: raw.parentFolderId,
        name: raw.name,
        version: raw.version,
        metadata: {
            createdAt: raw.createdAt.toISOString(),
            updatedAt: raw.updatedAt.toISOString(),
            deletedAt:
                raw.deletedAt === null ? null : raw.deletedAt.toISOString(),
        },
    };
}

// The columns an update may change: never the id, the couple, the owner, the space (R15), the creation date or the version.
export function toFolderState(snapshot: FolderSnapshot): FolderStateColumns {
    const { metadata } = snapshot;
    return {
        parentFolderId: snapshot.parentFolderId,
        name: snapshot.name,
        updatedAt: new Date(metadata.updatedAt),
        deletedAt:
            metadata.deletedAt === null ? null : new Date(metadata.deletedAt),
    };
}
